require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");
const { Pool } = require("pg");
const https = require("https");

const app = express();
app.use(express.json());
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS age INTEGER;
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255);

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

// In-memory conversation state for Telegram bot
const userState = {};

const mainMenuKeyboard = Markup.keyboard([
  ["Register", "Create Listing"],
  ["My Listings", "View All Listings"]
]).resize();

const cropKeyboard = Markup.inlineKeyboard([
  [
    { text: "🍅 Tomato", callback_data: "crop_Tomato" },
    { text: "🧅 Onion", callback_data: "crop_Onion" }
  ],
  [
    { text: "🌾 Paddy", callback_data: "crop_Paddy" },
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
    { text: "🍆 Brinjal", callback_data: "crop_Brinjal" },
    { text: "🥕 Carrot", callback_data: "crop_Carrot" }
  ],
  [
    { text: "🍌 Banana", callback_data: "crop_Banana" },
    { text: "🍇 Grapes", callback_data: "crop_Grapes" }
  ],
  [
    { text: "🥭 Mango", callback_data: "crop_Mango" },
    { text: "🍉 Watermelon", callback_data: "crop_Watermelon" }
  ],
  [
    { text: "🌿 Other Crop", callback_data: "crop_Other" }
  ]
]);

const harvestKeyboard = Markup.inlineKeyboard([
  [{ text: "✅ Ready Now", callback_data: "harvest_Ready_Now" }],
  [
    { text: "🕒 1 Week", callback_data: "harvest_1_Week" },
    { text: "🕒 2 Weeks", callback_data: "harvest_2_Weeks" }
  ],
  [{ text: "🗓️ Other", callback_data: "harvest_Other" }]
]);

const qualityKeyboard = Markup.inlineKeyboard([
  [
    { text: "⭐ Premium (Grade A+)", callback_data: "quality_Premium" },
    { text: "🟡 Average (Grade B)", callback_data: "quality_Average" }
  ]
]);

async function sendMainMenu(ctx, chatId) {
  try {
    const farmerResult = await pool.query(
      "SELECT id, name, village, upi_id FROM farmers WHERE telegram_chat_id = $1",
      [String(chatId)]
    );

    if (farmerResult.rows.length > 0) {
      const f = farmerResult.rows[0];
      await ctx.reply(
        `Hi ${f.name}! 👨‍🌾\nVillage: ${f.village || "Not set"}\nUPI: ${f.upi_id || "Not set"}\n\nChoose an option below:`,
        mainMenuKeyboard
      );
    } else {
      await ctx.reply(
        "Hi! 👋 Welcome to FARLX - Farm-to-Buyer Direct Marketplace.\n\nTap Register below to create your farmer profile and start selling directly to wholesale buyers!",
        mainMenuKeyboard
      );
    }
  } catch (error) {
    console.error("Send menu error:", error.message);
    await ctx.reply("Welcome to FARLX! Please tap Register to get started.", mainMenuKeyboard);
  }
}

async function showBidsForListing(ctx, listingId) {
  try {
    const bidsResult = await pool.query(
      `SELECT
         b.id,
         b.listing_id,
         b.buyer_name,
         b.buyer_phone,
         b.offered_price,
         b.quantity,
         b.status,
         b.created_at,
         l.crop
       FROM bids b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.listing_id = $1
       ORDER BY b.created_at DESC`,
      [listingId]
    );

    if (bidsResult.rows.length === 0) {
      await ctx.reply(`📩 No bids received for Listing #${listingId} yet.`);
      return;
    }

    for (const bid of bidsResult.rows) {
      const statusLabel =
        bid.status === "accepted"
          ? "✅ Accepted"
          : bid.status === "rejected"
            ? "❌ Rejected"
            : "⏳ Pending Review";

      const totalVal = (Number(bid.offered_price) * Number(bid.quantity || 1)).toFixed(2);

      let msg =
        `📩 *Bid #${bid.id} for Listing #${listingId} (${bid.crop})*\n\n` +
        `👤 Buyer: ${bid.buyer_name || "Unknown"}\n` +
        `📞 Phone: ${bid.buyer_phone || "Not provided"}\n` +
        `⚖️ Quantity: ${bid.quantity || "Full listing"} kg\n` +
        `💰 Offer: ₹${bid.offered_price}/kg\n` +
        `💵 Total: ₹${totalVal}\n` +
        `Status: ${statusLabel}`;

      if (bid.status === "pending") {
        await ctx.reply(
          msg,
          Markup.inlineKeyboard([
            [
              Markup.button.callback(`✅ Accept Bid #${bid.id}`, `accept_bid_${bid.id}`),
              Markup.button.callback(`❌ Reject`, `reject_bid_${bid.id}`)
            ]
          ])
        );
      } else {
        await ctx.reply(msg);
      }
    }
  } catch (error) {
    console.error("Show bids error:", error.message);
    await ctx.reply("Failed to load bids. Please try again.");
  }
}

