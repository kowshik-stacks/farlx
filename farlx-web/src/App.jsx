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
  Smartphone,
  Sun,
  Moon,
  Globe,
  Camera,
  Download,
  FileText
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
  ResponsiveContainer
} from "recharts";

import LiveData from "./pages/LiveData";
import { translations } from "./translations";


const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

function normalizeListing(raw, idx = 0) {
  const cropEmojis = {
    tomato: "🍅",
    onion: "🧅",
    paddy: "🌾",
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

  const cropKey = (raw.crop || "").toLowerCase().trim();
  const emoji = cropEmojis[cropKey] || "🌿";

  const gradients = [
    { gradient: "from-rose-500 via-orange-400 to-amber-300", softGradient: "from-rose-50 via-orange-50 to-amber-50" },
    { gradient: "from-emerald-500 via-teal-400 to-cyan-300", softGradient: "from-emerald-50 via-teal-50 to-cyan-50" },
    { gradient: "from-amber-500 via-yellow-400 to-orange-300", softGradient: "from-amber-50 via-yellow-50 to-orange-50" },
    { gradient: "from-violet-500 via-purple-400 to-pink-300", softGradient: "from-violet-50 via-purple-50 to-pink-50" },
    { gradient: "from-blue-500 via-cyan-400 to-teal-300", softGradient: "from-blue-50 via-cyan-50 to-teal-50" }
  ];
  const g = gradients[(raw.id || idx) % gradients.length];

  const qty = Number(raw.quantity) || 100;
  const prc = Number(raw.price_per_kg || raw.price || 30);

  return {
    id: raw.id,
    crop: raw.crop,
    farmer: raw.farmer_name || raw.farmer || "Verified Farmer",
    farmerPhone: raw.farmer_phone,
    farmerUpi: raw.farmer_upi || `${raw.farmer_phone || '9876543210'}@upi`,
    region: raw.location || raw.region || "Tamil Nadu",
    price: prc,
    quality: raw.quality || "Grade A+",
    image: raw.image || emoji,
    quantity: `${qty.toFixed(0)} kg`,
    quantityNumber: qty,
    delivery: raw.harvest_time || raw.delivery || "Ready Now",
    badge: raw.status === "sold" ? "Sold Out" : "Live Telegram Supply",
    status: raw.status || "active",
    bidCount: Number(raw.bid_count || 0),
    matching: 96,
    trend: 12.5,
    rating: 4.9,
    orders: 48,
    deliveryRate: 99,
    acceptingRate: 98,
    joined: "2024",
    telegram: "@FarlX_bot",
    description: raw.description || `Fresh, farm-graded ${raw.crop} harvested directly by farmer. Available for direct bulk procurement via FARLX Smart Escrow with instant UPI settlement upon delivery.`,
    gradient: g.gradient,
    softGradient: g.softGradient,
    category: ["Tomato", "Onion", "Potato", "Chilli", "Cucumber", "Brinjal", "Carrot"].includes(raw.crop) ? "Vegetables" : "Grains & Fruits"
  };
}

// ----------------- DATA -----------------

const navItemsConfig = [
  { id: "Home", key: "navHome", defaultLabel: "Home", icon: Home },
  { id: "My Farm", key: "navMyFarm", defaultLabel: "My Farm", icon: Sprout },
  { id: "Market", key: "navMarket", defaultLabel: "Market", icon: TrendingUp },
  { id: "Buy & Sell", key: "navBuySell", defaultLabel: "Buy & Sell", icon: ShoppingBag },
  { id: "Weather", key: "navWeather", defaultLabel: "Weather", icon: CloudSun },
  { id: "AI Assistant", key: "navAiAssistant", defaultLabel: "AI Assistant", icon: Bot, badge: "NEW" },
  { id: "Logistics", key: "navLogistics", defaultLabel: "Logistics", icon: Truck },
  { id: "Community", key: "navCommunity", defaultLabel: "Community", icon: Users },
  { id: "Reports", key: "navReports", defaultLabel: "Reports", icon: BarChart3 },
  { id: "Settings", key: "navSettings", defaultLabel: "Settings", icon: Settings }
];

function getNavItems(lang) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  return navItemsConfig.map(n => ({
    ...n,
    label: t(n.key, n.defaultLabel)
  }));
}

const listings = [
  {
    id: 1,
    crop: "Tomato",
    farmer: "Suresh Farms",
    region: "Nashik",
    price: 25,
    quality: "A+",
    image: "🍅",
    quantity: "4.8 tonnes",
    quantityNumber: 4.8,
    delivery: "Ready today",
    badge: "Fast moving",
    matching: 96,
    trend: 12.5,
    rating: 4.9,
    orders: 138,
    deliveryRate: 98,
    acceptingRate: 99,
    joined: "2023",
    telegram: "Active now",
    description:
      "Fresh, graded A+ tomatoes harvested this morning. Ideal for wholesale buyers, hotels, restaurants, and food processing businesses.",
    gradient: "from-rose-500 via-orange-400 to-amber-300",
    softGradient: "from-rose-50 via-orange-50 to-amber-50",
    category: "Vegetables",
    deliveryDays: "Same day pickup",
    verification: ["Identity verified", "Farm location verified", "Bank details verified"],
    reasons: [
      "Matches your preferred A+ quality grade",
      "Available quantity meets your purchase pattern",
      "Same-day pickup reduces logistics delay",
      "Price is below your recent tomato average",
      "Farmer has 98% on-time delivery"
    ]
  },
  {
    id: 2,
    crop: "Potato",
    farmer: "GreenValley Co.",
    region: "Indore",
    price: 18,
    quality: "A",
    image: "🥔",
    quantity: "12.5 tonnes",
    quantityNumber: 12.5,
    delivery: "Dispatch in 24h",
    badge: "Best value",
    matching: 92,
    trend: -3.2,
    rating: 4.7,
    orders: 96,
    deliveryRate: 96,
    acceptingRate: 97,
    joined: "2022",
    telegram: "Active now",
    description:
      "Clean, sorted potatoes with consistent sizing. Suitable for bulk buyers, distributors, kitchens, and processing requirements.",
    gradient: "from-amber-500 via-yellow-400 to-lime-300",
    softGradient: "from-amber-50 via-yellow-50 to-lime-50",
    category: "Vegetables",
    deliveryDays: "Dispatch within 24 hours",
    verification: ["Identity verified", "Farm location verified", "Quality checked"],
    reasons: [
      "Lowest available price in your selected region",
      "Large quantity is available for bulk purchase",
      "Farmer has a stable acceptance history",
      "Quality is compatible with your past orders",
      "Market price is currently falling"
    ]
  },
  {
    id: 3,
    crop: "Rice",
    farmer: "Punjab Agro",
    region: "Ludhiana",
    price: 40,
    quality: "A++",
    image: "🍚",
    quantity: "8.2 tonnes",
    quantityNumber: 8.2,
    delivery: "Ready tomorrow",
    badge: "Top quality",
    matching: 94,
    trend: 8.1,
    rating: 4.9,
    orders: 203,
    deliveryRate: 99,
    acceptingRate: 98,
    joined: "2021",
    telegram: "Online",
    description:
      "Premium A++ rice with high grain consistency and clean processing. Reliable choice for quality-focused commercial buyers.",
    gradient: "from-emerald-500 via-teal-400 to-cyan-300",
    softGradient: "from-emerald-50 via-teal-50 to-cyan-50",
    category: "Grains",
    deliveryDays: "Ready for dispatch tomorrow",
    verification: ["Identity verified", "Farm location verified", "Premium quality verified"],
    reasons: [
      "Premium quality matches your high-grade preference",
      "Supplier has completed over 200 marketplace orders",
      "99% delivery reliability reduces supply risk",
      "Available quantity matches your order size",
      "Supplier is active on Telegram"
    ]
  },
  {
    id: 4,
    crop: "Wheat",
    farmer: "MP Grains",
    region: "Bhopal",
    price: 22,
    quality: "A",
    image: "🌾",
    quantity: "15 tonnes",
    quantityNumber: 15,
    delivery: "Ready today",
    badge: "High demand",
    matching: 98,
    trend: 5.8,
    rating: 4.8,
    orders: 174,
    deliveryRate: 97,
    acceptingRate: 99,
    joined: "2022",
    telegram: "Active now",
    description:
      "Freshly cleaned A-grade wheat available in bulk. Strong demand is expected due to current Bhopal market movement.",
    gradient: "from-violet-500 via-fuchsia-400 to-pink-300",
    softGradient: "from-violet-50 via-fuchsia-50 to-pink-50",
    category: "Grains",
    deliveryDays: "Same-day pickup available",
    verification: ["Identity verified", "Farm location verified", "Bank details verified"],
    reasons: [
      "Strongest match with your recent grain purchases",
      "High quantity supports your bulk requirement",
      "Farmer has a 99% bid acceptance history",
      "Supplier is ready for immediate pickup",
      "Rising market demand suggests early purchase"
    ]
  },
  {
    id: 5,
    crop: "Onion",
    farmer: "Kisan Harvest Group",
    region: "Pune",
    price: 28,
    quality: "A",
    image: "🧅",
    quantity: "9.6 tonnes",
    quantityNumber: 9.6,
    delivery: "Ready in 24h",
    badge: "Fresh stock",
    matching: 89,
    trend: 2.8,
    rating: 4.7,
    orders: 122,
    deliveryRate: 96,
    acceptingRate: 97,
    joined: "2023",
    telegram: "Online",
    description:
      "Freshly harvested onions, well sorted and packed for commercial transport. Available for immediate regional dispatch.",
    gradient: "from-fuchsia-500 via-pink-400 to-rose-300",
    softGradient: "from-fuchsia-50 via-pink-50 to-rose-50",
    category: "Vegetables",
    deliveryDays: "Dispatch within 24 hours",
    verification: ["Identity verified", "Farm location verified", "Quality checked"],
    reasons: [
      "Fresh stock fits your vegetable supply requirements",
      "Supplier rating is consistently strong",
      "Delivery is available within 24 hours",
      "Quantity supports medium-volume procurement",
      "Price remains competitive for the region"
    ]
  },
  {
    id: 6,
    crop: "Maize",
    farmer: "Deccan Crop Collective",
    region: "Hubballi",
    price: 21,
    quality: "A",
    image: "🌽",
    quantity: "18 tonnes",
    quantityNumber: 18,
    delivery: "Ready tomorrow",
    badge: "Bulk supply",
    matching: 91,
    trend: 4.2,
    rating: 4.8,
    orders: 151,
    deliveryRate: 98,
    acceptingRate: 98,
    joined: "2021",
    telegram: "Active now",
    description:
      "A-grade maize with dependable bulk availability for feed, food processing, and wholesale distribution buyers.",
    gradient: "from-yellow-500 via-amber-400 to-orange-300",
    softGradient: "from-yellow-50 via-amber-50 to-orange-50",
    category: "Grains",
    deliveryDays: "Dispatch tomorrow",
    verification: ["Identity verified", "Farm location verified", "Bulk supplier verified"],
    reasons: [
      "Bulk quantity exceeds your usual order size",
      "High on-time delivery performance",
      "Strong fit for grain procurement demand",
      "Competitive regional price",
      "Farmer has reliable Telegram response activity"
    ]
  }
];

