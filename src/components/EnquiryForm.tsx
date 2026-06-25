import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Phone, CheckCircle } from "lucide-react";

interface EnquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnquiryForm({ isOpen, onClose }: EnquiryFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError("Name and Phone Number are required");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message })
      });

      if (!response.ok) {
        throw new Error("Failed to submit enquiry");
      }

      setIsSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl z-10"
          >
            {/* Top Border Accent */}
            <div className="h-2 bg-gradient-to-r from-blue-900 via-amber-500 to-rose-500" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-6 md:p-8">
              {!isSuccess ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-950">Inquire About Collection</h3>
                      <p className="text-sm text-gray-500">Let our Luxury Handbag Experts assist you</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    {error && (
                      <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg font-medium">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Anjali"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden transition-all text-sm text-gray-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 8919449475"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden transition-all text-sm text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. anjali@luxe.com"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden transition-all text-sm text-gray-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Message / Request
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Which bag or color are you looking for?"
                        rows={3}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white focus:outline-hidden transition-all text-sm text-gray-800 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 mt-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white font-medium rounded-xl hover:from-blue-900 hover:to-blue-800 shadow-lg shadow-blue-900/20 active:scale-98 transition-all duration-150 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Send Request Now"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-500 mb-4"
                  >
                    <CheckCircle size={48} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
                  <p className="text-gray-600 font-medium mb-6">We will contact you soon.</p>
                  <button
                    onClick={() => {
                      onClose();
                      // Wait a bit to reset success screen
                      setTimeout(() => setIsSuccess(false), 300);
                    }}
                    className="px-6 py-2 bg-gray-150 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
