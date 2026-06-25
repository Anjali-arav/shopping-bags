import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ShoppingBag, Compass } from "lucide-react";

interface HeroSliderProps {
  onShopNowClick: () => void;
}

export default function HeroSlider({ onShopNowClick }: HeroSliderProps) {
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1600&auto=format&fit=crop&q=80",
      title: "Premium Handbags For Every Style",
      description: "Shop elegant handbags at affordable prices",
      buttonText: "Shop Now",
      icon: <ShoppingBag size={18} />,
      badge: "EXCLUSIVE COLLECTION",
      accent: "from-blue-950/90 to-blue-900/60"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1600&auto=format&fit=crop&q=80",
      title: "Carry Your Confidence",
      description: "Trending handbags under ₹1000",
      buttonText: "Explore Collection",
      icon: <Compass size={18} />,
      badge: "FASHION TRENDS 2026",
      accent: "from-amber-950/95 to-amber-900/50"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000); // Auto slide every 6 seconds
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[32rem] md:h-[38rem] overflow-hidden bg-gray-950">
      {/* Slides with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
            style={{ backgroundImage: `url(${slides[currentIndex].image})` }}
          />

          {/* Luxury Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

          {/* Slide Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
              <div className="max-w-2xl text-left">
                {/* Badge Accent */}
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest text-amber-400 bg-amber-450/10 border border-amber-400/20 mb-4"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {slides[currentIndex].badge}
                </motion.span>

                {/* Main Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight font-sans"
                >
                  {slides[currentIndex].title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg leading-relaxed"
                >
                  {slides[currentIndex].description}
                </motion.p>

                {/* Button Action */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={onShopNowClick}
                  className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-amber-500 text-white shadow-2xl shadow-blue-950/50 hover:shadow-amber-500/10 hover:brightness-110 active:scale-98 transition-all overflow-hidden cursor-pointer"
                >
                  {/* Hover visual light beam */}
                  <span className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                  {slides[currentIndex].icon}
                  {slides[currentIndex].buttonText}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/45 hover:bg-black/70 text-white border border-white/10 transition-all duration-200 backdrop-blur-xs hover:scale-105 active:scale-95"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/45 hover:bg-black/70 text-white border border-white/10 transition-all duration-200 backdrop-blur-xs hover:scale-105 active:scale-95"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index ? "w-8 bg-amber-400" : "w-2.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
