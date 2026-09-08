import React, { useMemo, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Sprout,
  TrendingUp,
  ShoppingBag,
  CloudSun,
  Bot,
  Users,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
  DollarSign,
  Package,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  ChevronRight,
  ExternalLink,
  ShoppingCart,
  Star,
  Info,
  X,
  Sparkles,
  MapPin,
  CircleDollarSign,
  BadgeCheck,
  Zap,
  Store,
  SlidersHorizontal,
  Activity,
  Truck,
  Handshake,
  Flame,
  Circle,
  CalendarDays,
  MessageCircle,
  Target,
  ScanSearch,
  HeartHandshake,
  ChartNoAxesCombined,
  Send,
  Award,
  IndianRupee,
  Layers3,
  CircleCheckBig,
  Filter,
  Check,
  Plus,
  Minus,
  ClipboardList,
  Clock3,
  Shield,
  CheckCircle2,
  Phone,
  MessageSquare,
  PackageCheck,
  BadgeIndianRupee,
  CircleAlert,
  ListFilter,
  QrCode,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  Printer,
  FileText,
  Camera,
  UploadCloud,
  ChevronDown
} from "lucide-react";

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

import LiveData from "./pages/LiveData";
import { translations, languages } from "./translations";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

function normalizeListing(raw, idx = 0) {
  const cropEmojis = {
    tomato: "🍅",
    onion: "🧅",
    paddy: "🌾",
    rice: "🍚",
    potato: "🥔",
    chilli: "🌶️",
    groundnut: "🥜",
    maize: "🌽",
    cucumber: "🥒",
    brinjal: "🍆",
    carrot: "🥕",
    banana: "🍌",
    grapes: "🍇",
    mango: "🥭",
    watermelon: "🍉"
  };

  const key = (raw.crop || "").toLowerCase().trim();
  const emoji = cropEmojis[key] || "🌿";

  const gradients = [
    { gradient: "from-rose-500 via-orange-400 to-amber-300", softGradient: "from-rose-50 via-orange-50 to-amber-50" },
    { gradient: "from-amber-500 via-yellow-400 to-lime-300", softGradient: "from-amber-50 via-yellow-50 to-lime-50" },
    { gradient: "from-emerald-600 via-teal-500 to-cyan-400", softGradient: "from-emerald-50 via-teal-50 to-cyan-50" },
    { gradient: "from-blue-600 via-cyan-500 to-teal-400", softGradient: "from-blue-50 via-cyan-50 to-teal-50" }
  ];

  const g = gradients[idx % gradients.length];
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
    image: emoji,
    quantity: `${qty >= 1000 ? (qty / 1000).toFixed(1) + " tonnes" : qty + " kg"}`,
    quantityNumber: qty,
    delivery: raw.harvest_time || "Ready Now",
    status: raw.status || "active",
    bidCount: Number(raw.bid_count || 0),
    badge: raw.status === "sold" ? "Sold in Escrow" : "Live Batch",
    matching: 96,
    trend: 12.5,
    rating: 4.9,
    orders: 142,
    deliveryRate: 99,
    acceptingRate: 98,
    telegram: "@FarlX_bot",
    description: raw.description || `Farm-fresh ${raw.crop} harvested directly by farmer. Certified Grade A+ produce available for direct bulk purchase with FARLX Smart Escrow and instant UPI settlement.`,
    gradient: g.gradient,
    softGradient: g.softGradient,
    category: ["Tomato", "Onion", "Potato", "Chilli", "Cucumber", "Brinjal", "Carrot"].includes(raw.crop) ? "Vegetables" : "Fruits & Grains"
  };
}

