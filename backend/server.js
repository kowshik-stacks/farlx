require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "frontend")));

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const PORT = 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Temporary state while a farmer registers or creates a listing.
// This is reset if the Node server restarts.
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
  [
    { text: "✅ Ready Now", callback_data: "harvest_Ready_Now" }
  ],
  [
    { text: "🕒 1 Week", callback_data: "harvest_1_Week" },
    { text: "🕒 2 Weeks", callback_data: "harvest_2_Weeks" }
  ],
  [
    { text: "🗓️ Other", callback_data: "harvest_Other" }
  ]
]);

const qualityKeyboard = Markup.inlineKeyboard([
  [
    { text: "⭐ Premium", callback_data: "quality_Premium" },
    { text: "🟡 Average", callback_data: "quality_Average" }
  ]
]);

async function sendMainMenu(ctx, chatId) {
  try {
    const farmerResult = await pool.query(
      "SELECT id, name FROM farmers WHERE telegram_chat_id = $1",
      [String(chatId)]
    );

    if (farmerResult.rows.length > 0) {
      await ctx.reply(
        `Hi ${farmerResult.rows[0].name}! 👨‍🌾\nChoose an option below:`,
        mainMenuKeyboard
      );
    } else {
      await ctx.reply(
        "Hi! 👋 Welcome to FARLX.\n\nTap Register to create your farmer profile.",
        mainMenuKeyboard
      );
    }
  } catch (error) {
    console.error("Send menu error:", error.message);
    await ctx.reply("Unable to load the menu. Please try again.");
  }
}

async function showBidsForListing(ctx, listingId) {
  try {
    const bidsResult = await pool.query(
      `SELECT
         id,
         listing_id,
         buyer_name,
         buyer_phone,
         offered_price,
         status,
         created_at
       FROM bids
       WHERE listing_id = $1
       ORDER BY created_at DESC`,
      [listingId]
    );

    if (bidsResult.rows.length === 0) {
      await ctx.editMessageText("📩 No bids for this listing yet.");
      return;
    }

    let message = `📩 Bids for Listing #${listingId}\n\n`;
    const buttons = [];

    for (const bid of bidsResult.rows) {
      const statusLabel =
        bid.status === "accepted"
          ? "✅ Accepted"
          : bid.status === "rejected"
            ? "❌ Rejected"
            : "⏳ Pending";

      message +=
        `Bid ID: ${bid.id}\n` +
        `Buyer: ${bid.buyer_name || "Unknown"}\n` +
        `Phone: ${bid.buyer_phone || "Not provided"}\n` +
        `Offer: ₹${bid.offered_price}/kg\n` +
        `Status: ${statusLabel}\n\n`;

      if (bid.status === "pending") {
        buttons.push([
          {
            text: `✅ Accept Bid #${bid.id}`,
            callback_data: `accept_bid_${bid.id}`
          }
        ]);
      }
    }

    if (buttons.length > 0) {
      await ctx.editMessageText(message, Markup.inlineKeyboard(buttons));
    } else {
      await ctx.editMessageText(message);
    }
  } catch (error) {
    console.error("Show bids error:", error.message);
    await ctx.editMessageText("Failed to load bids. Please try again.");
  }
}