async function publishListing(ctx, chatId) {
  const state = userState[chatId];

  if (!state || state.flow !== "listing") {
    await ctx.reply("Listing session expired. Tap Create Listing and try again.");
    return;
  }

  const farmerResult = await pool.query(
    "SELECT id, name, village FROM farmers WHERE telegram_chat_id = $1",
    [String(chatId)]
  );

  if (farmerResult.rows.length === 0) {
    delete userState[chatId];
    await ctx.reply("Please register as a farmer first.", mainMenuKeyboard);
    return;
  }

  const farmerId = farmerResult.rows[0].id;
  const farmerName = farmerResult.rows[0].name;
  const location = farmerResult.rows[0].village || "Unknown";

  const {
    crop,
    quantity,
    price,
    harvest_time: harvestTime,
    quality
  } = state.data;

  const result = await pool.query(
    `INSERT INTO listings
      (farmer_id, crop, quantity, price_per_kg, location, harvest_time, quality, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      farmerId,
      crop,
      quantity,
      price,
      location,
      harvestTime,
      quality,
      "active"
    ]
  );

  const listingId = result.rows[0].id;

  delete userState[chatId];

  await createNotification(
    "new_listing",
    "🌾 New Crop Listed",
    `${farmerName} listed ${quantity} kg of ${crop} at ₹${price}/kg (${location})`,
    listingId
  );

  await ctx.reply(
    `✅ *Listing Published Live on FARLX!* \n\n` +
      `📦 *Listing ID:* #${listingId}\n` +
      `🌾 *Crop:* ${crop}\n` +
      `⚖️ *Quantity:* ${quantity} kg\n` +
      `💰 *Price:* ₹${price}/kg\n` +
      `📍 *Location:* ${location}\n` +
      `🕒 *Harvest:* ${harvestTime}\n` +
      `⭐ *Quality:* ${quality}\n\n` +
      `Buyers on the FARLX Web Marketplace can now view your listing and submit bids! You will receive instant notifications here when bids arrive.`,
    mainMenuKeyboard
  );
}

// ----------------- TELEGRAM BOT COMMANDS & HANDLERS -----------------

bot.command("start", async (ctx) => {
  await sendMainMenu(ctx, ctx.chat.id);
});

bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();

  const menuButtons = [
    "Register",
    "Create Listing",
    "My Listings",
    "View All Listings"
  ];

  // Register
  if (text === "Register") {
    try {
      const farmerResult = await pool.query(
        "SELECT id, name, village, upi_id FROM farmers WHERE telegram_chat_id = $1",
        [String(chatId)]
      );

      if (farmerResult.rows.length > 0) {
        const farmer = farmerResult.rows[0];
        await ctx.reply(
          `✅ You are already registered as a farmer!\n\n` +
            `Farmer ID: #${farmer.id}\n` +
            `Name: ${farmer.name}\n` +
            `Village: ${farmer.village || "Not set"}\n` +
            `UPI ID: ${farmer.upi_id || "Not set"}\n\n` +
            `Tap "Create Listing" to put your crop up for sale.`,
          mainMenuKeyboard
        );
        return;
      }

      userState[chatId] = {
        flow: "register",
        step: "name",
        data: {}
      };

      await ctx.reply(
        "🌾 *Farmer Registration*\n\nWhat is your full name?\nExample: Ramesh Patel"
      );
    } catch (error) {
      console.error("Register start error:", error.message);
      await ctx.reply("Registration could not start. Please try again.");
    }
    return;
  }

  // Create Listing
  if (text === "Create Listing") {
    try {
      const farmerResult = await pool.query(
        "SELECT id FROM farmers WHERE telegram_chat_id = $1",
        [String(chatId)]
      );

      if (farmerResult.rows.length === 0) {
        await ctx.reply(
          "Please register first! Tap Register below to set up your profile.",
          mainMenuKeyboard
        );
        return;
      }

      userState[chatId] = {
        flow: "listing",
        step: "crop",
        data: {}
      };

      await ctx.reply(
        "🌾 *Create a Crop Listing*\n\nSelect your crop from the list below:",
        cropKeyboard
      );
    } catch (error) {
      console.error("Create listing start error:", error.message);
      await ctx.reply("Could not start listing. Please try again.", mainMenuKeyboard);
    }
    return;
  }

  // My Listings
  if (text === "My Listings") {
    try {
      const farmerResult = await pool.query(
        "SELECT id FROM farmers WHERE telegram_chat_id = $1",
        [String(chatId)]
      );

      if (farmerResult.rows.length === 0) {
        await ctx.reply("Please register as a farmer first.", mainMenuKeyboard);
        return;
      }

      const farmerId = farmerResult.rows[0].id;

      const listingsResult = await pool.query(
        `SELECT
           l.id,
           l.crop,
           l.quantity,
           l.price_per_kg,
           l.location,
           l.harvest_time,
           l.quality,
           l.status,
           l.created_at,
           COUNT(b.id) AS bid_count
         FROM listings l
         LEFT JOIN bids b ON b.listing_id = l.id
         WHERE l.farmer_id = $1
         GROUP BY
           l.id,
           l.crop,
           l.quantity,
           l.price_per_kg,
           l.location,
           l.harvest_time,
           l.quality,
           l.status,
           l.created_at
         ORDER BY l.created_at DESC`,
        [farmerId]
      );

      if (listingsResult.rows.length === 0) {
        await ctx.reply("📦 You have no listings yet. Tap Create Listing to add one!", mainMenuKeyboard);
        return;
      }

      let message = "📦 *Your Listings*\n\n";
      const bidButtons = [];

      for (const listing of listingsResult.rows) {
        message +=
          `*#${listing.id} ${listing.crop}*\n` +
          `⚖️ Quantity: ${listing.quantity} kg | 💰 ₹${listing.price_per_kg}/kg\n` +
          `📍 Location: ${listing.location}\n` +
          `Status: ${listing.status === "sold" ? "🔴 Sold" : "🟢 Active"}\n` +
          `📩 Bids: ${listing.bid_count}\n\n`;

        if (Number(listing.bid_count) > 0) {
          bidButtons.push([
            {
              text: `📩 View ${listing.bid_count} Bid(s) on #${listing.id}`,
              callback_data: `view_bids_${listing.id}`
            }
          ]);
        }
      }

      if (bidButtons.length > 0) {
        await ctx.reply(message, Markup.inlineKeyboard(bidButtons));
      } else {
        await ctx.reply(message, mainMenuKeyboard);
      }
    } catch (error) {
      console.error("My listings error:", error.message);
      await ctx.reply("Failed to load your listings.", mainMenuKeyboard);
    }
    return;
  }

  // View All Listings
  if (text === "View All Listings") {
    try {
      const listingsResult = await pool.query(
        `SELECT
           l.id,
           l.crop,
           l.quantity,
           l.price_per_kg,
           l.location,
           f.name AS farmer_name
         FROM listings l
         JOIN farmers f ON f.id = l.farmer_id
         WHERE COALESCE(l.status, 'active') = 'active'
         ORDER BY l.created_at DESC
         LIMIT 10`
      );

      if (listingsResult.rows.length === 0) {
        await ctx.reply("🌾 No active listings are available yet.", mainMenuKeyboard);
        return;
      }

      let message = "🌾 *Recent Live Marketplace Listings*\n\n";

      for (const listing of listingsResult.rows) {
        message +=
          `#${listing.id} *${listing.crop}*\n` +
          `⚖️ ${listing.quantity} kg @ ₹${listing.price_per_kg}/kg\n` +
          `📍 ${listing.location} (Farmer: ${listing.farmer_name})\n\n`;
      }

      await ctx.reply(message, mainMenuKeyboard);
    } catch (error) {
      console.error("View all listings error:", error.message);
      await ctx.reply("Failed to load all listings.", mainMenuKeyboard);
    }
    return;
  }

  const state = userState[chatId];

  if (!state) {
    if (!menuButtons.includes(text)) {
      await sendMainMenu(ctx, chatId);
    }
    return;
  }

  try {
    // Registration steps
    if (state.flow === "register") {
      if (state.step === "name") {
        if (text.length < 2) {
          await ctx.reply("Please enter a valid name.");
          return;
        }

        state.data.name = text;
        state.step = "age";
        await ctx.reply("What is your age?\nExample: 35");
        return;
      }

      if (state.step === "age") {
        const age = Number.parseInt(text, 10);
        state.data.age = Number.isInteger(age) && age >= 18 ? age : 30;
        state.step = "phone";
        await ctx.reply("What is your mobile number?\nExample: 9876543210");
        return;
      }

      if (state.step === "phone") {
        const phone = text.replace(/\s+/g, "");
        state.data.phone = phone;
        state.step = "village";
        await ctx.reply("What is your village or district name?\nExample: Nashik, Maharashtra");
        return;
      }

      if (state.step === "village") {
        state.data.village = text;
        state.step = "upi";
        await ctx.reply(
          "💳 *Payment Details (UPI / QR)*\n\n" +
          "Enter your UPI ID to receive direct payments from buyers when crops are delivered:\n" +
          "Example: 9876543210@upi or ramesh@okaxis\n\n" +
          "(Or send *skip* to use phone@upi)"
        );
        return;
      }

      if (state.step === "upi") {
        const upi = text.toLowerCase() === "skip" ? `${state.data.phone}@upi` : text;
        state.data.upi_id = upi;

        const { name, age, phone, village, upi_id } = state.data;

        const insertResult = await pool.query(
          `INSERT INTO farmers
            (name, age, phone, village, upi_id, telegram_chat_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (telegram_chat_id) DO UPDATE
             SET name = EXCLUDED.name,
                 phone = EXCLUDED.phone,
                 village = EXCLUDED.village,
                 upi_id = EXCLUDED.upi_id
           RETURNING id`,
          [name, age, phone, village, upi_id, String(chatId)]
        );

        const farmerId = insertResult.rows[0].id;
        delete userState[chatId];

        await createNotification(
          "farmer_registered",
          "👨‍🌾 New Farmer Registered",
          `${name} from ${village} joined FARLX with UPI ID ${upi_id}`,
          farmerId
        );

        await ctx.reply(
          `🎉 *Farmer Registration Complete!*\n\n` +
            `Farmer ID: #${farmerId}\n` +
            `Name: ${name}\n` +
            `Village: ${village}\n` +
            `Phone: ${phone}\n` +
            `UPI ID: ${upi_id}\n\n` +
            `You are now connected to the FARLX Web Marketplace. Tap *Create Listing* to list your first crop!`,
          mainMenuKeyboard
        );
        return;
      }
    }

    // Listing steps
    if (state.flow === "listing") {
      if (state.step === "crop_other") {
        state.data.crop = text;
        state.step = "quantity";
        await ctx.reply(`Crop selected: ${text}\n\nEnter quantity in kg.\nExample: 250`);
        return;
      }

      if (state.step === "quantity") {
        const quantity = Number.parseFloat(text);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          await ctx.reply("Please enter a valid quantity in kg.\nExample: 250");
          return;
        }

        state.data.quantity = quantity;
        state.step = "price";
        await ctx.reply("Enter your expected price per kg in ₹.\nExample: 42");
        return;
      }

      if (state.step === "price") {
        const price = Number.parseFloat(text);
        if (!Number.isFinite(price) || price <= 0) {
          await ctx.reply("Please enter a valid price in ₹/kg.\nExample: 42");
          return;
        }

        state.data.price = price;
        state.step = "harvest";
        await ctx.reply("Select harvest availability:", harvestKeyboard);
        return;
      }

      if (state.step === "harvest_other") {
        state.data.harvest_time = text;
        state.step = "quality";
        await ctx.reply("Choose the crop quality:", qualityKeyboard);
        return;
      }
    }
  } catch (error) {
    console.error("Bot text processing error:", error.message);
    delete userState[chatId];
    await ctx.reply("Something went wrong. Please tap an option below:", mainMenuKeyboard);
  }
});

