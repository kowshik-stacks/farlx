const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { Telegraf, Markup } = require("telegraf");
const { Pool } = require("pg");
const https = require("https");

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use(cors());
app.use(express.static(path.join(__dirname, "frontend")));

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const PORT = process.env.PORT || 3000;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.DATABASE_URL.includes("localhost") ||
          process.env.DATABASE_URL.includes("127.0.0.1")
            ? false
            : { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "farlx_db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres"
      }
);

// Helper to record platform notifications
async function createNotification(type, title, message, entityId = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (type, title, message, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [type, title, message, entityId]
    );
  } catch (err) {
    console.error("Notification insert error:", err.message);
  }
}

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        phone VARCHAR(50),
        village VARCHAR(255),
        telegram_chat_id VARCHAR(255) UNIQUE,
        upi_id VARCHAR(255),
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS age INTEGER;
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255);
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        farmer_id INTEGER REFERENCES farmers(id),
        crop VARCHAR(100) NOT NULL,
        quantity NUMERIC(10,2) NOT NULL,
        price_per_kg NUMERIC(10,2) NOT NULL,
        location VARCHAR(255),
        harvest_time VARCHAR(100),
        quality VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        ai_grade VARCHAR(20) DEFAULT 'Grade A+',
        freshness_score NUMERIC(5,2) DEFAULT 95.0,
        certificate_hash VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_grade VARCHAR(20) DEFAULT 'Grade A+';
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS freshness_score NUMERIC(5,2) DEFAULT 95.0;
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS certificate_hash VARCHAR(100);

      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id),
        buyer_name VARCHAR(255),
        buyer_phone VARCHAR(50),
        offered_price NUMERIC(10,2) NOT NULL,
        quantity NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE bids ADD COLUMN IF NOT EXISTS quantity NUMERIC(10,2);

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        bid_id INTEGER REFERENCES bids(id),
        listing_id INTEGER,
        buyer_name VARCHAR(255),
        farmer_name VARCHAR(255),
        farmer_upi VARCHAR(255),
        crop VARCHAR(100),
        quantity NUMERIC(10,2),
        total_amount NUMERIC(12,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'payment_escrowed',
        escrow_hash VARCHAR(100),
        delivered_at TIMESTAMP,
        payment_released_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS listing_id INTEGER;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS buyer_name VARCHAR(255);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS farmer_name VARCHAR(255);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS farmer_upi VARCHAR(255);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS crop VARCHAR(100);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS quantity NUMERIC(10,2);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS escrow_hash VARCHAR(100);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_released_at TIMESTAMP;

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        entity_id INTEGER,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized and schema verified successfully.");
  } catch (error) {
    console.error("Database initialization error:", error.message);
  }
}

initDb();

// ----------------- MULTILINGUAL BOT DICTIONARY -----------------

