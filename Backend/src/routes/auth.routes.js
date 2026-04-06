import Router from "express";
import {
  register,
  verifyEmail,
  login,
  getMe,
  logout
} from "../controller/auth.controller.js";


import {
  registerValidator,
  loginValidator,
} from "../validator/auth.validator.js";

import {authUser} from "../middleware/auth.middleware.js";
const authRouter = Router();

/*
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register", registerValidator, register);

/*
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Private
 * @body { email, password }
 */
authRouter.post("/login", loginValidator, login);




/*
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Public
 */
authRouter.post("/logout", logout);

/* 
 * @route GET /api/auth/getMe
    * @desc Get current logged in user details
    * @access Private
    * @body { token }

*/
authRouter.get("/getMe",authUser, getMe);






/*
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
authRouter.get("/verify-email", verifyEmail);

export default authRouter;
