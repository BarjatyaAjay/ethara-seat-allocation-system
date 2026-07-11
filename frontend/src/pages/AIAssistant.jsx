import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
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
              ? [{
                  seat_code: res.data.seat.seat_code,
                  employee: res.data.employee?.name,
                  floor: res.data.seat.floor,
                }]
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
      <div className="overflow-x-auto mt-3 rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {keys.map((key) => (
                <th key={key} className="px-3 py-2 text-left font-medium text-gray-600 capitalize">
                  {key.replaceAll("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                {keys.map((key) => (
                  <td key={key} className="px-3 py-2 text-gray-700">
                    {row[key] !== null && row[key] !== undefined ? String(row[key]) : "-"}
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
        <div className="flex justify-end mb-4">
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
              <p className="text-sm">{msg.content}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUser className="text-blue-600 text-sm" />
            </div>
          </div>
        </div>
      );
    }

    const data = msg.content;
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-2 max-w-[90%]">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FaRobot className="text-purple-600 text-sm" />
          </div>
          <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${msg.error ? "bg-red-50" : "bg-white shadow-sm border"}`}>
            {data.intent && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {data.intent.replaceAll("_", " ")}
                </span>
                {data.confidence > 0 && (
                  <span className="text-xs text-gray-400">
                    {(data.confidence * 100).toFixed(0)}% confidence
                  </span>
                )}
              </div>
            )}
            <p className="text-sm text-gray-700">{data.explanation}</p>
            {data.result_count > 0 && (
              <p className="text-xs text-gray-400 mt-1">{data.result_count} result(s)</p>
            )}
            {renderTable(data.results)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaRobot className="text-purple-600" /> AI Seat Assistant
        </h1>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow overflow-hidden min-h-[500px]">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <FaRobot className="text-5xl text-purple-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  How can I help you?
                </h2>
                <p className="text-gray-500 mb-6 max-w-md">
                  Ask about seat availability, employee allocations, project utilization, and more.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => askAI(s)}
                      className="text-sm bg-purple-50 text-purple-700 px-3 py-2 rounded-full hover:bg-purple-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => <div key={i}>{renderMessage(msg)}</div>)
            )}

            {loading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaRobot className="text-purple-600 text-sm" />
                  </div>
                  <div className="bg-white shadow-sm border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ask about seats, employees, projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && askAI()}
                disabled={loading}
              />
              <button
                onClick={() => askAI()}
                disabled={loading || !query.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:w-80 bg-white rounded-xl shadow p-5 h-fit">
          <h2 className="text-lg font-bold mb-4">Auto Allocate</h2>
          <p className="text-sm text-gray-500 mb-3">
            Automatically assign the best available seat to an employee.
          </p>
          <input
            type="number"
            className="border rounded-lg p-3 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <button
            onClick={autoAllocate}
            disabled={allocating}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg disabled:opacity-50"
          >
            {allocating ? "Allocating..." : "Auto Allocate Seat"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