bot.action(/^crop_(.+)$/, async (ctx) => {
  const chatId = ctx.chat.id;
  const crop = ctx.match[1];
  const state = userState[chatId];

  await ctx.answerCbQuery();

  if (!state || state.flow !== "listing") {
    await ctx.reply("Session expired. Tap Create Listing to start over.", mainMenuKeyboard);
    return;
  }

  if (crop === "Other") {
    state.step = "crop_other";
    await ctx.editMessageText("Type your custom crop name:\nExample: Sugarcane");
    return;
  }

  state.data.crop = crop;
  state.step = "quantity";
  await ctx.editMessageText(`Crop selected: ${crop}\n\nEnter quantity in kg.\nExample: 250`);
});

bot.action(/^harvest_(.+)$/, async (ctx) => {
  const chatId = ctx.chat.id;
  const rawHarvest = ctx.match[1];
  const state = userState[chatId];

  await ctx.answerCbQuery();

  if (!state || state.flow !== "listing") {
    await ctx.reply("Session expired. Tap Create Listing.", mainMenuKeyboard);
    return;
  }

  if (rawHarvest === "Other") {
    state.step = "harvest_other";
    await ctx.editMessageText("Type harvest availability (e.g. 5 days):");
    return;
  }

  const harvestTime = rawHarvest.replaceAll("_", " ");
  state.data.harvest_time = harvestTime;
  state.step = "quality";
  await ctx.editMessageText("Choose crop quality rating:", qualityKeyboard);
});

