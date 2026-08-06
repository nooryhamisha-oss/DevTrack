import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { askGuideBot, buildGreeting } from "../services/ai.js";
import { fetchChatHistory, saveChatMessage } from "../services/chat.js";
import { useDevTrack } from "../context/DevTrackContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const PAGE_NAMES = {
  "/": "Dashboard",
  "/app": "Dashboard",
  "/dashboard": "Project Analysis",
  "/skill-gap": "Skill Gap",
  "/planner": "Roadmap",
  "/history": "Progress History",
  "/settings": "Settings",
};

const QUICK_SUGGESTIONS = [
  "What's my portfolio score?",
  "What should I improve first?",
  "How close am I to job-ready?",
];

export default function GuideBot() {
  const location = useLocation();
  const { user } = useAuth();
  const {
    guideNotification,
    markGuideNotificationRead,
    username,
    portfolioResult,
    skillGapResult,
    learningPath,
  } = useDevTrack();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: buildGreeting() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const panelRef = useRef(null);
  const historyLoadedRef = useRef(false);

  useEffect(() => {
    if (!user || historyLoadedRef.current) return;
    historyLoadedRef.current = true;
    fetchChatHistory(user.id)
      .then((history) => {
        if (history.length > 0) setMessages(history);
      })
      .catch(() => {});
  }, [user?.id]);

  const currentPageName =
    PAGE_NAMES[location.pathname] ||
    (location.pathname.startsWith("/repo/")
      ? "Repository Analysis"
      : "Dashboard");

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (guideNotification?.unread) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: guideNotification.message },
      ]);
    }
  }, [guideNotification?.message]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleOpen() {
    setOpen((o) => !o);
    if (guideNotification?.unread) markGuideNotificationRead();
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    if (user) saveChatMessage(user.id, "user", text).catch(() => {});
    try {
      const reply = await askGuideBot(nextMessages, currentPageName, {
        username,
        portfolioResult,
        skillGapResult,
        learningPath,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (user) saveChatMessage(user.id, "assistant", reply).catch(() => {});
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I can't respond right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    sendMessage(input);
  }

  const isFreshConversation = messages.length <= 1;
  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        {!open && (
          <span className="bg-panel2 border border-border text-ink text-xs font-mono px-3 py-2 rounded-card shadow-lg whitespace-nowrap">
            Ask DreamEagle 🦅
          </span>
        )}
        <button
          onClick={handleOpen}
          className="rounded-full bg-gradient-to-br from-violet to-cyan
                     shadow-lg flex items-center justify-center text-bg hover:scale-105 transition-transform relative"
          style={{ width: 52, height: 52 }}
          aria-label="Open DreamEagle assistant"
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
          {guideNotification?.unread && !open && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-flag border-2 border-bg" />
          )}
        </button>
      </div>
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-5 z-50 w-[340px] max-h-[480px] flex flex-col card shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-violet-soft">
            <Sparkles size={16} className="text-violet" />
            <div>
              <p className="font-display text-sm font-semibold">DreamEagle</p>
              <p className="text-[10px] text-ink-faint font-mono">
                on {currentPageName}
              </p>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-xs leading-relaxed max-w-[85%] px-3 py-2 rounded-card whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-violet text-bg ml-auto"
                    : "bg-panel text-ink"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-ink-faint text-xs">
                <Loader2 size={13} className="animate-spin" /> Typing...
              </div>
            )}

            {isFreshConversation && !loading && (
              <div className="flex flex-col gap-1.5 pt-1">
                {QUICK_SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs font-mono px-3 py-2 rounded-card border border-border text-ink-soft hover:border-violet/40 hover:text-violet transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-border flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 rounded-card border border-border bg-panel text-ink text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-card bg-violet flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
