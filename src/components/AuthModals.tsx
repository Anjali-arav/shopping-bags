import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Phone, MapPin, KeyRound, ShieldAlert } from "lucide-react";
import { User as UserType } from "../types";

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export default function AuthModals({ isOpen, onClose, onLoginSuccess }: AuthModalsProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "admin">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setAddress("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Invalid email or password.");
      }

      const userData: UserType = await response.json();
      onLoginSuccess(userData);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address, password })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to register.");
      }

      const userData: UserType = await response.json();
      onLoginSuccess(userData);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl z-10"
          >
            {/* Top design accent bar */}
            <div className="h-2 bg-gradient-to-r from-blue-900 via-amber-500 to-rose-400" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-20"
            >
              <X size={18} />
            </button>

            {/* Tab Selectors */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => { setActiveTab("login"); setError(""); }}
                className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "login"
                    ? "border-blue-900 text-blue-900 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab("register"); setError(""); }}
                className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "register"
                    ? "border-blue-900 text-blue-900 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => { setActiveTab("admin"); setError(""); }}
                className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "admin"
                    ? "border-amber-500 text-amber-600 bg-white"
                    : "border-transparent text-gray-400 hover:text-gray-800"
                }`}
              >
                <KeyRound size={14} /> Admin
              </button>
            </div>

            <div className="p-6 md:p-8">
              {error && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tab: LOGIN */}
              {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Welcome Back</h4>
                    <p className="text-xs text-gray-500 mt-1">Sign in with your email or test credentials</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. anjali@luxe.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden text-sm text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. user123"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden text-sm text-gray-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg shadow-blue-950/25 active:scale-98 transition-all disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </button>

                  <div className="mt-4 p-3 bg-blue-50/50 rounded-lg text-[11px] text-blue-900 leading-relaxed border border-blue-100/30">
                    <span className="font-bold">Quick-Login:</span> Anjali (customer) use <code className="font-mono bg-white px-1 py-0.5 rounded border">anjali@luxe.com</code> with pass <code className="font-mono bg-white px-1 py-0.5 rounded border">user123</code>
                  </div>
                </form>
              )}

              {/* Tab: REGISTER */}
              {activeTab === "register" && (
                <form onSubmit={handleRegister} className="space-y-3.5 overflow-y-auto max-h-[60vh] pr-1">
                  <div className="text-center mb-2">
                    <h4 className="text-lg font-bold text-gray-900">Create Account</h4>
                    <p className="text-xs text-gray-500">Join the Luxe Handbags family today</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-0.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Anjali"
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden text-xs text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-0.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. anjali@example.com"
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden text-xs text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-0.5">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 89194..."
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden text-xs text-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-0.5">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden text-xs text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-0.5">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="12-3, Jubilee Hills, Hyderabad, Telangana"
                        rows={2}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden text-xs text-gray-800 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 mt-2 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg active:scale-98 transition-all disabled:opacity-50 text-xs"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                </form>
              )}

              {/* Tab: ADMIN */}
              {activeTab === "admin" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                      Luxe Portal Admin
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Management login for store staff</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Admin Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@luxe.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden text-sm text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Security Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. admin123"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden text-sm text-gray-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? "Verifying Keys..." : "Access Control Panel"}
                  </button>

                  <div className="mt-4 p-3 bg-amber-50/50 rounded-lg text-[11px] text-amber-900 leading-relaxed border border-amber-100/30">
                    <span className="font-bold">Staff Admin Credentials:</span> Use <code className="font-mono bg-white px-1 py-0.5 rounded border">admin@luxe.com</code> with pass <code className="font-mono bg-white px-1 py-0.5 rounded border">admin123</code>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
