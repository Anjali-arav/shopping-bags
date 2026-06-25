import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, ShoppingBag, Zap, Shield, HelpCircle, ArrowLeftRight, Check } from "lucide-react";
import { Product } from "../types";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedColor: { name: string; hex: string }, selectedSize: string, quantity: number) => void;
  onBuyNowDirect: (product: Product, selectedColor: { name: string; hex: string }, selectedSize: string, quantity: number) => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNowDirect
}: ProductDetailsModalProps) {
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);

  // Sync state with product when modal opens
  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
      setSelectedColor(product.colors[0] || null);
      setSelectedSize(product.sizes[0] || "Medium");
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedColor) return;
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (!selectedColor) return;
    onBuyNowDirect(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
          />

          {/* Success toast notification */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 16 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-medium text-sm shadow-xl"
              >
                <Check size={16} />
                Successfully added to your shopping cart!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            {/* Upper Gold accent band */}
            <div className="h-1.5 bg-gradient-to-r from-blue-950 via-amber-500 to-rose-400" />

            {/* Header / Dismiss Button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-bold text-gray-900">Product Details</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Images Section */}
                <div className="space-y-4">
                  {/* Large main view stage */}
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Thumbnail Previews */}
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          activeImage === img ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side: Configuration & Details */}
                <div className="space-y-5">
                  {/* Title & Badge */}
                  <div>
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 uppercase tracking-widest rounded-md mb-2">
                      {product.category} COLLECTION
                    </span>
                    <h3 className="text-2xl font-extrabold text-blue-950 leading-snug">{product.name}</h3>

                    {/* Ratings */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={15}
                            fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                            className="text-amber-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-500">
                        {product.rating} / 5.0 ({product.reviewsCount} verified reviews)
                      </span>
                    </div>
                  </div>

                  {/* Pricing Layout */}
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-blue-950">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Inclusive of all local taxes & customs duties</p>
                    </div>
                    {product.discount > 0 && (
                      <span className="px-3.5 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm">
                        SAVE {product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Core Description Text */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Material & Construction details */}
                  <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-3 text-xs text-gray-600">
                    <div>
                      <span className="font-bold text-gray-900 uppercase block mb-0.5">Material:</span>
                      {product.material}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 uppercase block mb-0.5">Availability:</span>
                      {product.stock > 0 ? (
                        <span className="text-emerald-600 font-semibold">In Stock ({product.stock} units)</span>
                      ) : (
                        <span className="text-rose-500 font-semibold">Temporarily Out of Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Selector: Colors */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <span>Select Color:</span>
                      <span className="text-gray-500 font-medium normal-case">
                        {selectedColor ? selectedColor.name : ""}
                      </span>
                    </h4>
                    <div className="flex gap-3">
                      {product.colors.map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(color)}
                          style={{ backgroundColor: color.hex }}
                          className={`w-8 h-8 rounded-full border border-black/10 transition-all flex items-center justify-center cursor-pointer ${
                            selectedColor?.name === color.name
                              ? "ring-2 ring-amber-500 ring-offset-2 scale-110 shadow-md"
                              : "hover:scale-105"
                          }`}
                          title={color.name}
                        >
                          {selectedColor?.name === color.name && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: color.hex === "#FFFDF0" || color.hex === "#E5E7EB" ? "#000" : "#FFF" }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector: Sizes */}
                  {product.sizes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                        Select Dimensions:
                      </h4>
                      <div className="flex gap-2.5">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              selectedSize === size
                                ? "bg-blue-950 text-white border-blue-950 shadow-sm"
                                : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {size} Bag
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selector: Quantity */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">Quantity:</h4>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center border border-gray-250 rounded-xl overflow-hidden bg-gray-50">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="px-3.5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-gray-900">{quantity}</span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          className="px-3.5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-gray-450 font-medium">Max available {product.stock} units</span>
                    </div>
                  </div>

                  {/* Purchase Action Panel */}
                  <div className="grid grid-cols-2 gap-3 mt-6 pt-2 shrink-0">
                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-blue-900/40 text-blue-950 bg-white hover:bg-blue-50 font-bold text-sm transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      <ShoppingBag size={18} />
                      Add to Shopping Cart
                    </button>

                    {/* Buy Now */}
                    <button
                      onClick={handleBuyNow}
                      disabled={product.stock <= 0}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-950 to-blue-900 hover:brightness-110 text-white font-bold text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      <Zap size={18} />
                      Instant Buy Now
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Shield size={16} className="text-amber-500" />
                      <span>100% Genuine</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ArrowLeftRight size={16} className="text-amber-500" />
                      <span>Easy Exchange</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <HelpCircle size={16} className="text-amber-500" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
