import React from 'react';
import { MessageCircle, Mail, Facebook, Instagram, ShieldCheck, Heart, Lock } from 'lucide-react';
import { getStoredSiteConfig } from '../services/siteStorage';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const config = getStoredSiteConfig();
  const whatsappNum = config.whatsappNumber;
  const tagline = config.brandTagline;
  const codMsg = config.codMessage;

  return (
    <footer id="contact" className="bg-[#101010] text-white border-t border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4A017]/40 shadow bg-[#141414] flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="GlowBoost" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-['Playfair_Display',serif]">
                Glow<span className="text-[#F5C542]">Boost</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#FAF7F0]/70 leading-relaxed">
              {tagline}। শীর্ষস্থানীয় আন্তর্জাতিক ব্র্যান্ড থেকে সরাসরি আমদানিকৃত খাঁটি স্কিনকেয়ার ও প্রসাধনীর বিশ্বস্ত অনলাইন শপ ও ফেসবুক পেজ।
            </p>
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-2 text-xs text-[#F5C542] font-semibold">
                <ShieldCheck className="w-4 h-4" /> ১০০% আসল পণ্যের গ্যারান্টি
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                ✓ {codMsg}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5C542]">প্রয়োজনীয় লিংক</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF7F0]/75">
              <li><a href="#home" className="hover:text-white transition-colors">হোম</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">সকল প্রোডাক্টস</a></li>
              <li><a href="#why-us" className="hover:text-white transition-colors">কেন গ্লোবুস্ট</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">গ্রাহকদের রিভিউ</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">সাধারণ জিজ্ঞাসা (FAQ)</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5C542]">যোগাযোগ ও সাপোর্ট</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#FAF7F0]/85">
              <li>
                <a 
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('আসসালামু আলাইকুম GlowBoost! আমি আপনাদের একটি প্রোডাক্ট সম্পর্কে জানতে চাই।')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#F5C542] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#F5C542]" /> হোয়াটসঅ্যাপ: +{whatsappNum}
                </a>
              </li>
              <li>
                <a 
                  href="mailto:alafsan22@gmail.com"
                  className="flex items-center gap-2 hover:text-[#F5C542] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#F5C542]" /> ইমেইল: alafsan22@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://facebook.com/61573758975647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#F5C542] transition-colors"
                >
                  <Facebook className="w-4 h-4 text-[#F5C542]" /> @GlowBoostBD
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/glowboostbd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#F5C542] transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#F5C542]" /> @glowboostbd
                </a>
              </li>
            </ul>
          </div>

          {/* Order System Architecture */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5C542]">অর্ডার সিস্টেম</h4>
            <p className="text-xs sm:text-sm text-[#FAF7F0]/70 leading-relaxed">
              সরাসরি হোয়াটসঅ্যাপে অর্ডার কনফার্মেশন ও ক্যাশ অন ডেলিভারি ব্যবস্থা সক্রিয় রয়েছে।
            </p>
            <div className="inline-block text-[11px] bg-[#1E1E1E] text-emerald-400 px-3 py-1 rounded-full border border-emerald-900 font-mono">
              অর্ডার মোড: লাইভ হোয়াটসঅ্যাপ প্যানেল
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#222] flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-[#FAF7F0]/50 gap-4">
          <p>© {new Date().getFullYear()} GlowBoost (গ্লোবুস্ট)। সর্বস্বত্ব সংরক্ষিত। ১০০% অথেনটিক বিউটি প্রোডাক্টস।</p>
          <p className="flex items-center gap-1">
            গ্লোবুস্ট ফেসবুক কমিউনিটির জন্য ভালোবাসায় নির্মিত <Heart className="w-3.5 h-3.5 text-[#F5C542] fill-[#F5C542]" />
          </p>
        </div>

      </div>
    </footer>
  );
};
