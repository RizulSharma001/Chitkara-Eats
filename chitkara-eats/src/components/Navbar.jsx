import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ShoppingCart, Sun, Moon } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar() {
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const count = cart.items.length;
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-neutral-100 dark:border-gray-800">
      <div className="container-pad h-16 flex items-center justify-between">
        <Link to="/order-food" className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-bold">
            CE
          </span>
          <span className="text-xl font-semibold hidden sm:inline">
            Chitkara <span className="text-red-600">Eats</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden sm:flex items-center gap-3">
          {[
            { to: "/order-food", label: "Order Food" },
            { to: "/orders", label: "Orders" },
            { to: "/account", label: "Account" },
            { to: "/contact", label: "Contact" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-colors duration-300
                ${
                  isActive
                    ? "bg-gray-200 dark:bg-gray-700 font-bold text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls: always visible (theme, cart, hamburger) */}
        <div className="flex items-center gap-2">
          <NavLink to="/vendor" className="hidden sm:inline px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
            Vendor Login
          </NavLink>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          <NavLink to="/cart" className="relative ml-1">
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </NavLink>

          <button
            className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile links dropdown */}
      <div className={`sm:hidden ${open ? 'block' : 'hidden'} bg-white/95 dark:bg-gray-900/95 border-b border-neutral-100 dark:border-gray-800`}> 
        <div className="container-pad py-2 flex flex-col gap-1">
          {[
            { to: "/order-food", label: "Order Food" },
            { to: "/orders", label: "Orders" },
            { to: "/account", label: "Account" },
            { to: "/contact", label: "Contact" },
            { to: "/vendor", label: "Vendor Login" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-3 rounded-md transition-colors duration-300 ${
                  isActive
                    ? 'bg-gray-200 dark:bg-gray-700 font-bold text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}
