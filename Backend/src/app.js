import express from 'express';
const app = express();
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import morgan from 'morgan';



// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // Log HTTP requests to the console
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  }),
);

app.use('/api/auth', authRouter);
app.use('/api/chats',chatRouter);
app.use(express.static("./public"));




export default app;