// ----------------- SAMPLE STATIC LISTINGS FALLBACK -----------------

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
    image: "🍅",
    quantity: "500 kg",
    quantityNumber: 500,
    delivery: "Ready Now",
    badge: "AI Certified",
    matching: 98,
    trend: 14.2,
    rating: 4.9,
    orders: 142,
    deliveryRate: 99,
    acceptingRate: 98,
    telegram: "@FarlX_bot",
    description: "Export-grade greenhouse tomatoes, high firmness and deep red colour. Harvested 4 hours ago.",
    gradient: "from-rose-500 via-orange-400 to-amber-300",
    softGradient: "from-rose-50 via-orange-50 to-amber-50",
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
    image: "🧅",
    quantity: "1.2 tonnes",
    quantityNumber: 1200,
    delivery: "Dispatch in 24h",
    badge: "Mandi Best Value",
    matching: 94,
    trend: 8.5,
    rating: 4.8,
    orders: 88,
    deliveryRate: 97,
    acceptingRate: 99,
    telegram: "@FarlX_bot",
    description: "Cured red onions with excellent shelf life (45+ days). Dry skin, uniform sizing.",
    gradient: "from-purple-600 via-pink-500 to-rose-400",
    softGradient: "from-purple-50 via-pink-50 to-rose-50",
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
    image: "🥔",
    quantity: "2.5 tonnes",
    quantityNumber: 2500,
    delivery: "Ready Now",
    badge: "Direct Farm Gate",
    matching: 95,
    trend: -2.1,
    rating: 4.7,
    orders: 110,
    deliveryRate: 96,
    acceptingRate: 95,
    telegram: "@FarlX_bot",
    description: "Sorted Jyoti variety potatoes. High dry matter, suitable for table consumption and processing.",
    gradient: "from-amber-500 via-yellow-400 to-lime-300",
    softGradient: "from-amber-50 via-yellow-50 to-lime-50",
    category: "Vegetables"
  }
];

// ----------------- SIDEBAR -----------------

