// src/pages/Cart.jsx
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { saveOrder } from "../utils/api";
import { OUTLETS } from "../data/outlets";
import { useState } from "react";
import { getCampus } from "../data/campus";
import OrderConfirmDialog from "../components/OrderConfirmDialog";

export default function Cart() {
  const { cart, updateQty, removeItem, clearCart, total } = useCart();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const payable = Math.max(0, total - discount);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    let applied = 0;
    let msg = "";
    if (code === "CHITKARA10") {
      applied = Math.min(100, Math.round(total * 0.1));
      msg = `Applied 10% off (max ₹100): -₹${applied}`;
    } else if (code === "SAVE50" && total >= 299) {
      applied = 50;
      msg = "Applied flat ₹50 off";
    } else if (code === "FREESHIP") {
      applied = 30; // simulate delivery charge waived
      msg = "Applied ₹30 delivery waiver";
    } else {
      setCouponMsg("Invalid code or conditions not met");
      setDiscount(0);
      return;
    }
    setDiscount(applied);
    setCouponMsg(msg);
  };

  const handlePlaceOrderClick = () => {
    if (!cart.items.length) {
      alert("Your cart is empty");
      return;
    }
    // Directly open payment modal for smoother flow
    setPayOpen(true);
  };

  const handleConfirmOrder = async () => {
    try {
      const outlet = OUTLETS.find(o => o.slug === cart.outlet);
      const orderData = {
        items: cart.items,
        total,
        discount,
        payable,
        outlet: outlet?.name || "Unknown Outlet",
        campus: getCampus(),
        status: "Pending",
      };

      // After confirm, open mock payment
      // In new flow, we already open payment directly
      setPayOpen(true);
      // We'll actually save after payment success
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
      setConfirmOpen(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const outlet = OUTLETS.find(o => o.slug === cart.outlet);
      const orderData = {
        items: cart.items,
        total,
        discount,
        payable,
        outlet: outlet?.name || "Unknown Outlet",
        campus: getCampus(),
        status: "Pending",
      };
      await saveOrder(orderData);
      clearCart();
      setPayOpen(false);
      navigate("/orders");
    } catch (error) {
      console.error("Error saving paid order:", error);
      alert("Payment succeeded but failed to save order. Check connection.");
      setPayOpen(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white">Your Cart</h1>

      {!cart.items.length ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-lg">
            Your cart is empty. Add some items from an outlet.
          </p>
          <button
            onClick={() => navigate("/order-food")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Browse Outlets
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-none"
              >
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">{item.name}</div>
                    <div className="text-base text-neutral-600 dark:text-neutral-400 mt-1">
                      ₹{item.price} each
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-11 h-11 flex items-center justify-center text-blue-600 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-2xl"
                      disabled={item.qty <= 1}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-gray-900 dark:text-white font-semibold text-xl">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-11 h-11 flex items-center justify-center text-blue-600 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition text-2xl"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-base text-gray-900 dark:text-white">
                    <span className="text-neutral-600 dark:text-neutral-400">Subtotal: </span>
                    <span className="font-semibold">₹{item.price * item.qty}</span>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-500 hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Outlet</div>
                <div className="font-semibold text-gray-900 dark:text-white text-lg">{cart.outlet}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Amount</div>
                <div className="text-3xl font-bold text-blue-600">₹{total}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e)=>setCouponCode(e.target.value)}
                  placeholder="Coupon code (CHITKARA10 / SAVE50 / FREESHIP)"
                  className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-4 py-3 bg-white dark:bg-gray-800"
                />
                <button onClick={applyCoupon} className="px-4 py-3 bg-gray-900 text-white rounded">Apply</button>
              </div>
              {couponMsg && (
                <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{couponMsg}</div>
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
              <div className="flex justify-between mt-2 text-lg font-semibold">
                <span>To Pay</span>
                <span>₹{payable}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={clearCart}
                className="px-5 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white rounded-lg transition"
              >
                Clear Cart
              </button>
              <button
                onClick={handlePlaceOrderClick}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition"
              >
                Proceed to Pay • ₹{payable}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation kept available but not auto-used in new flow */}
      {confirmOpen && (
        <OrderConfirmDialog
          isOpen={confirmOpen}
          onConfirm={handleConfirmOrder}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      {payOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Complete Payment</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Mock payment gateway for demo.</p>
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2"><input type="radio" name="pm" defaultChecked/> UPI</label>
              <label className="flex items-center gap-2"><input type="radio" name="pm"/> Card</label>
              <label className="flex items-center gap-2"><input type="radio" name="pm"/> Cash on Pickup</label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setPayOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={handlePaymentSuccess} className="px-4 py-2 rounded bg-emerald-600 text-white">Pay ₹{payable}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
