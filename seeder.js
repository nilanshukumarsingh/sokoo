const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Shop = require("./models/Shop");
const Product = require("./models/Product");

// Load env vars
dotenv.config({ path: __dirname + "/.env" });

// Connect to DB
const connStr = process.env.MONGO_URI || "mongodb://localhost:27017/soko";
console.log(`Connecting to: ${connStr}`);
mongoose.connect(connStr, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// --- REALISTIC DATA ---

const vendors = [
  {
    name: "Urban Threads",
    email: "vendor1@gmail.com",
    password: "password123",
  },
  { name: "Tech Haven", email: "vendor2@gmail.com", password: "password123" },
  {
    name: "Home & Hearth",
    email: "vendor3@gmail.com",
    password: "password123",
  },
  {
    name: "FitLife Sports",
    email: "vendor4@gmail.com",
    password: "password123",
  },
  {
    name: "Bookworm's Den",
    email: "vendor5@gmail.com",
    password: "password123",
  },
  { name: "Luxe Beauty", email: "vendor6@gmail.com", password: "password123" },
  { name: "Gadget Guru", email: "vendor7@gmail.com", password: "password123" },
];

const shops = [
  {
    name: "Urban Threads Styles",
    description: "Modern fashion for the urban soul.",
    vendorIndex: 0,
  }, // vendor1
  {
    name: "The Tech Vault",
    description: "Premium electronics and gadgets.",
    vendorIndex: 1,
  }, // vendor2
  {
    name: "Cozy Living",
    description: "Decor and essentials for a warm home.",
    vendorIndex: 2,
  }, // vendor3
  {
    name: "Active Gear",
    description: "High-performance sports equipment.",
    vendorIndex: 3,
  }, // vendor4
  {
    name: "Page Turner",
    description: "Rare and best-selling books.",
    vendorIndex: 4,
  }, // vendor5
  {
    name: "Pure Glow",
    description: "Organic and luxury beauty products.",
    vendorIndex: 5,
  }, // vendor6
  {
    name: "Future Tech",
    description: "Cutting edge innovations.",
    vendorIndex: 6,
  }, // vendor7
];

const products = [
  // --- Urban Threads Styles (Fashion) ---
  {
    name: "Classic Denim Jacket",
    description:
      "A timeless denim jacket featuring a relaxed fit and durable cotton fabric. Perfect for layering.",
    price: 59.99,
    category: "Fashion",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 0,
  },
  {
    name: "Minimalist Leather Sneakers",
    description:
      "Handcrafted white leather sneakers with a comfortable rubber sole and sleek design.",
    price: 89.5,
    category: "Fashion",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 0,
  },
  {
    name: "Vintage Wool Fedora",
    description:
      "Elegant wool fedora hat in charcoal grey. Adds a touch of sophistication to any outfit.",
    price: 45.0,
    category: "Fashion",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 0,
  },
  {
    name: "Oversized Knit Sweater",
    description:
      "Cozy oversized sweater made from soft merino wool blend. Perfect for winter days.",
    price: 75.0,
    category: "Fashion",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 0,
  },
  {
    name: "Silk Scarf",
    description: "Luxurious 100% silk scarf with a vibrant abstract print.",
    price: 35.0,
    category: "Fashion",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 0,
  },
  {
    name: "Slim Fit Chinos",
    description:
      "Versatile beige chinos that work for both office and casual wear.",
    price: 49.99,
    category: "Fashion",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 0,
  },
  {
    name: "Leather Messenger Bag",
    description: "Durable full-grain leather bag with laptop compartment.",
    price: 120.0,
    category: "Fashion",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 0,
  },

  // --- The Tech Vault (Electronics) ---
  {
    name: "Wireless Noise-Canceling Headphones",
    description:
      "Immersive sound with active noise cancellation and 30-hour battery life.",
    price: 249.99,
    category: "Electronics",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 1,
  },
  {
    name: "4K Action Camera",
    description:
      "Capture your adventures in stunning 4K resolution. Waterproof and shockproof.",
    price: 199.0,
    category: "Electronics",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 1,
  },
  {
    name: "Smart Home Assistant Speaker",
    description: "Voice-controlled smart speaker with high-fidelity sound.",
    price: 99.0,
    category: "Electronics",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 1,
  },
  {
    name: "Ergonomic Mechanical Keyboard",
    description:
      "Custom mechanical switches for tactile typing. RGB backlighting included.",
    price: 129.99,
    category: "Electronics",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 1,
  },
  {
    name: "Portable Power Bank 20000mAh",
    description:
      "Fast-charging power bank capable of charging laptops and phones.",
    price: 49.95,
    category: "Electronics",
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 1,
  },
  {
    name: "Professional Drone",
    description: "High-end drone with 3-axis gimbal and 5km range.",
    price: 899.0,
    category: "Electronics",
    stock: 10,
    images: [
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 1,
  },
  {
    name: "VR Headset",
    description: "Next-gen virtual reality headset for immersive gaming.",
    price: 399.0,
    category: "Electronics",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 1,
  },

  // --- Cozy Living (Home) ---
  {
    name: "Ceramic Minimalist Vase",
    description: "Hand-thrown ceramic vase with a matte white finish.",
    price: 34.0,
    category: "Home",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 2,
  },
  {
    name: "Velvet Accent Pillow",
    description: "Rich emerald green velvet pillow. 18x18 inches.",
    price: 28.0,
    category: "Home",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 2,
  },
  {
    name: "Modern Table Lamp",
    description:
      "Brass finish table lamp with a linen shade. Adds warmth to any room.",
    price: 85.0,
    category: "Home",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1507473888900-52e1ad14db4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 2,
  },
  {
    name: "Soy Wax Candle - Sandalwood",
    description:
      "Hand-poured soy candle with a calming woodsy scent. 40 hour burn time.",
    price: 22.0,
    category: "Home",
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 2,
  },
  {
    name: "Woven Jute Rug",
    description:
      "Natural jute area rug, perfect for adding texture to living spaces.",
    price: 150.0,
    category: "Home",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1575909812264-69022510b8a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 2,
  },
  {
    name: "Abstract Wall Art Print",
    description: "Framed modern art print, ready to hang.",
    price: 65.0,
    category: "Home",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 2,
  },
  {
    name: "Moka Pot Espresso Maker",
    description:
      "Classic stovetop espresso maker for authentic Italian coffee.",
    price: 39.99,
    category: "Home",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1517080315886-2dc92c80d46f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 2,
  },

  // --- Active Gear (Sports) ---
  {
    name: "Yoga Mat - Eco Friendly",
    description: "Non-slip yoga mat made from natural rubber.",
    price: 45.0,
    category: "Sports",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 3,
  },
  {
    name: "Running Shoes - Boost V2",
    description:
      "Lightweight running shoes designed for marathon distance comfort.",
    price: 110.0,
    category: "Sports",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 3,
  },
  {
    name: "Dumbbell Set (5-25lbs)",
    description: "Adjustable dumbbell set for home workouts.",
    price: 150.0,
    category: "Sports",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1586401100388-6158196238ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 3,
  },
  {
    name: "Tennis Racket Pro",
    description: "Carbon fiber tennis racket for advanced players.",
    price: 180.0,
    category: "Sports",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1617083934555-563d3cb925b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 3,
  },
  {
    name: "Cycling Helmet",
    description: "Aerodynamic helmet with advanced impact protection.",
    price: 65.0,
    category: "Sports",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1557803175-298e8a6cd432?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 3,
  },
  {
    name: "Insulated Water Bottle",
    description: "Keeps drinks cold for 24 hours. 32oz capacity.",
    price: 32.0,
    category: "Sports",
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 3,
  },
  {
    name: "Resistance Bands Set",
    description: "Set of 5 resistance bands for strength training.",
    price: 25.0,
    category: "Sports",
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1598289431512-b97b0917affc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 3,
  },

  // --- Page Turner (Books) ---
  {
    name: "The Midnight Library",
    description:
      "A novel about all the choices that go into a life well lived.",
    price: 18.0,
    category: "Books",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 4,
  },
  {
    name: "Design for Hackers",
    description: "Reverse engineering beauty for developers.",
    price: 35.0,
    category: "Books",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 4,
  },
  {
    name: "Sapiens: A Brief History",
    description: "A thorough history of humankind.",
    price: 22.0,
    category: "Books",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 4,
  },
  {
    name: "The Alchemist",
    description:
      "An inspiring tale of self-discovery and following your dreams.",
    price: 15.0,
    category: "Books",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 4,
  },
  {
    name: "Atomic Habits",
    description: "An easy & proven way to build good habits & break bad ones.",
    price: 20.0,
    category: "Books",
    stock: 70,
    images: [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 4,
  },
  {
    name: "Dune",
    description: "The classic science fiction masterpiece.",
    price: 25.0,
    category: "Books",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 4,
  },

  // --- Pure Glow (Beauty) ---
  {
    name: "Vitamin C Serum",
    description: "Brightening serum for radiant skin. 100% Organic.",
    price: 45.0,
    category: "Beauty",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 5,
  },
  {
    name: "Matte Lipstick Set",
    description: "Set of 3 long-lasting matte lipsticks in nude shades.",
    price: 32.0,
    category: "Beauty",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 5,
  },
  {
    name: "Hydrating Face Cream",
    description: "Deep moisture for dry skin with hyaluronic acid.",
    price: 38.0,
    category: "Beauty",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 5,
  },
  {
    name: "Rose Quartz Roller",
    description: "Facial massage tool for de-puffing and relaxation.",
    price: 25.0,
    category: "Beauty",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 5,
  },
  {
    name: "Organic Shampoo Bar",
    description: "Zero-waste shampoo bar with lavender and tea tree oil.",
    price: 15.0,
    category: "Beauty",
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 5,
  },
  {
    name: "Charcoal Face Mask",
    description: "Detoxifying clay mask for clear pores.",
    price: 28.0,
    category: "Beauty",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdd403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 5,
  },

  // --- Future Tech (More Electronics) ---
  {
    name: "Smart Watch Series 7",
    description: "Advanced health monitoring and fitness tracking.",
    price: 399.0,
    category: "Electronics",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 6,
  },
  {
    name: "True Wireless Earbuds",
    description: "Compact design with powerful bass and clear treble.",
    price: 129.0,
    category: "Electronics",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 6,
  },
  {
    name: "Gaming Monitor 144Hz",
    description: "27-inch curved monitor with ultra-fast refresh rate.",
    price: 350.0,
    category: "Electronics",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 6,
  },
  {
    name: "Retro Game Console",
    description:
      "Play classic 8-bit games on your TV. Includes two controllers.",
    price: 59.99,
    category: "Electronics",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 6,
  },
  {
    name: "Electric Toothbrush",
    description: "Smart toothbrush with pressure sensor.",
    price: 79.99,
    category: "Beauty", // Slightly mismatched category on purpose for variety or valid overlap
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1559676104-5858cf32d207?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 6,
  },
  {
    name: "Robot Vacuum Cleaner",
    description: "Automated cleaning for your home via app control.",
    price: 249.0,
    category: "Home",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1563820257007-8894df05370d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    vendorIndex: 6,
  },
];

// --- SEED FUNCTION ---

const importData = async () => {
  try {
    console.log("🔥 Clearing Database...");
    await User.deleteMany({ role: "vendor" }); // Keep admin/users if desired, but wiping vendors/products
    await Shop.deleteMany();
    await Product.deleteMany();

    console.log("Creating Vendors...");
    const createdUsers = [];

    for (const vendor of vendors) {
      const user = await User.create({
        name: vendor.name,
        email: vendor.email,
        password: vendor.password,
        role: "vendor",
      });
      createdUsers.push(user);
    }

    console.log("Creating Shops...");
    const createdShops = [];
    for (const shopData of shops) {
      const shop = await Shop.create({
        name: shopData.name,
        description: shopData.description,
        owner: createdUsers[shopData.vendorIndex]._id,
      });
      createdShops.push(shop);
    }

    console.log("Creating Products...");
    for (const productData of products) {
      await Product.create({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        stock: productData.stock,
        images: productData.images,
        shop: createdShops[productData.vendorIndex]._id,
      });
    }

    console.log("✅ Data Imported Successfully!");
    process.exit();
  } catch (err) {
    console.error(`${err}`);
    process.exit(1);
  }
};

importData();
