import React, { useState, useEffect } from "react";
import { User, Order, Product } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { UserCircle, ShoppingBag, Heart, MapPin, Phone, Mail, Clock, ShieldCheck, ShoppingCart, Trash2, Edit3, Lock, Check } from "lucide-react";

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, selectedColor: any, selectedSize: string) => void;
  onUpdateProfile: (updatedUser: User) => void;
}

export default function CustomerDashboard({
  user,
  onLogout,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onUpdateProfile
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone || "",
    address: user.address || ""
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Sync profile form when user prop changes
  useEffect(() => {
    setProfileForm({
      name: user.name,
      phone: user.phone || "",
      address: user.address || ""
    });
  }, [user]);

  // Fetch orders when dashboard opens
  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      try {
        const response = await fetch(`/api/orders/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [user.id, activeTab]);

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.name || !profileForm.phone) {
      setProfileError("Name and mobile phone are strictly required.");
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          address: profileForm.address
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateProfile(data);
        setProfileSuccess("Profile details updated successfully!");
        setIsEditingProfile(false);
      } else {
        const err = await response.json();
        setProfileError(err.error || "Failed to update profile details.");
      }
    } catch (error) {
      setProfileError("Something went wrong. Please try again.");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Please enter your new password and confirm it.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setPasswordSuccess("Password changed successfully!");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setIsChangingPassword(false);
      } else {
        const err = await response.json();
        setPasswordError(err.error || "Failed to change password.");
      }
    } catch (error) {
      setPasswordError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Dashboard Grid Header */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <UserCircle size={48} className="text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              CUSTOMER ACCOUNT PORTAL
            </span>
            <h2 className="text-2xl font-bold tracking-tight mt-0.5">Hello, {user.name}</h2>
            <p className="text-sm text-gray-300">Email: {user.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl border border-white/20 active:scale-95 transition-all cursor-pointer"
        >
          Sign Out of Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Navigation Links */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all text-left ${
              activeTab === "orders"
                ? "bg-blue-950 text-white shadow-md shadow-blue-950/10"
                : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <ShoppingBag size={18} />
            My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all text-left ${
              activeTab === "wishlist"
                ? "bg-blue-950 text-white shadow-md shadow-blue-950/10"
                : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Heart size={18} />
            My Wishlist ({wishlist.length})
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all text-left ${
              activeTab === "profile"
                ? "bg-blue-950 text-white shadow-md shadow-blue-950/10"
                : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <MapPin size={18} />
            Manage Profile
          </button>
        </div>

        {/* Right Side: Interactive Content Stage */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* Orders Tab View */}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-extrabold text-blue-950">Purchase Order History</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md">
                    REAL-TIME UPDATING
                  </span>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-sm font-semibold text-gray-500">
                    Loading your purchase history...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
                    <h4 className="text-base font-bold text-gray-900">No orders placed yet</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-5">
                      Check out our stunning luxury handbag collections and place your first order.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden"
                      >
                        {/* Order Upper Card Metadata */}
                        <div className="px-5 py-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 text-xs font-medium text-gray-600">
                          <div className="flex gap-4">
                            <div>
                              <p className="uppercase text-[10px] font-bold text-gray-400">Order Placed</p>
                              <p className="text-gray-800 font-semibold mt-0.5">
                                {new Date(order.orderDate).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="uppercase text-[10px] font-bold text-gray-400">Order ID</p>
                              <p className="font-mono text-blue-900 font-bold mt-0.5">{order.id}</p>
                            </div>
                            <div>
                              <p className="uppercase text-[10px] font-bold text-gray-400">Total Price</p>
                              <p className="text-gray-900 font-bold mt-0.5">₹{order.total}</p>
                            </div>
                          </div>

                          {/* Shipment status tag */}
                          <div className="ml-auto">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                order.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : order.status === "Shipped"
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-500"
                                    : order.status === "Shipped"
                                    ? "bg-blue-500"
                                    : "bg-amber-500 animate-pulse"
                                }`}
                              />
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order product list */}
                        <div className="p-5 space-y-4">
                          {order.products.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-xl object-cover border border-gray-100 bg-gray-50"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-sm text-gray-900 truncate">
                                  {item.name}
                                </h5>
                                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                  <span>Color: <strong className="text-gray-700">{item.color}</strong></span>
                                  <span>Size: <strong className="text-gray-700">{item.size}</strong></span>
                                  <span>Qty: <strong className="text-gray-700">{item.quantity}</strong></span>
                                </div>
                              </div>
                              <div className="text-right text-sm font-bold text-gray-900">
                                ₹{item.price * item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Lower shipping address summary */}
                        <div className="bg-gray-50/30 px-5 py-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                          <span>
                            Ship to: <strong>{order.deliveryAddress.fullName}</strong> — {order.deliveryAddress.houseAddress}, {order.deliveryAddress.city}, {order.deliveryAddress.pincode}
                          </span>
                          <span className="font-bold text-gray-700">Payment: {order.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Wishlist Tab View */}
            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-extrabold text-blue-950">My Saved Wishlist</h3>
                  <span className="text-xs font-semibold text-gray-500">({wishlist.length} saved handbags)</span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                    <Heart size={48} className="mx-auto text-gray-300 mb-3" />
                    <h4 className="text-base font-bold text-gray-900">Your wishlist is empty</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-5">
                      Save luxury bags you love to purchase them later.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center shadow-xs"
                      >
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold tracking-wider text-amber-600 uppercase">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 truncate mt-0.5">{item.name}</h4>
                          <div className="text-sm font-extrabold text-blue-950 mt-1">₹{item.price}</div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          {/* Quick Add To Cart */}
                          <button
                            onClick={() => onAddToCart(item, item.colors[0], item.sizes[0] || "Medium")}
                            className="p-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg transition-colors cursor-pointer"
                            title="Add to Cart"
                          >
                            <ShoppingCart size={15} />
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => onToggleWishlist(item)}
                            className="p-2 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove from Wishlist"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Profile Tab View */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                {/* 1. Profile Details Section */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
                      <UserCircle className="text-amber-500" size={22} />
                      Personal Profile Details
                    </h3>
                    {!isEditingProfile && (
                      <button
                        onClick={() => {
                          setIsEditingProfile(true);
                          setProfileError("");
                          setProfileSuccess("");
                        }}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        <Edit3 size={13} /> Edit Profile
                      </button>
                    )}
                  </div>

                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                      <Check size={16} /> {profileSuccess}
                    </div>
                  )}

                  {profileError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg">
                      {profileError}
                    </div>
                  )}

                  {!isEditingProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name field */}
                      <div className="flex gap-3 items-start">
                        <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{user.name}</p>
                        </div>
                      </div>

                      {/* Email field */}
                      <div className="flex gap-3 items-start">
                        <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg">
                          <Mail size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{user.email}</p>
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div className="flex gap-3 items-start">
                        <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg">
                          <Phone size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{user.phone || "Not specified"}</p>
                        </div>
                      </div>

                      {/* Account Security */}
                      <div className="flex gap-3 items-start">
                        <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</p>
                          <p className="text-sm font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
                            <ShieldCheck size={16} /> Active Verified Customer
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Mobile Number *</label>
                          <input
                            type="tel"
                            required
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Shipping Address</label>
                        <textarea
                          rows={3}
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800 font-medium resize-none"
                          placeholder="Your complete shipping address..."
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileForm({
                              name: user.name,
                              phone: user.phone || "",
                              address: user.address || ""
                            });
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}

                  {!isEditingProfile && (
                    <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl mt-4">
                      <div className="flex gap-3 items-start">
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                          <MapPin size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Shipping Address</p>
                          <p className="text-sm text-gray-700 font-semibold mt-1.5 leading-relaxed">
                            {user.address || "No shipping address saved yet. Configure one during checkout!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Security / Password Update Section */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
                      <Lock className="text-amber-500" size={20} />
                      Account Security & Password
                    </h3>
                    {!isChangingPassword && (
                      <button
                        onClick={() => {
                          setIsChangingPassword(true);
                          setPasswordError("");
                          setPasswordSuccess("");
                        }}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        <Lock size={13} /> Change Password
                      </button>
                    )}
                  </div>

                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                      <Check size={16} /> {passwordSuccess}
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg">
                      {passwordError}
                    </div>
                  )}

                  {!isChangingPassword ? (
                    <div className="text-xs text-gray-500 flex items-center gap-2.5">
                      <ShieldCheck size={20} className="text-emerald-600" />
                      <span>Your password is secure. You can update your account password at any time using verified credentials.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">New Password *</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800"
                          placeholder="At least 6 characters"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Confirm New Password *</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:bg-white text-gray-800"
                          placeholder="Confirm your password"
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md"
                        >
                          Change Password
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
