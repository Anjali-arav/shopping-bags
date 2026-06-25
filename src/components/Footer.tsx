import React from "react";
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, Heart, Info, ArrowUpRight } from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenEnquiry: () => void;
}

export default function Footer({ setActiveTab, onOpenEnquiry }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-blue-950 text-gray-200 pt-16 pb-8 border-t border-amber-500/20">
      {/* Lower right floating WhatsApp button */}
      <a
        href="https://wa.me/918919449475?text=Hi! I am inquiring about the luxury handbag collection from Luxe Handbags Store."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group cursor-pointer"
        title="WhatsApp Support Chat"
      >
        <MessageCircle size={28} className="fill-current text-white animate-pulse" />
        <span className="absolute right-full mr-3 bg-white text-gray-900 font-bold text-xs py-1.5 px-3 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
          WhatsApp Chat Support 💬
        </span>
      </a>

      {/* Main Footer Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-500 p-0.5 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-blue-950 flex items-center justify-center">
                <span className="font-serif font-black text-sm text-amber-500">L</span>
              </div>
            </div>
            <h3 className="text-lg font-serif font-bold text-white tracking-tight">Luxe Handbags</h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Our boutique offers a handpicked array of the finest, most sophisticated fashion handbags under ₹1000. Experience pure premium elegance without breaking the bank.
          </p>
          <div className="flex items-center gap-2.5 text-xs text-amber-400 font-bold">
            <ShieldCheck size={16} />
            <span>Secure 256-bit Encrypted Checkout</span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-3">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => setActiveTab("home")}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 group cursor-pointer"
              >
                <span>Store Home</span>
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("products")}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 group cursor-pointer"
              >
                <span>Luxury Products</span>
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("about")}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 group cursor-pointer"
              >
                <span>Our Heritage</span>
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("contact")}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 group cursor-pointer"
              >
                <span>Contact Lounge</span>
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Support Policies */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-3">
            Customer Support
          </h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-center gap-2">
              <Info size={12} className="text-amber-400" />
              <span>Free Express Shipping (3-5 Days)</span>
            </li>
            <li className="flex items-center gap-2">
              <Info size={12} className="text-amber-400" />
              <span>Easy 7-Day Exchange Policy</span>
            </li>
            <li className="flex items-center gap-2">
              <Info size={12} className="text-amber-400" />
              <span>100% Genuine Materials</span>
            </li>
            <li className="flex items-center gap-2">
              <Info size={12} className="text-amber-400" />
              <span>Cash on Delivery (COD) Available</span>
            </li>
          </ul>
        </div>

        {/* Contact Information Column */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-3">
            Boutique Contact
          </h4>
          <ul className="space-y-3.5 text-xs text-gray-300">
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Luxe Handbags HQ, Sector 5, New Delhi, India</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="text-amber-400" />
              <button
                onClick={onOpenEnquiry}
                className="hover:text-amber-400 transition-colors font-bold cursor-pointer"
              >
                +91 8919449475
              </button>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-amber-400" />
              <span>support@luxehandbags.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom copyright branding */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400 font-medium">
        <p>© {currentYear} Luxe Handbags Store. All Rights Reserved throughout India.</p>
        <p className="flex items-center gap-1">
          Made with <Heart size={10} className="text-amber-400 fill-current" /> for Fashion Lovers.
        </p>
      </div>
    </footer>
  );
}
