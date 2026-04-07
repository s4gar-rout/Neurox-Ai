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
      subject: "Verify Your Email -   NEUROX-AI",
      html: `
        <html>
          <body style="font-family: 'Inter', Arial, sans-serif; background-color: #050814; margin: 0; padding: 40px 20px; color: white;">
            <div style="background-color: #050814; padding: 40px; text-align: center; max-width: 420px; width: 100%; margin: 0 auto;">
              <!-- Glowing Mail icon -->
              <div style="margin: 0 auto 30px; width: 64px; height: 64px; background-color: #a3e635; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(163, 230, 53, 0.4);">
                <img src="https://api.iconify.design/lucide:mail-check.svg?color=%23050814" alt="Mail" width="32" height="32" style="display: block; margin: 16px;" />
              </div>
              <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #ffffff;">Verify Your Email</h2>
              <p style="color: #9ca3af; margin-bottom: 15px; font-size: 16px; line-height: 1.6;">Hi <strong style="color: #ffffff;">${username}</strong>,</p>
              <p style="color: #9ca3af; margin-bottom: 30px; font-size: 16px; line-height: 1.6;">Welcome to Neurox! Please confirm your email address to activate your account and start using our service.</p>
              <a href="${verifyLink}" style="background-color: #1e293b; color: #f1f5f9; padding: 14px 24px; display: inline-block; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
                Verify Email
              </a>
              <p style="color: #6b7280; margin-top: 40px; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
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
          <body style="font-family: 'Inter', Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #050814; margin: 0; padding: 20px; color: white;">
            <div style="text-align: center; max-width: 420px; width: 100%;">
              <div style="margin: 0 auto 30px; width: 64px; height: 64px; background-color: #ef4444; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verification Failed</h2>
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                User not found or link is invalid. Please try registering again.
              </p>
              <a href="${process.env.FRONTEND_URL}/register" style="background-color: #1e293b; color: #f1f5f9; padding: 14px 24px; display: block; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
                Go to Register
              </a>
            </div>
          </body>
        </html>
      `);
    }

    user.verified = true;
    await user.save();

    return res.status(200).send(`
      <html>
        <body style="font-family: 'Inter', Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #050814; margin: 0; padding: 20px; color: white;">
          <div style="text-align: center; max-width: 420px; width: 100%;">
            <div style="margin: 0 auto 30px; width: 64px; height: 64px; background-color: #a3e635; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(163, 230, 53, 0.4);">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#050814" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"></path>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                <path d="m16 19 2 2 4-4"></path>
              </svg>
            </div>
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Email Verified Successfully!</h2>
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
              You have successfully verified your email. Please login to access your account.
            </p>
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #1e293b; color: #f1f5f9; padding: 14px 24px; display: block; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; transition: background-color 0.2s;">
              Go to Login
            </a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    return res.status(400).send(`
      <html>
        <body style="font-family: 'Inter', Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #050814; margin: 0; padding: 20px; color: white;">
          <div style="text-align: center; max-width: 420px; width: 100%;">
            <div style="margin: 0 auto 30px; width: 64px; height: 64px; background-color: #ef4444; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verification Failed</h2>
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
              The verification link is invalid or has expired.
            </p>
            <a href="${process.env.FRONTEND_URL}/register" style="background-color: #1e293b; color: #f1f5f9; padding: 14px 24px; display: block; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
              Go to Register
            </a>
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