function Sidebar({ active, setActive, mobileOpen, setMobileOpen, t, theme, onToggleTheme, lang, onSelectLang }) {
  const navItems = [
    { label: t.navHome, id: "Home", icon: Home },
    { label: t.navMarket, id: "Market", icon: TrendingUp },
    { label: t.navBuySell, id: "Buy & Sell", icon: ShoppingBag, badge: "ESCROW" },
    { label: t.navAiAssistant, id: "AI Inspector", icon: Bot, badge: "AI" },
    { label: t.navWeather, id: "Mandi Advisor", icon: BarChart3 },
    { label: t.navLogistics, id: "Logistics Pool", icon: Truck, badge: "NEW" },
    { label: t.navMyFarm, id: "My Farm", icon: Sprout }
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-100"
        } ${
          theme === "dark"
            ? "bg-[#0F172A] border-r border-slate-800 text-slate-100"
            : "bg-white border-r border-slate-200 text-slate-900"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-xl font-black text-white shadow-lg shadow-emerald-500/25">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  FARLX
                </span>
                <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                  SIH
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">Direct Smart Escrow</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
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
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isSelected ? "text-white" : "text-slate-400 group-hover:text-emerald-500"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom utility controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Theme switcher */}
          <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 text-xs font-bold">
            <button
              onClick={() => onToggleTheme("light")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                theme === "light"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => onToggleTheme("dark")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                theme === "dark"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Moon className="h-3.5 w-3.5 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>

          {/* Telegram bot status card */}
          <a
            href="https://t.me/FarlX_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-950/40 dark:to-blue-950/40 border border-cyan-200/50 dark:border-cyan-800/40 p-3 text-xs transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white font-black text-sm">
                🤖
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">@FarlX_bot</p>
                <p className="text-[10px] text-cyan-700 dark:text-cyan-400">Telegram Bot Live</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
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
  onOpenOrders,
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
      className={`sticky top-0 z-30 min-h-[74px] border-b backdrop-blur-xl transition-colors ${
        theme === "dark"
          ? "bg-[#0F172A]/90 border-slate-800 text-white"
          : "bg-white/90 border-slate-200/80 text-slate-900"
      }`}
    >
      <div className="flex min-h-[74px] w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className="shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-600 dark:text-slate-300 shadow-sm lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="hidden min-w-0 flex-1 md:block max-w-[420px]">
          <label className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {/* Right Side Controls */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Quick Demo Seed */}
          {onSeedDemo && (
            <button
              onClick={onSeedDemo}
              title="Add sample farmer, crop & bid"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-black text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
              <span className="hidden sm:inline">{t.seedDemoBtn}</span>
            </button>
          )}

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-black text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden sm:inline">{currentLangObj.label}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl"
                  >
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onSelectLang(l.code);
                          setLangOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                          lang === l.code
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                        {lang === l.code && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Switcher Toggle Button */}
          <button
            onClick={() => onToggleTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:scale-105"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-600" />
            )}
          </button>

          {/* Notification Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:scale-105"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-900 to-emerald-950 px-4 py-3.5 text-white">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-wider">{t.notifications}</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold">
                            {unreadCount} {t.unread}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && onClearNotifications && (
                        <button onClick={onClearNotifications} className="text-[11px] font-bold text-emerald-300 hover:underline">
                          {t.markAllRead}
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          <p className="font-bold">{t.noNotifications}</p>
                          <p className="mt-1">Telegram events, bids, and escrow releases appear here live.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                              !n.read ? "bg-emerald-50/40 dark:bg-emerald-950/30" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-black text-slate-900 dark:text-white">{n.title}</span>
                              <span className="shrink-0 text-[10px] text-slate-400">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User profile badge */}
          <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-700 pl-2.5 sm:pl-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-black text-slate-900 dark:text-white">Rajesh Kumar</p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Buyer Portal</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-xs font-black text-white shadow-md">
              RK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ----------------- HERO BANNER -----------------

function HeroBanner({ onExplore, onOpenOrders, t }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07241A] via-[#0E3B2B] to-[#0A4D3C] p-6 sm:p-10 text-white shadow-xl shadow-emerald-950/20">
      <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t.heroBadge}</span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          {t.heroTitle}
        </h1>

        <p className="mt-3 text-sm sm:text-base leading-relaxed text-emerald-100/90 font-medium">
          {t.heroSubtitle}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3.5">
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all hover:scale-105"
          >
            <TrendingUp className="h-4 w-4" />
            <span>{t.exploreMarket}</span>
          </button>

          <button
            onClick={onOpenOrders}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs sm:text-sm font-black text-white backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>{t.openEscrow}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------- STATS GRID -----------------

function StatsGrid({ liveStats, t }) {
  const stats = [
    {
      title: t.statsActiveListings,
      val: liveStats ? liveStats.activeListings : "3",
      icon: Sprout,
      color: "from-emerald-500 to-teal-600",
      pill: "+100% Direct"
    },
    {
      title: t.statsTotalBids,
      val: liveStats ? liveStats.totalBids : "12",
      icon: Activity,
      color: "from-blue-500 to-cyan-600",
      pill: "Telegram Alerted"
    },
    {
      title: t.statsVolume,
      val: liveStats ? `₹${Number(liveStats.totalVolume || 0).toLocaleString('en-IN')}` : "₹48,500",
      icon: IndianRupee,
      color: "from-amber-500 to-orange-600",
      pill: "Smart Escrow"
    },
    {
      title: t.statsFarmers,
      val: liveStats ? liveStats.totalFarmers : "8",
      icon: Users,
      color: "from-violet-500 to-purple-600",
      pill: "Verified UPI"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${s.color} text-white shadow-md`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-black text-slate-700 dark:text-slate-300">
                {s.pill}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----------------- CROP CARD -----------------

function CropCard({ listing, onView, t }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-tr ${listing.gradient} p-4 text-6xl shadow-inner`}>
        <span className="transition-transform duration-300 group-hover:scale-125 select-none">{listing.image}</span>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="rounded-full bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white uppercase">
            {listing.quality}
          </span>
          <span className="rounded-full bg-emerald-500/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white">
            {listing.freshnessScore}% Fresh
          </span>
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 text-xs font-black text-slate-900 dark:text-white shadow-sm">
          ₹{listing.price} {t.perKg}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {listing.crop}
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {listing.quantity}
          </span>
        </div>

        <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{listing.region}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-emerald-500" />
            <span>{t.farmer}: <strong>{listing.farmer}</strong></span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {listing.bidCount > 0 ? `${listing.bidCount} Bids placed` : "Open for direct bids"}
          </div>

          <button
            onClick={() => onView(listing)}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <span>{t.viewDetails}</span>
            <ChevronRight className="h-3.5 w-3.5" />
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
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error(err);
      alert("Bid submission failed. Ensure backend is reachable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{listing.image}</span>
            <div>
              <h3 className="text-lg font-black">{listing.crop} - Direct Bid</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Farmer: {listing.farmer} ({listing.region})</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400">{t.bidSuccess}</h4>
            <p className="text-xs text-slate-500">The farmer received your offer with [Accept] & [Reject] buttons on Telegram.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl">
              <div>
                <span className="text-slate-400">Listed Rate:</span>
                <div className="font-black text-sm">₹{listing.price} / kg</div>
              </div>
              <div>
                <span className="text-slate-400">AI Quality:</span>
                <div className="font-black text-sm text-emerald-600">{listing.quality}</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.yourName}</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.yourPhone}</label>
              <input
                type="text"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.offeredPrice}</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.bidQuantity}</label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">{t.totalAmount}</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">₹{Number(totalValue).toLocaleString('en-IN')}</div>
              </div>
              <div className="text-[10px] text-right font-bold text-slate-500">
                🔒 Smart Escrow Protected
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/20 hover:opacity-95 disabled:opacity-50"
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
      console.error(err);
      alert("Payment release failed.");
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Smart Escrow Protocol</span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{t.escrowTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">{t.escrowSubtitle}</p>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 self-start"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-3xl">📦</div>
            <h3 className="mt-4 text-base font-black text-slate-800 dark:text-white">{t.noOrders}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">{t.noOrdersDesc}</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4">
            {transactions.map((txn) => {
              const isEscrow = txn.status === "payment_escrowed";
              const isReleased = txn.status === "payment_released";

              return (
                <div
                  key={txn.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded-md bg-slate-900 dark:bg-slate-700 px-2 py-0.5 text-xs font-black text-white">
                          #TXN-{txn.id}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {txn.crop || "Fresh Produce"} - {txn.quantity ? `${txn.quantity} kg` : "Batch"}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                            isReleased
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 animate-pulse"
                          }`}
                        >
                          {isReleased ? t.statusReleased : t.statusEscrowed}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <span>👨‍🌾 {t.farmer}: <strong>{txn.farmer_name || "Verified Farmer"}</strong></span>
                        <span>💳 {t.farmerUpi}: <strong className="font-mono text-cyan-600 dark:text-cyan-400">{txn.farmer_upi || "farmer@upi"}</strong></span>
                        <span>👤 {t.buyer}: <strong>{txn.buyer_name || "Wholesale Buyer"}</strong></span>
                        <span>📅 Date: <strong>{new Date(txn.created_at).toLocaleDateString()}</strong></span>
                      </div>

                      {txn.escrow_hash && (
                        <div className="mt-2 text-[10px] font-mono text-slate-400 truncate max-w-md">
                          SHA-256 State Hash: {txn.escrow_hash}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                      <div className="sm:text-right">
                        <span className="text-[11px] font-bold text-slate-400">{t.orderAmount}</span>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                          ₹{Number(txn.total_amount || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isEscrow ? (
                          <button
                            onClick={() => handleConfirmDelivery(txn)}
                            disabled={releasingId === txn.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black text-white shadow-md hover:opacity-95 disabled:opacity-50"
                          >
                            {releasingId === txn.id ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>{t.releasingPayment}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
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
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span>{t.viewUpiQrBtn}</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenBill(txn.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-600" />
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
    `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-2xl text-slate-900 dark:text-white"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h3 className="mt-3 text-lg font-black">{t.upiModalTitle}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.upiModalDesc}</p>

        <div className="my-5 flex flex-col items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md">
            <img src={qrUrl} alt="UPI QR Code" className="h-52 w-52 rounded-lg" />
          </div>
          <span className="mt-2 text-[11px] font-bold text-slate-500">{t.scanQrInstruction}</span>
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-3.5 text-xs text-left space-y-1.5 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-400">Beneficiary Farmer:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{settlement.farmerName || "Farmer"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Farmer UPI VPA:</span>
            <span className="font-mono font-bold text-cyan-600">{upiId}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-400">Amount Released:</span>
            <span className="font-black text-emerald-600 text-sm">₹{Number(amount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <a
            href={upiUri}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-black text-white shadow-md hover:opacity-95"
          >
            {t.openUpiAppBtn}
          </a>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-black">{t.billModalTitle}</h3>
          </div>
          <button onClick={onClose} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading || !bill ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Generating verifiable cryptographic invoice...
          </div>
        ) : (
          <div className="mt-5 space-y-4 text-xs">
            {/* Header */}
            <div className="flex justify-between items-start bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
              <div>
                <span className="font-black text-base text-emerald-600">FARLX PROTOCOL</span>
                <p className="text-[10px] text-slate-500">Decentralized Direct Agriculture Trade</p>
                <p className="mt-2 font-mono font-bold">{bill.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                  {bill.escrowVerification.status}
                </span>
                <p className="mt-2 text-slate-400">{t.billDate}: {new Date(bill.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Farmer & Buyer info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200 dark:border-slate-700/60 p-3.5 rounded-2xl">
                <p className="font-black text-slate-400 uppercase text-[10px]">{t.farmerInfo}</p>
                <p className="font-bold text-sm mt-1">{bill.farmer.name}</p>
                <p className="text-slate-500">{bill.farmer.village}</p>
                <p className="font-mono text-cyan-600 mt-1">{bill.farmer.upi}</p>
              </div>

              <div className="border border-slate-200 dark:border-slate-700/60 p-3.5 rounded-2xl">
                <p className="font-black text-slate-400 uppercase text-[10px]">{t.buyerInfo}</p>
                <p className="font-bold text-sm mt-1">{bill.buyer.name}</p>
                <p className="text-emerald-600 font-bold mt-1">Verified Wholesale Consignee</p>
              </div>
            </div>

            {/* Item Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-black flex justify-between">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>{bill.produce.crop} ({bill.produce.grade})</span>
                  <span>₹{Number(bill.produce.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>{bill.produce.quantityKg} kg @ ₹{bill.produce.ratePerKg}/kg</span>
                  <span>GST: 0% (Exempt)</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {bill.produce.gstExemption}
                </p>
              </div>
            </div>

            {/* Cryptographic Hash */}
            <div className="bg-slate-900 text-slate-300 p-3.5 rounded-2xl font-mono text-[10px] space-y-1">
              <p className="text-emerald-400 font-bold">{t.escrowAuditHash}:</p>
              <p className="break-all">{bill.escrowVerification.stateHash}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-600 py-3 text-xs font-black text-white hover:opacity-90"
              >
                <Printer className="h-4 w-4" />
                <span>{t.printInvoice}</span>
              </button>
              <button onClick={onClose} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 font-bold text-xs">
                {t.closeBtn}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ----------------- AI CROP QUALITY INSPECTOR PAGE -----------------

function AiQualityInspectorPage({ t }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [analysis, setAnalysis] = useState({
    crop: "Tomato",
    grade: "Grade A+ (Export Quality)",
    freshnessScore: 96.2,
    defectPercentage: 1.2,
    estimatedShelfLife: "7 - 9 Days",
    moistureIndex: "91.5% (Optimal)",
    sugarBrix: "4.8° Brix (High Sweetness)",
    commercialFit: "Premium retail supermarkets, hypermarkets, and export aggregators.",
    certificateHash: "8a4f912c98d41e77",
    timestamp: new Date().toISOString()
  });

  const runAnalysis = async (cropName) => {
    setAnalyzing(true);
    setSelectedCrop(cropName);
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
        }, 800);
      }
    } catch (e) {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
            <Bot className="h-3.5 w-3.5" />
            <span>Computer Vision AI</span>
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{t.aiPageTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t.aiPageSubtitle}</p>
        </div>

        {/* Upload & Sample Selector */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h4 className="mt-3 text-sm font-black text-slate-800 dark:text-white">{t.uploadPhotoPrompt}</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.uploadHelp}</p>

            <div className="mt-5">
              <p className="text-[11px] font-bold text-slate-400 mb-2">{t.samplePhotos}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => runAnalysis("Tomato")}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold hover:border-emerald-500 transition-all"
                >
                  {t.sampleTomato}
                </button>
                <button
                  onClick={() => runAnalysis("Onion")}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold hover:border-emerald-500 transition-all"
                >
                  {t.sampleOnion}
                </button>
                <button
                  onClick={() => runAnalysis("Potato")}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold hover:border-emerald-500 transition-all"
                >
                  {t.samplePotato}
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Certificate Display */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{t.qualityAnalysisResult}</h4>
              </div>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-400">
                Verified
              </span>
            </div>

            {analyzing ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
                <p className="font-bold">{t.analyzingImage}</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                    <span className="text-slate-400">{t.overallGrade}</span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{analysis.grade}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                    <span className="text-slate-400">{t.freshnessScore}</span>
                    <div className="text-base font-black text-slate-900 dark:text-white">{analysis.freshnessScore}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                    <span className="text-slate-400">{t.defectRate}</span>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{analysis.defectPercentage}% (Negligible)</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                    <span className="text-slate-400">{t.estimatedShelfLife}</span>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{analysis.estimatedShelfLife}</div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-slate-400">{t.recommendation}</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{analysis.commercialFit}</p>
                </div>

                <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                  {t.certificateHash}: {analysis.certificateHash}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------- MANDI PRICE INTELLIGENCE PAGE -----------------

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Agmarknet Mandi Integration</span>
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{t.mandiTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t.mandiSubtitle}</p>
        </div>

        {/* Mandi table */}
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-black text-[11px]">
              <tr>
                <th className="p-4">Crop</th>
                <th className="p-4">State & APMC Mandi</th>
                <th className="p-4">{t.mandiRate}</th>
                <th className="p-4">{t.farlxRate}</th>
                <th className="p-4">{t.extraEarnings}</th>
                <th className="p-4">Mandi Arrival</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {mandiPrices.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-black text-slate-900 dark:text-white">{m.crop}</td>
                  <td className="p-4">{m.mandi} ({m.state})</td>
                  <td className="p-4 font-mono">₹{m.mandiRate.toFixed(2)}/kg</td>
                  <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{m.farlxRate.toFixed(2)}/kg</td>
                  <td className="p-4">
                    <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
                      {m.difference}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{m.arrivalVolume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------- KISAN LOGISTICS POOLING PAGE -----------------

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
            <Truck className="h-3.5 w-3.5" />
            <span>Kisan Freight Pooling</span>
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{t.logisticsTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t.logisticsSubtitle}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {pools.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-900 dark:bg-slate-700 px-2 py-0.5 text-xs font-black text-white">
                  {p.id}
                </span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                  {p.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{p.cluster}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">➔ {p.destination}</p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  <span>{t.truckCapacity}</span>
                  <span>{p.utilizationPct}% ({p.currentLoadedKg} / {p.capacityKg} kg)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: `${p.utilizationPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400">{t.savingsPerFarmer}:</span>
                  <div className="font-black text-emerald-600">{p.avgSavingsPerFarmer}</div>
                </div>
                <div>
                  <span className="text-slate-400">{t.carbonReduced}:</span>
                  <div className="font-bold text-slate-700 dark:text-slate-200">{p.co2SavedKg}</div>
                </div>
              </div>

              <button
                onClick={() => alert(`Request submitted to join ${p.cluster} freight pool. Driver dispatch notified.`)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-black text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
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

// ----------------- MAIN APP COMPONENT -----------------

export default function App() {
  const [activeNav, setActiveNav] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBillTxnId, setSelectedBillTxnId] = useState(null);

  // Language state (persisted)
  const [lang, setLang] = useState(() => localStorage.getItem("farlx_lang") || "en");
  const t = translations[lang] || translations.en;

  // Theme state (persisted)
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

  const location = useLocation();
  const navigate = useNavigate();

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
        <div className="space-y-8">
          <HeroBanner
            onExplore={() => setActiveNav("Market")}
            onOpenOrders={() => setActiveNav("Buy & Sell")}
            t={t}
          />
          <StatsGrid liveStats={liveStats} t={t} />

          {/* Section: Live Harvests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.trendingCrops}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.verifiedDirect}</p>
              </div>
              <button
                onClick={() => setActiveNav("Market")}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t.exploreMarket} →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{t.marketTitle}</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t.marketSubtitle}</p>
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {filteredListings.length} {t.statsActiveListings}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-black">{activeNav}</h3>
        <p className="text-xs text-slate-500 mt-1">Live data viewable at /live-data</p>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 lg:flex ${
      theme === "dark" ? "bg-[#0B1120] text-slate-100" : "bg-[#F4F7FB] text-slate-900"
    }`}>
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        t={t}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        lang={lang}
        onSelectLang={handleSelectLang}
      />

      <div className="min-w-0 flex-1">
        <TopBar
          onMenu={() => setMobileOpen(true)}
          onSearch={setSearchQuery}
          notifications={notifications}
          unreadCount={unreadNotifs}
          onClearNotifications={handleClearNotifications}
          onOpenOrders={() => setActiveNav("Buy & Sell")}
          onSeedDemo={handleSeedDemo}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          lang={lang}
          onSelectLang={handleSelectLang}
          t={t}
        />

        <main className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1720px]">{renderPage()}</div>
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