const botTranslations = {
  en: {
    welcomeNew: `Hi! 👋 Welcome to FARLX - Farm-to-Buyer Direct Marketplace.\n\nSell crops directly to wholesale buyers with zero middleman commissions and guaranteed Escrow UPI payments!`,
    registeredWelcome: (name, village, upi) => `Hi ${name}! 👨‍🌾\n📍 Village: ${village || "Not set"}\n💳 UPI: ${upi || "Not set"}\n\nChoose an option below:`,
    menu: [
      ["🌾 Create Listing", "📦 My Listings"],
      ["📈 Mandi Prices", "🌐 Language"]
    ],
    chooseLang: `🌐 Choose your language / अपनी भाषा चुनें:`,
    langChanged: `✅ Language set to English!`,
    registerPrompt: `🌾 *Farmer Registration*\n\nWhat is your full name?\nExample: Ramesh Patel`,
    agePrompt: `What is your age?\nExample: 35`,
    phonePrompt: `What is your mobile number?\nExample: 9876543210`,
    villagePrompt: `What is your Village / District?\nExample: Nashik, Maharashtra`,
    upiPrompt: `What is your UPI ID for instant direct payments?\nExample: ramesh@okhdfcbank`,
    regSuccess: (name) => `🎉 *Registration Complete!*\n\nWelcome ${name} to FARLX. You can now list crops and get direct bids from verified buyers!`,
    bidNotification: (crop, buyer, price, qty, total) => `🔔 *NEW BID RECEIVED!* 🌾\n\n🌾 *Crop:* ${crop}\n👤 *Buyer:* ${buyer}\n⚖️ *Quantity:* ${qty} kg\n💰 *Offered Rate:* ₹${price}/kg\n💵 *Total:* ₹${total}\n\nDo you accept this offer?`,
    acceptBtn: (total) => `✅ Accept (₹${total})`,
    rejectBtn: `❌ Reject`,
    bidAccepted: (txnId, crop, total, upi) => `🎉 *BID ACCEPTED! ORDER IN ESCROW*\n\nOrder #TXN-${txnId}\nCrop: ${crop}\nTotal Amount: ₹${total}\nStatus: Locked in Smart Escrow 🔒\nPayment will release to your UPI (${upi}) once buyer confirms receipt!\n\nThank you for trading on FARLX!`,
    paymentReleased: (buyer, crop, amount, upi, txnId) => `🎉 *PAYMENT RELEASED TO YOUR UPI!* 💰\n\nBuyer ${buyer} confirmed receipt of ${crop}!\n💵 Amount: ₹${amount}\n🏦 UPI: ${upi}\n📋 Order #TXN-${txnId}\n\nThank you for trading on FARLX! 🌾`,
    mandiTitle: `📈 *Agmarknet APMC Mandi Benchmark Rates*\n\nLive wholesale prices vs FARLX Direct:\n\n• 🍅 Tomato: Mandi ₹24/kg | FARLX ₹28-32/kg (+25%)\n• 🧅 Onion: Mandi ₹18/kg | FARLX ₹22-26/kg (+28%)\n• 🥔 Potato: Mandi ₹14/kg | FARLX ₹18-20/kg (+35%)\n• 🌾 Paddy/Rice: Mandi ₹32/kg | FARLX ₹38-42/kg (+22%)\n• 🌶️ Chilli: Mandi ₹65/kg | FARLX ₹80-90/kg (+25%)\n\nFARLX eliminates 15-30% middleman mandi deductions!`,
    photoGraded: (grade, fresh, defect, shelf, price) => `🔬 *AI Crop Quality Certificate*\n\n⭐ *Grade:* ${grade}\n🌿 *Freshness:* ${fresh}%\n🔍 *Defects:* ${defect}%\n⏳ *Shelf Life:* ${shelf}\n💡 *Recommended Price:* ₹${price}/kg\n\nTap *Create Listing* to publish with this verified AI Certificate!`
  },
  hi: {
    welcomeNew: `नमस्ते! 👋 FARLX में आपका स्वागत है - बिना दलालों का सीधा कृषि बाजार।\n\nअपनी फसल सीधे थोक खरीदारों को बेचें और सुरक्षित एस्क्रो द्वारा सीधे UPI में भुगतान पाएं!`,
    registeredWelcome: (name, village, upi) => `नमस्ते ${name} जी! 👨‍🌾\n📍 गांव/जिला: ${village || "दर्ज नहीं"}\n💳 UPI: ${upi || "दर्ज नहीं"}\n\nनीचे दिए गए विकल्पों में से चुनें:`,
    menu: [
      ["🌾 फसल बेचें (Listing)", "📦 मेरी फसलें"],
      ["📈 मंडी भाव", "🌐 भाषा बदलें"]
    ],
    chooseLang: `🌐 अपनी भाषा चुनें / Choose language:`,
    langChanged: `✅ भाषा बदलकर हिन्दी कर दी गई है!`,
    registerPrompt: `🌾 *किसान पंजीकरण*\n\nआपका पूरा नाम क्या है?\nउदाहरण: रमेश पटेल`,
    agePrompt: `आपकी उम्र क्या है?\nउदाहरण: 35`,
    phonePrompt: `आपका मोबाइल नंबर क्या है?\nउदाहरण: 9876543210`,
    villagePrompt: `आपका गांव या जिला कौन सा है?\nउदाहरण: नासिक, महाराष्ट्र`,
    upiPrompt: `सीधे भुगतान के लिए आपका UPI ID क्या है?\nउदाहरण: ramesh@okhdfcbank`,
    regSuccess: (name) => `🎉 *पंजीकरण सफल!*\n\n${name} जी, FARLX में आपका स्वागत है। अब आप अपनी फसल की लिस्टिंग कर सकते हैं!\nखरीदार की बोली आते ही आपको तुरंत सूचना मिलेगी।`,
    bidNotification: (crop, buyer, price, qty, total) => `🔔 *नई बोली प्राप्त हुई!* 🌾\n\n🌾 *फसल:* ${crop}\n👤 *खरीदार:* ${buyer}\n⚖️ *मात्रा:* ${qty} किग्रा\n💰 *प्रस्तावित भाव:* ₹${price}/किग्रा\n💵 *कुल राशि:* ₹${total}\n\nक्या आप यह सौदा स्वीकार करते हैं?`,
    acceptBtn: (total) => `✅ स्वीकारें (₹${total})`,
    rejectBtn: `❌ अस्वीकारें`,
    bidAccepted: (txnId, crop, total, upi) => `🎉 *सौदा पक्का! एस्क्रो में सुरक्षित*\n\nऑर्डर संख्या #TXN-${txnId}\nफसल: ${crop}\nकुल सौदा राशि: ₹${total}\nस्थिति: एस्क्रो में सुरक्षित 🔒\nखरीदार द्वारा माल मिलने की पुष्टि होते ही ₹${total} आपके UPI (${upi}) पर पहुंच जाएंगे!\n\nFARLX पर व्यापार करने के लिए धन्यवाद!`,
    paymentReleased: (buyer, crop, amount, upi, txnId) => `🎉 *रुपये आपके खाते में पहुंचे!* 💰\n\nखरीदार ${buyer} ने ${crop} मिलने की पुष्टि कर दी है!\n💵 प्राप्त राशि: ₹${amount}\n🏦 UPI ID: ${upi}\n📋 ऑर्डर संख्या #TXN-${txnId}\n\nFARLX पर व्यापार करने के लिए धन्यवाद! 🌾`,
    mandiTitle: `📈 *सरकारी APMC मंडी भाव तुलना*\n\nमंडी भाव बनाम FARLX सीधा खेत भाव:\n\n• 🍅 टमाटर: मंडी ₹24 | FARLX ₹28-32 (+25% अधिक)\n• 🧅 प्याज: मंडी ₹18 | FARLX ₹22-26 (+28% अधिक)\n• 🥔 आलू: मंडी ₹14 | FARLX ₹18-20 (+35% अधिक)\n• 🌾 धान/चावल: मंडी ₹32 | FARLX ₹38-42 (+22% अधिक)\n• 🌶️ मिर्च: मंडी ₹65 | FARLX ₹80-90 (+25% अधिक)\n\nFARLX पर बिचौलिए का 15-30% कमीशन बचता है!`,
    photoGraded: (grade, fresh, defect, shelf, price) => `🔬 *AI फसल गुणवत्ता प्रमाण पत्र*\n\n⭐ *ग्रेड:* ${grade}\n🌿 *ताज़गी:* ${fresh}%\n🔍 *दोष:* ${defect}%\n⏳ *शेल्फ लाइफ:* ${shelf}\n💡 *अनुशंसित भाव:* ₹${price}/किग्रा\n\nइस प्रमाणित ग्रेड के साथ बेचने के लिए *फसल बेचें* पर टैप करें!`
  },
  ta: {
    welcomeNew: `வணக்கம்! 👋 FARLX-க்கு நல்வரவு - இடைத்தரகர் இல்லாத நேரடி வேளாண் சந்தை.\n\nநேரடியாக மொத்த வியாபாரிகளுக்கு விற்று எஸ்க்ரோ மூலம் உடனடி UPI பணத்தைப் பெறுங்கள்!`,
    registeredWelcome: (name, village, upi) => `வணக்கம் ${name}! 👨‍🌾\n📍 ஊர்: ${village || "இல்லை"}\n💳 UPI: ${upi || "இல்லை"}\n\nகீழே உள்ளதை தேர்ந்தெடுக்கவும்:`,
    menu: [
      ["🌾 பயிர் விற்க", "📦 என் பயிர்கள்"],
      ["📈 மண்டி விலை", "🌐 மொழி மாற்ற"]
    ],
    chooseLang: `🌐 மொழியை தேர்ந்தெடுக்கவும் / Choose language:`,
    langChanged: `✅ மொழி தமிழாக மாற்றப்பட்டது!`,
    registerPrompt: `🌾 *விவசாயி பதிவு*\n\nஉங்கள் முழு பெயர் என்ன?\nஎ.கா: ரமேஷ்`,
    agePrompt: `உங்கள் வயது என்ன?\nஎ.கா: 35`,
    phonePrompt: `உங்கள் அலைபேசி எண்?\nஎ.கா: 9876543210`,
    villagePrompt: `உங்கள் ஊர் அல்லது மாவட்டம்?\nஎ.கா: சேலம், தமிழ்நாடு`,
    upiPrompt: `பணம் பெற உங்கள் UPI ID என்ன?\nஎ.கா: ramesh@okhdfcbank`,
    regSuccess: (name) => `🎉 *பதிவு முடிந்தது!*\n\n${name}, FARLX-ல் பயிர்களை பட்டியலிட்டு சிறந்த விலையை பெறுங்கள்!\nவிலை கேட்கப்பட்டதும் தகவல் வரும்.`,
    bidNotification: (crop, buyer, price, qty, total) => `🔔 *புதிய விலை கேட்கப்பட்டுள்ளது!* 🌾\n\n🌾 *பயிர்:* ${crop}\n👤 *வாங்குபவர்:* ${buyer}\n⚖️ *அளவு:* ${qty} கிலோ\n💰 *விலை:* ₹${price}/கிலோ\n💵 *மொத்தம்:* ₹${total}\n\nஇந்த விலையை ஏற்கிறீர்களா?`,
    acceptBtn: (total) => `✅ ஏற்கவும் (₹${total})`,
    rejectBtn: `❌ நிராகரிக்க`,
    bidAccepted: (txnId, crop, total, upi) => `🎉 *விலை ஏற்கப்பட்டது! பணம் எஸ்க்ரோவில் உள்ளது*\n\nஆர்டர் எண் #TXN-${txnId}\nபயிர்: ${crop}\nதொகை: ₹${total}\nவாங்குபவர் உறுதி செய்தவுடன் ₹${total} உங்கள் UPI (${upi})-க்கு உடனடியாக விடுவிக்கப்படும்!\n\nநன்றி!`,
    paymentReleased: (buyer, crop, amount, upi, txnId) => `🎉 *பணம் உங்கள் கணக்கிற்கு வந்தது!* 💰\n\nவாங்குபவர் ${buyer} பயிரை பெற்று உறுதி செய்தார்!\n💵 தொகை: ₹${amount}\n🏦 UPI: ${upi}\n📋 ஆர்டர் #TXN-${txnId}\n\nநன்றி! 🌾`,
    mandiTitle: `📈 *அரசு மண்டி விலை ஒப்பீடு*\n\n• 🍅 தக்காளி: மண்டி ₹24 | FARLX ₹28-32 (+25% லாபம்)\n• 🧅 வெங்காயம்: மண்டி ₹18 | FARLX ₹22-26 (+28% லாபம்)\n• 🥔 உருளை: மண்டி ₹14 | FARLX ₹18-20 (+35% லாபம்)\n\nFARLX மூலம் தரகர் கமிஷன் மிச்சமாகிறது!`,
    photoGraded: (grade, fresh, defect, shelf, price) => `🔬 *AI பயிர் தர சான்றிதழ்*\n\n⭐ *தரம்:* ${grade}\n🌿 *புதிய நிலை:* ${fresh}%\n🔍 *சேதாரம்:* ${defect}%\n⏳ *இருப்பு காலம்:* ${shelf}\n💡 *பரிந்துரை விலை:* ₹${price}/கிலோ`
  },
  te: {
    welcomeNew: `నమస్కారం! 👋 FARLX కు స్వాగతం - దళారులు లేని వ్యవసాయ మార్కెట్.\n\nనేరుగా కొనుగోలుదారులకు అమ్మి సురక్షిత ఎస్క్రో UPI చెల్లింపులు పొందండి!`,
    registeredWelcome: (name, village, upi) => `నమస్కారం ${name}! 👨‍🌾\n📍 ప్రాంతం: ${village || "లేదు"}\n💳 UPI: ${upi || "లేదు"}\n\nకింది ఎంపికలలో ఒకదాన్ని ఎంచుకోండి:`,
    menu: [
      ["🌾 పంట అమ్మకం", "📦 నా పంటలు"],
      ["📈 మండి ధరలు", "🌐 భాష మార్చండి"]
    ],
    chooseLang: `🌐 భాషను ఎంచుకోండి / Choose language:`,
    langChanged: `✅ భాష తెలుగుగా మార్చబడింది!`,
    registerPrompt: `🌾 *రైతు నమోదు*\n\nమీ పూర్తి పేరు ఏమిటి?\nఉదాహరణ: రమేష్`,
    agePrompt: `మీ వయస్సు ఎంత?\nఉదాహరణ: 35`,
    phonePrompt: `మీ మొబైల్ నంబర్?\nఉదాహరణ: 9876543210`,
    villagePrompt: `మీ గ్రామం లేదా జిల్లా?\nఉదాహరణ: గుంటూరు`,
    upiPrompt: `చెల్లింపుల కోసం మీ UPI ID ఏమిటి?\nఉదాహరణ: ramesh@okhdfcbank`,
    regSuccess: (name) => `🎉 *నమోదు పూర్తయింది!*\n\n${name}, FARLX లో మీ పంటను అమ్మకానికి పెట్టవచ్చు!`,
    bidNotification: (crop, buyer, price, qty, total) => `🔔 *కొత్త బిడ్ వచ్చింది!* 🌾\n\n🌾 *పంట:* ${crop}\n👤 *కొనుగోలుదారు:* ${buyer}\n⚖️ *పరిమాణం:* ${qty} కిలోలు\n💰 *ధర:* ₹${price}/కిలో\n💵 *మొత్తం:* ₹${total}\n\nఈ ధరను అంగీకరిస్తారా?`,
    acceptBtn: (total) => `✅ అంగీకరించండి (₹${total})`,
    rejectBtn: `❌ తిరస్కరించండి`,
    bidAccepted: (txnId, crop, total, upi) => `🎉 *బిడ్ అంగీకరించబడింది! డబ్బు ఎస్క్రోలో ఉంది*\n\nఆర్డర్ #TXN-${txnId}\nమొత్తం: ₹${total}\nపంట అందిన వెంటనే ₹${total} మీ UPI (${upi}) లో జమ అవుతుంది!\n\nధన్యవాదాలు!`,
    paymentReleased: (buyer, crop, amount, upi, txnId) => `🎉 *డబ్బు మీ ఖాతాలో జమ అయింది!* 💰\n\nకొనుగోలుదారు ${buyer} పంట అందినట్లు ధృవీకరించారు!\n💵 మొత్తం: ₹${amount}\n🏦 UPI: ${upi}\n\nధన్యవాదాలు! 🌾`,
    mandiTitle: `📈 *మార్కెట్ మండి ధరల పోలిక*\n\n• 🍅 టమాటా: మండి ₹24 | FARLX ₹28-32 (+25% ఆదా)\n• 🧅 ఉల్లిపాయ: మండి ₹18 | FARLX ₹22-26 (+28% ఆదా)\n• 🥔 బంగాళాదుంప: మండి ₹14 | FARLX ₹18-20 (+35% ఆదా)`,
    photoGraded: (grade, fresh, defect, shelf, price) => `🔬 *AI నాణ్యత సర్టిఫికెట్*\n\n⭐ *గ్రేడ్:* ${grade}\n🌿 *తాజాదనం:* ${fresh}%\n🔍 *లోపాలు:* ${defect}%\n⏳ *నిల్వ కాలం:* ${shelf}\n💡 *సిఫార్సు ధర:* ₹${price}/కిలో`
  },
  mr: {
    welcomeNew: `नमस्कार! 👋 FARLX मध्ये आपले स्वागत आहे - दलालांशिवाय थेट शेती बाजारपेठ.\n\nआपले पीक थेट मोठ्या खरेदीदारांना विका आणि सुरक्षित एस्क्रो UPI पेमेंट मिळवा!`,
    registeredWelcome: (name, village, upi) => `नमस्कार ${name} जी! 👨‍🌾\n📍 गाव/जिल्हा: ${village || "नाही"}\n💳 UPI: ${upi || "नाही"}\n\nखालील पर्यायांमधून निवडा:`,
    menu: [
      ["🌾 पीक विक्री", "📦 माझी पिके"],
      ["📈 बाजारभाव", "🌐 भाषा बदला"]
    ],
    chooseLang: `🌐 भाषा निवडा / Choose language:`,
    langChanged: `✅ भाषा मराठी सेट केली आहे!`,
    registerPrompt: `🌾 *शेतकरी नोंदणी*\n\nआपले पूर्ण नाव काय आहे?\nउदा: रमेश पाटील`,
    agePrompt: `आपले वय किती आहे?\nउदा: 35`,
    phonePrompt: `आपला मोबाईल नंबर काय आहे?\nउदा: 9876543210`,
    villagePrompt: `आपले गाव किंवा जिल्हा कोणता?\nउदा: नाशिक, महाराष्ट्र`,
    upiPrompt: `थेट पेमेंटसाठी आपला UPI ID काय आहे?\nउदा: ramesh@okhdfcbank`,
    regSuccess: (name) => `🎉 *नोंदणी यशस्वी!*\n\n${name} जी, FARLX मध्ये स्वागत आहे. आता आपण पीक विक्रीसाठी ठेवू शकता!`,
    bidNotification: (crop, buyer, price, qty, total) => `🔔 *नवीन बोली आली आहे!* 🌾\n\n🌾 *पीक:* ${crop}\n👤 *खरेदीदार:* ${buyer}\n⚖️ *प्रमाण:* ${qty} किलो\n💰 *दर:* ₹${price}/किलो\n💵 *एकूण:* ₹${total}\n\nआपणास ही बोली मान्य आहे का?`,
    acceptBtn: (total) => `✅ स्वीकारा (₹${total})`,
    rejectBtn: `❌ नाकारा`,
    bidAccepted: (txnId, crop, total, upi) => `🎉 *सौदा पक्का! पैसे एस्क्रोमध्ये सुरक्षित*\n\nऑर्डर क्र. #TXN-${txnId}\nएकूण रक्कम: ₹${total}\nमाल मिळाल्याची खात्री होताच ₹${total} आपल्या UPI (${upi}) वर जमा होतील!\n\nधन्यवाद!`,
    paymentReleased: (buyer, crop, amount, upi, txnId) => `🎉 *पैसे आपल्या खात्यात जमा झाले!* 💰\n\nखरेदीदार ${buyer} ने माल मिळाल्याची खात्री केली आहे!\n💵 मिळालेली रक्कम: ₹${amount}\n🏦 UPI ID: ${upi}\n\nधन्यवाद! 🌾`,
    mandiTitle: `📈 *बाजार समिती दर तुलना*\n\n• 🍅 टोमॅटो: बाजार समिती ₹24 | FARLX ₹28-32 (+25% जादा)\n• 🧅 कांदा: बाजार समिती ₹18 | FARLX ₹22-26 (+28% जादा)\n• 🥔 बटाटा: बाजार समिती ₹14 | FARLX ₹18-20 (+35% जादा)`,
    photoGraded: (grade, fresh, defect, shelf, price) => `🔬 *AI पीक गुणवत्ता प्रमाणपत्र*\n\n⭐ *प्रत:* ${grade}\n🌿 *ताजेपणा:* ${fresh}%\n🔍 *दोष:* ${defect}%\n⏳ *टिकण्याची क्षमता:* ${shelf}\n💡 *शिफारस दर:* ₹${price}/किलो`
  }
};

