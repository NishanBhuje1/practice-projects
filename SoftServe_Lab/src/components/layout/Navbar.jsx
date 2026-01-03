import { NavLink } from "react-router-dom";
import ThemeToggle from "../theme/ThemeToggle.jsx";

function linkClass({ isActive }) {
  return [
    "text-sm px-3 py-2 rounded-full transition border",
    "backdrop-blur",
    isActive
      ? "border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm"
      : "border-transparent hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--card))]",
  ].join(" ");
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[rgb(var(--border))/0.6] bg-[rgb(var(--bg))/0.85] backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <NavLink to="/" className="font-semibold tracking-tight">
          SoftServe Lab
        </NavLink>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          <NavLink to="/book" className={linkClass}>Book Online</NavLink>
          <NavLink to="/admin" className={linkClass}>Admin</NavLink>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
