import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  ShoppingBag,
  Flame
} from 'lucide-react';
import { WHATSAPP_NUMBER, BRAND_TAGLINE } from '../config';
import PRODUCTS from '../data/products.json';
import { Product } from '../types';

interface HeroProps {
  onSelectProduct?: (product: Product, initialStep?: 'details' | 'order') => void;
  onAddToCart?: (product: Product) => void;
}

import { getStoredProducts, getStoredHeroConfig, HeroConfig } from '../services/siteStorage';

export const Hero: React.FC<HeroProps> = ({ onSelectProduct, onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>(getStoredProducts());
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(getStoredHeroConfig());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Sync data when updated from Admin Panel
  useEffect(() => {
    const handleSync = () => {
      setProducts(getStoredProducts());
      setHeroConfig(getStoredHeroConfig());
    };
    window.addEventListener('glowboost_products_updated', handleSync);
    window.addEventListener('glowboost_hero_updated', handleSync);
    return () => {
      window.removeEventListener('glowboost_products_updated', handleSync);
      window.removeEventListener('glowboost_hero_updated', handleSync);
    };
  }, []);

  const nextSlide = useCallback(() => {
    setProducts((latestProds) => {
      if (latestProds.length <= 1) return latestProds;
      setCurrentIndex((prev) => (prev + 1) % latestProds.length);
      return latestProds;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setProducts((latestProds) => {
      if (latestProds.length <= 1) return latestProds;
      setCurrentIndex((prev) => (prev - 1 + latestProds.length) % latestProds.length);
      return latestProds;
    });
  }, []);

  // Auto-advance slides every 4.5 seconds
  useEffect(() => {
    if (isPaused || products.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide, products.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  const handleAddToCartClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1500);
    }
  };

  const currentProduct = products[currentIndex] || products[0];
  const priceVal = currentProduct ? (currentProduct.priceTk ?? currentProduct.price ?? 0) : 0;

  return (
    <section className="relative bg-[#FAF7F0] overflow-hidden py-14 sm:py-20 lg:py-24 border-b border-stone-200">
      {/* Background ambient gold lights */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#D4A017]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-[#F5C542]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">

            {/* Main Headline with clean gold text and no background */}
            <h1 className="text-[34px] sm:text-4xl lg:text-[52px] font-bold text-[#141414] font-['Noto_Serif_Bengali',serif] leading-[1.35] sm:leading-[1.3] lg:leading-[1.25] tracking-tight">
              {heroConfig.headlineMain}{' '}
              <span className="inline-block text-[#D4A017] font-extrabold">
                {heroConfig.headlineHighlight}
              </span>{' '}
              প্রকাশ করুন
            </h1>

            {/* Tagline & Subtext */}
            <div className="space-y-3">
              <p className="text-sm sm:text-lg font-semibold text-[#B8860B] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4A017] shrink-0" /> {heroConfig.taglineText}
              </p>
              <p className="text-xs sm:text-base text-stone-600 max-w-xl leading-relaxed">
                {heroConfig.subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
              <a
                href="#products"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-[#141414] font-bold text-sm sm:text-base hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-[#D4A017]/25 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                এখনই কিনুন <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>

              {currentProduct && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct(currentProduct, 'order');
                    }
                  }}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-[#141414] font-bold text-sm sm:text-base hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-[#D4A017]/25 flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#141414]" />
                  <span>হোয়াটসঅ্যাপে অর্ডার</span>
                </button>
              )}
            </div>

            {/* Trust Highlights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 border border-stone-200/90 shadow-xs hover:border-[#D4A017]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center shrink-0 border border-[#D4A017]/20 text-[#D4A017]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#141414] truncate">{heroConfig.highlight1Title}</h4>
                  <p className="text-[11px] text-stone-500 truncate">{heroConfig.highlight1Desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 border border-stone-200/90 shadow-xs hover:border-[#D4A017]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center shrink-0 border border-[#D4A017]/20 text-[#D4A017]">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#141414] truncate">{heroConfig.highlight2Title}</h4>
                  <p className="text-[11px] text-stone-500 truncate">{heroConfig.highlight2Desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 border border-stone-200/90 shadow-xs hover:border-[#D4A017]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center shrink-0 border border-[#D4A017]/20 text-[#D4A017]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#141414] truncate">{heroConfig.highlight3Title}</h4>
                  <p className="text-[11px] text-stone-500 truncate">{heroConfig.highlight3Desc}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Product Slider Column */}
          <div 
            className="lg:col-span-5 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Glow Ring */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#F5C542]/15 via-[#D4A017]/10 to-[#B8860B]/15 rounded-[32px] blur-md opacity-40 pointer-events-none" />
            
            {/* Outer Rounded Container */}
            <div className="relative rounded-[28px] overflow-hidden border border-stone-300/80 shadow-xs bg-[#201D1A] group select-none flex flex-col">
              
              {/* 1. TOP: Full Lifestyle Image Display */}
              <div 
                className="relative w-full h-[320px] sm:h-[380px] bg-stone-900 overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => onSelectProduct && onSelectProduct(currentProduct)}
              >
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-xs pointer-events-auto">
                    <Flame className="w-3.5 h-3.5 text-[#F5C542]" />
                    <span>১০০% অথেনটিক</span>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-xs pointer-events-auto">
                    <span className="text-[#F5C542]">{currentIndex + 1}</span>
                    <span className="text-white/40">/</span>
                    <span>{products.length}</span>
                  </div>
                </div>

                {/* Left/Right Slider Navigation Arrow Buttons */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xs cursor-pointer backdrop-blur-sm"
                  aria-label="পূর্ববর্তী প্রোডাক্ট"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xs cursor-pointer backdrop-blur-sm"
                  aria-label="পরবর্তী প্রোডাক্ট"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slide Images Stack */}
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${
                      idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
              
              {/* 2. FLOATING OVERLAPPING WHITE CARD */}
              <div className="relative -mt-20 sm:-mt-24 z-20 mx-3 sm:mx-4 mb-3.5 p-4 sm:p-5 bg-[#FAF8F5] rounded-[24px] shadow-xs border border-stone-200/90 space-y-3">
                
                {/* Category Tag & Rating */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-extrabold text-[#B8860B] tracking-wider uppercase bg-[#FFF6D6] px-3 py-1 rounded-lg border border-[#FFE899]">
                    {currentProduct.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#D4A017]">
                    <Star className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                    <span className="font-extrabold text-[#141414] text-xs">{currentProduct.rating}</span>
                    <span className="text-stone-500 text-[11px]">({currentProduct.reviewsCount} রিভিউ)</span>
                  </div>
                </div>

                {/* Title & Benefit */}
                <div 
                  className="cursor-pointer space-y-0.5"
                  onClick={() => onSelectProduct && onSelectProduct(currentProduct)}
                >
                  <h3 className="text-base sm:text-lg font-bold text-[#141414] font-['Playfair_Display','Noto_Serif_Bengali',serif] hover:text-[#D4A017] transition-colors line-clamp-1 leading-snug">
                    {currentProduct.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1 leading-relaxed">
                    {currentProduct.benefit}
                  </p>
                </div>

                {/* Price & Availability */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {priceVal > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg sm:text-xl font-black text-[#D4A017]">৳{priceVal}</span>
                        {currentProduct.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">৳{currentProduct.originalPrice}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-[#D4A017] bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                        ইনবক্সে দাম জানুন
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> স্টকে এভেইলেবল
                  </span>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-1">
                  {/* WhatsApp Direct Order Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProduct) {
                        onSelectProduct(currentProduct, 'order');
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#D4A017] hover:bg-[#c29312] text-[#141414] font-extrabold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 text-center cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-[#141414] shrink-0" />
                    <span>হোয়াটসঅ্যাপে অর্ডার</span>
                  </button>

                  {/* Add to Cart Button */}
                  {onAddToCart && priceVal > 0 && (
                    <button
                      type="button"
                      onClick={(e) => handleAddToCartClick(currentProduct, e)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shrink-0 cursor-pointer ${
                        addedId === currentProduct.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white hover:bg-stone-50 text-[#141414] border-stone-200'
                      }`}
                      title="কার্টে যোগ করুন"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{addedId === currentProduct.id ? 'যুক্ত হয়েছে' : 'কার্ট'}</span>
                    </button>
                  )}

                  {/* View Details Button */}
                  {onSelectProduct && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(currentProduct);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 hover:text-black border border-stone-200 text-xs font-semibold transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      title="বিস্তারিত দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Slider Dot Indicators */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {products.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-1.5 transition-all rounded-full cursor-pointer ${
                        idx === currentIndex
                          ? 'w-6 bg-[#D4A017]'
                          : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                      }`}
                      aria-label={`স্লাইড ${idx + 1}`}
                    />
                  ))}
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
