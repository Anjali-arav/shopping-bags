import React, { useState, useEffect } from "react";
import { Product, Order, User, Enquiry } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Layers,
  IndianRupee,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Mail,
  Sliders,
  Calendar,
  AlertTriangle,
  Upload,
  UserCheck,
  Heart
} from "lucide-react";

interface AdminPanelProps {
  adminUser: User;
  onLogout: () => void;
  onRefreshProducts: () => void;
  products: Product[];
}

export default function AdminPanel({ adminUser, onLogout, onRefreshProducts, products }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "customers" | "enquiries" | "wishlists">("dashboard");
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State for Adding / Editing Product
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    discount: 0,
    description: "",
    material: "",
    category: "Classic",
    sizes: "Medium",
    colorsInput: "Cognac Brown:#78350F, Midnight Black:#111827",
    imageInput: "",
    stock: 10
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchStatsAndData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch("/api/dashboard/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch orders
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      // Fetch customers
      const customersRes = await fetch("/api/users");
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.filter((u: any) => !u.isAdmin));
      }

      // Fetch enquiries
      const enqRes = await fetch("/api/enquiries");
      if (enqRes.ok) {
        const enqData = await enqRes.json();
        setEnquiries(enqData);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndData();
  }, [activeTab]);

  const getCustomerOrderCount = (customer: User) => {
    return orders.filter((o) => o.customerName === customer.name || (o as any).userId === customer.id).length;
  };

  const getCustomerWishlistNames = (customer: User) => {
    if (!customer.wishlist || customer.wishlist.length === 0) return "";
    return customer.wishlist
      .map((id) => products.find((p) => p.id === id)?.name)
      .filter((name) => name)
      .join(", ");
  };

  const getMostLikedHandbags = () => {
    const counts: Record<string, number> = {};
    customers.forEach((c) => {
      if (c.wishlist) {
        c.wishlist.forEach((prodId) => {
          counts[prodId] = (counts[prodId] || 0) + 1;
        });
      }
    });

    return products
      .map((p) => ({
        product: p,
        count: counts[p.id] || 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus as any } : ord))
        );
        fetchStatsAndData();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this premium product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshProducts();
        fetchStatsAndData();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleOpenAddProduct = () => {
    setEditProductId(null);
    setIsEditing(true);
    setProdForm({
      name: "",
      price: 0,
      originalPrice: 0,
      discount: 0,
      description: "",
      material: "",
      category: "Classic",
      sizes: "Medium",
      colorsInput: "Midnight Black:#111827, Crimson Red:#991B1B",
      imageInput: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
      stock: 10
    });
    setFormError("");
    setFormSuccess("");
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditProductId(prod.id);
    setIsEditing(true);

    const colorsString = prod.colors.map((c) => `${c.name}:${c.hex}`).join(", ");
    const imagesString = prod.images.join(", ");

    setProdForm({
      name: prod.name,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price * 2,
      discount: prod.discount,
      description: prod.description,
      material: prod.material,
      category: prod.category,
      sizes: prod.sizes.join(", "),
      colorsInput: colorsString,
      imageInput: imagesString,
      stock: prod.stock
    });
    setFormError("");
    setFormSuccess("");
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!prodForm.name || !prodForm.price) {
      setFormError("Product name and price are strictly required");
      return;
    }

    // Parse Colors input: "Name:Hex, Name:Hex"
    const parsedColors = prodForm.colorsInput
      .split(",")
      .map((col) => {
        const parts = col.split(":");
        return {
          name: parts[0]?.trim() || "Black",
          hex: parts[1]?.trim() || "#000000"
        };
      })
      .filter((col) => col.name);

    // Parse Images input
    const parsedImages = prodForm.imageInput
      .split(",")
      .map((img) => img.trim())
      .filter((img) => img);

    // Parse sizes
    const parsedSizes = prodForm.sizes
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    const payload = {
      name: prodForm.name,
      price: Number(prodForm.price),
      originalPrice: Number(prodForm.originalPrice || prodForm.price),
      discount: Number(prodForm.discount || 0),
      description: prodForm.description,
      material: prodForm.material,
      category: prodForm.category,
      sizes: parsedSizes,
      colors: parsedColors,
      images: parsedImages,
      stock: Number(prodForm.stock)
    };

    try {
      let response;
      if (editProductId) {
        // Edit existing
        response = await fetch(`/api/products/${editProductId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setFormSuccess(editProductId ? "Product updated successfully!" : "New product created successfully!");
        onRefreshProducts();
        fetchStatsAndData();
        setTimeout(() => {
          setIsEditing(false);
          setEditProductId(null);
        }, 1200);
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to save product details.");
      }
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shadow-lg shadow-amber-500/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Sliders size={36} className="text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase">
              LUXE HANDBAGS MANAGEMENT PORTAL
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-0.5">Control Center</h2>
            <p className="text-xs text-white/80">Authorized Staff: <strong className="text-white font-bold">{adminUser.name}</strong></p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchStatsAndData}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all cursor-pointer"
            title="Refresh All Stats"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onLogout}
            className="px-6 py-2.5 bg-white text-amber-700 font-bold text-xs rounded-xl hover:bg-amber-50 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Logout Admin Portal
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-6 border-b border-gray-150">
        <button
          onClick={() => { setActiveTab("dashboard"); setIsEditing(false); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-white border border-gray-150 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Dashboard Metrics
        </button>
        <button
          onClick={() => { setActiveTab("products"); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "products"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-white border border-gray-150 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Manage Handbags ({products.length})
        </button>
        <button
          onClick={() => { setActiveTab("orders"); setIsEditing(false); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "orders"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-white border border-gray-150 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Manage Orders ({orders.length})
        </button>
        <button
          onClick={() => { setActiveTab("customers"); setIsEditing(false); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "customers"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-white border border-gray-150 text-gray-600 hover:bg-gray-50"
          }`}
        >
          View Registered Customers ({customers.length})
        </button>
        <button
          onClick={() => { setActiveTab("enquiries"); setIsEditing(false); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "enquiries"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-white border border-gray-150 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Store Inquiries ({enquiries.length})
        </button>
        <button
          onClick={() => { setActiveTab("wishlists"); setIsEditing(false); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "wishlists"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-white border border-gray-150 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Wishlists & Trends
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="py-24 text-center font-semibold text-sm text-gray-500">
            Fetching secure server resources...
          </div>
        ) : (
          <>
            {/* Tab: METRICS DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-8"
              >
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Revenue Card */}
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales Revenue</span>
                      <h4 className="text-2xl font-black text-gray-900 mt-1 font-sans">₹{stats.totalRevenue}</h4>
                      <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        <TrendingUp size={12} /> +14.2% from last month
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                      <IndianRupee size={24} />
                    </div>
                  </div>

                  {/* Total Orders Card */}
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Successful Orders</span>
                      <h4 className="text-2xl font-black text-gray-900 mt-1 font-sans">{stats.totalOrders}</h4>
                      <p className="text-[10px] font-bold text-blue-600 mt-1">100% fulfill rating</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                      <ShoppingBag size={24} />
                    </div>
                  </div>

                  {/* Total Customers Card */}
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Customers</span>
                      <h4 className="text-2xl font-black text-gray-900 mt-1 font-sans">{stats.totalCustomers}</h4>
                      <p className="text-[10px] font-bold text-indigo-600 mt-1">Direct retail accounts</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                      <Users size={24} />
                    </div>
                  </div>

                  {/* Total Products Card */}
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products Catalog</span>
                      <h4 className="text-2xl font-black text-gray-900 mt-1 font-sans">{stats.totalProducts}</h4>
                      <p className="text-[10px] font-bold text-amber-600 mt-1">8 luxury classes</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
                      <Layers size={24} />
                    </div>
                  </div>
                </div>

                {/* Dashboard layout lower grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Orders List */}
                  <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                      <h4 className="text-base font-extrabold text-blue-950">Recent Retail Orders</h4>
                      <button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-amber-600 hover:underline">
                        View All
                      </button>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="py-3 flex justify-between items-center gap-4 text-xs">
                          <div>
                            <p className="font-bold text-gray-900">{order.customerName}</p>
                            <p className="text-gray-400 mt-0.5">{order.products.length} handbag(s) — <strong className="font-mono text-blue-900">{order.id}</strong></p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">₹{order.total}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                              order.status === "Delivered" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <p className="py-8 text-center text-xs text-gray-400 font-medium">No order activity logged yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Stock Alert Panel */}
                  <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="text-base font-extrabold text-blue-950 pb-2 border-b border-gray-50 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500 animate-bounce" />
                      Stock Status Alerts
                    </h4>

                    <div className="space-y-3.5 max-h-[16.5rem] overflow-y-auto">
                      {products.map((p) => {
                        const isLow = p.stock <= 5;
                        return (
                          <div key={p.id} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-700 truncate max-w-[10rem]">{p.name}</span>
                            <span className={`px-2.5 py-0.5 rounded-md font-bold ${
                              p.stock === 0
                                ? "bg-rose-50 text-rose-600"
                                : isLow
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} Left`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: PRODUCT CATALOG CRUD MANAGEMENT */}
            {activeTab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                {!isEditing ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="text-xl font-extrabold text-blue-950">Active Handbags Catalog</h3>
                        <p className="text-xs text-gray-500 mt-1">Configure retail catalog prices and quantities</p>
                      </div>
                      <button
                        onClick={handleOpenAddProduct}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Plus size={14} /> Add Luxury Handbag
                      </button>
                    </div>

                    {/* Catalog Grid View */}
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                              <th className="p-4">Handbag Image</th>
                              <th className="p-4">Handbag Name & Class</th>
                              <th className="p-4">Retail Price</th>
                              <th className="p-4">Stock</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {products.map((p) => (
                              <tr key={p.id} className="hover:bg-gray-50/50">
                                <td className="p-4">
                                  <img
                                    src={p.images[0]}
                                    alt=""
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                                  />
                                </td>
                                <td className="p-4 font-semibold">
                                  <p className="text-gray-900 font-bold">{p.name}</p>
                                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{p.category}</span>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-gray-900 font-bold">₹{p.price}</span>
                                    {p.discount > 0 && (
                                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">-{p.discount}%</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${p.stock <= 5 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                                    {p.stock} units
                                  </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                  <button
                                    onClick={() => handleOpenEditProduct(p)}
                                    className="inline-flex p-2 bg-gray-100 hover:bg-amber-500 hover:text-white rounded-lg text-gray-600 transition-all cursor-pointer"
                                    title="Edit Product Details"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="inline-flex p-2 bg-gray-100 hover:bg-rose-500 hover:text-white rounded-lg text-gray-600 transition-all cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  // ADD / EDIT FORM STAGE
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-gray-150 rounded-2xl p-6 md:p-8 shadow-md max-w-2xl mx-auto space-y-6"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-blue-950">
                          {editProductId ? "Edit Premium Product Settings" : "Configure New Luxury Product"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Specify sizes, materials, prices and colors</p>
                      </div>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4">
                      {formError && (
                        <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg">
                          {formError}
                        </div>
                      )}
                      {formSuccess && (
                        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                          <Check size={16} /> {formSuccess}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={prodForm.name}
                          onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                          placeholder="e.g. Designer Saffiano Party Bag"
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Retail Price (₹) *</label>
                          <input
                            type="number"
                            required
                            value={prodForm.price || ""}
                            onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                            placeholder="Must be below 1000"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Original Price (₹)</label>
                          <input
                            type="number"
                            value={prodForm.originalPrice || ""}
                            onChange={(e) => setProdForm({ ...prodForm, originalPrice: Number(e.target.value) })}
                            placeholder="e.g. 1999"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            value={prodForm.stock || ""}
                            onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                            placeholder="e.g. 15"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Category / Type</label>
                          <select
                            value={prodForm.category}
                            onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                          >
                            <option value="Classic">Classic</option>
                            <option value="Premium">Premium</option>
                            <option value="Office">Office</option>
                            <option value="Party">Party</option>
                            <option value="Casual">Casual</option>
                            <option value="Tote">Tote</option>
                            <option value="Mini">Mini</option>
                            <option value="Elegant">Elegant</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Material Composition</label>
                          <input
                            type="text"
                            value={prodForm.material}
                            onChange={(e) => setProdForm({ ...prodForm, material: e.target.value })}
                            placeholder="e.g. Textured Saffiano Leather"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Dimension Sizes (Comma Separated)</label>
                          <input
                            type="text"
                            value={prodForm.sizes}
                            onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                            placeholder="e.g. Medium, Large"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Discount percentage (%)</label>
                          <input
                            type="number"
                            value={prodForm.discount || ""}
                            onChange={(e) => setProdForm({ ...prodForm, discount: Number(e.target.value) })}
                            placeholder="e.g. 50"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Color Options (Format Name:Hex, Comma Separated)</label>
                        <input
                          type="text"
                          value={prodForm.colorsInput}
                          onChange={(e) => setProdForm({ ...prodForm, colorsInput: e.target.value })}
                          placeholder="e.g. Cognac Brown:#78350F, Midnight Black:#111827"
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Image URLs (Comma Separated)</label>
                        <input
                          type="text"
                          value={prodForm.imageInput}
                          onChange={(e) => setProdForm({ ...prodForm, imageInput: e.target.value })}
                          placeholder="Image URL 1, Image URL 2"
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Detailed Description</label>
                        <textarea
                          rows={4}
                          value={prodForm.description}
                          onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                          placeholder="Describe the handbag's features, compartments, strap and style details..."
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                      >
                        {editProductId ? "Save Changes" : "Publish Premium Handbag"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Tab: ORDER FULFILLMENT */}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-extrabold text-blue-950">Fulfillment Order Logs</h3>
                  <p className="text-xs text-gray-500 mt-1">Track payments and configure shipping status</p>
                </div>

                {orders.length === 0 ? (
                  <p className="py-12 text-center text-xs text-gray-400 font-bold bg-white border border-gray-100 rounded-2xl">
                    No client orders placed yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div key={ord.id} className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-4 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Order ID</span>
                            <span className="font-mono text-blue-950 font-bold text-sm">{ord.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Buyer Name</span>
                            <span className="font-bold text-gray-800">{ord.customerName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Cash</span>
                            <span className="font-extrabold text-gray-900 font-sans">₹{ord.total}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment Option</span>
                            <span className="font-semibold text-gray-600">{ord.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Shipment Status</span>
                            <div className="flex gap-1.5 mt-1">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 bg-gray-50 font-bold rounded-lg text-xs"
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Order Address block */}
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs leading-relaxed text-gray-600">
                          <p className="font-bold text-gray-800 mb-1">Delivery Address & Contact details:</p>
                          <p>
                            <strong>Recipient:</strong> {ord.deliveryAddress.fullName} | <strong>Mobile:</strong> {ord.deliveryAddress.mobileNumber}
                          </p>
                          <p>
                            <strong>Address:</strong> {ord.deliveryAddress.houseAddress}, {ord.deliveryAddress.city}, {ord.deliveryAddress.state} - {ord.deliveryAddress.pincode}
                          </p>
                        </div>

                        {/* Order Items list */}
                        <div className="divide-y divide-gray-50">
                          {ord.products.map((p, idx) => (
                            <div key={idx} className="py-3 flex gap-4 items-center text-xs">
                              <img src={p.image} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                              <div className="flex-1">
                                <p className="font-bold text-gray-900">{p.name}</p>
                                <p className="text-gray-400">Color: {p.color} | Size: {p.size} | Qty: {p.quantity}</p>
                              </div>
                              <span className="font-bold text-gray-900">₹{p.price * p.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: REGISTERED CUSTOMERS */}
            {activeTab === "customers" && (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-extrabold text-blue-950">Active Customers List</h3>
                  <p className="text-xs text-gray-500 mt-1">Direct customer retail directory with order histories and active wishlists</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                          <th className="p-4">Customer Details</th>
                          <th className="p-4">Contact & Address</th>
                          <th className="p-4">Orders Placed</th>
                          <th className="p-4">Wishlist Items</th>
                          <th className="p-4 text-right">Account Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-semibold text-gray-900">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-900 rounded-full">
                                  <Users size={14} />
                                </div>
                                <span>{c.name}</span>
                              </div>
                            </td>
                            <td className="p-4 space-y-1">
                              <p className="font-medium text-gray-900">{c.email}</p>
                              <p className="text-gray-400 text-[11px]">{c.phone || "No phone linked"}</p>
                              <p className="text-gray-500 text-[10px] max-w-[14rem] truncate" title={c.address}>
                                {c.address || "No address saved"}
                              </p>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-950 font-bold rounded-lg text-[10px]">
                                {getCustomerOrderCount(c)} order(s)
                              </span>
                            </td>
                            <td className="p-4 max-w-[15rem]">
                              {c.wishlist && c.wishlist.length > 0 ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-md text-[9px]">
                                    <Heart size={10} className="fill-amber-600" /> {c.wishlist.length} item(s)
                                  </span>
                                  <p className="text-[10px] text-gray-500 truncate" title={getCustomerWishlistNames(c)}>
                                    {getCustomerWishlistNames(c)}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-[11px]">Empty Wishlist</span>
                              )}
                            </td>
                            <td className="p-4 text-right text-emerald-600 font-bold uppercase tracking-wider">
                              <span className="inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px]">
                                <UserCheck size={12} /> Verified Member
                              </span>
                            </td>
                          </tr>
                        ))}
                        {customers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">No customers registered yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: STORE INQUIRIES */}
            {activeTab === "enquiries" && (
              <motion.div
                key="enquiries"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-extrabold text-blue-950">Store Inquiries & Enquiries</h3>
                  <p className="text-xs text-gray-500 mt-1">Client messages from Call Now popup form</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enquiries.map((enq) => (
                    <div key={enq.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden">
                      {/* Top border decor */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{enq.name}</h4>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} />
                            {new Date(enq.date).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-sm">
                          {enq.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-y border-gray-50 py-2 text-gray-600">
                        <p><strong>Phone:</strong> {enq.phone}</p>
                        <p><strong>Email:</strong> {enq.email || "Not specified"}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Enquiry Message:</span>
                        <p className="text-xs text-gray-700 bg-gray-50/50 p-3 rounded-lg border border-gray-100 leading-relaxed italic">
                          "{enq.message || "Requested call support immediately without secondary message"}"
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <a
                          href={`tel:${enq.phone}`}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-950 to-blue-900 hover:brightness-110 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase transition-all shadow-xs"
                        >
                          <Mail size={11} /> Dial Back Support
                        </a>
                      </div>
                    </div>
                  ))}
                  {enquiries.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-xs text-gray-450 bg-white rounded-2xl border border-gray-100 font-bold">
                      No client messages or enquiries logged.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab: WISHLISTS & TRENDS */}
            {activeTab === "wishlists" && (
              <motion.div
                key="wishlists"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-extrabold text-blue-950">Wishlist & Design Trends</h3>
                  <p className="text-xs text-gray-500 mt-1">Real-time statistics on customer favorites and most wanted premium handbags</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Popularity list */}
                  <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
                    <h4 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                      <Heart size={16} className="text-rose-500 fill-rose-500" /> Most Liked Handbags Ranking
                    </h4>

                    <div className="space-y-5">
                      {getMostLikedHandbags().map(({ product, count }, index) => {
                        const totalUsersCount = Math.max(customers.length, 1);
                        const percentage = Math.round((count / totalUsersCount) * 100);

                        return (
                          <div key={product.id} className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            {/* Rank Badge */}
                            <span className="text-sm font-black text-gray-400 w-6 text-center">
                              #{index + 1}
                            </span>

                            {/* Product Info */}
                            <img
                              src={product.images[0]}
                              alt=""
                              className="w-14 h-14 rounded-lg object-cover border border-gray-100 bg-white shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <h5 className="font-bold text-xs text-gray-900 truncate">{product.name}</h5>
                                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">{product.category}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-extrabold text-xs text-blue-950 block">₹{product.price}</span>
                                  <span className="text-[10px] text-gray-400">Stock: {product.stock} left</span>
                                </div>
                              </div>

                              {/* Progress bar representing interest */}
                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                                  <span>Popularity Interest</span>
                                  <span className="text-amber-600 font-extrabold">{count} Saves ({percentage}%)</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Summary trends metrics */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white rounded-2xl p-6 shadow-md space-y-4">
                      <h4 className="text-base font-extrabold tracking-tight">Couture Metrics</h4>
                      <p className="text-xs text-blue-100 leading-relaxed">
                        Design trend dashboards help evaluate client preference shifts in color and model classes. Set discount margins for low-save designs to clear stock, and restock highly desired bags!
                      </p>

                      <div className="pt-4 border-t border-white/10 space-y-3.5 text-xs">
                        <div className="flex justify-between text-blue-200">
                          <span>Total User Accounts</span>
                          <strong className="text-white">{customers.length}</strong>
                        </div>
                        <div className="flex justify-between text-blue-200">
                          <span>Collective Saves</span>
                          <strong className="text-white">
                            {customers.reduce((acc, c) => acc + (c.wishlist?.length || 0), 0)} items
                          </strong>
                        </div>
                        <div className="flex justify-between text-blue-200">
                          <span>Most Wanted Category</span>
                          <strong className="text-white uppercase">
                            {(() => {
                              const catCounts: Record<string, number> = {};
                              customers.forEach((c) => {
                                if (c.wishlist) {
                                  c.wishlist.forEach((id) => {
                                    const p = products.find((prod) => prod.id === id);
                                    if (p) catCounts[p.category] = (catCounts[p.category] || 0) + 1;
                                  });
                                }
                              });
                              const entries = Object.entries(catCounts);
                              return entries.length > 0 ? entries.sort((a, b) => b[1] - a[1])[0][0] : "Classic";
                            })()}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Staff Recommendation</h4>
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start text-xs text-amber-900">
                        <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-bold">Restock alert!</p>
                          <p className="mt-1 leading-relaxed text-amber-800">
                            The bags showing above 40% interest with less than 5 units left require immediate boutique re-ordering.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
