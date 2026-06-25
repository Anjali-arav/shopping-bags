import React, { useState } from "react";
import { ShoppingCart, Heart, Phone, User, Search, Menu, X, Settings } from "lucide-react";
import { User as UserType } from "../types";

interface HeaderProps {
  currentUser: UserType | null;
  cartCount: number;
  wishlistCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenEnquiry: () => void;
  onSearch: (query: string) => void;
  onSelectCategory: (category: string) => void;
}

export default function Header({
  currentUser,
  cartCount,
  wishlistCount,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenEnquiry,
  onSearch,
  onSelectCategory
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setActiveTab("products");
  };

  const categories = ["Classic", "Premium", "Office", "Party", "Casual", "Tote", "Mini", "Elegant"];

  const navItems = [
    { label: "Home", value: "home" },
    { label: "Products", value: "products" },
    { label: "About Us", value: "about" },
    { label: "Contact Us", value: "contact" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-xs backdrop-blur-md bg-white/95">
      {/* Upper Micro-Header Hotlines */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-amber-900 text-white py-2 px-4 md:px-8 text-center md:text-left flex flex-wrap justify-between items-center gap-2 text-[11px] font-semibold tracking-wider uppercase border-b border-white/5">
        <div className="mx-auto md:mx-0 flex items-center gap-1.5 text-amber-300">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>FESTIVE SALE SPECIAL: ALL LUXURY STYLES UNDER ₹1000! FREE DELIVERY</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-gray-200">
          <span>Official Support: +91 8919449475</span>
          <span className="w-1 h-3 bg-white/20" />
          <span>GST Registered Store</span>
        </div>
      </div>

      {/* Main Luxury Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Logo and Brand Name */}
        <div
          onClick={() => { setActiveTab("home"); onSearch(""); setSearchQuery(""); }}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          {/* Visual Logo Ring */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-950 via-blue-900 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-950/20">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="font-serif font-black text-lg text-blue-950">L</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-serif font-black tracking-tight text-blue-950 leading-none">
              Luxe Handbags
            </h1>
            <span className="text-[9px] font-extrabold tracking-widest text-amber-600 block mt-0.5 uppercase">
              THE ART OF CARRYING
            </span>
          </div>
        </div>

        {/* Amazon-style Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search Amazon-style premium handbags... (e.g., Office, Tote, Leather)"
            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-950 focus:outline-hidden text-sm text-gray-800 transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Search size={15} />
          </button>
        </form>

        {/* Right side controls: Cart, Wishlist, User, Call button */}
        <div className="flex items-center gap-3.5 md:gap-5">
          {/* Wishlist Button */}
          <button
            onClick={() => {
              if (currentUser) {
                setActiveTab("dashboard");
              } else {
                onOpenAuth();
              }
            }}
            className="relative p-2.5 rounded-full hover:bg-gray-50 text-gray-600 hover:text-rose-500 transition-colors cursor-pointer"
            title="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Counter Icon */}
          <button
            onClick={() => setActiveTab("cart")}
            className="relative p-2.5 rounded-full hover:bg-gray-50 text-gray-600 hover:text-blue-950 transition-colors cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-tr from-amber-500 to-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile or Login Trigger */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer border border-blue-100/40"
            >
              {currentUser.isAdmin ? (
                <>
                  <Settings size={15} className="text-amber-600 animate-spin" />
                  <span className="text-xs font-bold text-amber-700">Staff Portal</span>
                </>
              ) : (
                <>
                  <User size={15} className="text-blue-900" />
                  <span className="text-xs font-bold text-blue-950 truncate max-w-[5rem]">
                    {currentUser.name}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-blue-950 rounded-xl transition-all font-bold text-xs cursor-pointer border border-gray-150"
            >
              <User size={14} />
              Sign In
            </button>
          )}

          {/* Luxury Call Now Header Button */}
          <button
            onClick={onOpenEnquiry}
            className="relative overflow-hidden group hidden lg:flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-950 via-blue-900 to-amber-500 text-white text-xs font-extrabold tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {/* Visual shine */}
            <span className="absolute inset-0 w-1/3 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000 ease-out" />
            <Phone size={13} className="animate-bounce" />
            <span>Call Now</span>
          </button>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Primary Category & Pages Navigation Rail */}
      <div className="hidden md:block bg-gray-50 border-t border-gray-100 py-1.5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between text-xs font-bold text-gray-600">
          <div className="flex items-center gap-6">
            {/* Categories dropdown selection */}
            <div className="relative">
              <button
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                className="flex items-center gap-1.5 py-1.5 text-blue-950 hover:text-amber-600 transition-colors uppercase tracking-wider font-bold cursor-pointer"
              >
                <Menu size={14} />
                <span>Shop Categories</span>
              </button>

              {showCatDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCatDropdown(false)} />
                  <div className="absolute top-full left-0 z-20 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          onSelectCategory(cat);
                          setShowCatDropdown(false);
                          setActiveTab("products");
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-amber-50 hover:text-amber-700 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        {cat} Handbags
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        onSelectCategory("All");
                        setShowCatDropdown(false);
                        setActiveTab("products");
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-amber-50 hover:text-amber-700 text-amber-600 font-bold text-xs border-t border-gray-50 cursor-pointer"
                    >
                      View All Handbags
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-gray-300" />

            {/* Nav Pages Menu */}
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveTab(item.value);
                  onSearch("");
                  setSearchQuery("");
                }}
                className={`py-1.5 transition-colors tracking-wide cursor-pointer hover:text-amber-600 ${
                  activeTab === item.value ? "text-amber-600 border-b-2 border-amber-600" : "text-gray-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="text-gray-400 flex items-center gap-1">
            <span>Special Boutique Phone Support:</span>
            <strong className="text-amber-600 hover:underline cursor-pointer" onClick={onOpenEnquiry}>
              +91 8919449475
            </strong>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-5 space-y-4 shadow-inner">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search premium handbags..."
              className="w-full pl-4 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-950 text-white rounded-lg">
              <Search size={13} />
            </button>
          </form>

          {/* Navigation Items */}
          <div className="flex flex-col gap-3 text-sm font-bold text-gray-700">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveTab(item.value);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-1.5 transition-colors ${
                  activeTab === item.value ? "text-amber-600 pl-2 border-l-2 border-amber-600" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Category Quick buttons */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shop Handbag Category</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setActiveTab("products");
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-left bg-gray-50 text-[11px] font-bold text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  {cat} Handbags
                </button>
              ))}
            </div>
          </div>

          {/* Hotlines mobile */}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEnquiry();
              }}
              className="w-full py-2.5 bg-blue-950 text-white font-bold text-xs uppercase tracking-wider text-center rounded-xl flex items-center justify-center gap-2"
            >
              <Phone size={13} />
              Call Now: +91 8919449475
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
