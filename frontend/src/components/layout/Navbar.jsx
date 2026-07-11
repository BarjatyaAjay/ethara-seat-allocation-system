import { FaBars } from "react-icons/fa";

const Navbar = ({ onMenuToggle }) => {
  return (
    <div className="h-14 md:h-16 bg-white shadow flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <FaBars className="text-gray-600" />
        </button>
        <h1 className="text-lg md:text-2xl font-bold text-blue-600 truncate">
          Ethara Seat Allocation
        </h1>
      </div>

      <div className="text-sm md:text-base font-medium text-gray-600">
        Admin
      </div>
    </div>
  );
};

export default Navbar;
