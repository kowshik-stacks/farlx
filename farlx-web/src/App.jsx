import React, { useMemo, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Sprout,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Bot,
  Truck,
  Menu,
  Bell,
  Search,
  ChevronRight,
  ExternalLink,
  X,
  MapPin,
  Award,
  IndianRupee,
  Activity,
  Users,
  Zap,
  Shield,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Printer,
  FileText,
  UploadCloud,
  ChevronDown,
  Check,
  QrCode
} from "lucide-react";

import LiveData from "./pages/LiveData";
import { translations, languages } from "./translations";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

// Realistic high-resolution photography for crops (replacing cartoon emojis)
const CROP_PHOTOS = {
  tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=700&auto=format&fit=crop&q=80",
  onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=700&auto=format&fit=crop&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=700&auto=format&fit=crop&q=80",
  paddy: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80",
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80",
  chilli: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=700&auto=format&fit=crop&q=80",
  cucumber: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=700&auto=format&fit=crop&q=80",
  carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=700&auto=format&fit=crop&q=80",
  maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=700&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=700&auto=format&fit=crop&q=80"
};

function getCropPhoto(cropName) {
  const key = (cropName || "").toLowerCase().trim();
  for (const [k, url] of Object.entries(CROP_PHOTOS)) {
    if (key.includes(k)) return url;
  }
  return CROP_PHOTOS.default;
}

function normalizeListing(raw, idx = 0) {
  const photo = getCropPhoto(raw.crop);
  const qty = Number(raw.quantity || 100);

  return {
    id: raw.id,
    crop: raw.crop || "Fresh Produce",
    farmer: raw.farmer_name || (raw.farmers && raw.farmers.name) || "Verified Farmer",
    farmerId: raw.farmer_id,
    farmerUpi: raw.farmer_upi || (raw.farmers && raw.farmers.upi_id) || "farmer@upi",
    farmerPhone: raw.farmer_phone || (raw.farmers && raw.farmers.phone) || "Not shared",
    region: raw.location || "Salem, TN",
    price: Number(raw.price_per_kg || 25),
    quality: raw.ai_grade || raw.quality || "Grade A+",
    freshnessScore: Number(raw.freshness_score || 95.5),
    certHash: raw.certificate_hash || "FARLX-CERT-A1",
    photoUrl: photo,
    quantity: `${qty >= 1000 ? (qty / 1000).toFixed(1) + " tonnes" : qty + " kg"}`,
    quantityNumber: qty,
    delivery: raw.harvest_time || "Ready Now",
    status: raw.status || "active",
    bidCount: Number(raw.bid_count || 0),
    badge: raw.status === "sold" ? "Sold in Escrow" : "Active Batch",
    matching: 96,
    rating: 4.9,
    orders: 142,
    deliveryRate: 99,
    telegram: "@FarlX_bot",
    description: raw.description || `Farm-fresh ${raw.crop} harvested directly by farmer. Certified Grade A+ produce available for direct bulk procurement with FARLX Smart Escrow and instant UPI settlement.`,
    category: ["Tomato", "Onion", "Potato", "Chilli", "Cucumber", "Brinjal", "Carrot"].includes(raw.crop) ? "Vegetables" : "Grains & Fruits"
  };
}

const sampleListings = [
  {
    id: 101,
    crop: "Tomato",
    farmer: "Ramesh Patel",
    region: "Nashik, Maharashtra",
    price: 32,
    quality: "Grade A+",
    freshnessScore: 96.5,
    certHash: "FARLX-NSK-9921",
    photoUrl: CROP_PHOTOS.tomato,
    quantity: "500 kg",
    quantityNumber: 500,
    delivery: "Ready Now",
    badge: "AI Certified",
    matching: 98,
    rating: 4.9,
    orders: 142,
    deliveryRate: 99,
    telegram: "@FarlX_bot",
    description: "Export-grade greenhouse tomatoes, high firmness and uniform deep red color. Harvested 4 hours ago.",
    category: "Vegetables"
  },
  {
    id: 102,
    crop: "Onion",
    farmer: "Dnyaneshwar Shinde",
    region: "Lasalgaon, Maharashtra",
    price: 24,
    quality: "Grade A",
    freshnessScore: 94.0,
    certHash: "FARLX-LSG-4812",
    photoUrl: CROP_PHOTOS.onion,
    quantity: "1.2 tonnes",
    quantityNumber: 1200,
    delivery: "Dispatch in 24h",
    badge: "Mandi Benchmark",
    matching: 94,
    rating: 4.8,
    orders: 88,
    deliveryRate: 97,
    telegram: "@FarlX_bot",
    description: "Cured red onions with excellent shelf life (45+ days). Dry skin, uniform sizing.",
    category: "Vegetables"
  },
  {
    id: 103,
    crop: "Potato",
    farmer: "Mukesh Chouhan",
    region: "Indore, MP",
    price: 19.5,
    quality: "Grade A+",
    freshnessScore: 95.2,
    certHash: "FARLX-IDR-3310",
    photoUrl: CROP_PHOTOS.potato,
    quantity: "2.5 tonnes",
    quantityNumber: 2500,
    delivery: "Ready Now",
    badge: "Direct Farm Gate",
    matching: 95,
    rating: 4.7,
    orders: 110,
    deliveryRate: 96,
    telegram: "@FarlX_bot",
    description: "Sorted Jyoti variety potatoes. High dry matter, suitable for table consumption and processing.",
    category: "Vegetables"
  }
];

