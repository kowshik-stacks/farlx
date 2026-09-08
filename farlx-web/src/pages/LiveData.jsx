import { useEffect, useState } from "react";
import { ArrowLeft, Database, Send, Zap, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "https://farlx-backend.onrender.com";
const API = `${API_BASE}/api`;

export default function LiveData() {
  const [farmers, setFarmers] = useState([]);
  const [listings, setListings] = useState([]);
  const [bids, setBids] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function load() {
    try {
      const [r0, r1, r2, r3] = await Promise.all([
        fetch(`${API}/farmers`).then((r) => r.json()).catch(() => []),
        fetch(`${API}/listings`).then((r) => r.json()).catch(() => []),
        fetch(`${API}/bids`).then((r) => r.json()).catch(() => []),
        fetch(`${API}/transactions`).then((r) => r.json()).catch(() => [])
      ]);

      setFarmers(Array.isArray(r0) ? r0 : []);
      setListings(Array.isArray(r1) ? r1 : []);
      setBids(Array.isArray(r2) ? r2 : []);
      setTransactions(Array.isArray(r3) ? r3 : []);
      setError("");
    } catch (e) {
      setError("Could not connect to backend at " + API_BASE + ". Make sure the server is online.");
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/demo-seed`, { method: "POST" });
      await load();
      alert("✅ Demo Farmer, Crop Listing & Bid created!");
    } catch (e) {
      alert("Failed to seed demo: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-6 sm:p-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://t.me/FarlX_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-cyan-700"
            >
              <Send size={15} />
              Open Telegram Bot (@FarlX_bot)
            </a>

            <button
              onClick={handleSeedDemo}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Zap size={15} className="text-amber-500" />
              {loading ? "Seeding..." : "Seed Demo Data"}
            </button>

            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50"
              title="Manual refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
            <Database size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Live PostgreSQL Database View</h1>
            <p className="text-sm text-slate-500">
              Live records auto-refreshing every 3 seconds as farmers register, list, and trade.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* 1. Farmers */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-base font-black text-slate-900">
              👨‍🌾 Registered Farmers ({farmers.length})
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Registers via Telegram @FarlX_bot
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Village / Area</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">UPI ID</th>
                  <th className="px-5 py-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-slate-500">
                      No farmers registered yet. Message <strong>@FarlX_bot</strong> on Telegram to register!
                    </td>
                  </tr>
                ) : (
                  farmers.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">#{f.id}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{f.name}</td>
                      <td className="px-5 py-3 text-slate-700">{f.village || "—"}</td>
                      <td className="px-5 py-3 text-slate-700">{f.phone || "—"}</td>
                      <td className="px-5 py-3 font-mono text-xs text-cyan-800 font-bold">{f.upi_id || `${f.phone}@upi`}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {f.created_at ? new Date(f.created_at).toLocaleString() : "Recently"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Listings */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-base font-black text-slate-900">
              🌾 Live Crop Listings ({listings.length})
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Created via Telegram @FarlX_bot
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Crop</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Quality</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Farmer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-center text-slate-500">
                      No listings found. Create a listing via Telegram @FarlX_bot!
                    </td>
                  </tr>
                ) : (
                  listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">#{l.id}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{l.crop}</td>
                      <td className="px-5 py-3 text-slate-700">{Number(l.quantity).toFixed(0)} kg</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        ₹{Number(l.price_per_kg).toFixed(2)}/kg
                      </td>
                      <td className="px-5 py-3 text-slate-700">{l.location}</td>
                      <td className="px-5 py-3 text-slate-700">{l.quality || "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            l.status === "sold"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {l.status || "active"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700 font-medium">{l.farmer_name || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Bids */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-base font-black text-slate-900">
              📩 Bids Submitted ({bids.length})
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Submitted from Web $\rightarrow$ Farmer notified in Telegram
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Listing</th>
                  <th className="px-5 py-3">Crop</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Buyer Phone</th>
                  <th className="px-5 py-3">Offer</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bids.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-slate-500">
                      No bids submitted yet. Place a bid on any listing in the Marketplace!
                    </td>
                  </tr>
                ) : (
                  bids.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">#{b.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">#{b.listing_id}</td>
                      <td className="px-5 py-3 text-slate-700">{b.crop}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{b.buyer_name || "—"}</td>
                      <td className="px-5 py-3 text-slate-700">{b.buyer_phone || "—"}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">
                        ₹{Number(b.offered_price).toFixed(2)}/kg
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            b.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Transactions & Escrow */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-base font-black text-slate-900">
              🔒 Escrow Orders & Settlement ({transactions.length})
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Created when farmer accepts bid $\rightarrow$ Paid out on delivery confirmation
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Crop</th>
                  <th className="px-5 py-3">Farmer</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Escrow Status</th>
                  <th className="px-5 py-3">Farmer UPI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-slate-500">
                      No escrow transactions yet. When a farmer accepts a bid in Telegram, an order is locked in Escrow!
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">#TXN-{t.id}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{t.crop}</td>
                      <td className="px-5 py-3 text-slate-700">{t.farmer_name || "—"}</td>
                      <td className="px-5 py-3 text-slate-700">{t.buyer_name || "—"}</td>
                      <td className="px-5 py-3 font-black text-emerald-700">
                        ₹{Number(t.total_amount).toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            t.status === "payment_released"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t.status === "payment_released" ? "Payment Released ✅" : "Held in Escrow 🔒"}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-cyan-800 font-bold">
                        {t.farmer_upi || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
