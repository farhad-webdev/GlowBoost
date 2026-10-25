import React from 'react';
import { ShoppingBag, MessageCircle, Menu, X, ShieldCheck } from 'lucide-react';
import { getStoredSiteConfig } from '../services/siteStorage';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const config = getStoredSiteConfig();
  const whatsappNum = config.whatsappNumber;
  const tagline = config.brandTagline;

  return (
    <header id="home" className="sticky top-0 z-40 bg-[#141414]/95 backdrop-blur-md border-b border-[#2A2A2A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Logo & Brand - Secret Ctrl + Shift + Click trigger for Admin Portal */}
        <a
          href="#home"
          onClick={(e) => {
            if (e.ctrlKey && e.shiftKey && onOpenAdmin) {
              e.preventDefault();
              onOpenAdmin();
            }
          }}
          className="flex items-center gap-3 shrink-0 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4A017]/40 shadow-lg shadow-[#D4A017]/20 group-hover:scale-105 transition-transform bg-[#141414] flex items-center justify-center shrink-0">
            <img src="https://drive.google.com/thumbnail?id=1Su39aNp_k2peyU1Hg9xuuQSUnye9NpYC&sz=w1000" alt="GlowBoost" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-['Playfair_Display',serif]">
              Glow<span className="text-[#F5C542]">Boost</span>
            </span>
            <span className="block text-[11px] tracking-wide text-[#FAF7F0]/70 font-medium">
              {tagline}
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-[#FAF7F0]/85">
          <a href="#home" className="hover:text-[#F5C542] transition-colors whitespace-nowrap">হোম</a>
          <a href="#products" className="hover:text-[#F5C542] transition-colors whitespace-nowrap">প্রোডাক্টস</a>
          <a href="#why-us" className="hover:text-[#F5C542] transition-colors whitespace-nowrap">কেন আমরা</a>
          <a href="#reviews" className="hover:text-[#F5C542] transition-colors whitespace-nowrap">রিভিউ</a>
          <a href="#faq" className="hover:text-[#F5C542] transition-colors whitespace-nowrap">প্রশ্নোত্তর</a>
          <a href="#contact" className="hover:text-[#F5C542] transition-colors whitespace-nowrap">যোগাযোগ</a>
        </nav>

        {/* Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          <a
            href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('আসসালামু আলাইকুম GlowBoost! আমি আপনাদের অথেনটিক প্রোডাক্ট সম্পর্কে জানতে চাই।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-semibold text-[#141414] bg-gradient-to-r from-[#F5C542] to-[#D4A017] rounded-full hover:opacity-90 transition-opacity shadow-md whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপ</span>
          </a>

          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] text-white hover:border-[#F5C542]/50 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="শপিং ব্যাগ"
          >
            <ShoppingBag className="w-5 h-5 text-[#F5C542]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4A017] text-[#141414] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-full bg-[#1E1E1E] text-white border border-[#2A2A2A] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#141414] border-b border-[#2A2A2A] px-6 py-6 space-y-4">
          <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-white hover:text-[#F5C542]">হোম</a>
          <a href="#products" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-white hover:text-[#F5C542]">প্রোডাক্টস</a>
          <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-white hover:text-[#F5C542]">কেন আমরা</a>
          <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-white hover:text-[#F5C542]">রিভিউ</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-white hover:text-[#F5C542]">প্রশ্নোত্তর</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-white hover:text-[#F5C542]">যোগাযোগ</a>
          <div className="text-xs text-emerald-400 font-medium bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/50 text-center">
            ✓ {config.codMessage}
          </div>
          <a
            href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('আসসালামু আলাইকুম GlowBoost! আমি আপনাদের অথেনটিক প্রোডাক্ট সম্পর্কে জানতে চাই।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-[#141414] bg-gradient-to-r from-[#F5C542] to-[#D4A017] rounded-xl"
          >
            <MessageCircle className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
          </a>
        </div>
      )}
    </header>
  );
};
