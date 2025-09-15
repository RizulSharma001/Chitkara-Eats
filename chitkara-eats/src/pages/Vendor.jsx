import { useEffect, useMemo, useState } from "react";
import { pickupByCode, getOrders, acceptOrder, updateOrderStatus, acceptByCode } from "../utils/api";
import jsQR from 'jsqr';

export default function Vendor() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("paste"); // paste | file
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [acceptId, setAcceptId] = useState("");
  const [filter, setFilter] = useState("All");
  const [fileName, setFileName] = useState("");
  const [fileObj, setFileObj] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await getOrders();
        setOrders(list);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter(o => (o.status || "").toLowerCase() === filter.toLowerCase());
  }, [orders, filter]);

  

async function decodeQrFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas and draw image to get pixel data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          resolve(code.data.toUpperCase());
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}


  const handleSubmit = async (e) => {
    e.preventDefault();
    let value = '';
    if (mode === 'paste') {
      value = (code || '').trim();
    } else {
      if (!fileObj) return;
      const decoded = await decodeQrFromFile(fileObj);
      if (!decoded) {
        alert('Could not read QR from image. Please paste the code manually.');
        return;
      }
      value = decoded.trim();
    }
    if (!value) return;
    setLoading(true);
    setResult(null);
    try {
      // Accept the order when QR is shown by student
      const res = await acceptByCode(value);
      setResult({ ok: true, order: res.order });
      // update listing
      setOrders(prev => {
        const exists = prev.find(o => o.id === res.order.id);
        if (exists) return prev.map(o => o.id === res.order.id ? res.order : o);
        return [res.order, ...prev];
      });
      setCode("");
      setFileObj(null);
      setFileName("");
    } catch (err) {
      setResult({ ok: false, message: err.message || "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    const id = acceptId.trim();
    if (!id) return;
    try {
      const res = await acceptOrder(id);
      setOrders(prev => prev.map(o => o.id === id ? res.order : o));
      setAcceptId("");
    } catch (err) {
      alert(err.message || "Failed to accept order");
    }
  };

  const handleAdvance = async (orderId, nextStatus) => {
    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Vendor Panel</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3">Accept by QR/Code</h2>
      <div className="flex gap-2 mb-3">
        {['paste','file'].map(m => (
          <button key={m} onClick={() => setMode(m)} type="button" className={`px-3 py-1 rounded text-sm ${mode===m?'bg-gray-200 dark:bg-gray-700':'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{m==='paste'?'Paste Code':'Scan QR (file)'}</button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'paste' ? (
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Paste pickup code"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-3 text-lg tracking-widest font-mono text-center text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
          />
        ) : (
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; setFileName(f? f.name: ''); setFileObj(f || null); }} className="flex-1 text-sm" />
            <span className="text-xs text-neutral-500 truncate max-w-[160px]">{fileName}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || (!(mode==='paste'?code:fileObj))}
          className="w-full bg-blue-600 text-white rounded px-4 py-3 disabled:opacity-60"
        >
          {loading ? "Accepting..." : "Accept Order"}
        </button>
      </form>
      {result && (
        <div className="mt-6 p-4 rounded border">
          {result.ok ? (
            <div>
              <div className="text-green-600 font-semibold mb-2">Accepted</div>
              <div className="text-sm">Order ID: <span className="font-mono">{result.order.id}</span></div>
              <div className="text-sm">Outlet: {result.order.outlet}</div>
              {result.order.campus && (
                <div className="text-sm">Campus: <span className="font-medium">{result.order.campus}</span></div>
              )}
              <div className="text-sm">Total: ₹{result.order.total}</div>
            </div>
          ) : (
            <div className="text-red-600">{result.message}</div>
          )}
        </div>
      )}
        </div>

        <div>
          <h2 className="font-semibold mb-3">Accept Order by ID</h2>
          <form onSubmit={handleAccept} className="flex gap-2">
            <input
              value={acceptId}
              onChange={(e) => setAcceptId(e.target.value)}
              placeholder="Enter order id"
              className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button className="px-4 py-3 bg-emerald-600 text-white rounded">Accept</button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm text-neutral-500">Filter:</span>
            {["All","Pending","Accepted","Picked"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm ${filter===f? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="mt-4 border rounded divide-y dark:divide-gray-700">
            {filtered.length === 0 && (
              <div className="p-4 text-sm text-neutral-500">No orders</div>
            )}
            {filtered.map(o => (
              <div key={o.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">#{o.id}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{o.outlet} • ₹{o.total}</div>
                  <div className="text-xs text-red-700 dark:text-red-300 mt-0.5">Campus: {o.campus || 'Punjab'}</div>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{o.status}</span>
                  {o.status !== 'Picked' && (
                    <>
                      {o.status === 'Pending' && (
                        <button className="px-2 py-1 rounded bg-emerald-600 text-white text-xs" onClick={() => handleAdvance(o.id,'Accepted')}>Accept</button>
                      )}
                      {o.status === 'Accepted' && (
                        <button className="px-2 py-1 rounded bg-indigo-600 text-white text-xs" onClick={() => handleAdvance(o.id,'Preparing')}>Start Preparing</button>
                      )}
                      {o.status === 'Preparing' && (
                        <button className="px-2 py-1 rounded bg-amber-600 text-white text-xs" onClick={() => handleAdvance(o.id,'Ready')}>Mark Ready</button>
                      )}
                      {o.status === 'Ready' && (
                        <button className="px-2 py-1 rounded bg-blue-600 text-white text-xs" onClick={() => handleAdvance(o.id,'Picked')}>Mark Picked</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


