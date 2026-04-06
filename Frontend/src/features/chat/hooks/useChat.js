import { initializeSocketConnection } from "../services/chat.socket";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
} from "../services/chat.api";
import {
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
  createNewChat,
  addNewMessage,
  addMessages,
  removeChat,
} from "../chat.slice";
import { useDispatch } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();

  async function handleSendMessage({ message, chatId }) {
    dispatch(setLoading(true));
    const data = await sendMessage({ message, chatId });
    const { chat, aiMessage } = data;

    if (!chatId) {
      // ✅ sirf naya chat hone par naya thread banao aur switch karo
      dispatch(createNewChat({
        chatId: chat._id,
        title: chat.title,
      }));
      dispatch(setCurrentChatId(chat._id)); // ← yahan shift kiya
    }

    dispatch(addNewMessage({
      chatId: chatId || chat._id,
      content: message,
      role: "user",
    }));

    dispatch(addNewMessage({
      chatId: chatId || chat._id,
      content: aiMessage.content,
      role: aiMessage.role,
    }));

 

    dispatch(setLoading(false));
  }

  async function handleGetChats() {
    dispatch(setLoading(true));
    const data = await getChats();
    const { chats } = data;
    dispatch(
      setChats(
        chats.reduce((acc, chat) => {
          acc[chat._id] = {
            id: chat._id,
            title: chat.title,
            messages: [],
            lastUpdated: chat.updatedAt,
          };
          return acc;
        }, {}),
      ),
    );
    dispatch(setLoading(false));
  }

  async function handleOpenChat(chatId, chats) {
    console.log(chats[chatId]?.messages.length);

    if (chats[chatId]?.messages.length === 0) {
      const data = await getMessages(chatId);
      const { messages } = data;

      const formattedMessages = messages.map((msg) => ({
        content: msg.content,
        role: msg.role,
      }));

      dispatch(
        addMessages({
          chatId,
          messages: formattedMessages,
        }),
      );
    }
    dispatch(setCurrentChatId(chatId));
  }
  async function handleDeleteChat(chatId) {
    await deleteChat(chatId);
    dispatch(removeChat(chatId));
  }
  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleDeleteChat,
  };
};
