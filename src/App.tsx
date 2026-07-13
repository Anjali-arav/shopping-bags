import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSlider from "./components/HeroSlider";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import EnquiryForm from "./components/EnquiryForm";
import AuthModals from "./components/AuthModals";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminPanel from "./components/AdminPanel";
import { Product, CartItem, User, Address, OrderItem } from "./types";
import { ShoppingBag, Star, Shield, ArrowLeft, ArrowRight, Phone, Mail, CheckCircle, Gift, Compass, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("home");

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Modals Toggles
  const [authOpen, setAuthOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  // Checkout State
  const [addressForm, setAddressForm] = useState<Address>({
    fullName: "",
    mobileNumber: "",
    houseAddress: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [paymentOption, setPaymentOption] = useState<"Cash on Delivery" | "UPI" | "Credit/Debit Card">("Cash on Delivery");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Quick Purchase "Buy Now" State
  const [quickBuyItem, setQuickBuyItem] = useState<{
    product: Product;
    quantity: number;
    color: { name: string; hex: string };
    size: string;
  } | null>(null);

  // Order Complete Success Screen
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Load products from API
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load products from Express API:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Recover cart and wishlist from localStorage if available
    const savedCart = localStorage.getItem("luxe_cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

    const savedWish = localStorage.getItem("luxe_wishlist");
    if (savedWish) {
      try { setWishlist(JSON.parse(savedWish)); } catch (e) { console.error(e); }
    }

    // Auto-login test customer on first render for high convenience
    const savedUser = localStorage.getItem("luxe_user");
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setCurrentUser(userObj);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save cart changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("luxe_cart", JSON.stringify(newCart));
  };

  // Save wishlist changes
  const saveWishlist = async (newWishlist: Product[]) => {
    setWishlist(newWishlist);
    localStorage.setItem("luxe_wishlist", JSON.stringify(newWishlist));

    if (currentUser) {
      try {
        const prodIds = newWishlist.map((item) => item.id);
        const res = await fetch(`/api/users/${currentUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wishlist: prodIds })
        });
        if (res.ok) {
          const updatedUser = await res.json();
          setCurrentUser(updatedUser);
          localStorage.setItem("luxe_user", JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error("Failed to sync wishlist to server:", err);
      }
    }
  };

  // Synchronize wishlist from logged-in user profile on backend
  useEffect(() => {
    if (currentUser && currentUser.wishlist && products.length > 0) {
      const userWishlistProducts = products.filter((p) => currentUser.wishlist?.includes(p.id));
      const currentIds = wishlist.map(p => p.id).sort().join(",");
      const userIds = userWishlistProducts.map(p => p.id).sort().join(",");
      if (currentIds !== userIds) {
        setWishlist(userWishlistProducts);
        localStorage.setItem("luxe_wishlist", JSON.stringify(userWishlistProducts));
      }
    }
  }, [currentUser, products]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("luxe_user", JSON.stringify(user));

    // Pre-fill shipping address form from user profile details
    setAddressForm({
      fullName: user.name,
      mobileNumber: user.phone || "+91 8919449475",
      houseAddress: user.address || "",
      city: "",
      state: "",
      pincode: ""
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("luxe_user");
    setActiveTab("home");
  };

  const handleAddToCart = (product: Product, color: any, size: string, quantity: number = 1) => {
    const existingIdx = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor.name === color.name &&
        item.selectedSize === size
    );

    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...cart, { product, quantity, selectedColor: color, selectedSize: size }]);
    }
  };

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      saveWishlist(wishlist.filter((item) => item.id !== product.id));
    } else {
      saveWishlist([...wishlist, product]);
    }
  };

  const handleBuyNowTrigger = (product: Product) => {
    const defaultColor = product.colors[0] || { name: "Midnight Black", hex: "#111827" };
    const defaultSize = product.sizes[0] || "Medium";
    setQuickBuyItem({
      product,
      quantity: 1,
      color: defaultColor,
      size: defaultSize
    });
    // Scroll to quick buy section or open tab
    setActiveTab("quickbuy");
  };

  const handleBuyNowDirect = (product: Product, color: any, size: string, quantity: number) => {
    setQuickBuyItem({
      product,
      quantity,
      color,
      size
    });
    setActiveTab("quickbuy");
  };

  // Pricing math helper
  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const originalSubtotal = cart.reduce((sum, item) => sum + (item.product.originalPrice || item.product.price) * item.quantity, 0);
    const storeDiscount = originalSubtotal - subtotal;
    const additionalDiscount = appliedDiscount;
    const total = Math.max(0, subtotal - additionalDiscount);

    return {
      subtotal,
      discount: storeDiscount + additionalDiscount,
      total
    };
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "LUXE10") {
      setAppliedDiscount(50); // ₹50 off special coupon
    } else if (couponCode.toUpperCase() === "FESTIVE") {
      setAppliedDiscount(100); // ₹100 off premium styles
    } else {
      alert("Invalid boutique coupon code.");
    }
  };

  // Place full cart order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.mobileNumber || !addressForm.houseAddress) {
      alert("Please fill in recipient details and delivery address.");
      return;
    }

    const { subtotal, discount, total } = getCartTotals();

    const orderPayload = {
      customerId: currentUser?.id || "anonymous_" + Date.now(),
      customerName: addressForm.fullName,
      customerEmail: currentUser?.email || "anonymous@luxe.com",
      customerPhone: addressForm.mobileNumber,
      deliveryAddress: addressForm,
      paymentMethod: paymentOption,
      products: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.selectedColor.name,
        size: item.selectedSize,
        image: item.product.images[0]
      })),
      subtotal,
      discount,
      total,
      paymentStatus: paymentOption === "Cash on Delivery" ? "Pending" : "Prepaid"
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const result = await res.json();
        setPlacedOrder(result);
        saveCart([]); // clear cart
        setActiveTab("order_complete");
        loadProducts(); // refresh stock numbers
      } else {
        alert("Failed to submit your order. Please try again.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
    }
  };

  // Place quick purchase order
  const handlePlaceQuickOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBuyItem) return;
    if (!addressForm.fullName || !addressForm.mobileNumber || !addressForm.houseAddress) {
      alert("Please fill in your shipping details.");
      return;
    }

    const itemPrice = quickBuyItem.product.price * quickBuyItem.quantity;

    const orderPayload = {
      customerId: currentUser?.id || "anonymous_" + Date.now(),
      customerName: addressForm.fullName,
      customerEmail: currentUser?.email || "anonymous@luxe.com",
      customerPhone: addressForm.mobileNumber,
      deliveryAddress: addressForm,
      paymentMethod: paymentOption,
      products: [
        {
          productId: quickBuyItem.product.id,
          name: quickBuyItem.product.name,
          price: quickBuyItem.product.price,
          quantity: quickBuyItem.quantity,
          color: quickBuyItem.color.name,
          size: quickBuyItem.size,
          image: quickBuyItem.product.images[0]
        }
      ],
      subtotal: itemPrice,
      discount: 0,
      total: itemPrice,
      paymentStatus: paymentOption === "Cash on Delivery" ? "Pending" : "Prepaid"
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const result = await res.json();
        setPlacedOrder(result);
        setQuickBuyItem(null); // clear quickbuy cache
        setActiveTab("order_complete");
        loadProducts(); // refresh stock levels
      } else {
        alert("Failed to complete direct checkout. Please try again.");
      }
    } catch (err) {
      console.error("Quick buy error:", err);
    }
  };

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sorting products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // featured defaults
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-800">
      {/* Sticky Premium Header */}
      <Header
        currentUser={currentUser}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenEnquiry={() => setEnquiryOpen(true)}
        onSearch={(q) => {
          setSearchQuery(q);
          setSelectedCategory("All");
        }}
        onSelectCategory={setSelectedCategory}
      />

      <main className="flex-1 shrink-0">
        <AnimatePresence mode="wait">
          {/* VIEW: HOME PAGE */}
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16 pb-16"
            >
              {/* Luxury Full-Width Slider */}
              <HeroSlider onShopNowClick={() => setActiveTab("products")} />

              {/* Curated Category Grid Cards */}
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-10">
                  <span className="text-xs font-bold text-amber-600 tracking-widest uppercase block mb-1">
                    EXQUISITE PAIRINGS
                  </span>
                  <h3 className="text-3xl font-serif font-bold text-blue-950">Shop Curated Handbag Classes</h3>
                  <div className="h-1 w-20 bg-amber-500 mx-auto mt-3 rounded-full" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { name: "Premium", label: "Premium Vegan", img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500" },
                    { name: "Office", label: "Corporate Carry", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500" },
                    { name: "Party", label: "Celebration Clutches", img: "https://images.unsplash.com/photo-1566150905458-1bf1fc15a6a0?w=500" },
                    { name: "Elegant", label: "Gala Designer", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" }
                  ].map((cat) => (
                    <div
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setActiveTab("products");
                      }}
                      className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all"
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10" />
                      <img
                        src={cat.img}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-x-4 bottom-4 z-20 text-white">
                        <span className="text-[9px] font-bold tracking-wider uppercase text-amber-400">LUXURY CATEGORY</span>
                        <h4 className="font-bold text-sm tracking-wide mt-0.5">{cat.label}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CURATED FEATURED PRODUCTS PANEL */}
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-10 pb-4 border-b border-gray-150">
                  <div>
                    <span className="text-xs font-bold text-amber-600 tracking-widest uppercase block">
                      BESTSELLERS SELECTION
                    </span>
                    <h3 className="text-2xl font-serif font-extrabold text-blue-950 mt-1">Featured Boutique Creations</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setActiveTab("products");
                    }}
                    className="text-xs font-bold text-blue-900 hover:text-amber-600 transition-colors"
                  >
                    View Complete Catalog →
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="text-center py-12 text-sm font-semibold text-gray-400">
                    Arranging beautiful selections...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.slice(0, 4).map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onAddToCart={(p, c, s) => {
                          handleAddToCart(p, c, s);
                          alert(`${p.name} added to cart!`);
                        }}
                        onBuyNow={handleBuyNowTrigger}
                        onViewDetails={(p) => {
                          setSelectedProduct(p);
                          setDetailModalOpen(true);
                        }}
                        isWishlisted={wishlist.some((item) => item.id === prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Premium Luxury Callout Section */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-amber-950 py-16 text-white text-center px-4 relative overflow-hidden">
                {/* Decorative golden geometric mesh */}
                <div className="absolute inset-0 bg-cover bg-center opacity-5 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000')" }} />
                <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                  <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">EXPERIENCE COUTURE</span>
                  <h4 className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-tight">Handbags Handcrafted For Your Utmost Confidence</h4>
                  <p className="text-sm text-gray-200 max-w-xl mx-auto leading-relaxed">
                    Designed in Milan, curated in New Delhi. Every stitch is placed with master artisan precision using premium sustainable cruelty-free materials.
                  </p>
                  <div className="flex justify-center gap-4 pt-3">
                    <button
                      onClick={() => setActiveTab("products")}
                      className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-blue-950 font-extrabold text-xs tracking-wider uppercase rounded-xl hover:brightness-110 shadow-lg active:scale-95 transition-all"
                    >
                      Browse Boutique Catalog
                    </button>
                    <button
                      onClick={() => setEnquiryOpen(true)}
                      className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-white/20 transition-all"
                    >
                      Consult Handbag Expert
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: PRODUCTS LISTINGS */}
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-2xl font-serif font-extrabold text-blue-950">Luxury Handbags Catalog</h3>
                  <p className="text-xs text-gray-500 mt-1">Discover trending handbags under ₹1000</p>
                </div>

                {/* Filters & Sorting Panel */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 font-bold text-xs rounded-xl text-gray-700"
                  >
                    <option value="All">All Categories</option>
                    <option value="Classic">Classic Bags</option>
                    <option value="Premium">Premium Bags</option>
                    <option value="Office">Office Bags</option>
                    <option value="Party">Party Bags</option>
                    <option value="Casual">Casual Bags</option>
                    <option value="Tote">Totes</option>
                    <option value="Mini">Minis</option>
                    <option value="Elegant">Elegant Series</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 font-bold text-xs rounded-xl text-gray-700"
                  >
                    <option value="featured">Featured Selections</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Results status */}
              {(searchQuery || selectedCategory !== "All") && (
                <div className="mb-6 flex items-center justify-between text-xs text-gray-500 bg-gray-100/55 px-4 py-2 rounded-xl">
                  <span>
                    Showing <strong>{sortedProducts.length}</strong> handbags matching:{" "}
                    {selectedCategory !== "All" && <span className="font-bold text-blue-950">Category: {selectedCategory} </span>}
                    {searchQuery && <span className="font-bold text-blue-950">Search: "{searchQuery}"</span>}
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="font-bold text-amber-600 hover:underline"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Product Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={(p, c, s) => {
                      handleAddToCart(p, c, s);
                      alert(`${p.name} added to cart!`);
                    }}
                    onBuyNow={handleBuyNowTrigger}
                    onViewDetails={(p) => {
                      setSelectedProduct(p);
                      setDetailModalOpen(true);
                    }}
                    isWishlisted={wishlist.some((item) => item.id === prod.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}

                {sortedProducts.length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white max-w-md mx-auto">
                    <ShoppingBag size={48} className="mx-auto text-gray-350 mb-3" />
                    <h4 className="text-base font-bold text-gray-900">No matching handbags found</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4">Try searching for other tags like Leather, Party, or Casual.</p>
                    <button
                      onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                      className="px-6 py-2.5 bg-blue-950 text-white font-bold text-xs rounded-xl"
                    >
                      Clear All Search Filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW: SHOPPING CART */}
          {activeTab === "cart" && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-10"
            >
              <h3 className="text-2xl font-serif font-extrabold text-blue-950 mb-8">My Shopping Bag</h3>

              {cart.length === 0 ? (
                <div className="py-20 text-center bg-white border border-gray-100 rounded-3xl max-w-xl mx-auto">
                  <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-bold text-gray-900">Your shopping bag is empty</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-6">Explore the finest collections of handbags and claim premium pieces.</p>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-950 to-blue-900 text-white font-bold text-xs rounded-xl uppercase tracking-wider"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Left: Cart Items Table List */}
                  <div className="lg:col-span-2 space-y-4">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 shadow-xs"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-24 h-24 rounded-xl object-cover border border-gray-150 bg-gray-50 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold tracking-widest text-amber-600 uppercase">
                            {item.product.category} COLLECTION
                          </span>
                          <h4 className="font-extrabold text-base text-gray-900 truncate mt-0.5">{item.product.name}</h4>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              Color: <strong className="text-gray-800">{item.selectedColor.name}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              Dimensions: <strong className="text-gray-800">{item.selectedSize}</strong>
                            </span>
                          </div>

                          <div className="text-sm font-extrabold text-blue-950 mt-2">
                            ₹{item.product.price}
                          </div>
                        </div>

                        {/* Quantity and removal buttons */}
                        <div className="flex items-center gap-4 shrink-0 mt-4 sm:mt-0">
                          <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  const updated = [...cart];
                                  updated[index].quantity -= 1;
                                  saveCart(updated);
                                }
                              }}
                              className="px-2.5 py-1.5 hover:bg-gray-100 text-gray-500 font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => {
                                const updated = [...cart];
                                updated[index].quantity += 1;
                                saveCart(updated);
                              }}
                              className="px-2.5 py-1.5 hover:bg-gray-100 text-gray-500 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              saveCart(cart.filter((_, i) => i !== index));
                            }}
                            className="text-xs font-bold text-rose-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Cart Summary Column */}
                  <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-5">
                    <h4 className="text-base font-extrabold text-blue-950 pb-3 border-b border-gray-100">Order Summary</h4>

                    <div className="space-y-3.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-gray-900">₹{getCartTotals().subtotal}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-semibold">
                        <span>Discounts / Deductions</span>
                        <span>-₹{appliedDiscount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Boutique Express Delivery</span>
                        <span className="text-emerald-600 font-bold">FREE</span>
                      </div>
                      <div className="border-t border-gray-100 pt-3.5 flex justify-between text-base font-extrabold text-blue-950">
                        <span>Total Price</span>
                        <span>₹{getCartTotals().total}</span>
                      </div>
                    </div>

                    {/* Promo coupon inputs */}
                    <div className="pt-3 border-t border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Coupon Code Promo</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="e.g. LUXE10 or FESTIVE"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-blue-950 text-white font-bold text-xs rounded-lg hover:brightness-110 active:scale-95 transition-all"
                        >
                          Apply
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">Hint: Try coupon <strong className="text-amber-600">LUXE10</strong> or <strong className="text-amber-600">FESTIVE</strong></p>
                    </div>

                    <button
                      onClick={() => setActiveTab("checkout")}
                      className="w-full py-4 bg-gradient-to-r from-blue-950 to-blue-900 hover:brightness-110 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-blue-950/20 active:scale-98 transition-all"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: CART CHECKOUT PAGE */}
          {activeTab === "checkout" && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-10"
            >
              <div className="flex items-center gap-2 mb-8">
                <button onClick={() => setActiveTab("cart")} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <ArrowLeft size={16} />
                </button>
                <h3 className="text-2xl font-serif font-extrabold text-blue-950">Complete Shipment</h3>
              </div>

              <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Delivery Address Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Delivery Address details */}
                  <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-xs space-y-4">
                    <h4 className="text-base font-extrabold text-blue-950 border-b border-gray-100 pb-3">Delivery Address details</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Recipient Full Name *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          placeholder="e.g. Anjali"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Mobile Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={addressForm.mobileNumber}
                          onChange={(e) => setAddressForm({ ...addressForm, mobileNumber: e.target.value })}
                          placeholder="e.g. +91 8919449475"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">House/Street Address *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.houseAddress}
                        onChange={(e) => setAddressForm({ ...addressForm, houseAddress: e.target.value })}
                        placeholder="e.g. 12-3, Jubilee Hills Road No. 12"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="e.g. Hyderabad"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="e.g. Telangana"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Pincode *</label>
                        <input
                          type="text"
                          required
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          placeholder="e.g. 500033"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Options Selection */}
                  <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-xs space-y-4">
                    <h4 className="text-base font-extrabold text-blue-950 border-b border-gray-100 pb-3">Payment Options</h4>

                    <div className="space-y-3">
                      {[
                        { id: "Cash on Delivery", label: "Cash on Delivery (COD)", desc: "Pay with cash upon package receipt" },
                        { id: "UPI", label: "Direct UPI Scan/Pay", desc: "Instant mobile transfers (Paytm, GPay, PhonePe)" },
                        { id: "Credit/Debit Card", label: "Visa / Mastercard / RuPay Debit Card", desc: "Pay securely via global transaction gateways" }
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            paymentOption === opt.id
                              ? "bg-blue-50/50 border-blue-900 text-blue-950"
                              : "bg-white border-gray-150 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentOption === opt.id}
                            onChange={() => setPaymentOption(opt.id as any)}
                            className="mt-1 accent-blue-950"
                          />
                          <div>
                            <span className="font-bold text-xs block">{opt.label}</span>
                            <span className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Sub fields for UPI and Card */}
                    {paymentOption === "UPI" && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2 text-gray-700">
                        <p className="font-bold text-gray-900">Scan & Pay QR Transfer:</p>
                        <p>UPI ID: <strong className="text-blue-900">luxehandbags@okaxis</strong></p>
                        <p className="text-gray-500 italic">Please complete transaction before placing order</p>
                      </div>
                    )}

                    {paymentOption === "Credit/Debit Card" && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                        <p className="font-bold text-xs text-gray-900">Credit Card Gateway</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <input type="text" placeholder="Cardholder Name" className="p-2 bg-white border border-gray-200 rounded-lg text-xs" />
                          <input type="text" placeholder="Card Number (16-Digit)" className="p-2 bg-white border border-gray-200 rounded-lg text-xs" />
                          <input type="text" placeholder="Expiry MM/YY" className="p-2 bg-white border border-gray-200 rounded-lg text-xs" />
                          <input type="password" placeholder="CVV Security Key" className="p-2 bg-white border border-gray-200 rounded-lg text-xs" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right sidebar: Checkout Order Summary */}
                <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-5">
                  <h4 className="text-base font-extrabold text-blue-950 pb-3 border-b border-gray-100">Checkout Summary</h4>

                  <div className="divide-y divide-gray-50 max-h-[14rem] overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                        <div className="truncate max-w-[10rem]">
                          <span className="font-bold text-gray-900 block truncate">{item.product.name}</span>
                          <span className="text-gray-400 font-medium text-[10px]">Qty: {item.quantity} | {item.selectedColor.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 font-sans">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex justify-between">
                      <span>Items Price</span>
                      <span className="font-bold text-gray-900">₹{getCartTotals().subtotal}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Coupons Discount</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-blue-950 pt-1.5 border-t border-gray-50">
                      <span>Grand Total</span>
                      <span>₹{getCartTotals().total}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-blue-950 font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
                  >
                    Place Secure Order
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* VIEW: DIRECT QUICK "BUY NOW" CHECKOUT */}
          {activeTab === "quickbuy" && quickBuyItem && (
            <motion.div
              key="quickbuy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-10"
            >
              <div className="flex items-center gap-2 mb-8">
                <button onClick={() => setActiveTab("products")} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <ArrowLeft size={16} />
                </button>
                <h3 className="text-2xl font-serif font-extrabold text-blue-950">Quick Instant Checkout</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Side: Address & Payment */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Selected Product summary */}
                  <div className="bg-white border border-gray-100 p-5 rounded-2xl flex gap-4 items-center shadow-xs">
                    <img src={quickBuyItem.product.images[0]} className="w-16 h-16 rounded-lg object-cover border" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{quickBuyItem.product.category}</span>
                      <h4 className="font-bold text-sm text-gray-900">{quickBuyItem.product.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Color: <strong>{quickBuyItem.color.name}</strong> | Size: <strong>{quickBuyItem.size}</strong> | Qty: <strong>{quickBuyItem.quantity}</strong>
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="font-black text-blue-950 text-base block">₹{quickBuyItem.product.price * quickBuyItem.quantity}</span>
                      <span className="text-[10px] text-gray-400">₹{quickBuyItem.product.price} each</span>
                    </div>
                  </div>

                  {/* Customer Address Forms */}
                  <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-blue-950">Shipping Destination</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Full Name *"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Mobile Number *"
                        value={addressForm.mobileNumber}
                        onChange={(e) => setAddressForm({ ...addressForm, mobileNumber: e.target.value })}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                      <input
                        type="text"
                        required
                        placeholder="House Address *"
                        value={addressForm.houseAddress}
                        onChange={(e) => setAddressForm({ ...addressForm, houseAddress: e.target.value })}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl md:col-span-2"
                      />
                      <input
                        type="text"
                        required
                        placeholder="City *"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State *"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Pincode *"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Payment option */}
                  <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-blue-950">Payment Selector</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {["Cash on Delivery", "UPI", "Credit/Debit Card"].map((o) => (
                        <button
                          key={o}
                          onClick={() => setPaymentOption(o as any)}
                          type="button"
                          className={`p-3.5 border-2 rounded-xl text-left font-bold text-xs transition-all cursor-pointer ${
                            paymentOption === o ? "bg-blue-50/50 border-blue-900 text-blue-900" : "bg-white hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Quick Buy sidebar summary */}
                <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-5">
                  <h4 className="text-base font-extrabold text-blue-950 pb-3 border-b">Order Summary</h4>
                  <div className="space-y-3.5 text-xs text-gray-600">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Item (Qty 1)</span>
                      <span>₹{quickBuyItem.product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Boutique Delivery</span>
                      <span className="text-emerald-600 font-bold">FREE</span>
                    </div>
                    <div className="border-t pt-3.5 flex justify-between text-base font-extrabold text-blue-950">
                      <span>Grand Total</span>
                      <span>₹{quickBuyItem.product.price * quickBuyItem.quantity}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceQuickOrder}
                    className="w-full py-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg active:scale-98 transition-all"
                  >
                    Place Quick Order Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: ORDER PLACEMENT SUCCESS GREETINGS */}
          {activeTab === "order_complete" && placedOrder && (
            <motion.div
              key="order_complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto py-20 px-4 text-center space-y-6"
            >
              <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-500 mb-2">
                <CheckCircle size={56} className="animate-bounce" />
              </div>

              <h3 className="text-3xl font-serif font-black text-blue-950">Order Placed Successfully!</h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                Thank you for shopping at Luxe Handbags Store. Your payment method (<strong>{placedOrder.paymentMethod}</strong>) was processed securely.
              </p>

              <div className="bg-white border border-gray-150 p-5 rounded-2xl text-left text-xs font-semibold space-y-3 text-gray-700 shadow-sm">
                <p className="flex justify-between pb-1 border-b">
                  <span>Order Receipt ID</span>
                  <strong className="font-mono text-blue-900 text-sm">{placedOrder.id}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Delivery Address</span>
                  <span className="text-gray-500">{placedOrder.deliveryAddress.fullName} | {placedOrder.deliveryAddress.houseAddress}, {placedOrder.deliveryAddress.city}</span>
                </p>
                <p className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-1 text-sm">
                  <span>Total Deductions Paid</span>
                  <span>₹{placedOrder.total}</span>
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setActiveTab("home");
                    setPlacedOrder(null);
                  }}
                  className="px-6 py-3 bg-gray-150 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => {
                    if (currentUser) {
                      setActiveTab("dashboard");
                    } else {
                      alert("Please register or login to access your historic orders panel.");
                      setAuthOpen(true);
                      setActiveTab("home");
                    }
                    setPlacedOrder(null);
                  }}
                  className="px-6 py-3 bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Track Order
                </button>
              </div>
            </motion.div>
          )}

          {/* VIEW: CUSTOMER DASHBOARD OR ADMIN PANEL */}
          {activeTab === "dashboard" && currentUser && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
            >
              {currentUser.isAdmin ? (
                <AdminPanel
                  adminUser={currentUser}
                  onLogout={handleLogout}
                  onRefreshProducts={loadProducts}
                  products={products}
                />
              ) : (
                <CustomerDashboard
                  user={currentUser}
                  onLogout={handleLogout}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p, c, s) => {
                    handleAddToCart(p, c, s);
                    alert(`${p.name} added to cart!`);
                  }}
                  onUpdateProfile={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    localStorage.setItem("luxe_user", JSON.stringify(updatedUser));
                  }}
                />
              )}
            </motion.div>
          )}

          {/* VIEW: ABOUT US PAGE */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-4xl mx-auto px-4 py-16 space-y-10 text-center"
            >
              <div className="space-y-4">
                <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">OUR HERITAGE STORY</span>
                <h3 className="text-4xl font-serif font-black text-blue-950">The Art of Carrying Luxe</h3>
                <div className="h-1 w-20 bg-amber-500 mx-auto mt-3 rounded-full" />
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-xl bg-gray-100 border">
                <img
                  src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&auto=format&fit=crop"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="max-w-2xl mx-auto text-sm text-gray-600 leading-relaxed text-left space-y-4">
                <p>
                  Established with a commitment to visual craftsmanship, <strong>Luxe Handbags</strong> has redrawn premium e-commerce access throughout India. Inspired by the meticulous service standard of Amazon and the visual elegance of Milanese runways, we bring masterclass designs to everyday lovers of fashion.
                </p>
                <p>
                  We believe that accessories should empower. A handbag carries more than essentials—it carries your poise, your drive, and your unique personality. By keeping our complete premium portfolio strictly under ₹1000, we make pure couture reachable to everyone.
                </p>
              </div>
            </motion.div>
          )}

          {/* VIEW: CONTACT US PAGE */}
          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-7xl mx-auto px-4 md:px-8 py-12"
            >
              <div className="text-center mb-12">
                <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">CUSTOMER ENGAGEMENT</span>
                <h3 className="text-3xl font-serif font-bold text-blue-950 mt-1">Get In Touch With Luxe</h3>
                <div className="h-1 w-20 bg-amber-500 mx-auto mt-3 rounded-full" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                {/* Left Form */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs">
                  <h4 className="text-lg font-bold text-blue-950 mb-6">Drop Us A Message</h4>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const target = e.target as any;
                      const name = target.elements.name.value;
                      const phone = target.elements.phone.value;
                      const email = target.elements.email.value;
                      const message = target.elements.message.value;

                      try {
                        const res = await fetch("/api/enquiries", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name, phone, email, message })
                        });
                        if (res.ok) {
                          alert("Thank you! Your message was submitted successfully. We will reach back soon.");
                          target.reset();
                        }
                      } catch (err) {
                        alert("Enquiry failed to submit. Try calling us directly.");
                      }
                    }}
                    className="space-y-4 text-xs font-medium"
                  >
                    <div>
                      <label className="block text-gray-700 uppercase tracking-wide mb-1">Your Name *</label>
                      <input name="name" required type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 uppercase tracking-wide mb-1">Phone Number *</label>
                        <input name="phone" required type="tel" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
                        <input name="email" type="email" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 uppercase tracking-wide mb-1">Your Message</label>
                      <textarea name="message" rows={4} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl resize-none" />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-blue-950 text-white font-bold rounded-xl hover:brightness-110 shadow-md">
                      Send Premium Message
                    </button>
                  </form>
                </div>

                {/* Right Info Section */}
                <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white p-6 md:p-8 rounded-3xl shadow-lg flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold tracking-tight mb-4">Official HQ Concierge</h4>
                    <p className="text-xs text-gray-200 leading-relaxed mb-8">
                      Have bespoke requirements? Or want to consult with a custom bag stylus advisor? Talk to our hotline representatives at any time. We are here to bring luxury directly to your doorsteps.
                    </p>

                    <div className="space-y-4 text-xs font-medium text-gray-250">
                      <p className="flex gap-2">
                        <Phone size={16} className="text-amber-400 shrink-0" />
                        <span>Hotline: +91 8919449475</span>
                      </p>
                      <p className="flex gap-2">
                        <Mail size={16} className="text-amber-400 shrink-0" />
                        <span>Inquiries: support@luxehandbags.com</span>
                      </p>
                      <p className="flex gap-2">
                        <MapPin size={16} className="text-amber-400 shrink-0" />
                        <span>Showroom: Sector 5, New Delhi - 110001</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-amber-400">
                    <span>RETAIL LOUNGE OPEN: 10AM - 9PM IST</span>
                    <button onClick={() => setEnquiryOpen(true)} className="underline hover:text-white uppercase tracking-wider text-[10px]">
                      Trigger Callback Hotline
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Section */}
      <Footer setActiveTab={setActiveTab} onOpenEnquiry={() => setEnquiryOpen(true)} />

      {/* --- FLOATING MODALS OVERLAYS --- */}

      {/* 1. Inquire Call Now Popup Form */}
      <EnquiryForm isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />

      {/* 2. Customer & Admin Account Portal Authentication */}
      <AuthModals isOpen={authOpen} onClose={() => setAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />

      {/* 3. Interactive Handbag Detail modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(p, c, s, qty) => {
          handleAddToCart(p, c, s, qty);
        }}
        onBuyNowDirect={(p, c, s, qty) => {
          handleBuyNowDirect(p, c, s, qty);
        }}
      />
    </div>
  );
}