bot.action(/^quality_(.+)$/, async (ctx) => {
  const chatId = ctx.chat.id;
  const quality = ctx.match[1];
  const state = userState[chatId];

  await ctx.answerCbQuery();

  if (!state || state.flow !== "listing") {
    await ctx.reply("Session expired. Tap Create Listing.", mainMenuKeyboard);
    return;
  }

  state.data.quality = quality;
  state.step = "preview";

  const { crop, quantity, price, harvest_time: harvestTime } = state.data;

  await ctx.editMessageText(
    `📋 *Listing Summary Preview*\n\n` +
      `🌾 *Crop:* ${crop}\n` +
      `⚖️ *Quantity:* ${quantity} kg\n` +
      `💰 *Price:* ₹${price}/kg\n` +
      `🕒 *Harvest:* ${harvestTime}\n` +
      `⭐ *Quality:* ${quality}\n\n` +
      `Ready to publish to the FARLX Marketplace?`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("✅ Publish Live", "confirm_publish"),
        Markup.button.callback("✏️ Start Over", "confirm_edit")
      ]
    ])
  );
});

bot.action("confirm_publish", async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery();

  try {
    await ctx.editMessageText("Publishing listing to FARLX Marketplace...");
    await publishListing(ctx, chatId);
  } catch (error) {
    console.error("Publish error:", error.message);
    delete userState[chatId];
    await ctx.reply("Could not publish listing. Please try again.", mainMenuKeyboard);
  }
});

bot.action("confirm_edit", async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.answerCbQuery();

  userState[chatId] = {
    flow: "listing",
    step: "crop",
    data: {}
  };

  await ctx.editMessageText("Select crop again:");
  await ctx.reply("🌾 Create a Crop Listing:", cropKeyboard);
});

bot.action(/^view_bids_(\d+)$/, async (ctx) => {
  const listingId = Number.parseInt(ctx.match[1], 10);
  await ctx.answerCbQuery();
  await showBidsForListing(ctx, listingId);
});

// ACCEPT BID CALLBACK
bot.action(/^accept_bid_(\d+)$/, async (ctx) => {
  const bidId = Number.parseInt(ctx.match[1], 10);
  const chatId = ctx.chat.id;
  let client;

  await ctx.answerCbQuery();

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const farmerResult = await client.query(
      "SELECT id, name, phone, upi_id FROM farmers WHERE telegram_chat_id = $1",
      [String(chatId)]
    );

    if (farmerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      await ctx.reply("Only the registered farmer can accept bids.");
      return;
    }

    const farmer = farmerResult.rows[0];

    const bidResult = await client.query(
      `SELECT
         b.id,
         b.listing_id,
         b.buyer_name,
         b.buyer_phone,
         b.offered_price,
         b.quantity AS bid_quantity,
         b.status,
         l.farmer_id,
         l.quantity AS listing_quantity,
         l.crop
       FROM bids b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.id = $1
       FOR UPDATE`,
      [bidId]
    );

    if (bidResult.rows.length === 0) {
      await client.query("ROLLBACK");
      await ctx.reply("Bid not found.");
      return;
    }

    const bid = bidResult.rows[0];

    if (bid.farmer_id !== farmer.id) {
      await client.query("ROLLBACK");
      await ctx.reply("You can only accept bids for your own listing.");
      return;
    }

    if (bid.status !== "pending") {
      await client.query("ROLLBACK");
      await ctx.reply(`This bid has already been ${bid.status}.`);
      return;
    }

    const tradeQuantity = bid.bid_quantity || bid.listing_quantity;
    const totalAmount = Number.parseFloat(bid.offered_price) * Number.parseFloat(tradeQuantity);
    const farmerUpi = farmer.upi_id || `${farmer.phone}@upi`;

    // Create escrow transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions
        (bid_id, listing_id, buyer_name, farmer_name, farmer_upi, crop, quantity, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'payment_escrowed')
       RETURNING id`,
      [
        bidId,
        bid.listing_id,
        bid.buyer_name || "Buyer",
        farmer.name,
        farmerUpi,
        bid.crop,
        tradeQuantity,
        totalAmount
      ]
    );

    const transactionId = transactionResult.rows[0].id;

    // Mark accepted
    await client.query("UPDATE bids SET status = 'accepted' WHERE id = $1", [bidId]);

    // Reject other pending bids on this listing
    await client.query(
      `UPDATE bids
       SET status = 'rejected'
       WHERE listing_id = $1 AND id <> $2 AND status = 'pending'`,
      [bid.listing_id, bidId]
    );

    // Mark listing as sold
    await client.query("UPDATE listings SET status = 'sold' WHERE id = $1", [bid.listing_id]);

    await client.query("COMMIT");

    // Notification
    await createNotification(
      "bid_accepted",
      "🤝 Bid Accepted & Escrow Created",
      `Farmer ${farmer.name} accepted ${bid.buyer_name}'s bid for ${bid.crop}. Order #TXN-${transactionId} is now in Escrow!`,
      transactionId
    );

    await ctx.reply(
      `🎉 *BID ACCEPTED! ORDER CREATED IN ESCROW*\n\n` +
        `📦 *Order ID:* #TXN-${transactionId}\n` +
        `🌾 *Crop:* ${bid.crop} (${tradeQuantity} kg)\n` +
        `👤 *Buyer:* ${bid.buyer_name || "Registered Buyer"}\n` +
        `📞 *Buyer Phone:* ${bid.buyer_phone || "Available upon dispatch"}\n` +
        `💰 *Agreed Rate:* ₹${bid.offered_price}/kg\n` +
        `💵 *Total Escrow Amount:* ₹${totalAmount.toFixed(2)}\n\n` +
        `🔒 *Escrow Status:* The payment is held in the FARLX Smart Escrow.\n\n` +
        `🚚 *Next Step:* Dispatch your crop to the buyer. When the buyer marks "Product Received" on FARLX Web, the full ₹${totalAmount.toFixed(2)} will be instantly released to your UPI (${farmerUpi})!`,
      mainMenuKeyboard
    );
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("Accept bid error:", error.message);
    await ctx.reply("Failed to accept the bid. Please try again.");
  } finally {
    if (client) client.release();
  }
});