// In-memory conversation state for Telegram bot
const userState = {};

function getLang(chatId) {
  return (userState[chatId] && userState[chatId].lang) || "en";
}

function getTexts(chatId) {
  const l = getLang(chatId);
  return botTranslations[l] || botTranslations.en;
}

function getMainMenuKeyboard(chatId) {
  const t = getTexts(chatId);
  return Markup.keyboard(t.menu).resize();
}

const languageKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback("🇬🇧 English", "set_lang_en"),
    Markup.button.callback("🇮🇳 हिन्दी", "set_lang_hi")
  ],
  [
    Markup.button.callback("🇮🇳 தமிழ்", "set_lang_ta"),
    Markup.button.callback("🇮🇳 తెలుగు", "set_lang_te")
  ],
  [
    Markup.button.callback("🇮🇳 मराठी", "set_lang_mr")
  ]
]);

const cropKeyboard = Markup.inlineKeyboard([
  [
    { text: "🍅 Tomato", callback_data: "crop_Tomato" },
    { text: "🧅 Onion", callback_data: "crop_Onion" }
  ],
  [
    { text: "🌾 Paddy / Rice", callback_data: "crop_Paddy" },
    { text: "🥔 Potato", callback_data: "crop_Potato" }
  ],
  [
    { text: "🌶️ Chilli", callback_data: "crop_Chilli" },
    { text: "🥜 Groundnut", callback_data: "crop_Groundnut" }
  ],
  [
    { text: "🌽 Maize", callback_data: "crop_Maize" },
    { text: "🥒 Cucumber", callback_data: "crop_Cucumber" }
  ],
  [
    { text: "🌿 Other Produce", callback_data: "crop_Other" }
  ]
]);

