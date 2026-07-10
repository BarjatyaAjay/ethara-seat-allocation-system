import { Link } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaProjectDiagram,
  FaChair,
  FaRobot,
} from "react-icons/fa";

const Sidebar = () => {
  const menus = [
    {
      name: "Dashboard",
      path: "/",
      icon: <FaHome />,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <FaUsers />,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <FaProjectDiagram />,
    },
    {
      name: "Seats",
      path: "/seats",
      icon: <FaChair />,
    },
    {
      name: "AI Assistant",
      path: "/assistant",
      icon: <FaRobot />,
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white">
      <div className="text-center text-2xl font-bold py-6">
        ETHARA
      </div>

      {menus.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className="flex items-center gap-3 px-6 py-4 hover:bg-slate-700 transition"
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;