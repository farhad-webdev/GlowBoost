import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getStoredReviews } from '../services/siteStorage';
import { Review } from '../types';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Quote, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<Review[]>(getStoredReviews());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync reviews when updated from Admin Panel
  useEffect(() => {
    const handleSync = () => {
      setReviewsList(getStoredReviews());
    };
    window.addEventListener('glowboost_reviews_updated', handleSync);
    return () => window.removeEventListener('glowboost_reviews_updated', handleSync);
  }, []);

  // Responsive itemsPerView detection
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, reviewsList.length - itemsPerView);

  // Keep index within bounds if window resizes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerView, maxIndex, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  }, [maxIndex]);

  // Autoplay functionality
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section id="reviews" className="py-20 bg-[#FAF7F0] text-[#222222] border-t border-stone-200 overflow-hidden font-['Noto_Serif_Bengali',serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/25 text-[#B8860B] text-xs font-bold tracking-wider uppercase">
              <HeartHandshake className="w-3.5 h-3.5 text-[#D4A017]" />
              ফেসবুক পরিবারের ভালোবাসা
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif] text-[#141414]">
              সম্মানিত গ্রাহকদের আসল রিভিউ
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              ঢাকা, চট্টগ্রাম, সিলেটসহ সারা বাংলাদেশের অসংখ্য সন্তুষ্ট আপু ও ভাইয়াদের সত্যিকারের অভিজ্ঞতা ও মতামত।
            </p>
          </div>

          {/* Desktop Navigation Controls & Rating Badge */}
          <div className="flex items-center gap-4 self-start md:self-end">
            <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex text-[#D4A017]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4A017]" />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">৫.০ / ৫.০ রেটিং</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Review"
                className="w-11 h-11 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-[#D4A017] hover:border-[#D4A017] hover:bg-[#D4A017]/5 active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Review"
                className="w-11 h-11 rounded-full bg-[#141414] text-white hover:bg-[#D4A017] active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slider Viewport */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {reviewsList.map((review) => (
                <div
                  key={review.id}
                  className="px-3 flex-shrink-0"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="h-full p-6 sm:p-7 rounded-3xl bg-white border border-stone-200 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-xs relative group">
                    
                    {/* Top Decorative Quote Icon */}
                    <div className="absolute top-6 right-6 text-stone-200 group-hover:text-[#D4A017]/25 transition-colors">
                      <Quote className="w-8 h-8 rotate-180" />
                    </div>

                    <div className="space-y-4">
                      {/* Rating Stars & Date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[#D4A017]">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#D4A017]" />
                          ))}
                        </div>
                        <span className="text-xs text-stone-400 font-medium">{review.date}</span>
                      </div>

                      {/* Review Comment */}
                      <p className="text-sm sm:text-[15px] text-stone-700 leading-relaxed italic pr-4">
                        "{review.comment}"
                      </p>

                      {/* Product Name Badge (English name) */}
                      <div className="text-xs font-semibold text-[#B8860B] bg-[#FAF7F0] px-3.5 py-2 rounded-xl border border-stone-200 inline-block max-w-full truncate">
                        <span className="text-stone-500 font-normal">পণ্য: </span>
                        {review.productName}
                      </div>
                    </div>

                    {/* Reviewer Bio & Verified Badge */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#222222] truncate">{review.name}</h4>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>যাচাইকৃত ফেসবুক ক্রেতা</span>
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F5C542] to-[#B8860B] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                        {review.name[0]}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots & Mobile Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 bg-[#D4A017]'
                    : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>

          {/* Trust Guarantees Bar */}
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> ১০০% আসল পণ্যের প্রমাণ
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">সরাসরি ফেসবুক পেজ থেকে সংগৃহীত রিভিউ</span>
          </div>

          {/* Mobile-Only Arrow Navigation */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Review"
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" /> আগেরটি
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Review"
              className="px-4 py-2 rounded-xl bg-[#141414] text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              পরেরটি <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