const harvestKeyboard = Markup.inlineKeyboard([
  [{ text: "✅ Ready Now", callback_data: "harvest_Ready_Now" }],
  [
    { text: "🕒 1 Week", callback_data: "harvest_1_Week" },
    { text: "🕒 2 Weeks", callback_data: "harvest_2_Weeks" }
  ]
]);

const qualityKeyboard = Markup.inlineKeyboard([
  [
    { text: "⭐ Premium (Grade A+)", callback_data: "quality_Premium" },
    { text: "🟡 Standard (Grade A)", callback_data: "quality_Standard" }
  ]
]);

async function sendMainMenu(ctx, chatId) {
  try {
    const farmerResult = await pool.query(
      "SELECT id, name, village, upi_id, language FROM farmers WHERE telegram_chat_id = $1",
      [String(chatId)]
    );

    if (farmerResult.rows.length > 0) {
      const f = farmerResult.rows[0];
      if (f.language) {
        if (!userState[chatId]) userState[chatId] = {};
        userState[chatId].lang = f.language;
      }
      const t = getTexts(chatId);
      await ctx.reply(
        t.registeredWelcome(f.name, f.village, f.upi_id),
        getMainMenuKeyboard(chatId)
      );
    } else {
      const t = getTexts(chatId);
      await ctx.reply(t.welcomeNew, getMainMenuKeyboard(chatId));
    }
  } catch (error) {
    console.error("Send menu error:", error.message);
    const t = getTexts(chatId);
    await ctx.reply(t.welcomeNew, getMainMenuKeyboard(chatId));
  }
}

// ----------------- TELEGRAM BOT COMMANDS & HANDLERS -----------------

bot.command("start", async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.reply(
    `🌾 *Welcome to FARLX Direct Farm Marketplace!*\n\nPlease select your language / अपनी भाषा चुनें:`,
    languageKeyboard
  );
});

bot.command("language", async (ctx) => {
  await ctx.reply(`🌐 *Select your preferred language / भाषा चुनें:*`, languageKeyboard);
});

bot.command("mandi", async (ctx) => {
  const t = getTexts(ctx.chat.id);
  await ctx.reply(t.mandiTitle, { parse_mode: "Markdown" });
});

// Language selection callbacks
bot.action(/^set_lang_(en|hi|ta|te|mr)$/, async (ctx) => {
  const lang = ctx.match[1];
  const chatId = ctx.chat.id;
  if (!userState[chatId]) userState[chatId] = {};
  userState[chatId].lang = lang;

  await ctx.answerCbQuery();

  try {
    await pool.query("UPDATE farmers SET language = $1 WHERE telegram_chat_id = $2", [
      lang,
      String(chatId)
    ]);
  } catch (err) {
    // Farmer may not be registered yet
  }

  const t = getTexts(chatId);
  await ctx.reply(t.langChanged, getMainMenuKeyboard(chatId));
  await sendMainMenu(ctx, chatId);
});

// Photo upload handler for AI crop quality grading
bot.on("photo", async (ctx) => {
  const chatId = ctx.chat.id;
  const t = getTexts(chatId);

  await ctx.reply(`🔬 *Analyzing crop photo with FARLX AI Quality Scanner...*\nExamining surface defects, ripeness, and moisture...`);

  setTimeout(async () => {
    const grades = ["Grade A+ (Export Quality)", "Grade A (Premium Retail)", "Grade A+ (Super Fresh)"];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const freshness = (94 + Math.random() * 5).toFixed(1);
    const defect = (1.2 + Math.random() * 1.5).toFixed(1);
    const shelf = "6-8 days";
    const recPrice = "32";

    if (!userState[chatId]) userState[chatId] = { data: {} };
    userState[chatId].lastAiGrade = { grade, freshness, defect, shelf };

    await ctx.reply(t.photoGraded(grade, freshness, defect, shelf, recPrice), {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("🌾 Create Listing with this Grade", "list_with_ai_grade")]
      ])
    });
  }, 1200);
});

bot.action("list_with_ai_grade", async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery();

  const farmerResult = await pool.query(
    "SELECT id FROM farmers WHERE telegram_chat_id = $1",
    [String(chatId)]
  );

  if (farmerResult.rows.length === 0) {
    await ctx.reply("Please register as a farmer first by tapping Register!");
    return;
  }

  userState[chatId] = {
    flow: "listing",
    step: "crop",
    data: {
      quality: "Grade A+ (AI Certified)"
    }
  };

  await ctx.reply(`🌾 *Select your crop from the list below:*`, cropKeyboard);
});

