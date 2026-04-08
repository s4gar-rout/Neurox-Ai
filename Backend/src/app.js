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
    origin: ["http://localhost:5173", "https://neurox-ai-two.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);
app.use(express.static("./public"));




export default app;