import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../service/mail.service.js";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */

export async function register(req, res) {
  const { username, email, password } = req.body;

  const existingUser = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return res.status(400).json({
      message: "User with the same email or username already exists",
      success: false,
      err: "user already exists",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({ username, email, password: hash });

  const emailVerificationToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_SECRET,
  );

  await sendEmail({
    to: email,
    subject: "Welcome to Perplexity!",
    html: `
                <p>Hi ${username},</p>
                <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                 <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                <p>Best regards,<br>The Perplexity Team</p>
        `,
  });

  res.status(201).json({
    message: "User registered successfully",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/*
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Private
 * @body { email, password }
 */
export async function login(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
      success: false,
      err: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email or password",
      success: false,
      err: "Incorrect password",
    });
  }

  if (!user.verified) {
    return res.status(400).json({
      message: "Please verify your email before logging in",
      success: false,
      err: "Email not verified",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token);

  res.status(200).json({
    message: "Login successful",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}




/* 
 * @desc Get current user's profile
  * @route GET /api/auth/me
  * @access Private
  
*/

export async function getMe(req,res){
const userId=req.user.id;
const user = await userModel.findById(userId).select("-password");
if(!user){
    return res.status(404).json({
        message:"User not found",
        success:false,
        err:"User not found"
    });
}
res.status(200).json({
  message:"User profile fetched successfully",
  success:true,
  user
})

}



/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */

export async function verifyEmail(req, res) {
  const { token } = req.query;

  const renderHTML = (isSuccess, title, message, linkHref, linkText) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Neurox</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background-color: #030712; color: #f8fafc; font-family: 'Inter', sans-serif; }
        </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-[#050814]/80 border border-white/5 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl">
            <div class="w-16 h-16 ${isSuccess ? 'bg-lime-400 text-slate-900 shadow-lime-400/20' : 'bg-red-500/20 text-red-500 border border-red-500/50'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                ${isSuccess 
                  ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"></path><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path><path d="m16 19 2 2 4-4"></path></svg>'
                  : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
                }
            </div>
            <h1 class="text-2xl font-bold mb-3">${title}</h1>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed">${message}</p>
            <a href="${linkHref}" class="inline-flex items-center justify-center w-full ${isSuccess ? 'bg-lime-400 text-slate-900 border-none hover:brightness-110' : 'bg-slate-800 text-slate-100 border border-white/5 hover:bg-slate-700'} font-bold py-3.5 rounded-xl shadow-lg transition-all">${linkText}</a>
        </div>
    </body>
    </html>
  `;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).send(renderHTML(
        false, 
        "User Not Found", 
        "We couldn't find an account associated with this verification link. Please register a new account.", 
        "http://localhost:5173/register", 
        "Go to Register"
      ));
    }

    user.verified = true;
    await user.save();

    return res.status(200).send(renderHTML(
      true,
      "Email Verified!",
      "Your email has been successfully verified. You can now access all features of Neurox.",
      "http://localhost:5173/login",
      "Go to Login"
    ));
  } catch (err) {
    return res.status(400).send(renderHTML(
      false,
      "Verification Failed",
      "Invalid or expired token. The link may have been used already, or too much time has passed. Please try registering again.",
      "http://localhost:5173/register",
      "Go to Register"
    ));
  }
}

export async function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
}
