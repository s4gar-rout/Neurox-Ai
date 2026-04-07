import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../service/mail.service.js";

/**
 * REGISTER
 */
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hash,
    });

    // ✅ token
    const emailVerificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET
    );

    // ✅ dynamic backend URL
    const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}`;

    
    await sendEmail({
      to: email,
      subject: "Verify Email",
      html: `<a href="${verifyLink}">Verify Email</a>`,
    });
    

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      verifyLink, // optional (for testing)
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}

/**
 * LOGIN
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Please verify your email first",
        success: false,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}

/**
 * GET ME
 */
export async function getMe(req, res) {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}

/**
 * VERIFY EMAIL
 */
export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; margin: 0;">
            <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
              <h2 style="color: #ef4444; margin-bottom: 10px;">Verification Failed</h2>
              <p style="color: #4b5563; margin-bottom: 20px;">User not found or link is invalid.</p>
              <a href="${process.env.FRONTEND_URL}/register" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Register</a>
            </div>
          </body>
        </html>
      `);
    }

    user.verified = true;
    await user.save();

    return res.status(200).send(`
      <html>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; margin: 0;">
          <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
            <h2 style="color: #10b981; margin-bottom: 10px;">Email Verified Successfully!</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">You are verified.</p>
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Login Page</a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; margin: 0;">
          <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
            <h2 style="color: #ef4444; margin-bottom: 10px;">Verification Failed</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">The verification link is invalid or has expired.</p>
            <a href="${process.env.FRONTEND_URL}/register" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Register</a>
          </div>
        </body>
      </html>
    `);
  }
}

/**
 * LOGOUT
 */
export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
}