import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(__dirname, "src", "db.json");

// Helper to ensure database is initialized
function initDatabase() {
  const defaultProducts = [
    {
      id: "prod_1",
      name: "Classic Women Handbag",
      price: 799,
      originalPrice: 1499,
      discount: 47,
      description: "A timeless accessory crafted for everyday sophistication. Featuring spacious compartments, premium stitching, and gold-toned hardware, this handbag effortlessly carries all your daily essentials in style.",
      material: "Premium Faux Leather",
      category: "Classic",
      sizes: ["Medium", "Large"],
      colors: [
        { name: "Crimson Red", hex: "#991B1B" },
        { name: "Emerald Green", hex: "#065F46" },
        { name: "Midnight Black", hex: "#111827" }
      ],
      rating: 4.5,
      reviewsCount: 124,
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80"
      ],
      stock: 15
    },
    {
      id: "prod_2",
      name: "Premium Leather Handbag",
      price: 899,
      originalPrice: 1899,
      discount: 53,
      description: "Indulge in pure luxury with our premium leather handbag. Specially treated for a soft texture and exceptional durability, it features structured handles and a detachable shoulder strap for versatile elegance.",
      material: "Genuine Vegan Leather",
      category: "Premium",
      sizes: ["Medium"],
      colors: [
        { name: "Cognac Brown", hex: "#78350F" },
        { name: "Midnight Black", hex: "#111827" },
        { name: "Soft Beige", hex: "#F5F5DC" }
      ],
      rating: 4.8,
      reviewsCount: 98,
      images: [
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"
      ],
      stock: 12
    },
    {
      id: "prod_3",
      name: "Stylish Office Handbag",
      price: 699,
      originalPrice: 1399,
      discount: 50,
      description: "Stay organized and sophisticated at the workplace. Designed with a padded tablet sleeve, multiple slip pockets, and a zippered middle divider, this sleek, professional bag is a modern workwear essential.",
      material: "Water-resistant PU Leather",
      category: "Office",
      sizes: ["Large"],
      colors: [
        { name: "Carbon Navy", hex: "#1E3A8A" },
        { name: "Slate Grey", hex: "#4B5563" },
        { name: "Midnight Black", hex: "#111827" }
      ],
      rating: 4.3,
      reviewsCount: 85,
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop&q=80"
      ],
      stock: 20
    },
    {
      id: "prod_4",
      name: "Designer Party Handbag",
      price: 999,
      originalPrice: 2499,
      discount: 60,
      description: "Sparkle at every celebration. Featuring gorgeous clutch design with premium embellishments and a delicate gold-link chain, this compact bag is guaranteed to turn heads at any evening event.",
      material: "Satin & Metallic Mesh",
      category: "Party",
      sizes: ["Small"],
      colors: [
        { name: "Champagne Gold", hex: "#D4AF37" },
        { name: "Rose Gold", hex: "#B76E79" },
        { name: "Silver Shimmer", hex: "#E5E7EB" }
      ],
      rating: 4.7,
      reviewsCount: 142,
      images: [
        "https://images.unsplash.com/photo-1566150905458-1bf1fc15a6a0?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?w=800&auto=format&fit=crop&q=80"
      ],
      stock: 8
    },
    {
      id: "prod_5",
      name: "Casual Shoulder Bag",
      price: 599,
      originalPrice: 1099,
      discount: 45,
      description: "The ultimate bag for your off-duty looks. Crafted with soft, lightweight materials and an adjustable shoulder strap, it provides an effortless slouchy silhouette that pairs beautifully with denims or summer dresses.",
      material: "Soft Polyurethane Leather",
      category: "Casual",
      sizes: ["Medium"],
      colors: [
        { name: "Olive Green", hex: "#3F6212" },
        { name: "Mustard Yellow", hex: "#D97706" },
        { name: "Teal Blue", hex: "#0F766E" }
      ],
      rating: 4.2,
      reviewsCount: 76,
      images: [
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80"
      ],
      stock: 25
    },
    {
      id: "prod_6",
      name: "Trendy Tote Handbag",
      price: 849,
      originalPrice: 1699,
      discount: 50,
      description: "Pack everything you need and more in this spacious, chic tote. Designed for modern life-on-the-go, it features long comfortable shoulder handles, reinforced bottom, and an ultra-wide top zipper.",
      material: "Premium Canvas & Leather Trim",
      category: "Tote",
      sizes: ["Large"],
      colors: [
        { name: "Tuscan Brown", hex: "#854D0E" },
        { name: "Vanilla Cream", hex: "#FFFDF0" },
        { name: "Navy Blue", hex: "#1E3A8A" }
      ],
      rating: 4.6,
      reviewsCount: 110,
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"
      ],
      stock: 18
    },
    {
      id: "prod_7",
      name: "Mini Fashion Handbag",
      price: 499,
      originalPrice: 999,
      discount: 50,
      description: "Miniature design, maximum statement. Inspired by runway trends, this petite accessory fits your keys, lipstick, and cards perfectly while serving as the ultimate modern style signature.",
      material: "Saffiano Faux Leather",
      category: "Mini",
      sizes: ["Small"],
      colors: [
        { name: "Blush Pink", hex: "#F472B6" },
        { name: "Lilac Lavender", hex: "#C084FC" },
        { name: "Mint Green", hex: "#34D399" }
      ],
      rating: 4.4,
      reviewsCount: 64,
      images: [
        "https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566150905458-1bf1fc15a6a0?w=800&auto=format&fit=crop&q=80"
      ],
      stock: 14
    },
    {
      id: "prod_8",
      name: "Elegant Ladies Handbag",
      price: 949,
      originalPrice: 1999,
      discount: 53,
      description: "Sophistication at its finest. This top-handle handbag features structured contours, protective metal feet, a gorgeous silk ribbon accent, and a masterfully partitioned interior for organized luxury.",
      material: "Textured Saffiano Leather",
      category: "Elegant",
      sizes: ["Medium", "Large"],
      colors: [
        { name: "Regal Navy", hex: "#1E3A8A" },
        { name: "Classic Black", hex: "#111827" },
        { name: "Warm Burgundy", hex: "#881337" }
      ],
      rating: 4.9,
      reviewsCount: 156,
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80"
      ],
      stock: 10
    }
  ];

  const defaultUsers = [
    {
      id: "usr_admin",
      name: "Luxe Admin",
      email: "admin@luxe.com",
      phone: "+91 8919449475",
      address: "Luxe Handbags HQ, New Delhi",
      password: "admin123",
      isAdmin: true
    },
    {
      id: "usr_customer",
      name: "Anjali",
      email: "anjali@luxe.com",
      phone: "+91 8919449475",
      address: "12-3, Jubilee Hills, Hyderabad, Telangana",
      password: "user123",
      isAdmin: false
    }
  ];

  const defaultOrders = [
    {
      id: "ORD-92817",
      customerId: "usr_customer",
      customerName: "Anjali",
      customerEmail: "anjali@luxe.com",
      customerPhone: "+91 8919449475",
      deliveryAddress: {
        fullName: "Anjali",
        mobileNumber: "+91 8919449475",
        houseAddress: "12-3, Jubilee Hills",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500033"
      },
      paymentMethod: "UPI",
      products: [
        {
          productId: "prod_2",
          name: "Premium Leather Handbag",
          price: 899,
          quantity: 1,
          color: "Cognac Brown",
          size: "Medium",
          image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80"
        }
      ],
      subtotal: 899,
      discount: 0,
      total: 899,
      status: "Shipped",
      orderDate: "2026-06-24T18:30:00Z"
    }
  ];

  const defaultEnquiries = [
    {
      id: "enq_1",
      name: "Suresh Kumar",
      phone: "+91 9876543210",
      email: "suresh@gmail.com",
      message: "Do you offer international shipping or bulk orders for corporate gifting?",
      date: "2026-06-24T14:20:00Z"
    }
  ];

  const parentDir = path.dirname(DB_FILE);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          products: defaultProducts,
          users: defaultUsers,
          orders: defaultOrders,
          enquiries: defaultEnquiries
        },
        null,
        2
      )
    );
    console.log("Database initialized at:", DB_FILE);
  }
}

