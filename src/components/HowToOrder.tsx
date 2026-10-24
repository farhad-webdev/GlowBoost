import React from 'react';
import { Search, MessageCircle, PackageCheck } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../config';

export const HowToOrder: React.FC = () => {
  const steps = [
    {
      step: '০১',
      title: 'প্রোডাক্ট পছন্দ করুন',
      description: 'আমাদের কালেকশন থেকে আপনার ত্বকের ধরন ও চাহিদা অনুযায়ী ১০০% আসল স্কিনকেয়ার বা মেকআপ আইটেম বেছে নিন।',
      icon: <Search className="w-6 h-6 text-[#D4A017]" />
    },
    {
      step: '০২',
      title: 'হোয়াটসঅ্যাপে অর্ডার দিন',
      description: `প্রোডাক্টের নিচে থাকা 'হোয়াটসঅ্যাপে অর্ডার' বাটনে চাপ দিন অথবা কার্ট থেকে নাম-ঠিকানা লিখে সরাসরি পাঠাতে পারেন। প্রয়োজনে আমাদের ০১৪০১-৩৩৪৪৯৮ নম্বরে চ্যাট করুন।`,
      icon: <MessageCircle className="w-6 h-6 text-[#D4A017]" />
    },
    {
      step: '০৩',
      title: 'ক্যাশ অন ডেলিভারিতে বুঝে নিন',
      description: 'আপনার ঠিকানায় পার্সেল পৌঁছালে নিজের হাতে দেখে ও চেক করে ক্যাশ অন ডেলিভারিতে সম্পূর্ণ নিশ্চিন্তে পেমেন্ট করুন।',
      icon: <PackageCheck className="w-6 h-6 text-[#D4A017]" />
    }
  ];

  return (
    <section className="py-20 bg-white text-[#222222] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4A017]">
            সহজ ৩ ধাপের প্রক্রিয়া
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif]">
            কীভাবে গ্লোবুস্ট থেকে অর্ডার করবেন?
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            আসল ও অথেনটিক বিউটি প্রোডাক্ট অর্ডার করা এখন আগের চেয়েও অনেক সহজ, দ্রুত ও নিরাপদ।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#FAF7F0] border border-stone-200 relative overflow-hidden space-y-6 group hover:border-[#D4A017] transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                  {s.icon}
                </div>
                <span className="text-3xl font-extrabold text-stone-300 font-['Noto_Serif_Bengali',serif] group-hover:text-[#D4A017]/60 transition-colors">
                  {s.step}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#222222] font-['Playfair_Display','Noto_Serif_Bengali',serif]">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 text-xs text-[#D4A017] font-semibold">
                ধাপ {idx + 1} (৩টির মধ্যে)
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