async function publishListing(ctx, chatId) {
  const state = userState[chatId];

  if (!state || state.flow !== "listing") {
    await ctx.reply("Listing session expired. Tap Create Listing and try again.");
    return;
  }

  const farmerResult = await pool.query(
    "SELECT id, village FROM farmers WHERE telegram_chat_id = $1",
    [String(chatId)]
  );

  if (farmerResult.rows.length === 0) {
    delete userState[chatId];
    await ctx.reply("Please register as a farmer first.", mainMenuKeyboard);
    return;
  }

  const farmerId = farmerResult.rows[0].id;
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

  await ctx.reply(
    `✅ Listing published!\n\n` +
      `Listing ID: ${listingId}\n` +
      `Crop: ${crop}\n` +
      `Quantity: ${quantity} kg\n` +
      `Price: ₹${price}/kg\n` +
      `Location: ${location}\n` +
      `Harvest: ${harvestTime}\n` +
      `Quality: ${quality}\n\n` +
      "Buyers can now view and bid on your crop.",
    mainMenuKeyboard
  );
}

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
        `SELECT id, name, village
         FROM farmers
         WHERE telegram_chat_id = $1`,
        [String(chatId)]
      );

      if (farmerResult.rows.length > 0) {
        const farmer = farmerResult.rows[0];

        await ctx.reply(
          `✅ You are already registered.\n\n` +
            `Farmer ID: ${farmer.id}\n` +
            `Name: ${farmer.name}\n` +
            `Village: ${farmer.village || "Not provided"}\n\n` +
            "Use Create Listing to sell a crop.",
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
        "🌾 Farmer Registration\n\nWhat is your name?\nExample: Ramesh"
      );
    } catch (error) {
      console.error("Register error:", error.message);
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
          "Please register first. Tap Register below.",
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
        "🌾 Create a Crop Listing\n\nSelect your crop:",
        cropKeyboard
      );
    } catch (error) {
      console.error("Create listing error:", error.message);
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
        await ctx.reply("📦 You have no listings yet.", mainMenuKeyboard);
        return;
      }

      let message = "📦 Your Listings\n\n";
      const bidButtons = [];

      for (const listing of listingsResult.rows) {
        message +=
          `#${listing.id} ${listing.crop}\n` +
          `Quantity: ${listing.quantity} kg | ₹${listing.price_per_kg}/kg\n` +
          `Location: ${listing.location}\n` +
          `Harvest: ${listing.harvest_time || "Not specified"}\n` +
          `Quality: ${listing.quality || "Not specified"}\n` +
          `Status: ${listing.status || "active"}\n` +
          `Bids: ${listing.bid_count}\n\n`;

        bidButtons.push([
          {
            text: `📩 View Bids for #${listing.id}`,
            callback_data: `view_bids_${listing.id}`
          }
        ]);
      }

      // FIXED PART: no .resized(), no .concat()
      await ctx.reply(message, Markup.inlineKeyboard(bidButtons));
      await ctx.reply("Choose another option below:", mainMenuKeyboard);
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
           l.harvest_time,
           l.quality,
           l.status,
           f.name AS farmer_name
         FROM listings l
         JOIN farmers f ON f.id = l.farmer_id
         WHERE COALESCE(l.status, 'active') = 'active'
         ORDER BY l.created_at DESC`
      );

      if (listingsResult.rows.length === 0) {
        await ctx.reply("🌾 No active listings are available yet.", mainMenuKeyboard);
        return;
      }

      let message = "🌾 Available Crop Listings\n\n";

      for (const listing of listingsResult.rows) {
        message +=
          `#${listing.id} ${listing.crop}\n` +
          `Quantity: ${listing.quantity} kg | ₹${listing.price_per_kg}/kg\n` +
          `Location: ${listing.location}\n` +
          `Harvest: ${listing.harvest_time || "Not specified"}\n` +
          `Quality: ${listing.quality || "Not specified"}\n` +
          `Farmer: ${listing.farmer_name}\n\n`;
      }

      await ctx.reply(message, mainMenuKeyboard);
    } catch (error) {
      console.error("View all listings error:", error.message);
      await ctx.reply("Failed to load all listings.", mainMenuKeyboard);
    }
    return;
  }

  const state = userState[chatId];

  // If a user has not selected an action, return menu.
  if (!state) {
    if (!menuButtons.includes(text)) {
      await sendMainMenu(ctx, chatId);
    }
    return;
  }

  try {
    // Farmer registration flow
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

        if (!Number.isInteger(age) || age < 18 || age > 120) {
          await ctx.reply("Please enter a valid age, for example: 35");
          return;
        }

        state.data.age = age;
        state.step = "phone";

        await ctx.reply("What is your phone number?\nExample: 9876543210");
        return;
      }

      if (state.step === "phone") {
        const phone = text.replace(/\s+/g, "");

        if (!/^[0-9]{10,15}$/.test(phone)) {
          await ctx.reply("Please enter a valid phone number using 10 to 15 digits.");
          return;
        }

        state.data.phone = phone;
        state.step = "village";

        await ctx.reply("What is your village or area?\nExample: Chennai");
        return;
      }

      if (state.step === "village") {
        if (text.length < 2) {
          await ctx.reply("Please enter a valid village or area name.");
          return;
        }

        state.data.village = text;

        const { name, age, phone, village } = state.data;

        const existingResult = await pool.query(
          "SELECT id FROM farmers WHERE telegram_chat_id = $1",
          [String(chatId)]
        );

        if (existingResult.rows.length > 0) {
          delete userState[chatId];

          await ctx.reply(
            `You are already registered.\nFarmer ID: ${existingResult.rows[0].id}`,
            mainMenuKeyboard
          );
          return;
        }

        const insertResult = await pool.query(
          `INSERT INTO farmers
            (name, age, phone, village, telegram_chat_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [name, age, phone, village, String(chatId)]
        );

        const farmerId = insertResult.rows[0].id;

        delete userState[chatId];

        await ctx.reply(
          `✅ Farmer registration complete!\n\n` +
            `Farmer ID: ${farmerId}\n` +
            `Name: ${name}\n` +
            `Village: ${village}\n\n` +
            "You can now create a crop listing.",
          mainMenuKeyboard
        );
        return;
      }
    }

    // Listing creation flow
    if (state.flow === "listing") {
      if (state.step === "crop_other") {
        if (text.length < 2) {
          await ctx.reply("Please type a valid crop name.");
          return;
        }

        state.data.crop = text;
        state.step = "quantity";

        await ctx.reply(
          `Crop selected: ${text}\n\nEnter quantity in kg.\nExample: 100`
        );
        return;
      }

      if (state.step === "quantity") {
        const quantity = Number.parseFloat(text);

        if (!Number.isFinite(quantity) || quantity <= 0) {
          await ctx.reply("Please enter a valid quantity in kg.\nExample: 100");
          return;
        }

        state.data.quantity = quantity;
        state.step = "price";

        await ctx.reply("Enter your expected price per kg in ₹.\nExample: 38");
        return;
      }

      if (state.step === "price") {
        const price = Number.parseFloat(text);

        if (!Number.isFinite(price) || price <= 0) {
          await ctx.reply("Please enter a valid price.\nExample: 38");
          return;
        }

        state.data.price = price;
        state.step = "harvest";

        await ctx.reply(
          "When will your crop be ready for harvest?",
          harvestKeyboard
        );
        return;
      }

      if (state.step === "harvest_other") {
        if (text.length < 2) {
          await ctx.reply("Please enter the harvest time.\nExample: 10 days");
          return;
        }

        state.data.harvest_time = text;
        state.step = "quality";

        await ctx.reply("Choose the crop quality:", qualityKeyboard);
        return;
      }
    }
  } catch (error) {
    console.error("Text flow error:", error.message);
    delete userState[chatId];
    await ctx.reply("Something went wrong. Please try again.", mainMenuKeyboard);
  }
});

bot.action(/^crop_(.+)$/, async (ctx) => {
  const chatId = ctx.chat.id;
  const crop = ctx.match[1];
  const state = userState[chatId];

  await ctx.answerCbQuery();

  if (!state || state.flow !== "listing") {
    await ctx.editMessageText("Session expired. Tap Create Listing again.");
    return;
  }

  if (crop === "Other") {
    state.step = "crop_other";

    await ctx.editMessageText(
      "Type the crop name.\nExample: Sugarcane"
    );
    return;
  }

  state.data.crop = crop;
  state.step = "quantity";

  await ctx.editMessageText(
    `Crop selected: ${crop}\n\nEnter quantity in kg.\nExample: 100`
  );
});

bot.action(/^harvest_(.+)$/, async (ctx) => {
  const chatId = ctx.chat.id;
  const rawHarvest = ctx.match[1];
  const state = userState[chatId];

  await ctx.answerCbQuery();

  if (!state || state.flow !== "listing") {
    await ctx.editMessageText("Session expired. Tap Create Listing again.");
    return;
  }

  if (rawHarvest === "Other") {
    state.step = "harvest_other";

    await ctx.editMessageText(
      "Type the harvest time.\nExample: 10 days or 3 weeks"
    );
    return;
  }

  const harvestTime = rawHarvest.replaceAll("_", " ");
  state.data.harvest_time = harvestTime;
  state.step = "quality";

  await ctx.editMessageText(
    "Choose the crop quality:",
    qualityKeyboard
  );
});

bot.action(/^quality_(.+)$/, async (ctx) => {
  const chatId = ctx.chat.id;
  const quality = ctx.match[1];
  const state = userState[chatId];

  await ctx.answerCbQuery();

  if (!state || state.flow !== "listing") {
    await ctx.editMessageText("Session expired. Tap Create Listing again.");
    return;
  }

  state.data.quality = quality;
  state.step = "preview";

  const { crop, quantity, price, harvest_time: harvestTime } = state.data;

  await ctx.editMessageText(
    `📋 Listing Preview\n\n` +
      `Crop: ${crop}\n` +
      `Quantity: ${quantity} kg\n` +
      `Expected Price: ₹${price}/kg\n` +
      `Harvest: ${harvestTime}\n` +
      `Quality: ${quality}\n\n` +
      `Publish this listing?`,
    Markup.inlineKeyboard([
      [
        { text: "✅ Publish", callback_data: "confirm_publish" },
        { text: "✏️ Edit", callback_data: "confirm_edit" }
      ]
    ])
  );
});

bot.action("confirm_publish", async (ctx) => {
  const chatId = ctx.chat.id;

  await ctx.answerCbQuery();

  try {
    await ctx.editMessageText("Publishing your listing...");
    await publishListing(ctx, chatId);
  } catch (error) {
    console.error("Publish listing error:", error.message);
    delete userState[chatId];
    await ctx.reply("Could not publish the listing. Please try again.", mainMenuKeyboard);
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

  await ctx.editMessageText("Select the crop again:");
  await ctx.reply("🌾 Create a Crop Listing\n\nSelect your crop:", cropKeyboard);
});

bot.action(/^view_bids_(\d+)$/, async (ctx) => {
  const listingId = Number.parseInt(ctx.match[1], 10);

  await ctx.answerCbQuery();
  await showBidsForListing(ctx, listingId);
});

bot.action(/^accept_bid_(\d+)$/, async (ctx) => {
  const bidId = Number.parseInt(ctx.match[1], 10);
  const chatId = ctx.chat.id;
  let client;

  await ctx.answerCbQuery();

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const farmerResult = await client.query(
      "SELECT id FROM farmers WHERE telegram_chat_id = $1",
      [String(chatId)]
    );

    if (farmerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      await ctx.editMessageText("Only a registered farmer can accept a bid.");
      return;
    }

    const farmerId = farmerResult.rows[0].id;

    const bidResult = await client.query(
      `SELECT
         b.id,
         b.listing_id,
         b.offered_price,
         b.status,
         l.farmer_id,
         l.quantity
       FROM bids b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.id = $1
       FOR UPDATE`,
      [bidId]
    );

    if (bidResult.rows.length === 0) {
      await client.query("ROLLBACK");
      await ctx.editMessageText("Bid not found.");
      return;
    }

    const bid = bidResult.rows[0];

    if (bid.farmer_id !== farmerId) {
      await client.query("ROLLBACK");
      await ctx.editMessageText("You can only accept bids for your own listing.");
      return;
    }

    if (bid.status !== "pending") {
      await client.query("ROLLBACK");
      await ctx.editMessageText("This bid has already been processed.");
      return;
    }

    // Current bid table has no bid quantity, so this uses the listing's full quantity.
    const totalAmount =
      Number.parseFloat(bid.offered_price) * Number.parseFloat(bid.quantity);

    const transactionResult = await client.query(
      `INSERT INTO transactions (bid_id, total_amount, status)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [bidId, totalAmount, "payment_pending"]
    );

    await client.query(
      "UPDATE bids SET status = 'accepted' WHERE id = $1",
      [bidId]
    );

    await client.query(
      `UPDATE bids
       SET status = 'rejected'
       WHERE listing_id = $1
         AND id <> $2
         AND status = 'pending'`,
      [bid.listing_id, bidId]
    );

    await client.query(
      "UPDATE listings SET status = 'sold' WHERE id = $1",
      [bid.listing_id]
    );

    await client.query("COMMIT");

    const transactionId = transactionResult.rows[0].id;

    await ctx.editMessageText(
      `✅ Bid accepted and transaction created!\n\n` +
        `Bid ID: ${bidId}\n` +
        `Transaction ID: ${transactionId}\n` +
        `Total Amount: ₹${totalAmount.toFixed(2)}\n` +
        `Payment Status: payment_pending\n\n` +
        `Other pending bids for this listing were rejected.`
    );

    await ctx.reply("Choose another option below:", mainMenuKeyboard);
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Accept bid error:", error.message);
    await ctx.editMessageText("Failed to accept the bid. Please try again.");
  } finally {
    if (client) {
      client.release();
    }
  }
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

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
         f.name AS farmer_name
       FROM listings l
       JOIN farmers f ON f.id = l.farmer_id
       ORDER BY l.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Listings API error:", error.message);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

app.get("/api/bids", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.id,
         b.listing_id,
         b.buyer_name,
         b.buyer_phone,
         b.offered_price,
         b.status,
         l.crop
       FROM bids b
       JOIN listings l ON l.id = b.listing_id
       ORDER BY b.id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Bids API error:", error.message);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         t.id,
         t.total_amount,
         t.status,
         b.listing_id,
         b.buyer_name,
         l.crop
       FROM transactions t
       JOIN bids b ON b.id = t.bid_id
       JOIN listings l ON l.id = b.listing_id
       ORDER BY t.id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Transactions API error:", error.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.listen(PORT, () => {
  console.log(`FARLX API running on http://localhost:${PORT}`);
});

bot.launch()
  .then(() => console.log("Telegram bot started successfully."))
  .catch((error) => console.error("Telegram bot launch error:", error.message));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));