const crops = [
  {
    name: "Tomato",
    price: 25,
    change: 12.5,
    image: "🍅",
    region: "Nashik",
    buyers: "182 buyers watching",
    color: "from-rose-500 to-orange-400",
    softColor: "from-rose-50 to-orange-50"
  },
  {
    name: "Potato",
    price: 18,
    change: -3.2,
    image: "🥔",
    region: "Indore",
    buyers: "96 buyers watching",
    color: "from-amber-500 to-yellow-400",
    softColor: "from-amber-50 to-yellow-50"
  },
  {
    name: "Wheat",
    price: 22,
    change: 5.8,
    image: "🌾",
    region: "Bhopal",
    buyers: "221 buyers watching",
    color: "from-violet-500 to-fuchsia-400",
    softColor: "from-violet-50 to-fuchsia-50"
  },
  {
    name: "Rice",
    price: 40,
    change: 8.1,
    image: "🍚",
    region: "Ludhiana",
    buyers: "148 buyers watching",
    color: "from-emerald-500 to-teal-400",
    softColor: "from-emerald-50 to-teal-50"
  }
];

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 }
];

const cropDistribution = [
  { name: "Tomato", value: 35, color: "#F43F5E" },
  { name: "Potato", value: 25, color: "#F59E0B" },
  { name: "Wheat", value: 20, color: "#8B5CF6" },
  { name: "Rice", value: 20, color: "#10B981" }
];

const activityEvents = [
  {
    title: "New bid received",
    description: "Suresh Farms responded to your tomato requirement.",
    time: "8 min ago",
    icon: Handshake,
    iconStyle: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500"
  },
  {
    title: "Price alert triggered",
    description: "Wheat prices increased by 5.8% in Bhopal.",
    time: "24 min ago",
    icon: TrendingUp,
    iconStyle: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500"
  },
  {
    title: "Order delivered",
    description: "Rice order #FX-2024 has reached your warehouse.",
    time: "1 hr ago",
    icon: Truck,
    iconStyle: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500"
  }
];

// ----------------- MOTION CONFIG -----------------

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" }
  }
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 }
  }
};

const itemReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: "easeOut" }
  }
};

// ----------------- SIDEBAR -----------------

