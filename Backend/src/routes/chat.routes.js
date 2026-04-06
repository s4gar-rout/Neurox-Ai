import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { sendMessage } from "../controller/chat.controller.js";
import { getMessages } from "../controller/chat.controller.js";
import { deleteChat } from "../controller/chat.controller.js";
import { getChats } from "../controller/chat.controller.js";
const chatRouter = Router();

chatRouter.post('/message',authUser,sendMessage)
chatRouter.get("/", authUser, getChats);

chatRouter.get("/:chatId/messages", authUser, getMessages);

chatRouter.delete("/delete/:chatId", authUser, deleteChat);

export default chatRouter;