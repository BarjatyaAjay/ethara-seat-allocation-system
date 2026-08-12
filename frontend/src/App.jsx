import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import AnimatedBackground from "./components/layout/AnimatedBackground";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Seats from "./pages/Seats";
import AIAssistant from "./pages/AIAssistant";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500/30 selection:text-sky-200">
      {/* Live Animated Starfield Background (Clean Dark Navy, 0 Fog) */}
      <AnimatedBackground />

      {/* Main Layout Container */}
      <div className="relative z-10 flex min-h-screen w-full">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-y-auto">
            {/* Keyed container for smooth page entrance animations */}
            <div key={location.pathname} className="animate-page-entrance">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/seats" element={<Seats />} />
                <Route path="/assistant" element={<AIAssistant />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
