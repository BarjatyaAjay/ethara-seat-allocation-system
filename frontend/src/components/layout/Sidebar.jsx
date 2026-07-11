import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaProjectDiagram, FaChair, FaRobot, FaTimes } from "react-icons/fa";

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/", icon: <FaHome /> },
    { name: "Employees", path: "/employees", icon: <FaUsers /> },
    { name: "Projects", path: "/projects", icon: <FaProjectDiagram /> },
    { name: "Seats", path: "/seats", icon: <FaChair /> },
    { name: "AI Assistant", path: "/assistant", icon: <FaRobot /> },
  ];

  return (
    <div
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-6">
        <span className="text-2xl font-bold">ETHARA</span>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
          <FaTimes />
        </button>
      </div>

      <nav>
        {menus.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-6 py-4 transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
