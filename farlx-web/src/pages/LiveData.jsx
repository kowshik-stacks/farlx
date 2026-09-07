import { useEffect, useState } from "react";
import { ArrowLeft, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";

export default function LiveData() {
  const [listings, setListings] = useState([]);
  const [bids, setBids] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch(`${API}/listings`),
          fetch(`${API}/bids`),
          fetch(`${API}/transactions`)
        ]);

        const d1 = await r1.json();
        const d2 = await r2.json();
        const d3 = await r3.json();

        setListings(Array.isArray(d1) ? d1 : []);
        setBids(Array.isArray(d2) ? d2 : []);
        setTransactions(Array.isArray(d3) ? d3 : []);

        if ((d1 && !Array.isArray(d1)) || (d2 && !Array.isArray(d2)) || (d3 && !Array.isArray(d3))) {
          setError(d1?.error || d2?.error || d3?.error || "Error loading database records.");
        }
      } catch (e) {
        setError("Could not connect to backend. Make sure Node server is running on port 3000.");
      }
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-6 sm:p-10 text-slate-900">
      <button
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
            <Database size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Live Backend Data</h1>
            <p className="text-sm text-slate-500">
              Real listings, bids, and transactions from your PostgreSQL database.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* Listings */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-black text-slate-900">
              Listings ({listings.length})
            </h2>
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
                      No listings found.
                    </td>
                  </tr>
                ) : (
                  listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">#{l.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{l.crop}</td>
                      <td className="px-5 py-3 text-slate-700">{Number(l.quantity).toFixed(0)} kg</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        ₹{Number(l.price_per_kg).toFixed(2)}/kg
                      </td>
                      <td className="px-5 py-3 text-slate-700">{l.location}</td>
                      <td className="px-5 py-3 text-slate-700">{l.quality || "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            l.status === "sold"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {l.status || "active"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{l.farmer_name || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bids */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-black text-slate-900">Bids ({bids.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Listing</th>
                  <th className="px-5 py-3">Crop</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Offer</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bids.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-slate-500">
                      No bids found.
                    </td>
                  </tr>
                ) : (
                  bids.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">#{b.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">#{b.listing_id}</td>
                      <td className="px-5 py-3 text-slate-700">{b.crop}</td>
                      <td className="px-5 py-3 text-slate-700">{b.buyer_name || "—"}</td>
                      <td className="px-5 py-3 text-slate-700">{b.buyer_phone || "—"}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        ₹{Number(b.offered_price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            b.status === "accepted"
                              ? "bg-emerald-50 text-emerald-700"
                              : b.status === "rejected"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
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

        {/* Transactions */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-black text-slate-900">
              Transactions ({transactions.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Listing</th>
                  <th className="px-5 py-3">Crop</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">#{t.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">#{t.listing_id}</td>
                      <td className="px-5 py-3 text-slate-700">{t.crop}</td>
                      <td className="px-5 py-3 text-slate-700">{t.buyer_name || "—"}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        ₹{Number(t.total_amount).toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            t.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {t.status}
                        </span>
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