// REJECT BID CALLBACK
bot.action(/^reject_bid_(\d+)$/, async (ctx) => {
  const bidId = Number.parseInt(ctx.match[1], 10);
  const chatId = ctx.chat.id;

  await ctx.answerCbQuery();

  try {
    const farmerResult = await pool.query(
      "SELECT id, name FROM farmers WHERE telegram_chat_id = $1",
      [String(chatId)]
    );

    if (farmerResult.rows.length === 0) {
      await ctx.reply("Only the registered farmer can reject bids.");
      return;
    }

    const bidResult = await pool.query(
      `SELECT b.id, b.offered_price, b.buyer_name, l.crop
       FROM bids b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.id = $1 AND l.farmer_id = $2`,
      [bidId, farmerResult.rows[0].id]
    );

    if (bidResult.rows.length === 0) {
      await ctx.reply("Bid not found or not authorized.");
      return;
    }

    const bid = bidResult.rows[0];

    await pool.query("UPDATE bids SET status = 'rejected' WHERE id = $1", [bidId]);

    await createNotification(
      "bid_rejected",
      "❌ Bid Rejected",
      `Farmer ${farmerResult.rows[0].name} rejected bid of ₹${bid.offered_price}/kg for ${bid.crop}`,
      bidId
    );

    await ctx.reply(
      `❌ *Bid #${bidId} Rejected*\n\n` +
        `You rejected the offer of ₹${bid.offered_price}/kg from ${bid.buyer_name} for ${bid.crop}.\n` +
        `Your listing remains active for other buyers.`,
      mainMenuKeyboard
    );
  } catch (error) {
    console.error("Reject bid error:", error.message);
    await ctx.reply("Could not reject bid. Please try again.");
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
    console.error("Stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Farmers List
app.get("/api/farmers", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, age, phone, village, upi_id, created_at
       FROM farmers
       ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Farmers API error:", error.message);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});

// Create Farmer from Web
app.post("/api/farmers", async (req, res) => {
  try {
    const { name, age, phone, village, upi_id } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const upi = upi_id || `${phone}@upi`;
    const result = await pool.query(
      `INSERT INTO farmers (name, age, phone, village, upi_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, age || 32, phone, village || "Tamil Nadu", upi]
    );

    const farmer = result.rows[0];

    await createNotification(
      "farmer_registered",
      "👨‍🌾 New Farmer Registered",
      `${name} from ${village || "Tamil Nadu"} joined FARLX`,
      farmer.id
    );

    res.status(201).json(farmer);
  } catch (err) {
    console.error("Create farmer error:", err.message);
    res.status(500).json({ error: err.message });
  }
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
    console.error("Listings API error:", error.message);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Create Listing from Web
app.post("/api/listings", async (req, res) => {
  try {
    const { farmer_id, crop, quantity, price_per_kg, location, harvest_time, quality } = req.body;

    if (!crop || !quantity || !price_per_kg) {
      return res.status(400).json({ error: "Crop, quantity, and price are required" });
    }

    let fId = farmer_id;
    if (!fId) {
      const fCheck = await pool.query("SELECT id FROM farmers LIMIT 1");
      if (fCheck.rows.length > 0) {
        fId = fCheck.rows[0].id;
      } else {
        const newF = await pool.query(
          "INSERT INTO farmers (name, phone, village, upi_id) VALUES ('Ramesh Patel', '9876543210', 'Nashik', 'ramesh@upi') RETURNING id"
        );
        fId = newF.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO listings
        (farmer_id, crop, quantity, price_per_kg, location, harvest_time, quality, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING *`,
      [fId, crop, quantity, price_per_kg, location || "Salem", harvest_time || "Ready Now", quality || "Premium"]
    );

    const listing = result.rows[0];

    await createNotification(
      "new_listing",
      "🌾 New Crop Listed",
      `New listing: ${quantity} kg of ${crop} at ₹${price_per_kg}/kg`,
      listing.id
    );

    res.status(201).json(listing);
  } catch (err) {
    console.error("Create listing API error:", err.message);
    res.status(500).json({ error: err.message });
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
    console.error("Bids API error:", error.message);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

// SUBMIT BID (From Web Buyer -> Real-Time Telegram Notification to Farmer)
app.post("/api/bids", async (req, res) => {
  try {
    const { listing_id, buyer_name, buyer_phone, offered_price, quantity } = req.body;

    if (!listing_id || !offered_price) {
      return res.status(400).json({ error: "listing_id and offered_price are required" });
    }

    // Check listing & farmer details
    const listingRes = await pool.query(
      `SELECT l.id, l.crop, l.quantity, l.price_per_kg, l.location,
              f.id AS farmer_id, f.name AS farmer_name, f.telegram_chat_id, f.phone AS farmer_phone
       FROM listings l
       LEFT JOIN farmers f ON f.id = l.farmer_id
       WHERE l.id = $1`,
      [listing_id]
    );

    if (listingRes.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listing = listingRes.rows[0];
    const tradeQty = quantity || listing.quantity;
    const bName = buyer_name || "Wholesale Buyer";
    const bPhone = buyer_phone || "Not shared";

    // Insert bid
    const insertBid = await pool.query(
      `INSERT INTO bids (listing_id, buyer_name, buyer_phone, offered_price, quantity, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [listing_id, bName, bPhone, offered_price, tradeQty]
    );

    const bid = insertBid.rows[0];
    const totalOrderVal = (Number(offered_price) * Number(tradeQty)).toFixed(2);

    // Log notification
    await createNotification(
      "bid_placed",
      "📩 New Bid Placed",
      `${bName} offered ₹${offered_price}/kg on #${listing_id} (${listing.crop}, ${tradeQty} kg). Total: ₹${totalOrderVal}`,
      bid.id
    );

    // SEND NOTIFICATION TO FARMER ON TELEGRAM WITH ACCEPT / REJECT BUTTONS!
    if (listing.telegram_chat_id) {
      const telegramMessage =
        `🔔 *NEW BID RECEIVED on FARLX!* 🌾\n\n` +
        `📦 *Listing #${listing.id}:* ${listing.crop}\n` +
        `👤 *Buyer:* ${bName}\n` +
        `📞 *Phone:* ${bPhone}\n` +
        `⚖️ *Quantity Requested:* ${tradeQty} kg\n` +
        `💰 *Offered Price:* ₹${offered_price}/kg (Listing rate: ₹${listing.price_per_kg}/kg)\n` +
        `💵 *Total Order Amount:* ₹${totalOrderVal}\n\n` +
        `Tap an option below to respond:`;

      const inlineKeyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback(`✅ Accept Offer (₹${totalOrderVal})`, `accept_bid_${bid.id}`),
          Markup.button.callback(`❌ Reject`, `reject_bid_${bid.id}`)
        ]
      ]);

      try {
        await bot.telegram.sendMessage(listing.telegram_chat_id, telegramMessage, {
          parse_mode: "Markdown",
          ...inlineKeyboard
        });
        console.log(`Telegram notification sent to farmer chat ${listing.telegram_chat_id}`);
      } catch (telegramErr) {
        console.error("Telegram send error:", telegramErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Bid placed successfully and farmer notified on Telegram!",
      bid,
      farmerNotified: Boolean(listing.telegram_chat_id)
    });
  } catch (err) {
    console.error("Place bid API error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Transactions (Orders & Escrow) List
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         t.id,
         t.bid_id,
         t.listing_id,
         t.buyer_name,
         t.farmer_name,
         t.farmer_upi,
         t.crop,
         t.quantity,
         t.total_amount,
         t.status,
         t.delivered_at,
         t.payment_released_at,
         t.created_at,
         f.phone AS farmer_phone,
         f.village AS farmer_village
       FROM transactions t
       LEFT JOIN listings l ON l.id = t.listing_id
       LEFT JOIN farmers f ON f.id = l.farmer_id
       ORDER BY t.id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Transactions API error:", error.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// CONFIRM PRODUCT RECEIVED & RELEASE PAYMENT TO FARMER VIA UPI / QR
app.post("/api/transactions/:id/confirm-delivery", async (req, res) => {
  try {
    const { id } = req.params;

    const txnRes = await pool.query(
      `SELECT t.*, l.farmer_id, f.telegram_chat_id, f.phone AS farmer_phone, f.name AS farmer_real_name
       FROM transactions t
       LEFT JOIN listings l ON l.id = t.listing_id
       LEFT JOIN farmers f ON f.id = l.farmer_id
       WHERE t.id = $1`,
      [id]
    );

    if (txnRes.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const txn = txnRes.rows[0];

    if (txn.status === "payment_released") {
      return res.json({
        success: true,
        message: "Payment has already been released for this order.",
        transaction: txn
      });
    }

    const updateRes = await pool.query(
      `UPDATE transactions
       SET status = 'payment_released',
           delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP),
           payment_released_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    const updatedTxn = updateRes.rows[0];
    const farmerUpi = txn.farmer_upi || `${txn.farmer_phone || '9876543210'}@upi`;
    const amount = Number(txn.total_amount).toFixed(2);

    // Generate UPI Payment URI
    const upiUri = `upi://pay?pa=${encodeURIComponent(farmerUpi)}&pn=${encodeURIComponent(txn.farmer_name || 'Farmer')}&am=${amount}&cu=INR&tn=FARLX+Order+${id}`;
    const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}`;

    // Create Notification
    await createNotification(
      "payment_released",
      "💰 Payment Released to Farmer",
      `Buyer confirmed receipt of ${txn.crop}. ₹${amount} released to ${txn.farmer_name} (UPI: ${farmerUpi})`,
      id
    );

    // Notify farmer on Telegram!
    if (txn.telegram_chat_id) {
      const telegramMessage =
        `🎉 *PAYMENT RELEASED TO YOUR UPI!* 💰\n\n` +
        `The buyer *${txn.buyer_name || "Wholesale Buyer"}* has confirmed receipt of the *${txn.crop}*!\n\n` +
        `💵 *Amount Credited:* ₹${amount}\n` +
        `🏦 *UPI ID:* \`${farmerUpi}\`\n` +
        `📋 *Order ID:* #TXN-${id}\n` +
        `Status: *Completed & Released* ✅\n\n` +
        `Thank you for successfully trading on FARLX! 🌾`;

      try {
        await bot.telegram.sendMessage(txn.telegram_chat_id, telegramMessage, {
          parse_mode: "Markdown"
        });
      } catch (tgErr) {
        console.error("Payment release telegram error:", tgErr.message);
      }
    }

    res.json({
      success: true,
      message: `Product received! ₹${amount} has been released to farmer ${txn.farmer_name}.`,
      transaction: updatedTxn,
      upi: {
        vpa: farmerUpi,
        payeeName: txn.farmer_name,
        amount,
        upiUri,
        qrCodeUrl: upiQrCodeUrl
      }
    });
  } catch (err) {
    console.error("Confirm delivery error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Notifications List
app.get("/api/notifications", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, type, title, message, entity_id, read, created_at
       FROM notifications
       ORDER BY id DESC
       LIMIT 25`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Notifications API error:", error.message);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark Notifications As Read
app.post("/api/notifications/read-all", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET read = TRUE WHERE read = FALSE");
    res.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error.message);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// Demo seed for SIH judges / quick testing
app.post("/api/demo-seed", async (req, res) => {
  try {
    // 1. Insert Farmer
    const fRes = await pool.query(
      `INSERT INTO farmers (name, age, phone, village, upi_id)
       VALUES ('Suresh Kumar', 38, '9840123456', 'Nashik, Maharashtra', 'suresh.farms@okhdfcbank')
       RETURNING id`
    );
    const farmerId = fRes.rows[0].id;

    // 2. Insert Listing
    const lRes = await pool.query(
      `INSERT INTO listings (farmer_id, crop, quantity, price_per_kg, location, harvest_time, quality, status)
       VALUES ($1, 'Tomato', 500, 32, 'Nashik', 'Ready Now', 'Premium', 'active')
       RETURNING id`,
      [farmerId]
    );
    const listingId = lRes.rows[0].id;

    // 3. Insert Bid
    const bRes = await pool.query(
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
    console.error("Seed error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint for Telegram
const WEBHOOK_PATH = "/api/telegram-webhook";
app.use(bot.webhookCallback(WEBHOOK_PATH));

app.listen(PORT, async () => {
  console.log(`FARLX API server running on port ${PORT}`);

  // Bot initialization
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

      // Self-ping to prevent Render sleep during demo
      setInterval(() => {
        https.get(`${externalUrl}/api/health`, () => {}).on("error", () => {});
      }, 8 * 60 * 1000);
    } else {
      // Local development - use polling
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
