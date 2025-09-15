// src/pages/Outlet.jsx
import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { OUTLETS } from "../data/outlets.js";
import { useCart } from "../context/CartContext.jsx";

export default function Outlet() {
  const { slug } = useParams();
  const outlet = OUTLETS.find(o => o.slug === slug);
  const { addItem, cart } = useCart();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  const getFilterButtonClass = (filter) => {
    const baseClass = "px-4 py-2 rounded-full text-sm ";
    if (filter === activeFilter) {
      switch (filter) {
        case "veg": return baseClass + "bg-green-600 text-white";
        case "nonveg": return baseClass + "bg-red-600 text-white";
        default: return baseClass + "bg-blue-600 text-white";
      }
    }
    return baseClass + "bg-gray-100";
  };

  const getCategoryButtonClass = (category) => {
    return "px-4 py-2 rounded-full text-sm whitespace-nowrap " + 
      (activeCategory === category ? "bg-blue-600 text-white" : "bg-gray-100");
  };

  const categories = useMemo(() => {
    if (!outlet) return [];
    return ["all", ...new Set(outlet.menu.map(item => item.category))];
  }, [outlet]);

  const filteredMenu = useMemo(() => {
    if (!outlet) return [];
    return outlet.menu.filter(item => {
      const matchesFilter = activeFilter === "all" || 
        (activeFilter === "veg" && item.isVeg) || 
        (activeFilter === "nonveg" && !item.isVeg);
      const matchesCategory = activeCategory === "all" || 
        item.category === activeCategory;
      return matchesFilter && matchesCategory;
    });
  }, [outlet, activeFilter, activeCategory]);

  if (!outlet) {
    return <div className="p-8">Outlet not found</div>;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 shadow">
        <div className="flex items-center gap-4">
          <div className="w-32 h-20 bg-neutral-100 rounded overflow-hidden">
            {outlet.image ? (
              <img src={outlet.image} alt={outlet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="p-4 font-bold">{outlet.short}</div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{outlet.name}</h1>
            <p className="text-sm text-neutral-600 mt-1">{outlet.cuisine} • {outlet.eta}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveFilter("all")}
              className={getFilterButtonClass("all")}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("veg")}
              className={getFilterButtonClass("veg")}
            >
              Veg
            </button>
            <button
              onClick={() => setActiveFilter("nonveg")}
              className={getFilterButtonClass("nonveg")}
            >
              Non-veg
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={getCategoryButtonClass(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMenu.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-neutral-100 rounded overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="p-2">{item.name}</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{item.name}</h3>
                  {item.isVeg ? (
                    <span className="w-4 h-4 border-2 border-green-600 p-0.5">
                      <span className="block w-full h-full bg-green-600 rounded-sm"></span>
                    </span>
                  ) : (
                    <span className="w-4 h-4 border-2 border-red-600 p-0.5">
                      <span className="block w-full h-full bg-red-600 rounded-sm"></span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500">{item.desc}</p>
                <p className="text-sm text-neutral-700 mt-2">₹{item.price}</p>
                <p className="text-xs text-neutral-500 mt-1">{item.category}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => addItem(item, outlet)}
                className="rounded-md bg-blue-600 text-white px-3 py-2 hover:bg-blue-500"
              >
                Add +
              </button>
              <div className="text-xs text-neutral-500">
                In cart: {cart.items.find(i => i.id === item.id)?.qty || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