// Read database helper
function readDB() {
  initDatabase();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading DB, re-initializing:", error);
    fs.unlinkSync(DB_FILE);
    initDatabase();
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  }
}

// Write database helper
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing DB:", error);
  }
}

async function startServer() {
  initDatabase();

  const app = express();
  app.use(express.json());

  // Log requests
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });

  // --- API ROUTES ---

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = readDB();
    const user = db.users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Don't send password in response
    const { password: _, ...userSafe } = user;
    res.json(userSafe);
  });

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    const { name, email, phone, address, password } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Name, Email, Phone, and Password are required" });
    }

    const db = readDB();
    const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "Account with this email already exists" });
    }

    const newUser = {
      id: "usr_" + Date.now(),
      name,
      email,
      phone,
      address: address || "",
      password,
      isAdmin: false
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _, ...userSafe } = newUser;
    res.status(201).json(userSafe);
  });

  // Products API
  app.get("/api/products", (req, res) => {
    const db = readDB();
    res.json(db.products);
  });

  app.post("/api/products", (req, res) => {
    const newProduct = req.body;
    if (!newProduct.name || !newProduct.price) {
      return res.status(400).json({ error: "Product name and price are required" });
    }

    const db = readDB();
    const createdProduct = {
      ...newProduct,
      id: "prod_" + Date.now(),
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice || newProduct.price * 2),
      discount: Number(newProduct.discount || 50),
      rating: Number(newProduct.rating || 4.5),
      reviewsCount: Number(newProduct.reviewsCount || 1),
      stock: Number(newProduct.stock || 10),
      images: newProduct.images?.length ? newProduct.images : [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"
      ],
      sizes: newProduct.sizes || ["Medium"],
      colors: newProduct.colors || [{ name: "Midnight Black", hex: "#111827" }]
    };

    db.products.push(createdProduct);
    writeDB(db);
    res.status(201).json(createdProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    const db = readDB();
    const index = db.products.findIndex((p: any) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    db.products[index] = {
      ...db.products[index],
      ...updatedData,
      price: Number(updatedData.price),
      originalPrice: Number(updatedData.originalPrice),
      discount: Number(updatedData.discount),
      stock: Number(updatedData.stock)
    };

    writeDB(db);
    res.json(db.products[index]);
  });

  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const filtered = db.products.filter((p: any) => p.id !== id);

    if (filtered.length === db.products.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    db.products = filtered;
    writeDB(db);
    res.json({ success: true, message: "Product deleted successfully" });
  });

  // Orders API
  app.get("/api/orders", (req, res) => {
    const db = readDB();
    res.json(db.orders);
  });

  app.get("/api/orders/user/:userId", (req, res) => {
    const { userId } = req.params;
    const db = readDB();
    const userOrders = db.orders.filter((o: any) => o.customerId === userId);
    res.json(userOrders);
  });

  app.post("/api/orders", (req, res) => {
    const orderData = req.body;
    if (!orderData.products || orderData.products.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one product" });
    }

    const db = readDB();
    const newOrder = {
      ...orderData,
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      status: "Processing",
      orderDate: new Date().toISOString()
    };

    // Deduct stock if possible
    orderData.products.forEach((orderedItem: any) => {
      const dbProd = db.products.find((p: any) => p.id === orderedItem.productId);
      if (dbProd) {
        dbProd.stock = Math.max(0, dbProd.stock - orderedItem.quantity);
      }
    });

    db.orders.unshift(newOrder);
    writeDB(db);
    res.status(201).json(newOrder);
  });

  app.put("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Processing", "Shipped", "Delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const db = readDB();
    const order = db.orders.find((o: any) => o.id === id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    writeDB(db);
    res.json(order);
  });

  // Enquiries API (Call Now)
  app.get("/api/enquiries", (req, res) => {
    const db = readDB();
    res.json(db.enquiries);
  });

  app.post("/api/enquiries", (req, res) => {
    const { name, phone, email, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and Phone Number are required" });
    }

    const db = readDB();
    const newEnquiry = {
      id: "enq_" + Date.now(),
      name,
      phone,
      email: email || "",
      message: message || "",
      date: new Date().toISOString()
    };

    db.enquiries.unshift(newEnquiry);
    writeDB(db);
    res.status(201).json({ success: true, data: newEnquiry });
  });

  // Users management API
  app.get("/api/users", (req, res) => {
    const db = readDB();
    // Return users without passwords for security
    const safeUsers = db.users.map((u: any) => {
      const { password: _, ...rest } = u;
      return rest;
    });
    res.json(safeUsers);
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, phone, address, password, wishlist } = req.body;

    const db = readDB();
    const index = db.users.findIndex((u: any) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name !== undefined) db.users[index].name = name;
    if (phone !== undefined) db.users[index].phone = phone;
    if (address !== undefined) db.users[index].address = address;
    if (password !== undefined) db.users[index].password = password;
    if (wishlist !== undefined) db.users[index].wishlist = wishlist;

    writeDB(db);

    const { password: _, ...userSafe } = db.users[index];
    res.json(userSafe);
  });

  // Stats API (Admin Dashboard Overview)
  app.get("/api/dashboard/stats", (req, res) => {
    const db = readDB();
    const totalCustomers = db.users.filter((u: any) => !u.isAdmin).length;
    const totalOrders = db.orders.length;
    const totalProducts = db.products.length;
    const totalRevenue = db.orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    res.json({
      totalCustomers,
      totalOrders,
      totalProducts,
      totalRevenue
    });
  });

  // --- DEV & PRODUCTION BUILD CONFIGURATION ---

  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luxe Handbags Server running on port ${PORT}`);
    console.log(`Database connected successfully at ${DB_FILE}`);
  });
}

startServer();