function Sidebar({ active, setActive, mobileOpen, setMobileOpen, lang = "en" }) {
  const navigate = useNavigate();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[236px] shrink-0 flex-col overflow-hidden border-r border-slate-700 bg-[#071A2B] text-white transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex min-h-[88px] items-center justify-between border-b border-slate-700/80 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-lg shadow-cyan-950/40">
              <Leaf className="h-5 w-5 text-white" />
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-white">
                Farlx
              </div>
              <div className="mt-0.5 text-[10px] font-bold tracking-[0.14em] text-cyan-100">
                BUY SMARTER
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 py-6">
          <div className="mb-4 flex items-center gap-2 px-3">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Buyer workspace
            </p>
          </div>

          <div className="space-y-2">
            {getNavItems(lang).map((item) => {
              const isActive = active === item.id;
              const Icon = item.icon;

              return (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={item.id}
                  onClick={() => {
                    if (item.id === "Home") {
                      setActive("Home");
                      navigate("/");
                    } else if (item.id === "Market") {
                      setActive("Market");
                      navigate("/market");
                    } else {
                      setActive(item.id);
                      navigate("/");
                    }
                    setMobileOpen(false);
                  }}
                  className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-950/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-slate-800/80 text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="truncate font-semibold tracking-wide">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className="ml-auto rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        <div className="relative border-t border-slate-700/80 p-4">
          <a
            href="/live-data"
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-slate-800 to-slate-950 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-300/70 hover:shadow-xl hover:shadow-cyan-950/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm font-bold text-white">
                  Live Market
                </span>
              </div>

              <Activity className="h-4 w-4 text-cyan-300" />
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-300">
              Watch prices, bids, and transactions in real time.
            </p>

            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              Open live data
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>
      </aside>
    </>
  );
}

// ----------------- TOP BAR -----------------

function TopBar({
  onMenu,
  onSearch,
  notifications = [],
  unreadCount = 0,
  onClearNotifications,
  onOpenOrders,
  onSeedDemo,
  isLive = true,
  isDark = false,
  onToggleDark,
  lang = "en",
  onSetLang,
  user = { name: "Rajesh Kumar", role: "Wholesale Buyer" }
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const LANGS = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
    { code: "te", label: "తెలుగు", flag: "🇮🇳" },
    { code: "mr", label: "मराठी", flag: "🇮🇳" }
  ];
  const currentLang = LANGS.find(l => l.code === lang) || LANGS[0];

  return (
    <header className={"sticky top-0 z-30 min-h-[74px] border-b backdrop-blur-xl transition-colors duration-200 " + (isDark ? "border-slate-700/80 bg-[#0B1120]/95" : "border-slate-200/80 bg-white/90")}>
      <div className="flex min-h-[74px] w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className={"shrink-0 rounded-xl border p-2.5 shadow-sm transition-all lg:hidden " + (isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 flex-1 md:block">
          <label className={"flex h-11 w-full max-w-[420px] items-center gap-3 rounded-xl border px-4 transition-all duration-200 " + (isDark ? "border-slate-700 bg-slate-900 focus-within:border-emerald-500" : "border-slate-200 bg-slate-50 focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100")}>
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder={(translations[lang] && translations[lang].searchPlaceholder) || "Search crops, farmers, locations..."}
              onChange={(event) => onSearch(event.target.value)}
              className={"min-w-0 flex-1 bg-transparent text-sm font-medium outline-none " + (isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400")}
            />
          </label>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3.5">
          {/* Telegram Bot Direct Pill */}
          <a
            href="https://t.me/FarlX_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/80 px-3 py-2 text-xs font-bold text-cyan-800 transition-all hover:bg-cyan-100 sm:inline-flex"
          >
            <Send className="h-3.5 w-3.5 text-cyan-600" />
            <span>Bot: @FarlX_bot</span>
            <ExternalLink className="h-3 w-3 text-cyan-500" />
          </a>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className={"flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all " + (isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm")}
              title="Select Language"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">{currentLang.flag} {currentLang.label.split(' ')[0]}</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className={"absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-2xl border shadow-2xl " + (isDark ? "border-slate-700 bg-[#0B1120]" : "border-slate-200 bg-white")}>
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { if(onSetLang) onSetLang(l.code); setLangOpen(false); }}
                      className={"flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors " + (l.code === lang ? (isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-50 text-emerald-700") : (isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"))}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                      {l.code === lang && <Check className="ml-auto h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={"rounded-xl border p-2.5 transition-all " + (isDark ? "border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm hover:text-amber-500")}
          >
            {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Quick Demo Seed Button */}
          {onSeedDemo && (
            <button
              onClick={onSeedDemo}
              title="Add sample farmer & listing for testing"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Demo Data</span>
            </button>
          )}

          {/* Live Status Indicator */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 lg:flex">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">Live Sync</span>
          </div>

          {/* Functional Notification Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={"relative rounded-xl border p-2.5 transition-all hover:-translate-y-0.5 " + (isDark ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-violet-700 hover:bg-violet-900/40 hover:text-violet-300" : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700")}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-bounce">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={"absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden rounded-2xl border shadow-2xl " + (isDark ? "border-slate-700 bg-[#0B132B] text-slate-100 shadow-slate-950/80" : "border-slate-200 bg-white shadow-slate-300")}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 to-[#071A2B] px-4 py-3.5 text-white">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-cyan-300" />
                        <span className="text-sm font-black">Live Platform Alerts</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && onClearNotifications && (
                        <button
                          onClick={onClearNotifications}
                          className="text-[11px] font-bold text-cyan-200 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          <p className="font-semibold text-slate-700">No notifications yet</p>
                          <p className="mt-1">Events from Telegram (@FarlX_bot), bids, and escrow releases will appear here in real time.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => {
                          const isEscrow = n.type === "bid_accepted" || n.type === "payment_released";
                          return (
                            <div
                              key={n.id}
                              className={`p-3.5 text-xs transition-colors hover:bg-slate-50 ${
                                !n.read ? "bg-cyan-50/40" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-900">{n.title}</span>
                                <span className="shrink-0 text-[10px] text-slate-400">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                              {isEscrow && onOpenOrders && (
                                <button
                                  onClick={() => {
                                    setNotifOpen(false);
                                    onOpenOrders();
                                  }}
                                  className="mt-2 inline-flex items-center gap-1 font-bold text-cyan-700 hover:underline text-[11px]"
                                >
                                  View in Orders & Escrow →
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50 p-2.5 text-center">
                      <button
                        onClick={() => {
                          setNotifOpen(false);
                          if (onOpenOrders) onOpenOrders();
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-cyan-700"
                      >
                        Manage Escrow Orders & Payments →
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold text-slate-900">{user.name}</div>
              <div className="mt-0.5 text-xs font-medium text-slate-500">{user.role}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-xs font-black text-white shadow-md shadow-blue-200">
              RK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ----------------- SECTION HEADING -----------------

function SectionHeading({ title, description, action, icon: Icon, isDark = false }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className={"flex h-9 w-9 items-center justify-center rounded-xl shadow-md " + (isDark ? "bg-emerald-600 text-white shadow-emerald-950/50" : "bg-slate-900 text-white shadow-slate-200")}>
              <Icon className="h-4.5 w-4.5" />
            </span>
          )}

          <h2 className={"text-xl font-black tracking-tight " + (isDark ? "text-white" : "text-slate-900")}>
            {title}
          </h2>
        </div>

        <p className={"mt-2 text-sm leading-6 " + (isDark ? "text-slate-400" : "text-slate-500")}>{description}</p>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function WorkflowPipeline({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;

  const steps = [
    { num: 1, title: t("pipeStep1Title", "1. Farmer Lists Produce"), desc: t("pipeStep1Desc", "Farmer lists crop via Telegram @FarlX_bot"), icon: "🌾", badge: "Live" },
    { num: 2, title: t("pipeStep2Title", "2. Buyer Places Bid"), desc: t("pipeStep2Desc", "Wholesale buyer submits offer on Web"), icon: "💼", badge: "Instant" },
    { num: 3, title: t("pipeStep3Title", "3. Farmer Accepts"), desc: t("pipeStep3Desc", "Farmer accepts offer in local language on Bot"), icon: "📱", badge: "Synced" },
    { num: 4, title: t("pipeStep4Title", "4. Escrow Locks Funds"), desc: t("pipeStep4Desc", "Funds locked safely; dispatch tracking starts"), icon: "🔒", badge: "Protected" },
    { num: 5, title: t("pipeStep5Title", "5. Delivery & UPI Payout"), desc: t("pipeStep5Desc", "Buyer confirms goods -> Instant UPI release"), icon: "💸", badge: "Instant" }
  ];

  return (
    <div className={"rounded-2xl border p-5 transition-all duration-200 " + (isDark ? "bg-[#111C32] border-slate-800 text-slate-100 shadow-xl" : "bg-white border-slate-200 shadow-sm text-slate-900")}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 font-black text-xs">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <h3 className={"text-sm font-black " + (isDark ? "text-white" : "text-slate-900")}>
              {t("pipeHeader", "Simultaneous Web & Telegram Escrow Workflow")}
            </h3>
            <p className={"text-xs " + (isDark ? "text-slate-400" : "text-slate-500")}>
              {t("pipeSubheader", "How buyer bids on Web and farmer approvals on Telegram synchronize in real time")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-500 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Live Sync: Web ⇄ @FarlX_bot
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((s, idx) => (
          <div
            key={s.num}
            className={"relative rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 " + 
              (idx === 1 
                ? (isDark ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200 ring-2 ring-cyan-500/30" : "border-cyan-300 bg-cyan-50/80 text-cyan-950 ring-2 ring-cyan-400/30")
                : (isDark ? "border-slate-800 bg-[#0B132B]/80 text-slate-300" : "border-slate-200/80 bg-slate-50/80 text-slate-700"))}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className={"text-[10px] font-black uppercase px-2 py-0.5 rounded-full " + 
                  (idx === 1 ? "bg-cyan-500 text-white" : (isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"))}>
                  {s.badge}
                </span>
              </div>
              <h4 className={"text-xs font-black " + (isDark ? "text-white" : "text-slate-900")}>{s.title}</h4>
              <p className={"text-[11px] mt-1 leading-snug " + (isDark ? "text-slate-400" : "text-slate-500")}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------- HERO -----------------



function Hero({ onExplore, lang = "en", isDark = false }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={"relative overflow-hidden rounded-[30px] shadow-2xl transition-all duration-300 " + (isDark ? "bg-[#0B132B] border border-slate-800 shadow-slate-950/70" : "bg-[#071A2B] shadow-slate-300/70")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(16,185,129,0.42),transparent_28%),radial-gradient(circle_at_75%_15%,rgba(59,130,246,0.46),transparent_28%),radial-gradient(circle_at_90%_90%,rgba(168,85,247,0.38),transparent_36%)]" />

      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"
      />

      <motion.div
        animate={{ x: [0, -16, 0], y: [0, 14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
      />

      <div className="relative grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.38fr)_minmax(320px,0.62fr)] lg:px-10">
        <div className="flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-50 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              {t("heroBadge", "LIVE BUYER INTELLIGENCE")}
            </div>

            <p className="mt-6 text-sm font-bold text-emerald-200">
              {t("heroGreeting", "Good evening, Rajesh")}
            </p>

            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-[40px] sm:leading-[1.1]">
              {t("heroSmarter", "The smarter way to source your supply.")}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
              42 {t("heroMatchDesc", "verified farmer listings match your buying preferences today. Compare quality, pricing, delivery readiness, and supplier trust in one place.")}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExplore}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-900 shadow-lg shadow-slate-950/20 transition-colors hover:bg-cyan-50"
            >
              <ShoppingCart className="h-4 w-4 text-teal-700" />
              {t("exploreMarket", "Explore marketplace")}
              <ArrowUpRight className="h-4 w-4 text-teal-700" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExplore}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <Send className="h-4 w-4 text-amber-300" />
              {t("postRequirement", "Post buying requirement")}
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 self-end">
          <motion.div
            whileHover={{ y: -4 }}
            className="col-span-2 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
                  {t("bestOpportunity", "Best opportunity today")}
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  42 {t("matchingListings", "matching listings")}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-amber-950 shadow-lg shadow-orange-950/20">
                <Flame className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "76%" }}
                transition={{ delay: 0.45, duration: 1.15, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300"
              />
            </div>

            <p className="mt-2 text-xs text-slate-200">
              76% {t("avgMatch", "average match with your recent buying behaviour")}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
          >
            <IndianRupee className="h-5 w-5 text-emerald-300" />
            <p className="mt-3 text-xl font-black text-white">₹18.4K</p>
            <p className="mt-1 text-xs text-slate-200">{t("potentialSavings", "Potential savings")}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
          >
            <Award className="h-5 w-5 text-cyan-300" />
            <p className="mt-3 text-xl font-black text-white">96%</p>
            <p className="mt-1 text-xs text-slate-200">
              {t("verifiedSuppliers", "Verified suppliers")}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function StatsGrid({ liveStats, isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const stats = [
    {
      label: t("statsVolume", "Total Trade Volume"),
      value: liveStats?.totalVolume ? `₹${liveStats.totalVolume.toLocaleString('en-IN')}` : "₹2,45,000",
      change: "+15.2%",
      icon: DollarSign,
      iconStyle: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700",
      badgeStyle: isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-blue-700",
      accent: "from-blue-500 to-cyan-400",
      bottom: "Smart Escrow settlement",
      bars: [35, 48, 42, 65, 56, 82]
    },
    {
      label: t("statsTotalBids", "Active Escrow Orders"),
      value: liveStats?.totalTransactions !== undefined ? String(liveStats.totalTransactions) : "18",
      change: "+4",
      icon: Package,
      iconStyle: isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700",
      badgeStyle: isDark ? "bg-violet-500/20 text-violet-300" : "bg-violet-50 text-violet-700",
      accent: "from-violet-500 to-fuchsia-400",
      bottom: "Awaiting buyer confirmation",
      bars: [20, 42, 35, 68, 56, 74]
    },
    {
      label: t("statsFarmers", "Registered Farmers"),
      value: liveStats?.totalFarmers ? String(liveStats.totalFarmers) : "42",
      change: "+12",
      icon: Users,
      iconStyle: isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700",
      badgeStyle: isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-500 to-teal-400",
      bottom: "Active in Telegram @FarlX_bot",
      bars: [32, 45, 51, 47, 68, 86]
    },
    {
      label: t("statsActiveListings", "Live Marketplace Listings"),
      value: liveStats?.totalListings ? String(liveStats.totalListings) : "28",
      change: "Real-time",
      icon: ShieldCheck,
      iconStyle: isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-800",
      badgeStyle: isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-50 text-amber-800",
      accent: "from-amber-500 to-yellow-400",
      bottom: "Direct farm-gate supply",
      bars: [40, 50, 44, 70, 62, 90]
    }
  ];

  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.article
            variants={itemReveal}
            whileHover={{ y: -4 }}
            key={stat.label}
            className={"group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-xl " + (isDark ? "border-slate-800 bg-[#111C32] hover:border-cyan-700" : "border-slate-200 bg-white hover:border-cyan-200 hover:shadow-slate-200/80")}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconStyle} shadow-sm transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-black ${stat.badgeStyle}`}
              >
                {stat.change}
              </span>
            </div>

            <div className={"mt-5 text-[26px] font-black tracking-tight " + (isDark ? "text-white" : "text-slate-900")}>
              {stat.value}
            </div>
            <div className={"mt-1 text-sm font-bold " + (isDark ? "text-slate-300" : "text-slate-600")}>
              {stat.label}
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <p className={"text-xs font-medium " + (isDark ? "text-slate-400" : "text-slate-500")}>
                {stat.bottom}
              </p>
              <div className="flex h-7 items-end gap-1">
                {stat.bars.map((height, index) => (
                  <motion.span
                    key={`${stat.label}-${index}`}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.18 + index * 0.07,
                      duration: 0.35
                    }}
                    className={`w-1.5 rounded-t-full bg-gradient-to-t ${stat.accent}`}
                  />
                ))}
              </div>
            </div>
          </motion.article>
        );
      })}
    </motion.section>
  );
}

function ListingCard({ listing, onView, compact = false, isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`group flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-2xl ${isDark ? "bg-[#111C32] border-slate-800 text-slate-100 hover:border-emerald-500/50" : "bg-white border-slate-200 text-slate-900 hover:border-emerald-300 hover:shadow-slate-200/90"} ${
        compact ? "min-h-[300px]" : "min-h-[328px]"
      }`}
    >
      <div
        className={`relative flex h-[160px] items-center justify-center overflow-hidden bg-gradient-to-br ${listing.softGradient} text-6xl`}
      >
        <div
          className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${listing.gradient} opacity-25 blur-2xl`}
        />
        <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/70 blur-2xl" />

        <span className="relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {listing.image}
        </span>

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur">
          {listing.badge}
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
          <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
          {t("verified", "Verified")}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={"text-lg font-black " + (isDark ? "text-white" : "text-slate-900")}>
              {listing.crop}
            </h3>

            <p className={"mt-1 flex items-center gap-1 text-xs font-medium " + (isDark ? "text-slate-400" : "text-slate-500")}>
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {listing.region}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs font-black text-amber-500 dark:text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {listing.quality}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className={"text-xs font-semibold " + (isDark ? "text-slate-400" : "text-slate-500")}>
            {listing.farmer}
          </p>

          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-black text-emerald-500 dark:text-emerald-400">
            {listing.matching}% {t("match", "match")}
          </span>
        </div>

        <div className={"mt-4 grid grid-cols-2 gap-2 rounded-xl p-3 " + (isDark ? "bg-[#0B132B] border border-slate-800" : "bg-slate-50 border border-slate-100")}>
          <div>
            <p className={"text-[10px] font-bold uppercase tracking-wide " + (isDark ? "text-slate-400" : "text-slate-500")}>
              {t("available", "Available")}
            </p>
            <p className={"mt-1 text-xs font-bold " + (isDark ? "text-slate-200" : "text-slate-700")}>
              {listing.quantity}
            </p>
          </div>

          <div className={"border-l pl-3 " + (isDark ? "border-slate-800" : "border-slate-200")}>
            <p className={"text-[10px] font-bold uppercase tracking-wide " + (isDark ? "text-slate-400" : "text-slate-500")}>
              {t("delivery", "Delivery")}
            </p>
            <p className={"mt-1 text-xs font-bold " + (isDark ? "text-emerald-400" : "text-emerald-700")}>
              {listing.delivery}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div>
            <p className={"text-xs font-medium " + (isDark ? "text-slate-400" : "text-slate-500")}>{t("startingAt", "Starting at")}</p>
            <p className={"mt-1 text-xl font-black tracking-tight " + (isDark ? "text-white" : "text-slate-900")}>
              ₹{listing.price}
              <span className={"text-sm font-semibold " + (isDark ? "text-slate-400" : "text-slate-500")}> {t("perKg", "/kg")}</span>
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(listing)}
            className={"inline-flex h-10 items-center gap-1 rounded-xl px-3.5 text-sm font-bold text-white transition-colors " + (isDark ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-900 hover:bg-teal-700")}
          >
            {t("viewBtn", "View")}
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function FeaturedListings({ currentListings, onView, onExplore, isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const displayListings = (currentListings && currentListings.length > 0) ? currentListings : listings;

  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
    >
      <SectionHeading
        title={t("featuredHeading", "Live listings from verified farmers")}
        description={t("featuredSubheading", "Fresh crop supplies harvested and posted in real time via Telegram @FarlX_bot.")}
        icon={Store}
        isDark={isDark}
        action={
          <motion.button
            whileHover={{ x: 3 }}
            onClick={onExplore}
            className={"inline-flex h-10 items-center gap-1 rounded-xl px-3.5 text-sm font-black text-white shadow-sm transition-colors " + (isDark ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-900 hover:bg-teal-700")}
          >
            {t("exploreAllListings", "Explore all listings")}
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        }
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6"
      >
        {displayListings.slice(0, 4).map((listing) => (
          <motion.div variants={itemReveal} key={listing.id}>
            <ListingCard listing={listing} onView={onView} isDark={isDark} lang={lang} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

function Insights({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
    >
      <SectionHeading
        title={t("insightsTitle", "Marketplace insights")}
        description={t("insightsDesc", "Make more confident procurement decisions with trends, category spend, and demand signals.")}
        icon={ChartNoAxesCombined}
        isDark={isDark}
        action={
          <button className={"inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold shadow-sm transition-colors " + (isDark ? "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}>
            <CalendarDays className="h-4 w-4" />
            {t("last6Months", "Last 6 months")}
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.article
          whileHover={{ y: -4 }}
          className={"min-h-[350px] overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-xl sm:p-6 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white hover:shadow-slate-200/60")}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700")}>
                <TrendingUp className="h-5 w-5" />
              </span>

              <div>
                <h3 className={"text-base font-black " + (isDark ? "text-white" : "text-slate-900")}>
                  {t("monthlySpend", "Monthly spend trend")}
                </h3>
                <p className={"mt-0.5 text-xs font-medium " + (isDark ? "text-slate-400" : "text-slate-500")}>
                  {t("procurementPerf", "Procurement performance")}
                </p>
              </div>
            </div>

            <div className={"rounded-xl px-3 py-2 text-right " + (isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-blue-700")}>
              <p className="text-[10px] font-bold uppercase tracking-wide">
                {t("thisMonth", "This month")}
              </p>
              <p className="mt-0.5 text-sm font-black">
                ₹67,000
              </p>
            </div>
          </div>

          <div className="mt-6 h-[248px] sm:h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1E293B" : "#E2E8F0"} />
                <XAxis
                  dataKey="month"
                  stroke={isDark ? "#94A3B8" : "#64748B"}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? "#94A3B8" : "#64748B"}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    border: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    borderRadius: "12px",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "10px 12px",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.10)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article
          whileHover={{ y: -4 }}
          className={"min-h-[350px] overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-xl sm:p-6 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white hover:shadow-slate-200/60")}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + (isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700")}>
                <Layers3 className="h-5 w-5" />
              </span>

              <div>
                <h3 className={"text-base font-black " + (isDark ? "text-white" : "text-slate-900")}>
                  {t("spendByCrop", "Spend by crop")}
                </h3>
                <p className={"mt-0.5 text-xs font-medium " + (isDark ? "text-slate-400" : "text-slate-500")}>
                  {t("categoryDist", "Category distribution")}
                </p>
              </div>
            </div>

            <span className={"rounded-full px-3 py-1.5 text-xs font-black " + (isDark ? "bg-violet-500/20 text-violet-300" : "bg-violet-50 text-violet-700")}>
              {t("categoriesCount", "4 categories")}
            </span>
          </div>

          <div className="mt-5 grid min-h-[250px] grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto]">
            <div className="h-[220px] sm:h-[240px] sm:w-[285px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={86}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      border: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
                      color: isDark ? "#F8FAFC" : "#0F172A",
                      borderRadius: "12px",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "10px 12px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-3 sm:w-[155px]">
              {cropDistribution.map((crop) => (
                <div
                  key={crop.name}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: crop.color }}
                    />
                    <span className={"text-xs font-bold " + (isDark ? "text-slate-300" : "text-slate-600")}>
                      {crop.name}
                    </span>
                  </div>

                  <span className={"text-xs font-black " + (isDark ? "text-white" : "text-slate-900")}>
                    {crop.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}

function BuyerPulse({ onOpenListing, isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.16fr)_minmax(365px,0.84fr)]"
    >
      <article className={"overflow-hidden rounded-2xl border shadow-sm " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white")}>
        <div className={"flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 " + (isDark ? "border-slate-800" : "border-slate-100")}>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-100">
                <Activity className="h-5 w-5" />
              </span>

              <h2 className={"text-xl font-black tracking-tight " + (isDark ? "text-white" : "text-slate-900")}>
                {t("buyerActivity", "Buyer activity")}
              </h2>
            </div>

            <p className={"mt-2 text-sm " + (isDark ? "text-slate-400" : "text-slate-500")}>
              {t("buyerActivityDesc", "Important updates from your market, suppliers, and active orders.")}
            </p>
          </div>

          <button className={"inline-flex h-10 items-center justify-center gap-1 rounded-xl px-3 text-sm font-bold transition-colors " + (isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-50 text-slate-700 hover:bg-slate-100")}>
            {t("viewAll", "View all")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="space-y-5">
            {activityEvents.map((event, index) => {
              const Icon = event.icon;

              return (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.09 }}
                  className="flex gap-4"
                >
                  <div className="relative">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${event.iconStyle}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    {index !== activityEvents.length - 1 && (
                      <div className={"absolute left-1/2 top-11 h-7 w-px -translate-x-1/2 " + (isDark ? "bg-slate-800" : "bg-slate-200")} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className={"text-sm font-black " + (isDark ? "text-slate-200" : "text-slate-800")}>
                        {event.title}
                      </p>
                      <span className="text-xs font-semibold text-slate-400">
                        {event.time}
                      </span>
                    </div>

                    <p className={"mt-1 text-sm leading-6 " + (isDark ? "text-slate-400" : "text-slate-500")}>
                      {event.description}
                    </p>
                  </div>

                  <span
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${event.dot}`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </article>

      <motion.article
        whileHover={{ y: -5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl shadow-indigo-950/30"
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-fuchsia-400/25 blur-3xl" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Bot className="h-5 w-5 text-amber-200" />
            </div>

            <span className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black text-amber-950">
              FARLX AI
            </span>
          </div>

          <div className="mt-7">
            <p className="text-sm font-bold text-cyan-100">
              {t("aiRecommendation", "Smart sourcing recommendation")}
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight">
              {t("secureWheat", "Secure wheat before the next market movement.")}
            </h3>

            <p className="mt-3 text-sm leading-6 text-indigo-100">
              {t("wheatDemandDesc", "Demand is rising in Bhopal. Three A-grade verified wheat lots are available at ₹22/kg and match your past quality preference.")}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-100">
                {t("expectedRise", "Expected rise")}
              </p>
              <p className="mt-1 text-lg font-black text-white">+8.4%</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-100">
                {t("availableLots", "Available lots")}
              </p>
              <p className="mt-1 text-lg font-black text-white">3</p>
            </div>
          </div>

          <button
            onClick={() => onOpenListing((listings && listings.length > 3) ? listings[3] : (listings[0] || null))}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-indigo-700 transition-all hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            {t("viewMatchingLots", "View matching lots")}
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </motion.article>
    </motion.section>
  );
}

function LivePrices({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
    >
      <SectionHeading
        title={t("livePricesTitle", "Live market prices")}
        description={t("livePricesDesc", "Current buying signals from major agricultural markets, refreshed as new market data arrives.")}
        icon={Activity}
        isDark={isDark}
        action={
          <a
            href="/live-data"
            target="_blank"
            rel="noopener noreferrer"
            className={"inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-bold text-white transition-colors " + (isDark ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-900 hover:bg-teal-700")}
          >
            {t("openLiveData", "Open live data")}
            <ExternalLink className="h-4 w-4" />
          </a>
        }
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6"
      >
        {crops.map((crop) => (
          <motion.article
            variants={itemReveal}
            whileHover={{ y: -6, scale: 1.01 }}
            key={crop.name}
            className={"group relative min-h-[204px] overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-xl " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white hover:shadow-slate-200/80")}
          >
            <div
              className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${crop.color}`}
            />
            <div
              className={`absolute -right-12 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${crop.color} opacity-10 blur-2xl`}
            />

            <div className="relative flex items-start justify-between gap-4">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${crop.softColor} text-2xl`}
              >
                {crop.image}
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                  crop.change >= 0
                    ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-500 dark:text-rose-400"
                }`}
              >
                {crop.change >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {Math.abs(crop.change)}%
              </span>
            </div>

            <div className="relative mt-5">
              <h3 className={"text-lg font-black " + (isDark ? "text-white" : "text-slate-900")}>
                {crop.name}
              </h3>

              <p className={"mt-1 flex items-center gap-1 text-xs font-semibold " + (isDark ? "text-slate-400" : "text-slate-500")}>
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {crop.region}
              </p>
            </div>

            <div className="relative mt-5 flex items-end justify-between gap-3">
              <div>
                <p className={"text-xs font-semibold " + (isDark ? "text-slate-400" : "text-slate-500")}>
                  {t("currentRate", "Current rate")}
                </p>
                <p className={"mt-1 text-2xl font-black tracking-tight " + (isDark ? "text-white" : "text-slate-900")}>
                  ₹{crop.price}
                  <span className={"ml-1 text-sm font-semibold " + (isDark ? "text-slate-400" : "text-slate-500")}>
                    {t("perKg", "/kg")}
                  </span>
                </p>
              </div>

              <div
                className={`rounded-lg px-2 py-1.5 text-xs font-black ${
                  crop.change >= 0
                    ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-500 dark:text-rose-400"
                }`}
              >
                {crop.change >= 0 ? t("rising", "Rising") : t("falling", "Falling")}
              </div>
            </div>

            <div className={"relative mt-4 flex items-center gap-1.5 border-t pt-3 text-xs font-semibold " + (isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500")}>
              <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
              {crop.buyers}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}

function MarketPage({ currentListings, searchQuery, onView, isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Best Match");

  const sourceListings = (currentListings && currentListings.length > 0) ? currentListings : listings;

  const filteredListings = useMemo(() => {
    const query = (searchQuery || "").trim().toLowerCase();

    let result = sourceListings.filter((listing) => {
      const matchesCategory =
        category === "All" || listing.category === category;

      const matchesSearch =
        !query ||
        listing.crop.toLowerCase().includes(query) ||
        listing.farmer.toLowerCase().includes(query) ||
        (listing.region && listing.region.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "Lowest Price") {
      result = [...result].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "Highest Rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [category, searchQuery, sortBy, sourceListings]);

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={"relative overflow-hidden rounded-[28px] p-7 text-white shadow-2xl sm:p-9 " + (isDark ? "bg-gradient-to-br from-slate-950 via-[#0B2538] to-[#0A3D38] border border-slate-800" : "bg-gradient-to-br from-slate-950 via-[#0B3C4D] to-[#0A5B54] shadow-slate-300/60")}
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
              <ScanSearch className="h-3.5 w-3.5" />
              {t("heroBadge", "VERIFIED SUPPLY NETWORK & SMART ESCROW")}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl text-white">
              {t("marketTitle", "Direct Farm Produce Marketplace")}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              {t("marketSubtitle", "Crops listed directly by farmers via Telegram bot (@FarlX_bot). Place your bid, get farmer acceptance, and pay through Escrow with instant UPI release upon delivery.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://t.me/FarlX_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 text-sm font-black text-white shadow-lg shadow-emerald-950/40 hover:opacity-95"
            >
              <Send className="h-4 w-4" />
              {t("listCropTelegram", "List Crop via Telegram")}
            </a>
          </div>
        </div>
      </motion.section>

      {/* Filter and sorting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "All", label: t("allCategories", "All Crops") },
            { id: "Vegetables", label: t("vegetables", "Vegetables") },
            { id: "Grains & Fruits", label: t("fruits", "Fruits & Grains") }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={"rounded-xl px-4 py-2 text-xs font-black transition-all " + (
                category === cat.id
                  ? (isDark ? "bg-emerald-600 text-white shadow-md" : "bg-slate-900 text-white shadow-md")
                  : (isDark ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200")
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end">
          <span className={"text-xs font-bold " + (isDark ? "text-slate-400" : "text-slate-500")}>{t("sortBy", "Sort by:")}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={"rounded-xl border px-3 py-1.5 text-xs font-bold outline-none " + (isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-800")}
          >
            <option value="Best Match">{t("bestMatch", "Best Match")}</option>
            <option value="Lowest Price">{t("lowestPrice", "Lowest Price")}</option>
            <option value="Highest Rating">{t("highestRating", "Highest Rating")}</option>
          </select>
        </div>
      </div>

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        {filteredListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} onView={onView} isDark={isDark} lang={lang} />
        ))}
      </div>
    </div>
  );
}

function ListingModal({ listing, onClose, onBidSuccess, isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const [quantity, setQuantity] = useState(100);
  const [bidPrice, setBidPrice] = useState(listing?.price || 35);
  const [buyerName, setBuyerName] = useState("Rajesh Kumar");
  const [buyerPhone, setBuyerPhone] = useState("9876543210");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bidError, setBidError] = useState("");

  if (!listing) return null;

  const total = Number(quantity || 0) * Number(bidPrice || 0);

  const handleQuantityChange = (amount) => {
    const nextValue = Math.max(10, Number(quantity) + amount);
    setQuantity(nextValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setBidError("");

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
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit bid");
      }

      setSubmitted(true);
      if (onBidSuccess) onBidSuccess();
    } catch (err) {
      setBidError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 35, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 280, damping: 25 }}
          onMouseDown={(event) => event.stopPropagation()}
          className={"max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] shadow-2xl sm:max-w-4xl sm:rounded-[28px] " + (isDark ? "bg-[#0B132B] text-slate-100 border border-slate-800" : "bg-[#F6F8FC] text-slate-900")}
        >
          <div className={"sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur sm:px-7 " + (isDark ? "bg-[#111C32]/95 border-slate-800" : "bg-white/95 border-slate-200")}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-2xl">
                {listing.image}
              </div>

              <div>
                <p className={"text-xs font-bold uppercase tracking-wide " + (isDark ? "text-slate-400" : "text-slate-500")}>
                  {t("modalTitle", "Direct Procurement Offer")}
                </p>
                <h2 className={"text-lg font-black " + (isDark ? "text-white" : "text-slate-900")}>
                  {listing.crop} - {listing.farmer}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className={"rounded-xl border p-2 transition-colors " + (isDark ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
              aria-label="Close listing"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {submitted ? (
            <div className="mx-auto max-w-xl px-5 py-12 text-center sm:px-10 sm:py-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-200">
                <Check className="h-10 w-10" />
              </div>

              <h3 className={"mt-6 text-2xl font-black " + (isDark ? "text-white" : "text-slate-900")}>
                {t("bidSuccess", "Bid Dispatched to Farmer! 🔔")}
              </h3>

              <div className={"mt-4 rounded-2xl border p-5 text-left text-sm " + (isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-emerald-200 bg-emerald-50/80 text-emerald-950")}>
                <p className="font-bold flex items-center gap-2">
                  <Send className="h-4 w-4 text-emerald-500" />
                  Live Telegram Notification Sent!
                </p>
                <p className="mt-2 text-xs leading-relaxed opacity-90">
                  Farmer <strong>{listing.farmer}</strong> has just received an interactive notification on Telegram (<strong>@FarlX_bot</strong>) with your offer of <strong>₹{bidPrice}/kg</strong> for <strong>{quantity} kg</strong> (Total: ₹{total.toLocaleString('en-IN')}).
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={onClose}
                  className={"rounded-xl px-6 py-3 text-sm font-black text-white " + (isDark ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-900 hover:bg-slate-800")}
                >
                  {t("closeBtn", "Close")}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12 lg:p-8">
              {/* Left Column: Crop and Farmer Details */}
              <div className="space-y-6 lg:col-span-7">
                <div className={"rounded-2xl border p-6 shadow-sm " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white")}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-500 dark:text-emerald-400">
                      {listing.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ID: #{listing.id}
                    </span>
                  </div>

                  <h3 className={"mt-4 text-2xl font-black " + (isDark ? "text-white" : "text-slate-900")}>
                    {listing.crop}
                  </h3>
                  <p className={"text-sm " + (isDark ? "text-slate-400" : "text-slate-500")}>
                    {listing.variety} • {listing.region}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className={"rounded-xl p-3 border " + (isDark ? "border-slate-800 bg-[#0B132B]" : "border-slate-100 bg-slate-50")}>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{t("farmer", "Farmer")}</span>
                      <p className={"mt-0.5 text-sm font-bold " + (isDark ? "text-white" : "text-slate-800")}>{listing.farmer}</p>
                    </div>
                    <div className={"rounded-xl p-3 border " + (isDark ? "border-slate-800 bg-[#0B132B]" : "border-slate-100 bg-slate-50")}>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{t("quantityAvailable", "Available")}</span>
                      <p className={"mt-0.5 text-sm font-bold " + (isDark ? "text-white" : "text-slate-800")}>{listing.quantity}</p>
                    </div>
                    <div className={"rounded-xl p-3 border " + (isDark ? "border-slate-800 bg-[#0B132B]" : "border-slate-100 bg-slate-50")}>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{t("mandiBenchmark", "Mandi Benchmark")}</span>
                      <p className={"mt-0.5 text-sm font-bold " + (isDark ? "text-slate-300" : "text-slate-700")}>₹{listing.mandi_price}/kg</p>
                    </div>
                    <div className={"rounded-xl p-3 border " + (isDark ? "border-slate-800 bg-[#0B132B]" : "border-slate-100 bg-slate-50")}>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{t("aiGrade", "AI Grade")}</span>
                      <p className="mt-0.5 text-sm font-bold text-emerald-500">{listing.quality || "Grade A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Bid Form */}
              <div className="lg:col-span-5">
                <form onSubmit={handleSubmit} className={"rounded-2xl border p-6 shadow-sm " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white")}>
                  <h4 className={"text-base font-black " + (isDark ? "text-white" : "text-slate-900")}>
                    {t("instantOffer", "Place Direct Bid")}
                  </h4>
                  <p className={"mt-1 text-xs " + (isDark ? "text-slate-400" : "text-slate-500")}>
                    {t("modalSubtitle", "Farmer will receive an instant alert on Telegram.")}
                  </p>

                  {bidError && (
                    <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
                      {bidError}
                    </div>
                  )}

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={"block text-xs font-bold " + (isDark ? "text-slate-300" : "text-slate-700")}>
                        {t("yourName", "Buyer Name")}
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className={"mt-1 w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none " + (isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900")}
                        required
                      />
                    </div>

                    <div>
                      <label className={"block text-xs font-bold " + (isDark ? "text-slate-300" : "text-slate-700")}>
                        {t("yourPhone", "Mobile Number")}
                      </label>
                      <input
                        type="text"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className={"mt-1 w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none " + (isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900")}
                        required
                      />
                    </div>

                    <div>
                      <label className={"block text-xs font-bold " + (isDark ? "text-slate-300" : "text-slate-700")}>
                        {t("offeredPrice", "Offered Price (₹/kg)")}
                      </label>
                      <input
                        type="number"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        className={"mt-1 w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none " + (isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900")}
                        required
                      />
                    </div>

                    <div>
                      <label className={"block text-xs font-bold " + (isDark ? "text-slate-300" : "text-slate-700")}>
                        {t("bidQuantity", "Procurement Quantity (kg)")}
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(-50)}
                          className={"flex h-8 w-8 items-center justify-center rounded-lg border " + (isDark ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-slate-50 text-slate-700")}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className={"w-full rounded-xl border px-3 py-2 text-center text-xs font-bold outline-none " + (isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900")}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(50)}
                          className={"flex h-8 w-8 items-center justify-center rounded-lg border " + (isDark ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-slate-50 text-slate-700")}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className={"rounded-xl p-3.5 border " + (isDark ? "border-slate-800 bg-[#0B132B]" : "border-slate-100 bg-slate-50")}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{t("totalAmount", "Total Value")}:</span>
                        <span className={"text-base font-black " + (isDark ? "text-emerald-400" : "text-slate-900")}>
                          ₹{total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={"w-full rounded-xl py-3 text-xs font-black text-white shadow-md transition-all " + (isDark ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-900 hover:bg-slate-800")}
                    >
                      {submitting ? t("submittingBid", "Sending alert to Telegram...") : t("submitBidBtn", "Submit Bid & Alert Farmer")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function OrdersEscrowPage({ transactions, onRefresh, onOpenListing, isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const [releasingId, setReleasingId] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const handleConfirmDelivery = async (txn) => {
    if (!confirm("Confirm delivery of " + txn.crop + "? Payment will release immediately to farmer UPI " + txn.farmer_upi)) return;
    setReleasingId(txn.id);

    try {
      const res = await fetch(`${API_BASE}/api/transactions/${txn.id}/release`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to release payment");

      setSelectedSettlement({
        id: txn.id,
        farmerName: txn.farmer_name,
        farmerUpi: txn.farmer_upi,
        amount: txn.total_amount,
        txnRef: data.transaction?.escrow_hash || "UTR-" + Math.floor(1000000000 + Math.random() * 9000000000)
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error releasing escrow: " + err.message);
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className={"relative overflow-hidden rounded-[28px] p-7 text-white shadow-2xl sm:p-9 " + (isDark ? "bg-gradient-to-br from-slate-950 via-[#0B2538] to-[#0A3D38] border border-slate-800" : "bg-gradient-to-br from-slate-950 via-[#0B3C4D] to-[#0A5B54] shadow-slate-300/60")}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("escrowTitle", "Orders & Smart Escrow Vault")}
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
          {t("escrowTitle", "Orders & Smart Escrow Vault")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          {t("escrowSubtitle", "Payments are securely locked in FARLX Escrow. When the buyer confirms delivery, funds release instantly to the farmer's UPI.")}
        </p>
      </div>

      <div>
        {transactions.length === 0 ? (
          <div className={"rounded-2xl border border-dashed p-12 text-center " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-300 bg-white")}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-500/10 text-3xl">
              📦
            </div>
            <h3 className={"mt-4 text-base font-black " + (isDark ? "text-white" : "text-slate-800")}>
              {t("noOrders", "No Orders in Escrow Yet")}
            </h3>
            <p className={"mt-1 text-xs max-w-md mx-auto " + (isDark ? "text-slate-400" : "text-slate-500")}>
              {t("noOrdersDesc", "Place a bid on any live crop in the Marketplace. Once the farmer taps [Accept Bid] in Telegram, the order will appear here in Escrow!")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {transactions.map((txn) => {
              const isEscrow = txn.status === "payment_escrowed";
              const isReleased = txn.status === "payment_released";

              return (
                <div
                  key={txn.id}
                  className={"overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white")}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className={"rounded-md px-2 py-0.5 text-xs font-black " + (isDark ? "bg-slate-800 text-cyan-300" : "bg-slate-900 text-white")}>
                          #TXN-{txn.id}
                        </span>
                        <h3 className={"text-lg font-black " + (isDark ? "text-white" : "text-slate-900")}>
                          {txn.crop || "Fresh Produce"} - {txn.quantity ? `${txn.quantity} kg` : "Standard batch"}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                            isReleased
                              ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-500 dark:text-amber-400 animate-pulse"
                          }`}
                        >
                          {isReleased ? t("statusReleased", "🟢 Payment Released (Completed)") : t("statusEscrowed", "🟡 In Escrow (Dispatched)")}
                        </span>
                      </div>

                      <div className={"mt-3 flex flex-wrap gap-4 text-xs font-medium " + (isDark ? "text-slate-400" : "text-slate-600")}>
                        <span>👨‍🌾 {t("farmer", "Farmer")}: <strong className={isDark ? "text-slate-200" : "text-slate-800"}>{txn.farmer_name || "Ramesh"}</strong></span>
                        <span>💳 {t("farmerUpi", "Farmer UPI")}: <strong className="font-mono text-cyan-400">{txn.farmer_upi || "farmer@upi"}</strong></span>
                        <span>👤 {t("buyer", "Buyer")}: <strong className={isDark ? "text-slate-200" : "text-slate-800"}>{txn.buyer_name || "Rajesh Kumar"}</strong></span>
                        <span>📅 Date: <strong className={isDark ? "text-slate-200" : "text-slate-800"}>{new Date(txn.created_at).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400">{t("orderAmount", "Order Amount")}</span>
                        <div className={"text-2xl font-black " + (isDark ? "text-white" : "text-slate-900")}>
                          ₹{Number(txn.total_amount || 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      {isEscrow ? (
                        <button
                          onClick={() => handleConfirmDelivery(txn)}
                          disabled={releasingId === txn.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:opacity-95 disabled:opacity-50"
                        >
                          {releasingId === txn.id ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              {t("releasingPayment", "Releasing to Farmer UPI...")}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              {t("confirmDeliveryBtn", "Confirm Product Received & Pay Farmer")}
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
                          className={"inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold " + (isDark ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20" : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100")}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          {t("viewUpiQrBtn", "View UPI Settlement & QR")}
                        </button>
                      )}
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
          isDark={isDark}
          lang={lang}
        />
      )}
    </div>
  );
}

function UpiSettlementModal({ settlement, onClose, isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  if (!settlement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className={"w-full max-w-md rounded-2xl border p-6 shadow-2xl " + (isDark ? "bg-[#111C32] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900")}>
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <h3 className="text-lg font-black">{t("upiModalTitle", "Direct UPI Payout Release")}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className={"text-xs " + (isDark ? "text-slate-400" : "text-slate-500")}>
            {t("upiModalDesc", "Produce delivered and inspected. Payment has been released directly from Escrow to the farmer's bank account.")}
          </p>

          <div className="mt-5 flex justify-center">
            <div className="rounded-2xl border border-dashed border-emerald-500/50 bg-emerald-500/5 p-4">
              <QrCode className="h-36 w-36 text-emerald-500 mx-auto" />
              <p className="mt-2 font-mono text-xs font-bold text-emerald-500">{settlement.farmerUpi}</p>
            </div>
          </div>

          <div className={"mt-4 rounded-xl p-3 text-xs " + (isDark ? "bg-slate-900" : "bg-slate-50")}>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Order Ref:</span>
              <span className="font-bold">#TXN-{settlement.id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Farmer:</span>
              <span className="font-bold">{settlement.farmerName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Released Amount:</span>
              <span className="font-black text-emerald-500">₹{Number(settlement.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-500"
          >
            {t("closeBtn", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AiInspectorPage({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const [selectedCrop, setSelectedCrop] = useState("Fresh Tomato");
  const [analyzing, setAnalyzing] = useState(false);
  const [gradeResult, setGradeResult] = useState({
    crop: "Fresh Tomato",
    grade: "Grade A+ (Export Ready)",
    freshness: 94,
    defects: "0.8% (Minor blemish)",
    shelfLife: "8-10 Days",
    certHash: "0x89f2a410b3e6c79a",
    mandiPrice: 28,
    farlxPrice: 34,
    extraFarmerGain: "+21%"
  });

  const sampleCrops = [
    { name: "Fresh Tomato", emoji: "🍅", mandi: 28, farlx: 34, grade: "Grade A+ (Export Ready)", freshness: 94 },
    { name: "Red Onion", emoji: "🧅", mandi: 22, farlx: 28, grade: "Grade A (Prime Market)", freshness: 91 },
    { name: "Paddy Basmati", emoji: "🌾", mandi: 40, farlx: 48, grade: "Grade A+ (Certified)", freshness: 97 },
    { name: "Seed Potato", emoji: "🥔", mandi: 18, farlx: 22, grade: "Grade A (Firm Skin)", freshness: 89 }
  ];

  const handleSelectSample = (crop) => {
    setSelectedCrop(crop.name);
    setAnalyzing(true);
    setTimeout(() => {
      setGradeResult({
        crop: crop.name,
        grade: crop.grade,
        freshness: crop.freshness,
        defects: (100 - crop.freshness) * 0.15 + "% (Acceptable)",
        shelfLife: "7-12 Days",
        certHash: "0x" + Math.random().toString(16).substring(2, 14),
        mandiPrice: crop.mandi,
        farlxPrice: crop.farlx,
        extraFarmerGain: "+" + Math.round(((crop.farlx - crop.mandi) / crop.mandi) * 100) + "%"
      });
      setAnalyzing(false);
    }, 450);
  };

  return (
    <div className="space-y-8">
      <div className={"relative overflow-hidden rounded-[28px] p-7 text-white shadow-xl sm:p-9 " + (isDark ? "bg-gradient-to-br from-slate-950 via-[#0B2538] to-[#0A3D38] border border-slate-800" : "bg-gradient-to-br from-slate-950 via-[#071A2B] to-[#0A4B54]")}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
          <Bot className="h-4 w-4 text-emerald-300" />
          {t("aiPageTitle", "AI Crop Inspector & Quality Grading")}
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
          {t("aiPageTitle", "Instant Quality Grading & Mandi Price Benchmarks")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          {t("aiPageSubtitle", "Farmers send produce photos via Telegram (@FarlX_bot). Our computer vision model inspects color uniformity, surface blemishes, and freshness to certify batches for smart escrow trading.")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={"rounded-2xl border p-6 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <h3 className={"text-base font-black " + (isDark ? "text-white" : "text-slate-900")}>
            {t("samplePhotos", "Select Produce to Inspect")}
          </h3>
          <p className={"mt-1 text-xs " + (isDark ? "text-slate-400" : "text-slate-500")}>
            Choose a crop batch or test with sample produce:
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {sampleCrops.map((c) => (
              <button
                key={c.name}
                onClick={() => handleSelectSample(c)}
                className={"flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all " + (selectedCrop === c.name ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-2 ring-emerald-500/20" : (isDark ? "border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"))}
              >
                <span className="text-3xl">{c.emoji}</span>
                <span className="mt-2 text-xs font-bold">{c.name}</span>
                <span className="text-[10px] text-slate-400">APMC: ₹{c.mandi}/kg</span>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200/60 pt-4 dark:border-slate-800">
            <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/10 p-6 text-center cursor-pointer hover:bg-emerald-500/20 transition-all">
              <Camera className="h-7 w-7 text-emerald-500" />
              <span className="mt-2 text-xs font-bold text-emerald-400">{t("uploadPhotoPrompt", "Upload Produce Image")}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG up to 10MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                if (e.target.files?.[0]) handleSelectSample({ name: "Uploaded Batch", emoji: "🌿", mandi: 25, farlx: 32, grade: "Grade A+", freshness: 96 });
              }} />
            </label>
          </div>
        </div>

        <div className={"lg:col-span-2 rounded-2xl border p-6 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-slate-800">
            <div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-400">
                {t("qualityAnalysisResult", "AI Certified Quality Certificate")}
              </span>
              <h2 className={"mt-2 text-xl font-black " + (isDark ? "text-white" : "text-slate-900")}>
                {gradeResult.crop} Quality Diagnostic
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400">{t("certificateHash", "Certificate Hash")}</span>
              <p className="font-mono text-xs font-bold text-cyan-400">{gradeResult.certHash}</p>
            </div>
          </div>

          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="mt-3 text-sm font-bold text-slate-400">{t("analyzingImage", "Running Computer Vision Neural Analysis...")}</p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={"rounded-xl p-4 border " + (isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50")}>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t("overallGrade", "Overall Grade")}</span>
                  <p className="mt-1 text-base font-black text-emerald-400">{gradeResult.grade}</p>
                </div>
                <div className={"rounded-xl p-4 border " + (isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50")}>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t("freshnessScore", "Freshness Index")}</span>
                  <p className="mt-1 text-base font-black text-cyan-400">{gradeResult.freshness}% Score</p>
                </div>
                <div className={"rounded-xl p-4 border " + (isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50")}>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t("defectRate", "Surface Defects")}</span>
                  <p className="mt-1 text-base font-black text-amber-400">{gradeResult.defects}</p>
                </div>
                <div className={"rounded-xl p-4 border " + (isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50")}>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t("estimatedShelfLife", "Expected Shelf Life")}</span>
                  <p className="mt-1 text-base font-black text-violet-400">{gradeResult.shelfLife}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-emerald-400">
                      {t("mandiBenchmark", "APMC Mandi Rate")} vs {t("farlxRate", "FARLX Direct Farm Rate")}
                    </h4>
                    <p className={"text-xs mt-1 " + (isDark ? "text-slate-300" : "text-slate-600")}>
                      Traditional APMC intermediary commissions are eliminated, guaranteeing higher farmer revenue and lower procurement costs.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-400">APMC Mandi</span>
                      <p className={"text-base font-black " + (isDark ? "text-slate-300" : "text-slate-600")}>₹{gradeResult.mandiPrice}/kg</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-emerald-400">FARLX Direct</span>
                      <p className="text-lg font-black text-emerald-400">₹{gradeResult.farlxPrice}/kg</p>
                    </div>
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                      {gradeResult.extraFarmerGain} Farmer Gain
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LogisticsPage({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const pools = [
    {
      id: "POOL-101",
      route: "Nashik ➔ Vashi Mumbai APMC",
      truck: "Tata Ace 2 Ton",
      capacity: 82,
      farmers: 4,
      departure: "Today, 7:00 PM",
      costPerKg: "₹1.40/kg",
      savings: "₹1,400 per farmer",
      co2Saved: "28 kg CO₂"
    },
    {
      id: "POOL-102",
      route: "Pune ➔ Bangalore Yeshwanthpur",
      truck: "Eicher Pro 5 Ton",
      capacity: 94,
      farmers: 6,
      departure: "Tomorrow, 5:00 AM",
      costPerKg: "₹2.10/kg",
      savings: "₹3,200 per farmer",
      co2Saved: "64 kg CO₂"
    },
    {
      id: "POOL-103",
      route: "Indore ➔ Delhi Azadpur Mandi",
      truck: "Ashok Leyland 10 Ton",
      capacity: 68,
      farmers: 3,
      departure: "Tomorrow, 8:00 PM",
      costPerKg: "₹2.80/kg",
      savings: "₹4,600 per farmer",
      co2Saved: "92 kg CO₂"
    }
  ];

  return (
    <div className="space-y-8">
      <div className={"relative overflow-hidden rounded-[28px] p-7 text-white shadow-xl sm:p-9 " + (isDark ? "bg-gradient-to-br from-slate-950 via-[#0B2538] to-[#0A3D38] border border-slate-800" : "bg-gradient-to-br from-slate-950 via-[#071A2B] to-[#0A4B54]")}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
          <Truck className="h-4 w-4 text-emerald-300" />
          {t("logisticsTitle", "KISAN LOGISTICS POOLING AGGREGATOR")}
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
          {t("logisticsTitle", "Shared Farm Freight Pooling & Carbon Reduction")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          {t("logisticsSubtitle", "Smallholder farmers combine smaller crop batches into shared regional commercial transport, cutting shipping costs by up to 45% and reducing transit time to wholesale buyer facilities.")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {pools.map((p) => (
          <div
            key={p.id}
            className={"flex flex-col justify-between rounded-2xl border p-6 transition-all hover:shadow-xl " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400">
                  {p.id}
                </span>
                <span className="text-xs font-bold text-emerald-400">{p.co2Saved}</span>
              </div>
              <h3 className={"mt-3 text-base font-black " + (isDark ? "text-white" : "text-slate-900")}>
                {p.route}
              </h3>
              <p className={"text-xs mt-1 " + (isDark ? "text-slate-400" : "text-slate-500")}>{p.truck} • Departs {p.departure}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>{t("truckCapacity", "Capacity Filled")}</span>
                  <span>{p.capacity}%</span>
                </div>
                <div className={"mt-1 h-2 w-full rounded-full overflow-hidden " + (isDark ? "bg-slate-800" : "bg-slate-200")}>
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: p.capacity + "%" }} />
                </div>
              </div>

              <div className={"mt-4 space-y-1.5 border-t pt-3 text-xs " + (isDark ? "border-slate-800" : "border-slate-100")}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Freight Rate:</span>
                  <span className={"font-bold " + (isDark ? "text-slate-200" : "text-slate-800")}>{p.costPerKg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t("savingsPerFarmer", "Avg Savings")}:</span>
                  <span className="font-bold text-emerald-400">{p.savings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t("activePools", "Pooled Farmers")}:</span>
                  <span className={"font-bold " + (isDark ? "text-slate-200" : "text-slate-800")}>{p.farmers} active</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("✅ Joined " + p.id + "! Dispatch driver will call for farm gate pickup.")}
              className={"mt-5 w-full rounded-xl py-2.5 text-xs font-black text-white hover:opacity-90 transition-opacity " + (isDark ? "bg-emerald-600" : "bg-slate-900")}
            >
              {t("joinPoolBtn", "Join Transport Pool")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeatherPage({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const forecasts = [
    { day: "Today", temp: "29°C / 21°C", cond: "Partly Cloudy", rain: "10%", spray: "Optimal (Morning)" },
    { day: "Tomorrow", temp: "31°C / 22°C", cond: "Sunny", rain: "5%", spray: "Optimal (All Day)" },
    { day: "Thursday", temp: "27°C / 20°C", cond: "Light Showers", rain: "65%", spray: "Not Recommended" },
    { day: "Friday", temp: "28°C / 21°C", cond: "Overcast", rain: "25%", spray: "Optimal (Afternoon)" },
    { day: "Saturday", temp: "30°C / 22°C", cond: "Clear Sky", rain: "10%", spray: "Optimal" }
  ];

  return (
    <div className="space-y-8">
      <div className={"relative overflow-hidden rounded-[28px] p-7 text-white shadow-xl sm:p-9 " + (isDark ? "bg-gradient-to-br from-slate-950 via-[#0B2538] to-[#0A3D38] border border-slate-800" : "bg-gradient-to-br from-slate-950 via-[#071A2B] to-[#0A4B54]")}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
          <CloudSun className="h-4 w-4 text-amber-300" />
          {t("navWeather", "AGRO-CLIMATIC WEATHER & SPRAYING ADVISORY")}
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
          Regional Weather Intelligence & Crop Protection
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          Hyper-local agricultural micro-climate monitoring. Provides farmers and wholesale buyers with humidity alerts, rainfall forecasting, and pesticide spraying time windows.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className={"rounded-2xl border p-5 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <span className="text-xs font-bold text-slate-400">Current Temperature</span>
          <p className={"mt-2 text-3xl font-black " + (isDark ? "text-white" : "text-slate-900")}>29°C</p>
          <p className="text-xs text-emerald-400 mt-1">Optimal harvest climate</p>
        </div>
        <div className={"rounded-2xl border p-5 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <span className="text-xs font-bold text-slate-400">Relative Humidity</span>
          <p className={"mt-2 text-3xl font-black " + (isDark ? "text-white" : "text-slate-900")}>68%</p>
          <p className="text-xs text-cyan-400 mt-1">Normal transpiration rate</p>
        </div>
        <div className={"rounded-2xl border p-5 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <span className="text-xs font-bold text-slate-400">Rain Probability</span>
          <p className={"mt-2 text-3xl font-black " + (isDark ? "text-white" : "text-slate-900")}>15%</p>
          <p className="text-xs text-slate-400 mt-1">Low risk for drying crops</p>
        </div>
        <div className={"rounded-2xl border p-5 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <span className="text-xs font-bold text-slate-400">Wind Velocity</span>
          <p className={"mt-2 text-3xl font-black " + (isDark ? "text-white" : "text-slate-900")}>12 km/h</p>
          <p className="text-xs text-emerald-400 mt-1">Safe for aerial spraying</p>
        </div>
      </div>

      <div className={"rounded-2xl border p-6 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
        <h3 className={"text-base font-black " + (isDark ? "text-white" : "text-slate-900")}>5-Day Agricultural Weather Advisory</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
          {forecasts.map((f) => (
            <div key={f.day} className={"rounded-xl p-4 border text-center " + (isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50")}>
              <p className="text-xs font-bold text-slate-400">{f.day}</p>
              <p className={"mt-1 text-sm font-black " + (isDark ? "text-white" : "text-slate-900")}>{f.temp}</p>
              <p className="text-xs font-medium text-cyan-400 mt-0.5">{f.cond}</p>
              <div className="mt-3 border-t border-slate-200/60 dark:border-slate-700 pt-2 text-[10px]">
                <span className="text-slate-400">Spray Window:</span>
                <p className="font-bold text-emerald-400">{f.spray}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyFarmPage({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const farmLots = [
    { crop: "Tomato", batch: "BATCH-89", qty: "4,800 kg", value: "₹1,34,400", status: "Active in Market", emoji: "🍅" },
    { crop: "Onion", batch: "BATCH-90", qty: "9,600 kg", value: "₹2,68,800", status: "Bid Received", emoji: "🧅" },
    { crop: "Potato", batch: "BATCH-91", qty: "12,500 kg", value: "₹2,25,000", status: "Ready for Dispatch", emoji: "🥔" }
  ];

  return (
    <div className="space-y-8">
      <div className={"relative overflow-hidden rounded-[28px] p-7 text-white shadow-xl sm:p-9 " + (isDark ? "bg-gradient-to-br from-slate-950 via-[#0B2538] to-[#0A3D38] border border-slate-800" : "bg-gradient-to-br from-slate-950 via-[#071A2B] to-[#0A4B54]")}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
          <Sprout className="h-4 w-4 text-emerald-300" />
          {t("navMyFarm", "FARMER HARVEST PORTFOLIO & TELEGRAM GATEWAY")}
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
          My Farm Operations & Harvest Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          Track your live crop inventory, harvest dates, escrow payouts, and buyer offers submitted via Telegram bot (@FarlX_bot).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={"rounded-2xl border p-5 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <span className="text-xs font-bold text-slate-400">Total Cultivated Acreage</span>
          <p className={"mt-2 text-2xl font-black " + (isDark ? "text-white" : "text-slate-900")}>8.5 Acres</p>
          <p className="text-xs text-emerald-400 mt-1">Verified land title</p>
        </div>
        <div className={"rounded-2xl border p-5 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <span className="text-xs font-bold text-slate-400">Total Settled Earnings</span>
          <p className={"mt-2 text-2xl font-black " + (isDark ? "text-white" : "text-slate-900")}>₹6,28,200</p>
          <p className="text-xs text-cyan-400 mt-1">100% direct UPI settlement</p>
        </div>
        <div className={"rounded-2xl border p-5 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <span className="text-xs font-bold text-slate-400">Active Telegram Batches</span>
          <p className={"mt-2 text-2xl font-black " + (isDark ? "text-white" : "text-slate-900")}>3 Batches</p>
          <p className="text-xs text-amber-400 mt-1">Receiving buyer bids live</p>
        </div>
      </div>

      <div className={"rounded-2xl border p-6 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={"text-base font-black " + (isDark ? "text-white" : "text-slate-900")}>Live Produce Inventory</h3>
          <a
            href="https://t.me/FarlX_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-500"
          >
            <Send className="h-3.5 w-3.5" />
            {t("listCropTelegram", "Add Crop in Telegram")}
          </a>
        </div>

        <div className="space-y-3">
          {farmLots.map((lot) => (
            <div key={lot.batch} className={"flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border " + (isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50")}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lot.emoji}</span>
                <div>
                  <h4 className={"text-sm font-black " + (isDark ? "text-white" : "text-slate-900")}>{lot.crop} - {lot.batch}</h4>
                  <p className="text-xs text-slate-400">{lot.qty} • Value: {lot.value}</p>
                </div>
              </div>
              <span className="mt-2 sm:mt-0 self-start sm:self-auto rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                {lot.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityPage({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  const posts = [
    { author: "Ramesh Pawar (Nashik)", topic: "Tomato Pricing Movement", content: "Nashik APMC arrivals down 20% today. Direct buyer bids on FARLX are averaging ₹28/kg compared to ₹22 in mandi.", time: "2 hours ago" },
    { author: "Sardar Baljit (Ludhiana)", topic: "Wheat Harvest Storage", content: "Moisture levels staying at 11%. Good time to store or sell direct to millers via Smart Escrow.", time: "4 hours ago" },
    { author: "Venkatesh Rao (Hubballi)", topic: "Logistics Pool to Bangalore", content: "We have 3 tonnes space left on the Eicher truck departing tomorrow. Contact to share fuel costs.", time: "6 hours ago" }
  ];

  return (
    <div className="space-y-8">
      <div className={"relative overflow-hidden rounded-[28px] p-7 text-white shadow-xl sm:p-9 " + (isDark ? "bg-gradient-to-br from-slate-950 via-[#0B2538] to-[#0A3D38] border border-slate-800" : "bg-gradient-to-br from-slate-950 via-[#071A2B] to-[#0A4B54]")}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
          <Users className="h-4 w-4 text-cyan-300" />
          {t("navCommunity", "FARMER PEER NETWORK & APMC MANDI INTEL")}
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
          National Agritech Farmer Community
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          Exchange live market rates, shared shipping requests, and agronomist tips with verified farmers across India.
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((p, idx) => (
          <div key={idx} className={"rounded-2xl border p-5 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
            <div className="flex items-center justify-between">
              <span className={"text-xs font-black " + (isDark ? "text-emerald-400" : "text-emerald-700")}>{p.author}</span>
              <span className="text-xs text-slate-400">{p.time}</span>
            </div>
            <h3 className={"mt-2 text-base font-black " + (isDark ? "text-white" : "text-slate-900")}>{p.topic}</h3>
            <p className={"mt-1 text-sm leading-relaxed " + (isDark ? "text-slate-300" : "text-slate-500")}>{p.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPage({ isDark = false, lang = "en" }) {
  const t = (k, def) => (translations[lang] && translations[lang][k]) || (translations.en && translations.en[k]) || def;
  return (
    <div className="space-y-8">
      <div className={"relative overflow-hidden rounded-[28px] p-7 text-white shadow-xl sm:p-9 " + (isDark ? "bg-gradient-to-br from-slate-950 via-[#0B2538] to-[#0A3D38] border border-slate-800" : "bg-gradient-to-br from-slate-950 via-[#071A2B] to-[#0A4B54]")}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
          <BarChart3 className="h-4 w-4 text-amber-300" />
          {t("navReports", "OFFICIAL MARKET REPORTS & AUDITED SETTLEMENTS")}
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
          Procurement Statements & Escrow Tax Invoices
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          Download verifiable PDF & Excel audit trails for agricultural procurement, tax exemption documentation, and bank reconciliation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className={"rounded-2xl border p-6 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <FileText className="h-8 w-8 text-cyan-500" />
          <h3 className={"mt-3 text-lg font-black " + (isDark ? "text-white" : "text-slate-900")}>Monthly Escrow Audit Report</h3>
          <p className={"mt-1 text-xs " + (isDark ? "text-slate-400" : "text-slate-500")}>Complete breakdown of locked escrow funds, release timestamps, and farmer UPI transaction UTRs.</p>
          <button
            onClick={() => alert("📥 Downloaded Monthly_Escrow_Statement_FARLX.pdf")}
            className={"mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-white hover:opacity-90 " + (isDark ? "bg-emerald-600" : "bg-slate-900")}
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </button>
        </div>

        <div className={"rounded-2xl border p-6 " + (isDark ? "border-slate-800 bg-[#111C32]" : "border-slate-200 bg-white shadow-sm")}>
          <ChartNoAxesCombined className="h-8 w-8 text-emerald-500" />
          <h3 className={"mt-3 text-lg font-black " + (isDark ? "text-white" : "text-slate-900")}>National APMC Mandi Price Index</h3>
          <p className={"mt-1 text-xs " + (isDark ? "text-slate-400" : "text-slate-500")}>Benchmark comparison report across Maharashtra, Punjab, Madhya Pradesh, and Karnataka APMCs.</p>
          <button
            onClick={() => alert("📥 Downloaded APMC_Mandi_Price_Index_FARLX.xlsx")}
            className={"mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-white hover:opacity-90 " + (isDark ? "bg-emerald-600" : "bg-slate-900")}
          >
            <Download className="h-4 w-4" />
            Download Excel Index
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("farlx_theme") === "dark";
    } catch {
      return false;
    }
  });

  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("farlx_lang") || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("farlx_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("farlx_theme", "light");
      }
    } catch (e) {}
  }, [isDark]);

  const handleToggleDark = () => setIsDark((prev) => !prev);
  const handleSetLang = (code) => {
    setLang(code);
    try {
      localStorage.setItem("farlx_lang", code);
    } catch (e) {}
  };

  const [liveListings, setLiveListings] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch all live data from backend
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
      console.warn("Live fetch error:", err.message);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const timer = setInterval(fetchLiveData, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.pathname === "/market") {
      setActiveNav("Market");
    } else if (location.pathname === "/" && activeNav === "Market") {
      setActiveNav("Home");
    }
  }, [location.pathname]);

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
      alert("✅ Demo Farmer, Crop Listing & Bid created! Check the Market and Buy & Sell tabs.");
    } catch (e) {
      console.error(e);
    }
  };

  const openListing = (listing) => setSelectedListing(listing);

  const goToMarket = () => {
    setActiveNav("Market");
    navigate("/market");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openOrders = () => {
    setActiveNav("Buy & Sell");
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentListings = liveListings.length > 0 ? liveListings : listings;

  const renderHome = () => {
    return (
      <div className="space-y-10">
        <Hero onExplore={goToMarket} lang={lang} isDark={isDark} />
        <StatsGrid liveStats={liveStats} isDark={isDark} lang={lang} />
        <FeaturedListings
          currentListings={currentListings}
          onView={openListing}
          onExplore={goToMarket}
          isDark={isDark}
          lang={lang}
        />
        <Insights isDark={isDark} lang={lang} />
        <BuyerPulse onOpenListing={openListing} isDark={isDark} lang={lang} />
        <LivePrices isDark={isDark} lang={lang} />
      </div>
    );
  };

  const renderPage = () => {
    if (activeNav === "Home") return renderHome();
    if (activeNav === "Market") return <MarketPage currentListings={currentListings} searchQuery={searchQuery} onView={openListing} isDark={isDark} lang={lang} />;
    if (activeNav === "Buy & Sell") return <OrdersEscrowPage transactions={transactions} onRefresh={fetchLiveData} onOpenListing={openListing} isDark={isDark} lang={lang} />;
    if (activeNav === "AI Assistant") return <AiInspectorPage isDark={isDark} lang={lang} />;
    if (activeNav === "Logistics") return <LogisticsPage isDark={isDark} lang={lang} />;
    if (activeNav === "Weather") return <WeatherPage isDark={isDark} lang={lang} />;
    if (activeNav === "My Farm") return <MyFarmPage isDark={isDark} lang={lang} />;
    if (activeNav === "Community") return <CommunityPage isDark={isDark} lang={lang} />;
    if (activeNav === "Reports") return <ReportsPage isDark={isDark} lang={lang} />;
    return <MarketPage currentListings={currentListings} searchQuery={searchQuery} onView={openListing} isDark={isDark} lang={lang} />;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className={"min-h-screen lg:flex transition-colors duration-200 " + (isDark ? "bg-[#080D1A] text-slate-100" : "bg-[#F4F7FB] text-slate-900")}>
            <Sidebar
              active={activeNav}
              setActive={setActiveNav}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              lang={lang}
            />

            <div className="min-w-0 flex-1">
              <TopBar
                onMenu={() => setMobileOpen(true)}
                onSearch={setSearchQuery}
                notifications={notifications}
                unreadCount={unreadNotifs}
                onClearNotifications={handleClearNotifications}
                onOpenOrders={openOrders}
                onSeedDemo={handleSeedDemo}
                isDark={isDark}
                onToggleDark={handleToggleDark}
                lang={lang}
                onSetLang={handleSetLang}
              />

              <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10 xl:py-10">
                <div className="mx-auto w-full max-w-[1720px]">
                  {renderPage()}
                </div>
              </main>
            </div>

            <AnimatePresence>
              {selectedListing && (
                <ListingModal
                  listing={selectedListing}
                  onClose={() => setSelectedListing(null)}
                  onBidSuccess={() => {
                    fetchLiveData();
                  }}
                  isDark={isDark}
                  lang={lang}
                />
              )}
            </AnimatePresence>
          </div>
        }
      />

      <Route
        path="/market"
        element={
          <div className={"min-h-screen lg:flex transition-colors duration-200 " + (isDark ? "bg-[#080D1A] text-slate-100" : "bg-[#F4F7FB] text-slate-900")}>
            <Sidebar
              active={activeNav}
              setActive={setActiveNav}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              lang={lang}
            />
            <div className="min-w-0 flex-1">
              <TopBar
                onMenu={() => setMobileOpen(true)}
                onSearch={setSearchQuery}
                notifications={notifications}
                unreadCount={unreadNotifs}
                onClearNotifications={handleClearNotifications}
                onOpenOrders={openOrders}
                onSeedDemo={handleSeedDemo}
                isDark={isDark}
                onToggleDark={handleToggleDark}
                lang={lang}
                onSetLang={handleSetLang}
              />
              <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10 xl:py-10">
                <div className="mx-auto w-full max-w-[1720px]">
                  <MarketPage
                    currentListings={currentListings}
                    searchQuery={searchQuery}
                    onView={openListing}
                    isDark={isDark}
                    lang={lang}
                  />
                </div>
              </main>
            </div>

            <AnimatePresence>
              {selectedListing && (
                <ListingModal
                  listing={selectedListing}
                  onClose={() => setSelectedListing(null)}
                  onBidSuccess={() => {
                    fetchLiveData();
                  }}
                  isDark={isDark}
                  lang={lang}
                />
              )}
            </AnimatePresence>
          </div>
        }
      />

      <Route path="/live-data" element={<LiveData />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
