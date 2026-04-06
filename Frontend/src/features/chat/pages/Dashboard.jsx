import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../../auth/hook/useAuth";
import { useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./dashboard.css";

// ── Typing Dots ────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-lime-400"
          style={{
            animation: `typingBounce 1.2s ${i * 0.2}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-5px)}
        }
      `}</style>
    </span>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-2 ml-12">
        <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-white/5 px-5 py-3.5 rounded-3xl rounded-tr-sm text-slate-100 text-sm leading-relaxed max-w-[85%] wrap-break-word whitespace-pre-wrap">
          {msg.content}
        </div>
        {time && (
          <span className="text-[10px] text-slate-600 pr-1">
            ✓✓ Sent {time}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 mr-12">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center text-slate-900 shrink-0">
          <iconify-icon icon="lucide:bot" className="text-base"></iconify-icon>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-lime-400">
          Neurox
        </span>
      </div>
      <div className="bg-slate-900/60 border border-white/5 px-5 py-4 rounded-3xl rounded-tl-sm text-slate-300 text-sm leading-relaxed max-w-[90%] markdown-content">
        {msg.typing ? (
          <TypingDots />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
      {!msg.typing && time && (
        <span className="text-[10px] text-slate-600 pl-1">{time}</span>
      )}
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      <div className="w-14 h-14 rounded-2xl bg-lime-400/5 border border-lime-400/10 flex items-center justify-center">
        <iconify-icon
          icon="lucide:brain"
          className="text-3xl text-lime-400/40"
        ></iconify-icon>
      </div>
      <p className="text-sm text-slate-500">Start a conversation with Neurox</p>
    </div>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="flex flex-col items-start gap-3 mr-12 mt-2 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-lime-400/20 flex items-center justify-center shrink-0">
          <iconify-icon
            icon="lucide:brain"
            className="text-base text-lime-400/50"
          ></iconify-icon>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-lime-400/50">
          Neurox
        </span>
      </div>
      <div className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl rounded-tl-sm w-full max-w-[85%] flex flex-col gap-3">
        <div className="h-2.5 bg-slate-700/50 rounded-full w-full"></div>
        <div className="h-2.5 bg-slate-700/50 rounded-full w-5/6"></div>
        <div className="h-2.5 bg-slate-700/50 rounded-full w-4/6"></div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = () => {
  // ek hi jagah se sab lo — do baar useChat() call mat karo
  const {
    handleDeleteChat,
    handleSendMessage,
    handleOpenChat,
    handleGetChats,
    handleNewChat,
    initializeSocketConnection,
  } = useChat();

  const [chatInput, setChatInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState(null);
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentMessages = chats?.[currentChatId]?.messages ?? [];
  const chatList = chats ? Object.values(chats).reverse() : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  useEffect(() => {
    initializeSocketConnection();
    handleGetChats();
  }, []);

  const handleSubmitMessage = async (event) => {
    event?.preventDefault();
    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) return;

    // Optimistic UI update instantly shows user message
    setPendingMessage({
      content: trimmedMessage,
      role: "user",
      createdAt: new Date().toISOString(),
    });
    setChatInput("");

    await handleSendMessage({ message: trimmedMessage, chatId: currentChatId });
    setPendingMessage(null); // Clear once Redux updates with actual backend state
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };

  const openChat = (chatId) => {
    handleOpenChat(chatId, chats);
    setIsSidebarOpen(false);
  };

  const onNewChat = () => {
    handleNewChat?.();
    setIsSidebarOpen(false);
  };

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <div className="h-screen w-full flex overflow-hidden relative bg-[#030712]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          w-72 bg-[#050814]/80 border-r border-white/5 flex flex-col z-30 shrink-0
          absolute inset-y-0 left-0 transition-transform duration-300
          md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-lime-400 rounded-xl flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.25)]">
              <iconify-icon
                icon="lucide:brain"
                className="text-lg"
              ></iconify-icon>
            </div>
            <span className="text-lg font-bold text-slate-100 tracking-tight">
              Neurox
            </span>
          </div>
          <button
            className="md:hidden text-slate-500 hover:text-white transition-colors p-1"
            onClick={() => setIsSidebarOpen(false)}
          >
            <iconify-icon icon="lucide:x" className="text-xl"></iconify-icon>
          </button>
        </div>

        {/* New Thread */}
        <div className="px-4 pb-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/7 text-slate-200 text-sm transition-all cursor-pointer"
          >
            <iconify-icon
              icon="lucide:plus"
              className="text-lime-400"
            ></iconify-icon>
            New Thread
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
          {chatList.length > 0 && (
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 py-2">
              Recent Chats
            </div>
          )}
          {chatList.map((c) => {
            const chatId = c.id || c._id;
            const isActive = chatId === currentChatId;
            return (
              <div
                key={chatId}
                className={`
                  group flex items-center gap-1 px-2 py-2 rounded-xl transition-all
                  ${
                    isActive
                      ? "bg-lime-400/6 border border-lime-400/10"
                      : "border border-transparent hover:bg-white/3"
                  }
                `}
              >
                {/* Chat open button */}
                <button
                  onClick={() => openChat(chatId)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer text-left"
                >
                  <iconify-icon
                    icon="lucide:message-square"
                    className={`shrink-0 transition-colors ${isActive ? "text-lime-400" : "text-slate-600"}`}
                  ></iconify-icon>
                  <span
                    className={`truncate text-sm ${isActive ? "text-slate-200" : "text-slate-400"}`}
                  >
                    {c.title?.replace(/[\*"]/g, "") ||
                      c.name?.replace(/[\*"]/g, "") ||
                      "New Chat"}
                  </span>
                </button>

                {/* Delete button — hover par dikhta hai */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chatId);
                  }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 text-slate-600 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-400/10 cursor-pointer"
                >
                  <iconify-icon
                    icon="lucide:trash-2"
                    className="text-sm"
                  ></iconify-icon>
                </button>
              </div>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "Felix"}`}
                alt="User avatar"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-200 truncate">
                {user?.username || "Felix Arvid"}
              </div>
              <div className="text-xs text-slate-500">Pro Plan</div>
            </div>
            <button className="text-slate-500 hover:text-white transition-colors shrink-0">
              <iconify-icon
                icon="lucide:settings"
                className="text-xl"
              ></iconify-icon>
            </button>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs text-slate-600 hover:text-red-400 transition-colors px-1 cursor-pointer"
          >
            <iconify-icon icon="lucide:log-out"></iconify-icon>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0e27]/40">
        {/* Header */}
        <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 border-b border-white/5 bg-[#030712]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 md:gap-4 max-w-[60%] md:max-w-none">
            <button
              className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
              onClick={() => setIsSidebarOpen(true)}
            >
              <iconify-icon
                icon="lucide:menu"
                className="text-xl"
              ></iconify-icon>
            </button>
            <span className="text-sm text-slate-300 truncate">
              {chats?.[currentChatId]?.title?.replace(/[\*"]/g, "") ||
                chats?.[currentChatId]?.name?.replace(/[\*"]/g, "") ||
                "Neurox"}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/3 hover:bg-white/7 border border-white/5 text-xs text-slate-300 transition-all">
              <iconify-icon icon="lucide:share-2"></iconify-icon>
              <span className="hidden sm:block">Share</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 transition-all">
              <iconify-icon icon="lucide:info"></iconify-icon>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-7 min-h-full">
            {currentMessages.length === 0 && !pendingMessage ? (
              <WelcomeScreen />
            ) : (
              currentMessages.map((msg, idx) => (
                <MessageBubble key={msg.id || msg._id || idx} msg={msg} />
              ))
            )}
            {pendingMessage && <MessageBubble msg={pendingMessage} />}
            {isLoading && <SkeletonLoader />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-6 bg-linear-to-t from-[#030712] via-[#030712]/90 to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-[#050814]/90 border border-white/[0.07] rounded-2xl px-3 py-2 shadow-2xl focus-within:border-lime-400/20 transition-colors">
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/3 text-slate-500 transition-all shrink-0">
                <iconify-icon
                  icon="lucide:paperclip"
                  className="text-lg"
                ></iconify-icon>
              </button>

              <input
                ref={inputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 text-sm py-3 caret-lime-400"
              />

              <div className="flex items-center gap-1 shrink-0">
                <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-white/3 text-slate-500 transition-all">
                  <iconify-icon
                    icon="lucide:mic"
                    className="text-lg"
                  ></iconify-icon>
                </button>
                <button
                  disabled={!chatInput.trim() || isLoading}
                  onClick={handleSubmitMessage}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-xl text-lg transition-all
                    ${
                      chatInput.trim() && !isLoading
                        ? "bg-lime-400 text-slate-900 hover:brightness-110 active:scale-95 cursor-pointer shadow-lg shadow-lime-400/10"
                        : "bg-slate-800 text-slate-600 cursor-not-allowed"
                    }
                  `}
                >
                  <iconify-icon
                    icon="lucide:arrow-right"
                    className="text-xl"
                  ></iconify-icon>
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <iconify-icon
                  icon="lucide:zap"
                  className="text-amber-500/60"
                ></iconify-icon>
                Gemini 2.0 Flash
              </span>
              <span className="flex items-center gap-1.5">
                <iconify-icon
                  icon="lucide:globe"
                  className="text-blue-500/60"
                ></iconify-icon>
                Web Search
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <iconify-icon
                  icon="lucide:shield-check"
                  className="text-lime-500/60"
                ></iconify-icon>
                Safe Mode
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
