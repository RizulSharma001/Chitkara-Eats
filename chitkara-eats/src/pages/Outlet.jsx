import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { OUTLETS } from "../data/outlets.js";
import { OUTLETS_HIMACHAL } from "../data/outlets_himachal.js";
import { getCampus } from "../data/campus.js";
import { useCart } from "../context/CartContext.jsx";

export default function Outlet() {
  const { slug } = useParams();
  const campus = getCampus();
  const dataset = campus === "Himachal" ? OUTLETS_HIMACHAL : OUTLETS;
  // Fallback: if slug not found in chosen campus, look across both to ensure deep links work
  const outlet = (dataset.find(o => o.slug === slug) || [...OUTLETS, ...OUTLETS_HIMACHAL].find(o => o.slug === slug));
  const { addItem, changeItemQty, cart } = useCart();
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
    return baseClass + "bg-gray-100 dark:bg-gray-700 dark:text-gray-300";
  };

  const getCategoryButtonClass = (category) => {
    return "px-4 py-2 rounded-full text-sm whitespace-nowrap " + 
      (activeCategory === category 
        ? "bg-blue-600 text-white" 
        : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300");
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
    return <div className="p-8 text-gray-900 dark:text-gray-100">Outlet not found</div>;
  }

  return (
    <section className="container-pad py-6 space-y-6 mx-auto max-w-screen-xl">
      {/* Header card */}
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl p-4 flex flex-col gap-4 shadow">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-[140px] sm:w-[160px] h-[90px] sm:h-[100px] rounded overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            {outlet.image ? (
              <img
                src={outlet.image}
                alt={outlet.name}
                className="w-auto max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="p-4 font-bold">{outlet.short}</div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold">{outlet.name}</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{outlet.cuisine} • {outlet.eta}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="border-t pt-4">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveFilter("all")} className={getFilterButtonClass("all")}>All</button>
            <button onClick={() => setActiveFilter("veg")} className={getFilterButtonClass("veg")}>Veg</button>
            <button onClick={() => setActiveFilter("nonveg")} className={getFilterButtonClass("nonveg")}>Non-veg</button>
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

      {/* Menu items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredMenu.map(item => {
          const qtyInCart = cart.items.find(i => i.id === item.id)?.qty || 0;
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 shadow"
              style={{ minWidth: "280px" }}
            >
              {/* Item details */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded overflow-hidden">
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
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">₹{item.price}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{item.category}</p>
                </div>
              </div>

              {/* Add button or quantity selector */}
              <div className="flex flex-col items-end gap-2 w-28 md:w-32">
                {qtyInCart > 0 ? (
                  <div className="flex items-center justify-between rounded-md bg-blue-600 text-white px-2 py-1 w-full">
                    <button
                      onClick={() => changeItemQty(item, outlet, -1)}
                      className="w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-500 rounded"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center">{qtyInCart}</span>
                    <button
                      onClick={() => changeItemQty(item, outlet, 1)}
                      className="w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-500 rounded"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => changeItemQty(item, outlet, 1)}
                    className="rounded-md bg-blue-600 text-white w-full h-12 flex items-center justify-center hover:bg-blue-500"
                  >
                    Add +
                  </button>
                )}
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  In cart: {qtyInCart}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
