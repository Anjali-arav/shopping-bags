import React from "react";
import { Star, Heart, ShoppingCart, Zap } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product, selectedColor: any, selectedSize: string) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onViewDetails,
  isWishlisted,
  onToggleWishlist
}: ProductCardProps) {
  const defaultColor = product.colors[0] || { name: "Default", hex: "#000" };
  const defaultSize = product.sizes[0] || "Medium";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 inline-block bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
          {product.discount}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => onToggleWishlist(product)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full border shadow-sm backdrop-blur-xs transition-all ${
          isWishlisted
            ? "bg-rose-50 border-rose-100 text-rose-500"
            : "bg-white/80 border-gray-100 text-gray-400 hover:text-rose-500 hover:bg-white"
        }`}
      >
        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Product Image Stage */}
      <div
        onClick={() => onViewDetails(product)}
        className="relative aspect-square w-full overflow-hidden bg-gray-50 cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Quick View Cover */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 bg-white/95 text-xs font-bold text-gray-900 rounded-lg shadow-md tracking-wider uppercase">
            Quick View
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category Label */}
        <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase mb-1">
          {product.category} COLLECTION
        </span>

        {/* Product Title */}
        <h3
          onClick={() => onViewDetails(product)}
          className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 cursor-pointer line-clamp-1 transition-colors"
        >
          {product.name}
        </h3>

        {/* Ratings & Stock */}
        <div className="flex items-center gap-1.5 mt-1.5 mb-2.5">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                className={i < Math.floor(product.rating) ? "text-amber-400" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-gray-500">
            ({product.reviewsCount})
          </span>
          {product.stock <= 0 ? (
            <span className="ml-auto text-[10px] font-bold text-rose-500 uppercase">
              Out of stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="ml-auto text-[10px] font-bold text-amber-500 uppercase animate-pulse">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Pricing Layout */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-extrabold text-blue-950 font-sans">
            ₹{product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
          {/* Add to Cart */}
          <button
            onClick={() => onAddToCart(product, defaultColor, defaultSize)}
            disabled={product.stock <= 0}
            className="flex items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-bold border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            <ShoppingCart size={13} />
            Add Cart
          </button>

          {/* Buy Now */}
          <button
            onClick={() => onBuyNow(product)}
            disabled={product.stock <= 0}
            className="flex items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-bold text-white rounded-lg bg-gradient-to-r from-blue-950 to-blue-900 hover:brightness-110 shadow-xs active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Zap size={13} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
