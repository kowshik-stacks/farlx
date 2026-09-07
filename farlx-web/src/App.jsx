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
  ListFilter
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

// ----------------- DATA (same as your original) -----------------

const navItems = [
  { label: "Home", icon: Home },
  { label: "My Farm", icon: Sprout },
  { label: "Market", icon: TrendingUp },
  { label: "Buy & Sell", icon: ShoppingBag },
  { label: "Weather", icon: CloudSun },
  { label: "AI Assistant", icon: Bot, badge: "NEW" },
  { label: "Community", icon: Users },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings }
];

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

function Sidebar({ active, setActive, mobileOpen, setMobileOpen }) {
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
            {navItems.map((item) => {
              const isActive = active === item.label;
              const Icon = item.icon;

              return (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={item.label}
                  onClick={() => {
                    if (item.label === "Home") {
                      setActive("Home");
                      navigate("/");
                    } else if (item.label === "Market") {
                      setActive("Market");
                      navigate("/market");
                    } else {
                      setActive(item.label);
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

                  <span className="flex-1 text-left font-semibold">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-950">
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
  user = { name: "Rajesh Kumar", role: "Premium Buyer" }
}) {
  return (
    <header className="sticky top-0 z-30 min-h-[74px] border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="flex min-h-[74px] w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-all hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 flex-1 md:block">
          <label className="flex h-11 w-full max-w-[430px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition-all duration-200 focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="text"
              placeholder="Search crops, farmers, regions..."
              onChange={(event) => onSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />

            <span className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 lg:block">
              ⌘ K
            </span>
          </label>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 lg:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">
              Market live
            </span>
          </div>

          <button
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold text-slate-900">
                {user.name}
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-500">
                {user.role}
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-xs font-black text-white shadow-md shadow-blue-200">
              RK
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3 md:hidden">
        <label className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Search crops, farmers, regions..."
            onChange={(event) => onSearch(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>
    </header>
  );
}

// ----------------- SECTION HEADING -----------------

function SectionHeading({ title, description, action, icon: Icon }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-200">
              <Icon className="h-4.5 w-4.5" />
            </span>
          )}

          <h2 className="text-xl font-black tracking-tight text-slate-900">
            {title}
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ----------------- HERO -----------------

function Hero({ onExplore }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[30px] bg-[#071A2B] shadow-2xl shadow-slate-300/70"
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
              LIVE BUYER INTELLIGENCE
            </div>

            <p className="mt-6 text-sm font-bold text-emerald-200">
              Good evening, Rajesh
            </p>

            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-[40px] sm:leading-[1.1]">
              The smarter way to
              <span className="block bg-gradient-to-r from-emerald-300 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                source your supply.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
              42 verified farmer listings match your buying preferences today.
              Compare quality, pricing, delivery readiness, and supplier trust
              in one place.
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
              Explore marketplace
              <ArrowUpRight className="h-4 w-4 text-teal-700" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <Send className="h-4 w-4 text-amber-300" />
              Post buying requirement
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
                  Best opportunity today
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  42 matching listings
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
              76% average match with your recent buying behaviour
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
          >
            <IndianRupee className="h-5 w-5 text-emerald-300" />
            <p className="mt-3 text-xl font-black text-white">₹18.4K</p>
            <p className="mt-1 text-xs text-slate-200">Potential savings</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
          >
            <Award className="h-5 w-5 text-cyan-300" />
            <p className="mt-3 text-xl font-black text-white">96%</p>
            <p className="mt-1 text-xs text-slate-200">
              Verified suppliers
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// ----------------- STATS GRID -----------------

function StatsGrid() {
  const stats = [
    {
      label: "Total Spend",
      value: "₹2,45,000",
      change: "+12.5%",
      icon: DollarSign,
      iconStyle: "bg-blue-100 text-blue-700",
      badgeStyle: "bg-blue-50 text-blue-700",
      accent: "from-blue-500 to-cyan-400",
      bottom: "Compared with last month",
      bars: [35, 48, 42, 65, 56, 82]
    },
    {
      label: "Active Orders",
      value: "24",
      change: "+3",
      icon: Package,
      iconStyle: "bg-violet-100 text-violet-700",
      badgeStyle: "bg-violet-50 text-violet-700",
      accent: "from-violet-500 to-fuchsia-400",
      bottom: "7 dispatching today",
      bars: [20, 42, 35, 68, 56, 74]
    },
    {
      label: "Farmers Connected",
      value: "156",
      change: "+18",
      icon: Users,
      iconStyle: "bg-emerald-100 text-emerald-700",
      badgeStyle: "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-500 to-teal-400",
      bottom: "Trusted supply network",
      bars: [32, 45, 51, 47, 68, 86]
    },
    {
      label: "On-time Delivery",
      value: "98.2%",
      change: "+2.1%",
      icon: ShieldCheck,
      iconStyle: "bg-amber-100 text-amber-700",
      badgeStyle: "bg-amber-50 text-amber-700",
      accent: "from-amber-500 to-orange-400",
      bottom: "Above buyer target",
      bars: [50, 58, 52, 70, 78, 92]
    }
  ];

  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <motion.article
              variants={itemReveal}
              whileHover={{ y: -6, scale: 1.01 }}
              key={stat.label}
              className="group relative min-h-[176px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/70 sm:p-6"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${stat.accent}`}
              />

              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyle}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black ${stat.badgeStyle}`}
                >
                  {stat.change}
                </span>
              </div>

              <div className="mt-5 text-[26px] font-black tracking-tight text-slate-900">
                {stat.value}
              </div>

              <div className="mt-1 text-sm font-bold text-slate-600">
                {stat.label}
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-xs font-medium text-slate-400">
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
      </motion.div>
    </motion.section>
  );
}

// ----------------- LISTING CARD -----------------

function ListingCard({ listing, onView, compact = false }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-2xl hover:shadow-slate-200/90 ${
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
          Verified
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {listing.crop}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {listing.region}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {listing.quality}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-500">
            {listing.farmer}
          </p>

          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
            {listing.matching}% match
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Available
            </p>
            <p className="mt-1 text-xs font-bold text-slate-700">
              {listing.quantity}
            </p>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Delivery
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-700">
              {listing.delivery}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Starting at</p>
            <p className="mt-1 text-xl font-black tracking-tight text-slate-900">
              ₹{listing.price}
              <span className="text-sm font-semibold text-slate-500">/kg</span>
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(listing)}
            className="inline-flex h-10 items-center gap-1 rounded-xl bg-slate-900 px-3.5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
          >
            View
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

// ----------------- FEATURED LISTINGS -----------------

function FeaturedListings({ onView, onExplore }) {
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
    >
      <SectionHeading
        title="Featured from verified farmers"
        description="Curated opportunities matched to your buying activity, quality preferences, and delivery needs."
        icon={Store}
        action={
          <motion.button
            whileHover={{ x: 3 }}
            onClick={onExplore}
            className="inline-flex h-10 items-center gap-1 rounded-xl bg-slate-900 px-3.5 text-sm font-black text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            Explore all listings
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
        {listings.slice(0, 4).map((listing) => (
          <motion.div variants={itemReveal} key={listing.id}>
            <ListingCard listing={listing} onView={onView} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

// ----------------- INSIGHTS -----------------

function Insights() {
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
    >
      <SectionHeading
        title="Marketplace insights"
        description="Make more confident procurement decisions with trends, category spend, and demand signals."
        icon={ChartNoAxesCombined}
        action={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50">
            <CalendarDays className="h-4 w-4" />
            Last 6 months
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.article
          whileHover={{ y: -4 }}
          className="min-h-[350px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <TrendingUp className="h-5 w-5" />
              </span>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Monthly spend trend
                </h3>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Procurement performance
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 px-3 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">
                This month
              </p>
              <p className="mt-0.5 text-sm font-black text-blue-700">
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

                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
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
          className="min-h-[350px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Layers3 className="h-5 w-5" />
              </span>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Spend by crop
                </h3>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Category distribution
                </p>
              </div>
            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">
              4 categories
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
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
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
                    <span className="text-xs font-bold text-slate-600">
                      {crop.name}
                    </span>
                  </div>

                  <span className="text-xs font-black text-slate-900">
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

// ----------------- BUYER PULSE -----------------

function BuyerPulse({ onOpenListing }) {
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.16fr)_minmax(365px,0.84fr)]"
    >
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-100">
                <Activity className="h-5 w-5" />
              </span>

              <h2 className="text-xl font-black tracking-tight text-slate-900">
                Buyer activity
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Important updates from your market, suppliers, and active orders.
            </p>
          </div>

          <button className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-slate-50 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100">
            View all
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
                      <div className="absolute left-1/2 top-11 h-7 w-px -translate-x-1/2 bg-slate-200" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-black text-slate-800">
                        {event.title}
                      </p>
                      <span className="text-xs font-semibold text-slate-400">
                        {event.time}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl shadow-indigo-200"
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
              Smart sourcing recommendation
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight">
              Secure wheat before the next market movement.
            </h3>

            <p className="mt-3 text-sm leading-6 text-indigo-100">
              Demand is rising in Bhopal. Three A-grade verified wheat lots are
              available at ₹22/kg and match your past quality preference.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-100">
                Expected rise
              </p>
              <p className="mt-1 text-lg font-black text-white">+8.4%</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-100">
                Available lots
              </p>
              <p className="mt-1 text-lg font-black text-white">3</p>
            </div>
          </div>

          <button
            onClick={() => onOpenListing(listings[3])}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-indigo-700 transition-all hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            View matching lots
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </motion.article>
    </motion.section>
  );
}

// ----------------- LIVE PRICES -----------------

function LivePrices() {
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
    >
      <SectionHeading
        title="Live market prices"
        description="Current buying signals from major agricultural markets, refreshed as new market data arrives."
        icon={Activity}
        action={
          <a
            href="/live-data"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
          >
            Open live data
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
            className="group relative min-h-[204px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/80"
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
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-600"
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
              <h3 className="text-lg font-black text-slate-900">
                {crop.name}
              </h3>

              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {crop.region}
              </p>
            </div>

            <div className="relative mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Current rate
                </p>
                <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  ₹{crop.price}
                  <span className="ml-1 text-sm font-semibold text-slate-500">
                    /kg
                  </span>
                </p>
              </div>

              <div
                className={`rounded-lg px-2 py-1.5 text-xs font-black ${
                  crop.change >= 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {crop.change >= 0 ? "Rising" : "Falling"}
              </div>
            </div>

            <div className="relative mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
              <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
              {crop.buyers}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}

// ----------------- MARKET PAGE -----------------

function MarketPage({ searchQuery, onView }) {
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Best Match");

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = listings.filter((listing) => {
      const matchesCategory =
        category === "All" || listing.category === category;

      const matchesSearch =
        !query ||
        listing.crop.toLowerCase().includes(query) ||
        listing.farmer.toLowerCase().includes(query) ||
        listing.region.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "Lowest Price") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "Highest Match") {
      result = [...result].sort((a, b) => b.matching - a.matching);
    }

    if (sortBy === "Highest Rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [category, searchQuery, sortBy]);

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-[#0B3C4D] to-[#0A5B54] p-7 text-white shadow-2xl shadow-slate-300/60 sm:p-9"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
              <ScanSearch className="h-3.5 w-3.5" />
              VERIFIED SUPPLY NETWORK
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Discover your next best supply.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              Compare verified farmer offers using price, quality, quantity,
              delivery readiness, and Farlx Smart Match.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-100">
              Available today
            </p>
            <p className="mt-1 text-3xl font-black">42 listings</p>
            <p className="mt-1 text-xs text-slate-200">
              Across 18 verified suppliers
            </p>
          </div>
        </div>
      </motion.section>

      <section>
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {["All", "Vegetables", "Grains"].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`h-10 rounded-xl px-4 text-sm font-bold transition-colors ${
                  category === item
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <ListFilter className="h-4 w-4" />
              Sort by
            </div>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition-colors focus:border-cyan-400"
            >
              <option>Best Match</option>
              <option>Lowest Price</option>
              <option>Highest Match</option>
              <option>Highest Rating</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Showing <span className="font-black text-slate-800">{filteredListings.length}</span> verified listings
          </p>

          <div className="hidden items-center gap-2 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live inventory updates enabled
          </div>
        </div>

        {filteredListings.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onView={onView}
                compact
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-4 text-lg font-black text-slate-800">
              No matching listings found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try a different crop, farmer, region, or category.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// ----------------- LISTING MODAL -----------------

function ListingModal({ listing, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [bidPrice, setBidPrice] = useState(listing?.price || 0);
  const [submitted, setSubmitted] = useState(false);

  if (!listing) return null;

  const total = Number(quantity || 0) * Number(bidPrice || 0);

  const handleQuantityChange = (amount) => {
    const nextValue = Math.max(1, Number(quantity) + amount);
    setQuantity(nextValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
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
          className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-[#F6F8FC] shadow-2xl sm:max-w-6xl sm:rounded-[28px]"
        >
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-2xl">
                {listing.image}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Verified farmer listing
                </p>
                <h2 className="text-lg font-black text-slate-900">
                  {listing.crop} from {listing.farmer}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50"
              aria-label="Close listing"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {submitted ? (
            <div className="mx-auto max-w-2xl px-5 py-12 text-center sm:px-10 sm:py-16">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 16 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-200"
              >
                <CheckCircle2 className="h-10 w-10" />
              </motion.div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">
                Bid submitted successfully
              </p>

              <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                Your bid is now with {listing.farmer}.
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                You placed a bid for <strong>{quantity} tonne(s)</strong> of{" "}
                <strong>{listing.crop}</strong> at{" "}
                <strong>₹{bidPrice}/kg</strong>. The farmer will receive this
                request through Telegram and can accept it directly.
              </p>

              <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-black text-emerald-950">
                      Telegram farmer workflow started
                    </p>
                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                      Farlx will notify the farmer. When the farmer accepts,
                      the transaction will appear in your Live Data page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="/live-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
                >
                  Open Live Data
                  <ExternalLink className="h-4 w-4" />
                </a>

                <button
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Continue browsing
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
              <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div
                    className={`relative flex min-h-[220px] items-center justify-center overflow-hidden bg-gradient-to-br ${listing.softGradient} text-8xl`}
                  >
                    <div
                      className={`absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br ${listing.gradient} opacity-25 blur-3xl`}
                    />
                    <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-white/70 blur-3xl" />

                    <span className="relative">{listing.image}</span>

                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur">
                      <BadgeCheck className="h-4 w-4 text-emerald-600" />
                      Verified supplier
                    </div>

                    <div className="absolute bottom-5 right-5 rounded-full bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                      {listing.badge}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black text-slate-900">
                            {listing.crop}
                          </h3>

                          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            {listing.quality}
                          </span>
                        </div>

                        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {listing.region} · {listing.farmer}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                          Starting price
                        </p>
                        <p className="mt-1 text-2xl font-black text-emerald-700">
                          ₹{listing.price}
                          <span className="text-sm">/kg</span>
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-600">
                      {listing.description}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <PackageCheck className="h-4 w-4 text-blue-600" />
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Quantity
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {listing.quantity}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <Truck className="h-4 w-4 text-emerald-600" />
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Delivery
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {listing.delivery}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <Star className="h-4 w-4 text-amber-500" />
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Rating
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {listing.rating}/5
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <ClipboardList className="h-4 w-4 text-violet-600" />
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Orders
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {listing.orders}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">
                          Farlx Smart Match
                        </h3>
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-black text-violet-700">
                          {listing.matching}% match
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        This recommendation is based on your buying behaviour,
                        quality preferences, delivery needs, and supplier trust.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${listing.matching}%` }}
                      transition={{ duration: 0.85, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500"
                    />
          </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {listing.reasons.map((reason) => (
                      <div
                        key={reason}
                        className="flex items-start gap-2 rounded-xl bg-slate-50 p-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <p className="text-xs font-semibold leading-5 text-slate-600">
                          {reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-black text-slate-900">
                      Farmer trust profile
                    </h3>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        On-time delivery
                      </p>
                      <p className="mt-2 text-xl font-black text-emerald-700">
                        {listing.deliveryRate}%
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Bid acceptance
                      </p>
                      <p className="mt-2 text-xl font-black text-blue-700">
                        {listing.acceptingRate}%
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Marketplace orders
                      </p>
                      <p className="mt-2 text-xl font-black text-violet-700">
                        {listing.orders}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Farlx since
                      </p>
                      <p className="mt-2 text-xl font-black text-amber-700">
                        {listing.joined}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {listing.verification.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {item}
                      </span>
                    ))}

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Telegram: {listing.telegram}
                    </span>
                  </div>
                </section>
              </div>

              <aside>
                <form
                  onSubmit={handleSubmit}
                  className="sticky top-[88px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
                >
                  <div className="bg-gradient-to-r from-slate-950 via-[#0B3C4D] to-[#0A5B54] p-5 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
                          Buyer action
                        </p>
                        <h3 className="mt-1 text-xl font-black">
                          Place your bid
                        </h3>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                        <Handshake className="h-5 w-5 text-emerald-200" />
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      Your bid will be delivered to the farmer through Telegram.
                    </p>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-700">
                        Marketplace rate
                      </p>
                      <p className="mt-1 text-2xl font-black text-emerald-800">
                        ₹{listing.price}
                        <span className="text-sm">/kg</span>
                      </p>
                      <p className="mt-1 text-xs text-emerald-700">
                        You can submit your own bid price below.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-black text-slate-800">
                        Quantity required
                      </label>

                      <div className="mt-2 flex h-12 items-center overflow-hidden rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(-1)}
                          className="flex h-full w-12 items-center justify-center border-r border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(event) => setQuantity(event.target.value)}
                          className="h-full min-w-0 flex-1 text-center text-lg font-black text-slate-900 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(1)}
                          className="flex h-full w-12 items-center justify-center border-l border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Available supply: {listing.quantity}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-black text-slate-800">
                        Your bid price per kg
                      </label>

                      <div className="mt-2 flex h-12 items-center rounded-xl border border-slate-200 px-4 transition-colors focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                        <span className="text-lg font-black text-slate-500">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={bidPrice}
                          onChange={(event) => setBidPrice(event.target.value)}
                          className="min-w-0 flex-1 bg-transparent pl-2 text-lg font-black text-slate-900 outline-none"
                        />
                        <span className="text-sm font-bold text-slate-400">/kg</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-500">
                          Estimated bid value
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          ₹{total.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Clock3 className="h-4 w-4 text-cyan-600" />
                          Farmer usually responds within 2 hours
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-sm font-black text-white shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <Send className="h-4 w-4" />
                      Submit bid to farmer
                    </button>

                    <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-700">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                      The farmer receives this bid in Telegram and can accept it
                      directly. Farlx records the transaction status.
                    </div>
                  </div>
                </form>
              </aside>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ----------------- COMING SOON -----------------

function ComingSoon({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl py-10"
    >
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center shadow-xl shadow-slate-200/70">
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 px-8 py-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <Sparkles className="h-8 w-8" />
          </div>

          <h2 className="mt-5 text-2xl font-black text-white">{title}</h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-cyan-50">
            This buyer workspace is being upgraded with better sourcing tools
            and market intelligence.
          </p>
        </div>

        <div className="p-8">
          <a
            href="/live-data"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
          >
            View Live Data
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ----------------- APP WITH ROUTES -----------------

export default function App() {
  const [activeNav, setActiveNav] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/market") {
      setActiveNav("Market");
    } else if (location.pathname === "/" && activeNav === "Market") {
      setActiveNav("Home");
    }
  }, [location.pathname]);

  const openListing = (listing) => setSelectedListing(listing);

  const goToMarket = () => {
    setActiveNav("Market");
    navigate("/market");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderHome = () => {
    return (
      <div className="space-y-10">
        <Hero onExplore={goToMarket} />
        <StatsGrid />
        <FeaturedListings onView={openListing} onExplore={goToMarket} />
        <Insights />
        <BuyerPulse onOpenListing={openListing} />
        <LivePrices />
      </div>
    );
  };

  const renderPage = () => {
    if (activeNav === "Home") {
      return renderHome();
    }

    if (activeNav === "Market") {
      return (
        <MarketPage searchQuery={searchQuery} onView={openListing} />
      );
    }

    return <ComingSoon title={activeNav} />;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-[#F4F7FB] text-slate-900 lg:flex">
            <Sidebar
              active={activeNav}
              setActive={setActiveNav}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />

            <div className="min-w-0 flex-1">
              <TopBar
                onMenu={() => setMobileOpen(true)}
                onSearch={setSearchQuery}
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
                />
              )}
            </AnimatePresence>
          </div>
        }
      />

      <Route
        path="/market"
        element={
          <div className="min-h-screen bg-[#F4F7FB] text-slate-900 lg:flex">
            <Sidebar
              active={activeNav}
              setActive={setActiveNav}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
            <div className="min-w-0 flex-1">
              <TopBar
                onMenu={() => setMobileOpen(true)}
                onSearch={setSearchQuery}
              />
              <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10 xl:py-10">
                <div className="mx-auto w-full max-w-[1720px]">
                  <MarketPage searchQuery={searchQuery} onView={openListing} />
                </div>
              </main>
            </div>

            <AnimatePresence>
              {selectedListing && (
                <ListingModal
                  listing={selectedListing}
                  onClose={() => setSelectedListing(null)}
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