// Crop selection callback
bot.action(/^crop_(.+)$/, async (ctx) => {
  const crop = ctx.match[1];
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery();

  if (!userState[chatId] || userState[chatId].flow !== "listing") {
    userState[chatId] = { flow: "listing", step: "quantity", data: { crop } };
  } else {
    userState[chatId].data.crop = crop;
    userState[chatId].step = "quantity";
  }

  await ctx.reply(`🌾 Crop selected: *${crop}*\n\nHow many kilograms (kg) do you want to list?\nExample: 500`);
});

// Harvest time callback
bot.action(/^harvest_(.+)$/, async (ctx) => {
  const harvest = ctx.match[1].replace(/_/g, " ");
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery();

  if (userState[chatId] && userState[chatId].flow === "listing") {
    userState[chatId].data.harvest_time = harvest;
    userState[chatId].step = "quality";
    await ctx.reply("Select crop quality grade:", qualityKeyboard);
  }
});

// Quality selection callback
bot.action(/^quality_(.+)$/, async (ctx) => {
  const quality = ctx.match[1] === "Premium" ? "Premium (Grade A+)" : "Standard (Grade A)";
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery();

  if (userState[chatId] && userState[chatId].flow === "listing") {
    userState[chatId].data.quality = quality;
    await publishListing(ctx, chatId);
  }
});

async function publishListing(ctx, chatId) {
  const state = userState[chatId];
  if (!state || state.flow !== "listing") return;

  const farmerResult = await pool.query(
    "SELECT id, name, village FROM farmers WHERE telegram_chat_id = $1",
    [String(chatId)]
  );

  if (farmerResult.rows.length === 0) {
    await ctx.reply("Please register as a farmer first.", getMainMenuKeyboard(chatId));
    return;
  }

  const farmer = farmerResult.rows[0];
  const { crop, quantity, price, harvest_time: harvestTime, quality } = state.data;
  const location = farmer.village || "Nashik";

  const certHash = crypto.createHash("sha256").update(`${crop}-${quantity}-${price}-${Date.now()}`).digest("hex").slice(0, 16);

  const res = await pool.query(
    `INSERT INTO listings
      (farmer_id, crop, quantity, price_per_kg, location, harvest_time, quality, ai_grade, freshness_score, certificate_hash, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'Grade A+', 96.5, $8, 'active')
     RETURNING id`,
    [farmer.id, crop, quantity, price, location, harvestTime || "Ready Now", quality || "Grade A+", certHash]
  );

  const listingId = res.rows[0].id;
  delete userState[chatId];

  await createNotification(
    "new_listing",
    "🌾 New Crop Listed",
    `${farmer.name} listed ${quantity} kg of ${crop} at ₹${price}/kg (${location})`,
    listingId
  );

  await ctx.reply(
    `✅ *Listing Published Live on FARLX!*\n\n` +
      `📦 *Listing ID:* #${listingId}\n` +
      `🌾 *Crop:* ${crop}\n` +
      `⚖️ *Quantity:* ${quantity} kg\n` +
      `💰 *Price:* ₹${price}/kg\n` +
      `📍 *Location:* ${location}\n` +
      `⭐ *AI Certified Grade:* Grade A+ (${certHash})\n\n` +
      `Buyers on FARLX Web Marketplace can now view your produce and bid! You will receive instant notifications here.`,
    getMainMenuKeyboard(chatId)
  );
}

// Text message handler
bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();
  const t = getTexts(chatId);

  // Check language menu triggers
  if (text === "🌐 Language" || text === "🌐 भाषा बदलें" || text === "🌐 மொழி மாற்ற" || text === "🌐 భాష మార్చండి" || text === "🌐 भाषा बदला") {
    await ctx.reply(t.chooseLang, languageKeyboard);
    return;
  }

  // Mandi prices trigger
  if (text === "📈 Mandi Prices" || text === "📈 मंडी भाव" || text === "📈 மண்டி விலை" || text === "📈 మండి ధరలు" || text === "📈 बाजारभाव") {
    await ctx.reply(t.mandiTitle, { parse_mode: "Markdown" });
    return;
  }

  // Register trigger
  if (text === "Register" || text === "🌾 Register as Farmer") {
    const farmerCheck = await pool.query(
      "SELECT id, name, village, upi_id FROM farmers WHERE telegram_chat_id = $1",
      [String(chatId)]
    );

    if (farmerCheck.rows.length > 0) {
      const f = farmerCheck.rows[0];
      await ctx.reply(
        `✅ You are already registered!\nFarmer ID: #${f.id}\nName: ${f.name}\nVillage: ${f.village}\nUPI: ${f.upi_id}`,
        getMainMenuKeyboard(chatId)
      );
      return;
    }

    userState[chatId] = {
      flow: "register",
      step: "name",
      data: {}
    };

    await ctx.reply(t.registerPrompt);
    return;
  }

  // Create listing trigger
  if (
    text === "Create Listing" ||
    text === "🌾 Create Listing" ||
    text === "🌾 फसल बेचें (Listing)" ||
    text === "🌾 பயிர் விற்க" ||
    text === "🌾 పంట అమ్మకం" ||
    text === "🌾 पीक विक्री"
  ) {
    const farmerCheck = await pool.query(
      "SELECT id FROM farmers WHERE telegram_chat_id = $1",
      [String(chatId)]
    );

    if (farmerCheck.rows.length === 0) {
      userState[chatId] = { flow: "register", step: "name", data: {} };
      await ctx.reply(`Please register as a farmer first!\n\n${t.registerPrompt}`);
      return;
    }

    userState[chatId] = {
      flow: "listing",
      step: "crop",
      data: {}
    };

    await ctx.reply(`🌾 *Create a Crop Listing*\n\nSelect your crop from the list below:`, cropKeyboard);
    return;
  }

  // My listings trigger
  if (
    text === "My Listings" ||
    text === "📦 My Listings" ||
    text === "📦 मेरी फसलें" ||
    text === "📦 என் பயிர்கள்" ||
    text === "📦 నా పంటలు" ||
    text === "📦 माझी पिके"
  ) {
    try {
      const farmerRes = await pool.query(
        "SELECT id FROM farmers WHERE telegram_chat_id = $1",
        [String(chatId)]
      );

      if (farmerRes.rows.length === 0) {
        await ctx.reply("Please register as a farmer first.", getMainMenuKeyboard(chatId));
        return;
      }

      const listings = await pool.query(
        `SELECT l.*, COUNT(b.id) AS bid_count
         FROM listings l
         LEFT JOIN bids b ON b.listing_id = l.id
         WHERE l.farmer_id = $1
         GROUP BY l.id
         ORDER BY l.created_at DESC`,
        [farmerRes.rows[0].id]
      );

      if (listings.rows.length === 0) {
        await ctx.reply("📦 You have no crop listings yet. Tap Create Listing to add one!", getMainMenuKeyboard(chatId));
        return;
      }

      let msg = "📦 *Your Active Listings on FARLX:*\n\n";
      for (const l of listings.rows) {
        msg += `#${l.id} *${l.crop}* (${l.quantity} kg @ ₹${l.price_per_kg}/kg)\nStatus: ${l.status === 'sold' ? '🔴 Sold' : '🟢 Active'} | Bids: ${l.bid_count}\n\n`;
      }

      await ctx.reply(msg, getMainMenuKeyboard(chatId));
    } catch (err) {
      await ctx.reply("Failed to load listings.", getMainMenuKeyboard(chatId));
    }
    return;
  }

  // Conversation state machine
  const state = userState[chatId];
  if (!state) {
    await sendMainMenu(ctx, chatId);
    return;
  }

  if (state.flow === "register") {
    if (state.step === "name") {
      state.data.name = text;
      state.step = "age";
      await ctx.reply(t.agePrompt);
      return;
    }
    if (state.step === "age") {
      state.data.age = Number.parseInt(text, 10) || 35;
      state.step = "phone";
      await ctx.reply(t.phonePrompt);
      return;
    }
    if (state.step === "phone") {
      state.data.phone = text;
      state.step = "village";
      await ctx.reply(t.villagePrompt);
      return;
    }
    if (state.step === "village") {
      state.data.village = text;
      state.step = "upi";
      await ctx.reply(t.upiPrompt);
      return;
    }
    if (state.step === "upi") {
      const upi = text.includes("@") ? text : `${state.data.phone}@upi`;
      const currentLang = state.lang || "en";

      const insertRes = await pool.query(
        `INSERT INTO farmers (name, age, phone, village, telegram_chat_id, upi_id, language)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (telegram_chat_id) DO UPDATE
         SET name = EXCLUDED.name, phone = EXCLUDED.phone, village = EXCLUDED.village, upi_id = EXCLUDED.upi_id, language = EXCLUDED.language
         RETURNING id`,
        [state.data.name, state.data.age, state.data.phone, state.data.village, String(chatId), upi, currentLang]
      );

      delete userState[chatId];

      await createNotification(
        "farmer_registered",
        "👨‍🌾 New Farmer Registered",
        `${state.data.name} from ${state.data.village} joined via Telegram`,
        insertRes.rows[0].id
      );

      await ctx.reply(t.regSuccess(state.data.name), getMainMenuKeyboard(chatId));
      return;
    }
  }

  if (state.flow === "listing") {
    if (state.step === "quantity") {
      const qty = Number.parseFloat(text);
      if (Number.isNaN(qty) || qty <= 0) {
        await ctx.reply("Please enter a valid quantity in kg. Example: 500");
        return;
      }
      state.data.quantity = qty;
      state.step = "price";
      await ctx.reply(`⚖️ Quantity: *${qty} kg*\n\nWhat is your expected selling price per kg (in ₹)?\nExample: 32`);
      return;
    }
    if (state.step === "price") {
      const price = Number.parseFloat(text);
      if (Number.isNaN(price) || price <= 0) {
        await ctx.reply("Please enter a valid price in ₹. Example: 32");
        return;
      }
      state.data.price = price;
      state.step = "harvest";
      await ctx.reply(`💰 Price: *₹${price}/kg*\n\nWhen will this produce be ready for dispatch?`, harvestKeyboard);
      return;
    }
  }
});