// ----------------- SIDEBAR (CLEAN, STARTUP AESTHETIC) -----------------

function Sidebar({ active, setActive, mobileOpen, setMobileOpen, t, theme, onToggleTheme }) {
  const navItems = [
    { label: t.navHome, id: "Home", icon: Home },
    { label: t.navMarket, id: "Market", icon: TrendingUp },
    { label: t.navBuySell, id: "Buy & Sell", icon: ShoppingBag, badge: "ESCROW" },
    { label: t.navAiAssistant, id: "AI Inspector", icon: Bot },
    { label: t.navWeather, id: "Mandi Advisor", icon: BarChart3 },
    { label: t.navLogistics, id: "Logistics Pool", icon: Truck },
    { label: t.navMyFarm, id: "My Farm", icon: Sprout }
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          theme === "dark"
            ? "bg-[#0C1017] border-r border-slate-800 text-slate-100"
            : "bg-white border-r border-slate-200/80 text-slate-900"
        }`}
      >
        {/* Brand without any SIH badge */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-sm tracking-tighter">
              FX
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Farlx
              </span>
              <p className="text-[10px] font-medium text-slate-400 leading-none">Agri Exchange</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : theme === "dark"
                    ? "text-slate-400 hover:bg-slate-850 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isSelected ? "text-white dark:text-slate-900" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded px-1 py-0.2 text-[9px] font-bold uppercase ${
                      isSelected
                        ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Theme switcher */}
          <div className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-850 p-0.5 text-xs font-medium">
            <button
              onClick={() => onToggleTheme("light")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 transition-all ${
                theme === "light"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sun className="h-3 w-3 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => onToggleTheme("dark")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 transition-all ${
                theme === "dark"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Moon className="h-3 w-3 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>

          {/* Bot link */}
          <a
            href="https://t.me/FarlX_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🤖</span>
              <span className="font-semibold text-slate-900 dark:text-white text-xs">@FarlX_bot</span>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
        </div>
      </aside>
    </>
  );
}

// ----------------- TOPBAR -----------------

function TopBar({
  onMenu,
  onSearch,
  notifications = [],
  unreadCount = 0,
  onClearNotifications,
  onSeedDemo,
  theme,
  onToggleTheme,
  lang,
  onSelectLang,
  t
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header
      className={`sticky top-0 z-30 min-h-[58px] border-b backdrop-blur-md transition-colors ${
        theme === "dark"
          ? "bg-[#0C1017]/95 border-slate-800 text-white"
          : "bg-white/95 border-slate-200/80 text-slate-900"
      }`}
    >
      <div className="flex min-h-[58px] w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-600 dark:text-slate-300 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Clean search bar */}
        <div className="hidden min-w-0 flex-1 md:block max-w-[340px]">
          <label className="flex h-8.5 w-full items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 px-2.5 focus-within:border-slate-400 dark:focus-within:border-slate-600">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {/* Right side controls */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Quick Demo Seed */}
          {onSeedDemo && (
            <button
              onClick={onSeedDemo}
              title="Add sample farmer & crop listing"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition-colors"
            >
              <Zap className="h-3 w-3 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">{t.seedDemoBtn}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs"
            >
              <span className="text-xs">{currentLangObj.flag}</span>
              <span className="hidden sm:inline text-xs">{currentLangObj.label}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            <AnimatePresence>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-lg"
                  >
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onSelectLang(l.code);
                          setLangOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          lang === l.code
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                        {lang === l.code && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => onToggleTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-slate-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-[9px] font-bold text-white dark:text-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    className="absolute right-0 top-10 z-50 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider">{t.notifications}</span>
                        {unreadCount > 0 && (
                          <span className="rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 text-[10px] font-semibold">
                            {unreadCount} {t.unread}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && onClearNotifications && (
                        <button onClick={onClearNotifications} className="text-[11px] font-medium text-slate-500 hover:underline">
                          {t.markAllRead}
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                      {notifications.length === 0 ? (
                        <div className="p-5 text-center text-xs text-slate-400">
                          <p className="font-medium">{t.noNotifications}</p>
                          <p className="mt-0.5 text-[11px]">Telegram events and escrow updates will appear here.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-750 ${
                              !n.read ? "bg-slate-50/70 dark:bg-slate-750/40 font-medium" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">{n.title}</span>
                              <span className="shrink-0 text-[10px] text-slate-400">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-normal">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Rajesh Kumar</p>
              <p className="text-[10px] text-slate-400">Buyer</p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-[11px] font-bold text-white dark:text-slate-950">
              RK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ----------------- HERO BANNER (CLEAN & MINIMALIST STARTUP LOOK) -----------------

function HeroBanner({ onExplore, onOpenOrders, t }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-6 sm:p-8 shadow-xs">
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          <span>{t.heroBadge}</span>
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
          {t.heroTitle}
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {t.heroSubtitle}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{t.exploreMarket}</span>
          </button>

          <button
            onClick={onOpenOrders}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 px-4 py-2 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.openEscrow}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------- STATS GRID (CLEAN & SUBTLE) -----------------

function StatsGrid({ liveStats, t }) {
  const stats = [
    {
      title: t.statsActiveListings,
      val: liveStats ? liveStats.activeListings : "3",
      icon: Sprout,
      pill: "Direct Farm"
    },
    {
      title: t.statsTotalBids,
      val: liveStats ? liveStats.totalBids : "12",
      icon: Activity,
      pill: "Telegram Sync"
    },
    {
      title: t.statsVolume,
      val: liveStats ? `₹${Number(liveStats.totalVolume || 0).toLocaleString('en-IN')}` : "₹48,500",
      icon: IndianRupee,
      pill: "Escrow Vault"
    },
    {
      title: t.statsFarmers,
      val: liveStats ? liveStats.totalFarmers : "8",
      icon: Users,
      pill: "Verified UPI"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={i}
            className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111622] p-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[9px] font-medium text-slate-500">
                {s.pill}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{s.val}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{s.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----------------- CROP CARD WITH REALISTIC PHOTOGRAPHY -----------------

function CropCard({ listing, onView, t }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
      {/* Real photographic crop image container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={listing.photoUrl}
          alt={listing.crop}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Minimal tags overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="rounded-md bg-black/65 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
            {listing.quality}
          </span>
          <span className="rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:text-slate-200">
            {listing.freshnessScore}% Fresh
          </span>
        </div>

        <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/75 backdrop-blur-sm px-2 py-0.5 text-xs font-bold text-white">
          ₹{listing.price} <span className="text-[10px] font-normal text-slate-300">{t.perKg}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            {listing.crop}
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {listing.quantity}
          </span>
        </div>

        <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span>{listing.region}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3 w-3 text-slate-500" />
            <span>{t.farmer}: <strong className="text-slate-800 dark:text-slate-200">{listing.farmer}</strong></span>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            {listing.bidCount > 0 ? `${listing.bidCount} Bids placed` : "Bidding open"}
          </span>

          <button
            onClick={() => onView(listing)}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            <span>{t.viewDetails}</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------- BIDDING MODAL -----------------

function ListingModal({ listing, onClose, onBidSuccess, t }) {
  const [buyerName, setBuyerName] = useState("Metro Hypermarket");
  const [buyerPhone, setBuyerPhone] = useState("9123456789");
  const [bidPrice, setBidPrice] = useState(listing.price || 30);
  const [quantity, setQuantity] = useState(listing.quantityNumber || 200);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const totalValue = (Number(bidPrice) * Number(quantity)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
          offered_price: Number(bidPrice),
          quantity: Number(quantity)
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(true);
        if (onBidSuccess) onBidSuccess();
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      alert("Bid submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-xl text-slate-900 dark:text-white overflow-hidden"
      >
        <div className="relative h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={listing.photoUrl} alt={listing.crop} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <h3 className="text-base font-bold">{listing.crop}</h3>
              <p className="text-xs text-slate-300">Farmer: {listing.farmer} ({listing.region})</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-white/80 hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {successMsg ? (
          <div className="p-7 text-center space-y-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold">{t.bidSuccess}</h4>
            <p className="text-xs text-slate-500">The farmer received your offer with [Accept] & [Reject] buttons on Telegram.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg">
              <div>
                <span className="text-slate-400">Listing Price:</span>
                <div className="font-bold text-sm">₹{listing.price} / kg</div>
              </div>
              <div>
                <span className="text-slate-400">Quality:</span>
                <div className="font-bold text-sm">{listing.quality}</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.yourName}</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.yourPhone}</label>
              <input
                type="text"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.offeredPrice}</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.bidQuantity}</label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400">{t.totalAmount}</span>
                <div className="text-base font-bold text-slate-900 dark:text-white">₹{Number(totalValue).toLocaleString('en-IN')}</div>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                🔒 Escrow Protected
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? t.submittingBid : t.submitBidBtn}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ----------------- ORDERS & ESCROW PAGE -----------------

function OrdersEscrowPage({ transactions = [], onRefresh, onOpenBill, t }) {
  const [releasingId, setReleasingId] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const handleConfirmDelivery = async (txn) => {
    setReleasingId(txn.id);
    try {
      const res = await fetch(`${API_BASE}/api/transactions/${txn.id}/confirm-delivery`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSettlement({
          id: txn.id,
          farmerName: txn.farmer_name,
          farmerUpi: (data.upi && data.upi.vpa) || txn.farmer_upi,
          amount: (data.upi && data.upi.amount) || txn.total_amount,
          qrCodeUrl: data.upi && data.upi.qrCodeUrl,
          upiUri: data.upi && data.upi.upiUri
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert("Payment release failed.");
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.escrowTitle}</h2>
            <p className="text-xs text-slate-500 max-w-lg">{t.escrowSubtitle}</p>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-750 self-start shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t.noOrders}</h3>
            <p className="mt-0.5 text-xs text-slate-500 max-w-sm mx-auto">{t.noOrdersDesc}</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {transactions.map((txn) => {
              const isEscrow = txn.status === "payment_escrowed";
              const isReleased = txn.status === "payment_released";

              return (
                <div
                  key={txn.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-900 dark:bg-slate-700 px-2 py-0.5 text-xs font-bold text-white">
                          #TXN-{txn.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {txn.crop || "Produce"} - {txn.quantity ? `${txn.quantity} kg` : "Batch"}
                        </h3>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            isReleased
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60"
                          }`}
                        >
                          {isReleased ? t.statusReleased : t.statusEscrowed}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                        <span>👨‍🌾 {t.farmer}: <strong className="text-slate-800 dark:text-slate-200">{txn.farmer_name || "Farmer"}</strong></span>
                        <span>💳 {t.farmerUpi}: <strong className="font-mono text-slate-700 dark:text-slate-300">{txn.farmer_upi || "farmer@upi"}</strong></span>
                        <span>👤 {t.buyer}: <strong className="text-slate-800 dark:text-slate-200">{txn.buyer_name || "Buyer"}</strong></span>
                        <span>📅 {new Date(txn.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <div className="sm:text-right">
                        <span className="text-[10px] text-slate-400">{t.orderAmount}</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          ₹{Number(txn.total_amount || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isEscrow ? (
                          <button
                            onClick={() => handleConfirmDelivery(txn)}
                            disabled={releasingId === txn.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {releasingId === txn.id ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                <span>{t.releasingPayment}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{t.confirmDeliveryBtn}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectedSettlement({
                                id: txn.id,
                                farmerName: txn.farmer_name,
                                farmerUpi: txn.farmer_upi,
                                amount: txn.total_amount
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                          >
                            <QrCode className="h-3.5 w-3.5 text-slate-600" />
                            <span>{t.viewUpiQrBtn}</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenBill(txn.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                        >
                          <FileText className="h-3 w-3 text-slate-400" />
                          <span>{t.viewBillOfSupply}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedSettlement && (
        <UpiSettlementModal
          settlement={selectedSettlement}
          onClose={() => setSelectedSettlement(null)}
          t={t}
        />
      )}
    </div>
  );
}

// ----------------- UPI SETTLEMENT MODAL -----------------

function UpiSettlementModal({ settlement, onClose, t }) {
  const upiId = settlement.farmerUpi || "farmer@upi";
  const amount = Number(settlement.amount || 0).toFixed(2);
  const upiUri =
    settlement.upiUri ||
    `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(settlement.farmerName || 'Farmer')}&am=${amount}&cu=INR&tn=FARLX+Order+${settlement.id}`;
  const qrUrl =
    settlement.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-5 text-center shadow-xl text-slate-900 dark:text-white"
      >
        <h3 className="text-sm font-bold">{t.upiModalTitle}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{t.upiModalDesc}</p>

        <div className="my-3 flex flex-col items-center justify-center">
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-xs">
            <img src={qrUrl} alt="UPI QR Code" className="h-40 w-40 rounded" />
          </div>
          <span className="mt-1 text-[10px] text-slate-400">{t.scanQrInstruction}</span>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-2.5 text-xs text-left space-y-1 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-400">Farmer:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{settlement.farmerName || "Farmer"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">UPI ID:</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{upiId}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-400">Amount:</span>
            <span className="font-bold text-sm">₹{Number(amount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="mt-3.5 flex gap-2">
          <a
            href={upiUri}
            className="flex-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-2 text-xs font-semibold transition-colors"
          >
            {t.openUpiAppBtn}
          </a>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t.closeBtn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ----------------- DIGITAL BILL OF SUPPLY MODAL -----------------

function DigitalBillModal({ txnId, onClose, t }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/transactions/${txnId}/bill`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBill(d.bill);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [txnId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-5 shadow-xl text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold">{t.billModalTitle}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading || !bill ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1.5 text-slate-500" />
            Generating tax invoice...
          </div>
        ) : (
          <div className="mt-3.5 space-y-3 text-xs">
            <div className="flex justify-between items-start bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">FARLX PROTOCOL</span>
                <p className="text-[10px] text-slate-400 font-mono">{bill.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <span className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 text-[9px] font-medium">
                  {bill.escrowVerification.status}
                </span>
                <p className="mt-0.5 text-slate-400 text-[10px]">{t.billDate}: {new Date(bill.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
                <p className="font-bold text-slate-400 uppercase text-[9px]">{t.farmerInfo}</p>
                <p className="font-semibold mt-0.5">{bill.farmer.name}</p>
                <p className="text-slate-500 text-[11px]">{bill.farmer.village}</p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
                <p className="font-bold text-slate-400 uppercase text-[9px]">{t.buyerInfo}</p>
                <p className="font-semibold mt-0.5">{bill.buyer.name}</p>
                <p className="text-slate-400 text-[10px]">Verified Consignee</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-850 px-3 py-1.5 font-semibold flex justify-between text-[11px]">
                <span>Produce</span>
                <span>Amount</span>
              </div>
              <div className="p-3 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{bill.produce.crop} ({bill.produce.grade})</span>
                  <span>₹{Number(bill.produce.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>{bill.produce.quantityKg} kg @ ₹{bill.produce.ratePerKg}/kg</span>
                  <span>GST: Exempt</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-2 text-xs font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{t.printInvoice}</span>
              </button>
              <button onClick={onClose} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium">
                {t.closeBtn}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ----------------- AI QUALITY INSPECTOR (CLEAN) -----------------

function AiQualityInspectorPage({ t }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState({
    crop: "Tomato",
    grade: "Grade A+ (Export Quality)",
    freshnessScore: 96.2,
    defectPercentage: 1.2,
    estimatedShelfLife: "7 - 9 Days",
    commercialFit: "Premium supermarkets and export aggregators."
  });

  const runAnalysis = async (cropName) => {
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai-grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: cropName })
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          setAnalysis(data.analysis);
          setAnalyzing(false);
        }, 500);
      }
    } catch (e) {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-5 shadow-xs">
        <div className="max-w-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.aiPageTitle}</h2>
          <p className="text-xs text-slate-500">{t.aiPageSubtitle}</p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 p-4 text-center">
            <UploadCloud className="h-6 w-6 text-slate-400 mx-auto" />
            <h4 className="mt-2 text-xs font-bold text-slate-800 dark:text-white">{t.uploadPhotoPrompt}</h4>
            <p className="mt-0.5 text-[11px] text-slate-400">{t.uploadHelp}</p>

            <div className="mt-3">
              <p className="text-[10px] text-slate-400 mb-1">{t.samplePhotos}</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                <button
                  onClick={() => runAnalysis("Tomato")}
                  className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium hover:border-slate-400"
                >
                  {t.sampleTomato}
                </button>
                <button
                  onClick={() => runAnalysis("Onion")}
                  className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium hover:border-slate-400"
                >
                  {t.sampleOnion}
                </button>
                <button
                  onClick={() => runAnalysis("Potato")}
                  className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium hover:border-slate-400"
                >
                  {t.samplePotato}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.qualityAnalysisResult}</h4>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                Verified Grade
              </span>
            </div>

            {analyzing ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto text-slate-400" />
                <p>{t.analyzingImage}</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded">
                    <span className="text-slate-400 text-[10px]">{t.overallGrade}</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{analysis.grade}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded">
                    <span className="text-slate-400 text-[10px]">{t.freshnessScore}</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{analysis.freshnessScore}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded">
                    <span className="text-slate-400 text-[10px]">{t.defectRate}</span>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{analysis.defectPercentage}% (Clean)</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded">
                    <span className="text-slate-400 text-[10px]">{t.estimatedShelfLife}</span>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{analysis.estimatedShelfLife}</div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded">
                  <span className="text-slate-400 text-[10px]">{t.recommendation}</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{analysis.commercialFit}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------- MANDI ADVISOR (CLEAN) -----------------

function MandiAdvisorPage({ t }) {
  const [mandiPrices, setMandiPrices] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/mandi-prices`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setMandiPrices(d.data);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-5 shadow-xs">
        <div className="max-w-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.mandiTitle}</h2>
          <p className="text-xs text-slate-500">{t.mandiSubtitle}</p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Crop</th>
                <th className="p-3">APMC Mandi</th>
                <th className="p-3">{t.mandiRate}</th>
                <th className="p-3">{t.farlxRate}</th>
                <th className="p-3">{t.extraEarnings}</th>
                <th className="p-3">Arrival</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {mandiPrices.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{m.crop}</td>
                  <td className="p-3">{m.mandi} ({m.state})</td>
                  <td className="p-3 font-mono">₹{m.mandiRate.toFixed(2)}/kg</td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">₹{m.farlxRate.toFixed(2)}/kg</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 text-xs font-semibold">
                      {m.difference}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{m.arrivalVolume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------- KISAN LOGISTICS POOL (CLEAN) -----------------

function LogisticsPoolPage({ t }) {
  const [pools, setPools] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/logistics/pools`)
      .then((r) => r.json())
      .then((d) => {
        if (d.pools) setPools(d.pools);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-5 shadow-xs">
        <div className="max-w-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.logisticsTitle}</h2>
          <p className="text-xs text-slate-500">{t.logisticsSubtitle}</p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {pools.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-900 dark:bg-slate-700 px-2 py-0.5 text-xs font-bold text-white">
                  {p.id}
                </span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-medium">
                  {p.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.cluster}</h4>
                <p className="text-xs text-slate-400">➔ {p.destination}</p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Capacity</span>
                  <span>{p.utilizationPct}% ({p.currentLoadedKg} kg)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-slate-800 dark:bg-white rounded-full"
                    style={{ width: `${p.utilizationPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                <div>
                  <span className="text-slate-400 text-[10px]">{t.savingsPerFarmer}:</span>
                  <div className="font-bold">{p.avgSavingsPerFarmer}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">{t.carbonReduced}:</span>
                  <div className="font-medium text-slate-500">{p.co2SavedKg}</div>
                </div>
              </div>

              <button
                onClick={() => alert(`Request submitted for ${p.cluster} freight pool.`)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t.joinPoolBtn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------- MAIN APP -----------------

export default function App() {
  const [activeNav, setActiveNav] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBillTxnId, setSelectedBillTxnId] = useState(null);

  // Language state
  const [lang, setLang] = useState(() => localStorage.getItem("farlx_lang") || "en");
  const t = translations[lang] || translations.en;

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem("farlx_theme") || "light");

  const handleToggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("farlx_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSelectLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("farlx_lang", newLang);
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Live state from Backend
  const [liveListings, setLiveListings] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const fetchLiveData = async () => {
    try {
      const [lRes, sRes, tRes, nRes] = await Promise.all([
        fetch(`${API_BASE}/api/listings`).then((r) => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/stats`).then((r) => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/transactions`).then((r) => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/notifications`).then((r) => r.json()).catch(() => [])
      ]);

      if (Array.isArray(lRes) && lRes.length > 0) {
        setLiveListings(lRes.map((r, idx) => normalizeListing(r, idx)));
      }
      if (sRes) setLiveStats(sRes);
      if (Array.isArray(tRes)) setTransactions(tRes);
      if (Array.isArray(nRes)) {
        setNotifications(nRes);
        setUnreadNotifs(nRes.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.warn("Fetch error:", err.message);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const timer = setInterval(fetchLiveData, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleClearNotifications = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, { method: "POST" });
      setUnreadNotifs(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedDemo = async () => {
    try {
      await fetch(`${API_BASE}/api/demo-seed`, { method: "POST" });
      await fetchLiveData();
      alert("✅ Demo Farmer, Crop Listing & Bid created!");
    } catch (e) {
      console.error(e);
    }
  };

  const currentListings = liveListings.length > 0 ? liveListings : sampleListings;

  const filteredListings = useMemo(() => {
    if (!searchQuery) return currentListings;
    const q = searchQuery.toLowerCase();
    return currentListings.filter(
      (l) =>
        l.crop.toLowerCase().includes(q) ||
        l.farmer.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [currentListings, searchQuery]);

  const renderPage = () => {
    if (activeNav === "Home") {
      return (
        <div className="space-y-6">
          <HeroBanner
            onExplore={() => setActiveNav("Market")}
            onOpenOrders={() => setActiveNav("Buy & Sell")}
            t={t}
          />
          <StatsGrid liveStats={liveStats} t={t} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.trendingCrops}</h3>
                <p className="text-xs text-slate-500">{t.verifiedDirect}</p>
              </div>
              <button
                onClick={() => setActiveNav("Market")}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline"
              >
                {t.exploreMarket} →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredListings.slice(0, 6).map((item) => (
                <CropCard key={item.id} listing={item} onView={(l) => setSelectedListing(l)} t={t} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeNav === "Market") {
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.marketTitle}</h2>
                <p className="text-xs text-slate-500">{t.marketSubtitle}</p>
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {filteredListings.length} {t.statsActiveListings}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredListings.map((item) => (
                <CropCard key={item.id} listing={item} onView={(l) => setSelectedListing(l)} t={t} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeNav === "Buy & Sell") {
      return (
        <OrdersEscrowPage
          transactions={transactions}
          onRefresh={fetchLiveData}
          onOpenBill={(id) => setSelectedBillTxnId(id)}
          t={t}
        />
      );
    }

    if (activeNav === "AI Inspector") {
      return <AiQualityInspectorPage t={t} />;
    }

    if (activeNav === "Mandi Advisor") {
      return <MandiAdvisorPage t={t} />;
    }

    if (activeNav === "Logistics Pool") {
      return <LogisticsPoolPage t={t} />;
    }

    return (
      <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622]">
        <h3 className="text-sm font-bold">{activeNav}</h3>
        <p className="text-xs text-slate-500 mt-1">Live data viewable at /live-data</p>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-150 lg:flex ${
      theme === "dark" ? "bg-[#090D14] text-slate-100" : "bg-[#F9FAFB] text-slate-900"
    }`}>
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        t={t}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="min-w-0 flex-1">
        <TopBar
          onMenu={() => setMobileOpen(true)}
          onSearch={setSearchQuery}
          notifications={notifications}
          unreadCount={unreadNotifs}
          onClearNotifications={handleClearNotifications}
          onSeedDemo={handleSeedDemo}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          lang={lang}
          onSelectLang={handleSelectLang}
          t={t}
        />

        <main className="w-full px-4 py-5 sm:px-6 lg:px-8 max-w-[1520px] mx-auto">
          {renderPage()}
        </main>
      </div>

      {/* Bidding Modal */}
      <AnimatePresence>
        {selectedListing && (
          <ListingModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            onBidSuccess={fetchLiveData}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Digital Bill of Supply Modal */}
      <AnimatePresence>
        {selectedBillTxnId && (
          <DigitalBillModal
            txnId={selectedBillTxnId}
            onClose={() => setSelectedBillTxnId(null)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
