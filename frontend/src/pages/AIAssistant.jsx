import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaPaperPlane, FaRobot, FaUser, FaMagic, FaTrash, FaCheckCircle, FaBolt } from "react-icons/fa";
import api from "../services/api";

const SUGGESTIONS = [
  "Show available seats",
  "Show dashboard summary",
  "Show project utilization",
  "Find unassigned employees",
  "Show floor utilization",
];

const AIAssistant = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [allocating, setAllocating] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("ai_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai_chat_history", JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askAI = async (text) => {
    const q = (text || query).trim();
    if (!q) return;

    const userMsg = { role: "user", content: q, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await api.post("/ai/query", { query: q });
      const assistantMsg = {
        role: "assistant",
        content: res.data,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      toast.error("AI request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: { explanation: "Sorry, something went wrong. Please try again." },
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const autoAllocate = async () => {
    if (!employeeId) {
      toast.error("Enter Employee ID");
      return;
    }

    try {
      setAllocating(true);
      const res = await api.post(`/seats/auto-allocate/${employeeId}`);
      const msg = res.data.message || "Seat allocated successfully";
      toast.success(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: {
            explanation: msg,
            results: res.data.seat
              ? [
                  {
                    seat_code: res.data.seat.seat_code,
                    employee: res.data.employee?.name,
                    floor: res.data.seat.floor,
                  },
                ]
              : [],
            intent: "auto_allocate",
          },
          timestamp: new Date().toISOString(),
        },
      ]);
      setEmployeeId("");
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;
      toast.error(typeof detail === "string" ? detail : "Allocation failed");
    } finally {
      setAllocating(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("ai_chat_history");
    toast.success("Chat history cleared");
  };

  const renderTable = (results) => {
    if (!Array.isArray(results) || results.length === 0) return null;
    const keys = Object.keys(results[0]);

    return (
      <div className="overflow-x-auto mt-3 rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
        <table className="min-w-full text-xs text-left border-collapse">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase whitespace-nowrap">
            <tr>
              {keys.map((key) => (
                <th key={key} className="px-3.5 py-2.5">
                  {key.replaceAll("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {results.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors duration-150">
                {keys.map((key) => (
                  <td key={key} className="px-3.5 py-2.5 font-medium whitespace-nowrap">
                    {key === "seat_code" && row[key] ? (
                      <span className="seat-code-pill">
                        <span>{row[key]}</span>
                      </span>
                    ) : row[key] !== null && row[key] !== undefined ? (
                      String(row[key])
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMessage = (msg) => {
    if (msg.role === "user") {
      return (
        <div className="flex justify-end mb-5 animate-in slide-in-from-right-4 fade-in duration-250">
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold rounded-2xl rounded-tr-xs px-4 py-3 shadow-[0_0_20px_rgba(34,211,238,0.18)]">
              <p className="text-xs md:text-sm font-medium leading-relaxed">{msg.content}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FaUser size={13} />
            </div>
          </div>
        </div>
      );
    }

    const data = msg.content;
    return (
      <div className="flex justify-start mb-5 animate-in slide-in-from-left-4 fade-in duration-250">
        <div className="flex items-start gap-3 max-w-[90%]">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_15px_rgba(129,140,248,0.2)]">
            <FaRobot size={14} />
          </div>
          <div
            className={`rounded-2xl rounded-tl-xs px-5 py-4 border shadow-xl ${
              msg.error
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "glass-panel border-slate-800/80 text-slate-200"
            }`}
          >
            {data.intent && (
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {data.intent.replaceAll("_", " ")}
                </span>
                {data.confidence > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {(data.confidence * 100).toFixed(0)}% confidence
                  </span>
                )}
              </div>
            )}
            <p className="text-xs md:text-sm leading-relaxed text-slate-200">{data.explanation}</p>
            {data.result_count > 0 && (
              <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                {data.result_count} record(s) retrieved
              </p>
            )}
            {renderTable(data.results)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen flex flex-col animate-page-entrance">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800/80 shrink-0 stagger-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-text-indigo">
              AI Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              Engine v2.4 Active
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Query workforce metrics, seat distribution, and trigger automated intelligent allocation.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition btn-micro"
          >
            <FaTrash size={11} /> Clear History
          </button>
        )}
      </div>

      {/* Main Command Surface */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 stagger-2">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl min-h-[500px]">
          {/* Scrollable Messages */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_30px_rgba(129,140,248,0.2)]">
                  <FaMagic className="text-3xl text-indigo-400 animate-pulse" />
                </div>

                <div className="space-y-1 max-w-md">
                  <h2 className="text-xl font-bold text-slate-100">
                    Ethara AI Workspace Assistant
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ask questions in natural language regarding seat availability, employee allocations, project capacity, and floor metrics.
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="flex flex-wrap gap-2 justify-center max-w-lg pt-3">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={s}
                      onClick={() => askAI(s)}
                      className="text-xs bg-slate-800/60 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 px-3 py-2 rounded-xl transition duration-200 btn-micro"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      "{s}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => <div key={i}>{renderMessage(msg)}</div>)
            )}

            {/* Three-Dot Sequential Typing Indicator */}
            {loading && (
              <div className="flex justify-start mb-4 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <FaRobot size={14} />
                  </div>
                  <div className="glass-panel border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 glass-input rounded-2xl px-4 py-3 text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Ask about seats, employees, projects... (Press Enter ↵ to send)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && askAI()}
                disabled={loading}
              />
              <button
                onClick={() => askAI()}
                disabled={loading || !query.trim()}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-md disabled:opacity-40 btn-micro btn-shine transition"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Auto Allocate Control Panel */}
        <div className="lg:w-80 glass-panel rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between shrink-0 shadow-2xl h-fit space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <FaBolt size={14} />
              </div>
              <h2 className="text-base font-bold text-slate-100">Auto Allocation</h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically calculate and assign the optimal open seat for an unassigned employee based on team zone algorithms.
            </p>

            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Employee ID
              </label>
              <input
                type="number"
                className="glass-input rounded-xl p-3 text-xs w-full focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Enter Employee ID..."
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={autoAllocate}
            disabled={allocating || !employeeId}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md btn-micro btn-shine transition disabled:opacity-40"
          >
            <FaCheckCircle size={14} />
            <span>{allocating ? "Allocating..." : "Auto Allocate Seat"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