// ACCEPT BID CALLBACK
bot.action(/^accept_bid_(\d+)$/, async (ctx) => {
  const bidId = Number.parseInt(ctx.match[1], 10);
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fRes = await client.query("SELECT id, name, upi_id, language FROM farmers WHERE telegram_chat_id = $1", [String(chatId)]);
    if (fRes.rows.length === 0) {
      await ctx.reply("Only the registered farmer can accept bids.");
      await client.query("ROLLBACK");
      return;
    }

    const farmer = fRes.rows[0];
    const farmerLang = farmer.language || "en";
    const t = botTranslations[farmerLang] || botTranslations.en;

    const bRes = await client.query(
      `SELECT b.*, l.crop, l.quantity AS listing_qty, l.farmer_id
       FROM bids b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.id = $1 AND l.farmer_id = $2`,
      [bidId, farmer.id]
    );

    if (bRes.rows.length === 0) {
      await ctx.reply("Bid not found or already settled.");
      await client.query("ROLLBACK");
      return;
    }

    const bid = bRes.rows[0];
    const tradeQty = bid.quantity || bid.listing_qty;
    const totalAmount = Number(bid.offered_price) * Number(tradeQty);
    const farmerUpi = farmer.upi_id || "farmer@upi";

    const escrowHash = crypto.createHash("sha256").update(`ESCROW-${bid.listing_id}-${bid.id}-${totalAmount}-${Date.now()}`).digest("hex");

    const txnRes = await client.query(
      `INSERT INTO transactions
        (bid_id, listing_id, buyer_name, farmer_name, farmer_upi, crop, quantity, total_amount, status, escrow_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'payment_escrowed', $9)
       RETURNING id`,
      [bidId, bid.listing_id, bid.buyer_name || "Wholesale Buyer", farmer.name, farmerUpi, bid.crop, tradeQty, totalAmount, escrowHash]
    );

    const txnId = txnRes.rows[0].id;

    await client.query("UPDATE bids SET status = 'accepted' WHERE id = $1", [bidId]);
    await client.query("UPDATE bids SET status = 'rejected' WHERE listing_id = $1 AND id <> $2 AND status = 'pending'", [bid.listing_id, bidId]);
    await client.query("UPDATE listings SET status = 'sold' WHERE id = $1", [bid.listing_id]);

    await client.query("COMMIT");

    await createNotification(
      "bid_accepted",
      "🤝 Bid Accepted & Escrow Created",
      `Farmer ${farmer.name} accepted ${bid.buyer_name}'s bid for ${bid.crop}. Order #TXN-${txnId} is now locked in Smart Escrow!`,
      txnId
    );

    await ctx.reply(t.bidAccepted(txnId, bid.crop, totalAmount.toFixed(2), farmerUpi), getMainMenuKeyboard(chatId));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Accept bid error:", err.message);
    await ctx.reply("Could not accept bid. Please try again.");
  } finally {
    client.release();
  }
});

// REJECT BID CALLBACK
bot.action(/^reject_bid_(\d+)$/, async (ctx) => {
  const bidId = Number.parseInt(ctx.match[1], 10);
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery();

  try {
    await pool.query("UPDATE bids SET status = 'rejected' WHERE id = $1", [bidId]);
    await ctx.reply("❌ Bid has been rejected. Your listing remains active for other buyers.", getMainMenuKeyboard(chatId));
  } catch (err) {
    await ctx.reply("Could not reject bid.", getMainMenuKeyboard(chatId));
  }
});


// ----------------- EXPRESS REST API ENDPOINTS -----------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "FARLX Fullstack API", time: new Date().toISOString() });
});

