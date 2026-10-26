import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getStoredProducts } from '../services/siteStorage';
import { Star, ShoppingBag, Eye, Search, CheckCircle2, MessageCircle } from 'lucide-react';

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product, initialStep?: 'details' | 'order') => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onAddToCart, onSelectProduct }) => {
  const [productsList, setProductsList] = useState<Product[]>(getStoredProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>('সবগুলো');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConcern, setSelectedConcern] = useState<string>('সব');
  const [addedId, setAddedId] = useState<string | null>(null);

  // Sync products list when admin updates products
  useEffect(() => {
    const handleSync = () => {
      setProductsList(getStoredProducts());
    };
    window.addEventListener('glowboost_products_updated', handleSync);
    return () => window.removeEventListener('glowboost_products_updated', handleSync);
  }, []);


  const concernOptions = [
    { key: 'সব', label: 'সব' },
    { key: 'dry', label: 'শুষ্ক ত্বক' },
    { key: 'oily', label: 'তৈলাক্ত ত্বক' },
    { key: 'acne', label: 'ব্রণপ্রবণ' },
    { key: 'sun', label: 'সান প্রোটেকশন' },
  ];
  const getConcerns = (product: Product): string[] => {
    if (product.skinConcerns && product.skinConcerns.length > 0) return product.skinConcerns;
    const text = (product.name + ' ' + product.benefit).toLowerCase();
    const out: string[] = [];
    if (text.includes('sunblock') || text.includes('sun cream') || text.includes('sunscreen') || text.includes('spf') || text.includes('sun ')) out.push('sun');
    if (text.includes('hyaluronic') || text.includes('hydra') || text.includes('baume') || text.includes('moisturis') || text.includes('cream')) out.push('dry');
    if (text.includes('cleansing oil') || text.includes('facial wash') || text.includes('water gel') || text.includes('oil')) out.push('oily');
    if (text.includes('aha') || text.includes('bha') || text.includes('peeling') || text.includes('snail') || text.includes('centella')) out.push('acne');
    return out;
  };
  const getStock = (product: Product): { label: string; cls: string; dot: string } => {
    if (product.stockStatus === 'low_stock') return { label: 'কম স্টক', cls: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' };
    if (product.stockStatus === 'out_of_stock' || product.inStock === false) return { label: 'স্টক শেষ', cls: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500' };
    return { label: 'স্টকে আছে', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' };
  };
  const getHighlight = (product: Product): string | null => {
    if (product.highlightBadge === 'best_seller') return 'বেস্ট সেলার';
    if (product.highlightBadge === 'new') return 'নতুন';
    if (product.name.includes('Beauty of Joseon Relief Sun')) return 'বেস্ট সেলার';
    if (product.name.includes('Neutrogena Ultra Sheer')) return 'নতুন';
    return null;
  };
  const categories = ['সবগুলো', 'স্কিন কেয়ার', 'সান কেয়ার', 'হেয়ার কেয়ার', 'গিফট কিট'];

  const filteredProducts = productsList.filter((product) => {
    const matchesCategory = selectedCategory === 'সবগুলো' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.benefit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesConcern = selectedConcern === 'সব' || getConcerns(product).includes(selectedConcern);
    return matchesCategory && matchesSearch && matchesConcern;
  });

  const handleAddToCartClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const priceVal = product.priceTk ?? product.price ?? 0;
    if (priceVal <= 0) {
      onSelectProduct(product, 'order');
      return;
    }
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleWhatsAppOrderClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectProduct(product, 'order');
  };

  return (
    <section id="products" className="py-20 bg-[#FAF7F0] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left sm:text-center max-w-2xl sm:mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4A017]">
            অথেনটিক গ্লো কালেকশন · সারা বাংলাদেশে ক্যাশ অন ডেলিভারি
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif]">
            বেস্ট সেলার ও সকল বিউটি প্রোডাক্টস
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            আমাদের প্রতিটি পণ্য ১০০% অরিজিনাল। সরাসরি দ্রুত কিনতে "হোয়াটসঅ্যাপে অর্ডার"<br className="hidden md:block" /> বাটনে ক্লিক করুন অথবা কার্টে যোগ করুন।
          </p>
        </div>

        {/* Filter & Search Bar - Mobile-First Responsive Design */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-10">
          
          {/* Scrollable Category Filter Pills */}
          <div className="w-full md:w-auto overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-[#141414] font-bold shadow-md shadow-[#D4A017]/25'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-[#D4A017] hover:text-[#141414] shadow-xs active:bg-stone-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin Concern Filter Pills */}
          <div className="w-full">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              <span className="text-xs font-bold text-stone-500 whitespace-nowrap shrink-0">ত্বকের ধরন:</span>
              {concernOptions.map((c) => {
                const isActive = selectedConcern === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setSelectedConcern(c.key)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#141414] text-white shadow-md'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-[#D4A017] hover:text-[#141414] shadow-xs'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Box with Clear Button */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="সিরাম, সানস্ক্রিন বা কিট খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-stone-300 rounded-full text-xs sm:text-sm text-[#222222] placeholder-stone-400 focus:outline-none focus:border-[#D4A017] transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs p-1"
                aria-label="অনুসন্ধান মুছে ফেলুন"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Product Grid - 2 columns on mobile, 2 on sm, 3 on md, 4 on lg */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
            <p className="text-base sm:text-lg font-medium text-stone-600">
              আপনার অনুসন্ধানের সাথে মিল রেখে কোনো প্রোডাক্ট পাওয়া যায়নি।
            </p>
            <button
              onClick={() => {
                setSelectedCategory('সবগুলো');
                setSearchQuery('');
                setSelectedConcern('সব');
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#D4A017] text-white text-xs sm:text-sm font-bold hover:bg-[#B8860B] transition-colors cursor-pointer"
            >
              সব প্রোডাক্ট দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => {
              const priceVal = product.priceTk ?? product.price ?? 0;
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product, 'details')}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 overflow-hidden hover:border-[#D4A017] transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div>
                    {/* Image Container - High clarity, clear product photo display */}
                    <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden border-b border-stone-100 flex items-center justify-center p-1 sm:p-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />

                      {/* Highlight Badge: Best Seller / New */}
                      {getHighlight(product) && (
                        <span className="absolute top-2 right-11 sm:top-3 sm:right-12 bg-[#141414] text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-full uppercase tracking-wider shadow-sm z-10 pointer-events-none">
                          {getHighlight(product)}
                        </span>
                      )}

                      {/* Badge */}
                      {product.badge && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#D4A017] text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-full uppercase tracking-wider shadow-sm z-10 pointer-events-none">
                          {product.badge}
                        </span>
                      )}

                      {/* Quick Eye Button top right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product, 'details');
                        }}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-[#D4A017] flex items-center justify-center shadow-md transition-transform active:scale-95 z-10 cursor-pointer"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Hover Overlay for larger screens */}
                      <div className="hidden sm:flex absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 pointer-events-none">
                        <span className="px-3.5 py-1.5 bg-white/95 backdrop-blur-md text-[#222222] rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                          <Eye className="w-3.5 h-3.5 text-[#D4A017]" /> বিস্তারিত দেখুন
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5">
                      
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500">
                        <span className="font-semibold text-stone-500 truncate max-w-[55%]">{product.category}</span>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[#D4A017] shrink-0">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#D4A017]" />
                          <span className="font-bold text-[#222222] text-[10px] sm:text-xs">{product.rating}</span>
                          <span className="text-stone-400 text-[9px] sm:text-[11px] hidden sm:inline">({product.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#141414] font-['Playfair_Display','Noto_Serif_Bengali',serif] group-hover:text-[#D4A017] transition-colors line-clamp-2 leading-tight min-h-[2rem] sm:min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      {/* Short Benefit */}
                      <p className="text-[10px] sm:text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {product.benefit}
                      </p>

                      {/* Stock Status */}
                      <p className="pt-1">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${getStock(product).cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStock(product).dot}`}></span>
                          {getStock(product).label}
                        </span>
                      </p>

                    </div>
                  </div>

                  {/* Card Bottom: Price & WhatsApp / Cart Actions */}
                  <div className="p-2.5 pt-0 sm:p-4 sm:pt-0 space-y-2">
                    
                    {/* Price & Add to Cart */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div>
                        {priceVal > 0 ? (
                          <div className="flex items-baseline gap-1 sm:gap-1.5">
                            <span className="text-sm sm:text-base md:text-lg font-black text-[#141414]">৳{priceVal}</span>
                            {product.originalPrice && (
                              <span className="text-[10px] sm:text-xs text-stone-400 line-through">৳{product.originalPrice}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-bold text-[#D4A017] bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                            ইনবক্সে দাম
                          </span>
                        )}
                      </div>

                      {priceVal > 0 && (
                        <button
                          type="button"
                          onClick={(e) => handleAddToCartClick(product, e)}
                          className={`p-1.5 sm:px-3 sm:py-2 rounded-xl font-semibold text-[10px] sm:text-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                            addedId === product.id
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-stone-100 text-[#222222] border border-stone-200 hover:bg-[#D4A017] hover:text-white hover:border-[#D4A017]'
                          }`}
                          title="কার্টে যোগ করুন"
                        >
                          {addedId === product.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">যুক্ত হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">কার্ট</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Direct WhatsApp Order Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWhatsAppOrderClick(product, e)}
                      className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-[#141414] font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 hover:brightness-105 active:scale-[0.98] transition-all shadow-xs cursor-pointer text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#141414] shrink-0" />
                      <span>হোয়াটসঅ্যাপে অর্ডার</span>
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
