// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Orders from "./pages/Orders.jsx";
import Account from "./pages/Account.jsx";
import Contact from "./pages/Contact.jsx";
import Outlet from "./pages/Outlet.jsx";
import Cart from "./pages/Cart.jsx";
import Vendor from "./pages/Vendor.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Navbar />
        <main className="flex-1 container-pad py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/order-food" />} />
            <Route path="/order-food" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/account" element={<Account />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/outlet/:slug" element={<Outlet />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/vendor" element={<Vendor />} />
            <Route path="*" element={<div className="text-center py-20">404</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