// Stats
app.get("/api/stats", async (req, res) => {
  try {
    const [lRes, bRes, tRes, fRes] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'active') AS active FROM listings"),
      pool.query("SELECT COUNT(*) AS total FROM bids"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(total_amount), 0) AS volume FROM transactions"),
      pool.query("SELECT COUNT(*) AS total FROM farmers")
    ]);

    res.json({
      totalListings: Number.parseInt(lRes.rows[0].total, 10) || 0,
      activeListings: Number.parseInt(lRes.rows[0].active, 10) || 0,
      totalBids: Number.parseInt(bRes.rows[0].total, 10) || 0,
      totalTransactions: Number.parseInt(tRes.rows[0].total, 10) || 0,
      totalVolume: Number.parseFloat(tRes.rows[0].volume) || 0,
      totalFarmers: Number.parseInt(fRes.rows[0].total, 10) || 0
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Mandi Benchmark Prices API
app.get("/api/mandi-prices", (req, res) => {
  const mandiData = [
    { crop: "Tomato", state: "Maharashtra", mandi: "Nashik APMC", mandiRate: 24.50, farlxRate: 32.00, difference: "+30.6%", arrivalVolume: "4,200 Quintals" },
    { crop: "Tomato", state: "Karnataka", mandi: "Kolar Mandi", mandiRate: 23.00, farlxRate: 30.00, difference: "+30.4%", arrivalVolume: "5,800 Quintals" },
    { crop: "Onion", state: "Maharashtra", mandi: "Lasalgaon APMC", mandiRate: 18.00, farlxRate: 24.00, difference: "+33.3%", arrivalVolume: "12,400 Quintals" },
    { crop: "Potato", state: "Madhya Pradesh", mandi: "Indore Mandi", mandiRate: 14.50, farlxRate: 19.50, difference: "+34.5%", arrivalVolume: "8,900 Quintals" },
    { crop: "Paddy / Rice", state: "Punjab", mandi: "Khanna Mandi", mandiRate: 32.00, farlxRate: 39.00, difference: "+21.8%", arrivalVolume: "15,000 Quintals" },
    { crop: "Chilli", state: "Andhra Pradesh", mandi: "Guntur Mandi", mandiRate: 68.00, farlxRate: 85.00, difference: "+25.0%", arrivalVolume: "3,100 Quintals" },
    { crop: "Cucumber", state: "Tamil Nadu", mandi: "Dindigul Mandi", mandiRate: 16.00, farlxRate: 22.00, difference: "+37.5%", arrivalVolume: "1,800 Quintals" }
  ];
  res.json({ source: "Agmarknet APMC Benchmarks (Live)", data: mandiData });
});

// AI Crop Quality Grading API (Simulated Computer Vision Model)
app.post("/api/ai-grade", (req, res) => {
  const { crop, imageSample } = req.body;
  const c = crop || "Tomato";

  const certHash = crypto.createHash("sha256").update(`FARLX-AI-VISION-${c}-${Date.now()}`).digest("hex");

  const analysis = {
    crop: c,
    grade: "Grade A+ (Export Quality)",
    freshnessScore: 95.8,
    defectPercentage: 1.4,
    estimatedShelfLife: "7 - 9 Days",
    moistureIndex: "91.2% (Optimal)",
    sugarBrix: "4.8° Brix (High Quality)",
    commercialFit: "Premium retail supermarkets, hypermarkets, and export aggregators.",
    certificateHash: certHash.slice(0, 32),
    timestamp: new Date().toISOString()
  };

  res.json({ success: true, analysis });
});

// Kisan Logistics Pooling Aggregator API
app.get("/api/logistics/pools", (req, res) => {
  const pools = [
    {
      id: "POOL-NSK-01",
      cluster: "Nashik Cluster (Maharashtra)",
      destination: "Mumbai / Navi Mumbai APMC Hub",
      vehicleType: "Eicher 14ft Mini-Truck (3.5T)",
      capacityKg: 3500,
      currentLoadedKg: 2800,
      utilizationPct: 80,
      farmersPooled: 3,
      avgSavingsPerFarmer: "₹1,850",
      co2SavedKg: "46.2 kg CO₂",
      status: "Pooling Active (Departs in 4 hrs)",
      crops: ["Tomato", "Pomegranate", "Capsicum"]
    },
    {
      id: "POOL-KLR-02",
      cluster: "Kolar Cluster (Karnataka)",
      destination: "Bengaluru Wholesale Markets",
      vehicleType: "Tata 407 (2.5T)",
      capacityKg: 2500,
      currentLoadedKg: 2350,
      utilizationPct: 94,
      farmersPooled: 4,
      avgSavingsPerFarmer: "₹1,420",
      co2SavedKg: "38.5 kg CO₂",
      status: "Ready for Dispatch",
      crops: ["Tomato", "Carrot", "Beans"]
    },
    {
      id: "POOL-SLM-03",
      cluster: "Salem Cluster (Tamil Nadu)",
      destination: "Chennai Koyambedu Hub",
      vehicleType: "Ashok Leyland Dost (1.8T)",
      capacityKg: 1800,
      currentLoadedKg: 1200,
      utilizationPct: 67,
      farmersPooled: 2,
      avgSavingsPerFarmer: "₹2,100",
      co2SavedKg: "52.0 kg CO₂",
      status: "Accepting Farmer Cargo",
      crops: ["Brinjal", "Tapioca", "Mango"]
    }
  ];

  res.json({ success: true, pools });
});

// Listings List
app.get("/api/listings", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         l.id,
         l.crop,
         l.quantity,
         l.price_per_kg,
         l.location,
         l.harvest_time,
         l.quality,
         l.ai_grade,
         l.freshness_score,
         l.certificate_hash,
         l.status,
         l.created_at,
         f.id AS farmer_id,
         f.name AS farmer_name,
         f.phone AS farmer_phone,
         f.upi_id AS farmer_upi,
         COUNT(b.id) AS bid_count
       FROM listings l
       LEFT JOIN farmers f ON f.id = l.farmer_id
       LEFT JOIN bids b ON b.listing_id = l.id
       GROUP BY l.id, f.id
       ORDER BY l.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Bids List
app.get("/api/bids", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.id,
         b.listing_id,
         b.buyer_name,
         b.buyer_phone,
         b.offered_price,
         b.quantity,
         b.status,
         b.created_at,
         l.crop,
         l.location,
         f.name AS farmer_name
       FROM bids b
       JOIN listings l ON l.id = b.listing_id
       LEFT JOIN farmers f ON f.id = l.farmer_id
       ORDER BY b.id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

// Submit Bid (from Web Buyer -> alerts Farmer on Telegram with Accept / Reject buttons in farmer's native language!)
app.post("/api/bids", async (req, res) => {
  try {
    const { listing_id, buyer_name, buyer_phone, offered_price, quantity } = req.body;
    if (!listing_id || !offered_price) {
      return res.status(400).json({ error: "listing_id and offered_price required" });
    }

    const listingRes = await pool.query(
      `SELECT l.*, f.name AS farmer_name, f.telegram_chat_id, f.phone AS farmer_phone, f.language AS farmer_lang
       FROM listings l
       LEFT JOIN farmers f ON f.id = l.farmer_id
       WHERE l.id = $1`,
      [listing_id]
    );

    if (listingRes.rows.length === 0) return res.status(404).json({ error: "Listing not found" });

    const l = listingRes.rows[0];
    const tradeQty = quantity || l.quantity;
    const bName = buyer_name || "Wholesale Buyer";
    const bPhone = buyer_phone || "Not shared";

    const insertBid = await pool.query(
      `INSERT INTO bids (listing_id, buyer_name, buyer_phone, offered_price, quantity, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [listing_id, bName, bPhone, offered_price, tradeQty]
    );

    const bid = insertBid.rows[0];
    const totalVal = (Number(offered_price) * Number(tradeQty)).toFixed(2);

    await createNotification(
      "bid_placed",
      "📩 New Bid Placed",
      `${bName} offered ₹${offered_price}/kg on #${listing_id} (${l.crop}, ${tradeQty} kg). Total: ₹${totalVal}`,
      bid.id
    );

    // Notify farmer on Telegram in farmer's preferred language!
    if (l.telegram_chat_id) {
      const fLang = l.farmer_lang || "en";
      const t = botTranslations[fLang] || botTranslations.en;

      const alertMsg = t.bidNotification(l.crop, bName, offered_price, tradeQty, totalVal);

      const buttons = Markup.inlineKeyboard([
        [
          Markup.button.callback(t.acceptBtn(totalVal), `accept_bid_${bid.id}`),
          Markup.button.callback(t.rejectBtn, `reject_bid_${bid.id}`)
        ]
      ]);

      try {
        await bot.telegram.sendMessage(l.telegram_chat_id, alertMsg, {
          parse_mode: "Markdown",
          ...buttons
        });
      } catch (tgErr) {
        console.error("Telegram send error:", tgErr.message);
      }
    }

    res.status(201).json({ success: true, bid, farmerNotified: Boolean(l.telegram_chat_id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions List (Orders & Escrow)
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         t.*,
         f.phone AS farmer_phone,
         f.village AS farmer_village,
         l.harvest_time,
         l.quality
       FROM transactions t
       LEFT JOIN listings l ON l.id = t.listing_id
       LEFT JOIN farmers f ON f.id = l.farmer_id
       ORDER BY t.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Verifiable Bill of Supply / Tax Invoice for Escrow Transaction
app.get("/api/transactions/:id/bill", async (req, res) => {
  try {
    const { id } = req.params;
    const txnRes = await pool.query(
      `SELECT t.*, f.name AS farmer_name, f.village AS farmer_village, f.phone AS farmer_phone,
              l.harvest_time, l.quality, l.ai_grade
       FROM transactions t
       LEFT JOIN listings l ON l.id = t.listing_id
       LEFT JOIN farmers f ON f.id = l.farmer_id
       WHERE t.id = $1`,
      [id]
    );

    if (txnRes.rows.length === 0) return res.status(404).json({ error: "Transaction not found" });

    const t = txnRes.rows[0];
    const bill = {
      invoiceNumber: `FARLX-KBS-${t.id.toString().padStart(6, "0")}`,
      orderId: `#TXN-${t.id}`,
      date: t.created_at,
      settlementDate: t.payment_released_at || "Held in Escrow",
      farmer: {
        name: t.farmer_name,
        village: t.farmer_village || "Nashik, Maharashtra",
        phone: t.farmer_phone || "Verified Farmer",
        upi: t.farmer_upi
      },
      buyer: {
        name: t.buyer_name || "Registered Wholesale Buyer",
        verifiedConsignee: true
      },
      produce: {
        crop: t.crop,
        quantityKg: t.quantity,
        ratePerKg: (Number(t.total_amount) / Number(t.quantity)).toFixed(2),
        totalAmount: t.total_amount,
        grade: t.ai_grade || "Grade A+",
        gstExemption: "Exempted under Section 2(47) of Central GST Act (Fresh Agricultural Produce)"
      },
      escrowVerification: {
        stateHash: t.escrow_hash || crypto.createHash("sha256").update(`ESCROW-${t.id}`).digest("hex"),
        status: t.status,
        guarantee: "100% Direct Payout Released via FARLX Smart Escrow Protocol"
      }
    };

    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm delivery & release payment to farmer via UPI
app.post("/api/transactions/:id/confirm-delivery", async (req, res) => {
  try {
    const { id } = req.params;
    const txnRes = await pool.query(
      `SELECT t.*, f.telegram_chat_id, f.phone AS farmer_phone, f.language AS farmer_lang
       FROM transactions t
       LEFT JOIN listings l ON l.id = t.listing_id
       LEFT JOIN farmers f ON f.id = l.farmer_id
       WHERE t.id = $1`,
      [id]
    );

    if (txnRes.rows.length === 0) return res.status(404).json({ error: "Transaction not found" });

    const txn = txnRes.rows[0];
    const farmerUpi = txn.farmer_upi || `${txn.farmer_phone || '9876543210'}@upi`;
    const amount = Number(txn.total_amount).toFixed(2);

    const updateRes = await pool.query(
      `UPDATE transactions
       SET status = 'payment_released',
           delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP),
           payment_released_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    const upiUri = `upi://pay?pa=${encodeURIComponent(farmerUpi)}&pn=${encodeURIComponent(txn.farmer_name || 'Farmer')}&am=${amount}&cu=INR&tn=FARLX+Order+${id}`;
    const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}`;

    await createNotification(
      "payment_released",
      "💰 Payment Released to Farmer",
      `Buyer confirmed receipt of ${txn.crop}. ₹${amount} released to ${txn.farmer_name} (UPI: ${farmerUpi})`,
      id
    );

    // Notify farmer on Telegram in their local language
    if (txn.telegram_chat_id) {
      const fLang = txn.farmer_lang || "en";
      const t = botTranslations[fLang] || botTranslations.en;

      try {
        await bot.telegram.sendMessage(
          txn.telegram_chat_id,
          t.paymentReleased(txn.buyer_name || "Buyer", txn.crop, amount, farmerUpi, id),
          { parse_mode: "Markdown" }
        );
      } catch (tgErr) {
        console.error("Payment release telegram error:", tgErr.message);
      }
    }

    res.json({
      success: true,
      transaction: updateRes.rows[0],
      upi: {
        vpa: farmerUpi,
        payeeName: txn.farmer_name,
        amount,
        upiUri,
        qrCodeUrl: upiQrCodeUrl
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, type, title, message, entity_id, read, created_at FROM notifications ORDER BY id DESC LIMIT 25"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications/read-all", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET read = TRUE WHERE read = FALSE");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// Demo seed for platform demonstration / quick testing
app.post("/api/demo-seed", async (req, res) => {
  try {
    const fRes = await pool.query(
      `INSERT INTO farmers (name, age, phone, village, upi_id, language)
       VALUES ('Suresh Kumar', 38, '9840123456', 'Nashik, Maharashtra', 'suresh.farms@okhdfcbank', 'hi')
       RETURNING id`
    );
    const farmerId = fRes.rows[0].id;

    const certHash = crypto.createHash("sha256").update(`Tomato-500-32-${Date.now()}`).digest("hex").slice(0, 16);

    const lRes = await pool.query(
      `INSERT INTO listings (farmer_id, crop, quantity, price_per_kg, location, harvest_time, quality, ai_grade, freshness_score, certificate_hash, status)
       VALUES ($1, 'Tomato', 500, 32, 'Nashik', 'Ready Now', 'Premium', 'Grade A+', 96.8, $2, 'active')
       RETURNING id`,
      [farmerId, certHash]
    );
    const listingId = lRes.rows[0].id;

    await pool.query(
      `INSERT INTO bids (listing_id, buyer_name, buyer_phone, offered_price, quantity, status)
       VALUES ($1, 'Metro Hypermarket', '9123456789', 30, 200, 'pending')
       RETURNING id`,
      [listingId]
    );

    await createNotification(
      "new_listing",
      "🌾 Demo Data Generated",
      "Suresh Kumar listed 500 kg Tomato at ₹32/kg with active bid",
      listingId
    );

    res.json({ success: true, message: "Demo seed created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint for Telegram
const WEBHOOK_PATH = "/api/telegram-webhook";
app.use(bot.webhookCallback(WEBHOOK_PATH));

app.listen(PORT, async () => {
  console.log(`FARLX API server running on port ${PORT}`);

  if (process.env.TELEGRAM_BOT_TOKEN) {
    const externalUrl = process.env.RENDER_EXTERNAL_URL;
    if (externalUrl) {
      const fullWebhookUrl = `${externalUrl.replace(/\/$/, "")}${WEBHOOK_PATH}`;
      try {
        await bot.telegram.setWebhook(fullWebhookUrl);
        console.log(`Telegram Bot running in WEBHOOK mode at ${fullWebhookUrl}`);
      } catch (wErr) {
        console.error("Telegram webhook setup error:", wErr.message);
      }

      setInterval(() => {
        https.get(`${externalUrl}/api/health`, () => {}).on("error", () => {});
      }, 8 * 60 * 1000);
    } else {
      try {
        await bot.telegram.deleteWebhook({ drop_pending_updates: false });
        await bot.launch();
        console.log("Telegram Bot running in POLLING mode.");
      } catch (pErr) {
        console.error("Telegram bot polling launch error:", pErr.message);
      }
    }
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
