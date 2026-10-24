import React from 'react';
import { ShieldCheck, Truck, Clock, Award } from 'lucide-react';
import { COD_MESSAGE } from '../config';

export const WhyUs: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#D4A017]" />,
      title: '১০০% অথেনটিক পণ্য',
      description: 'আমাদের প্রতিটি স্কিনকেয়ার ও বিউটি আইটেম শতভাগ আসল এবং অনুমোদিত গ্লোবাল ডিস্ট্রিবিউটর থেকে সরাসরি আমদানিকৃত।'
    },
    {
      icon: <Truck className="w-8 h-8 text-[#D4A017]" />,
      title: 'ক্যাশ অন ডেলিভারি',
      description: `${COD_MESSAGE}। পার্সেল হাতে পেয়ে চেক করে সম্পূর্ণ নিশ্চিন্তে মূল্য পরিশোধ করুন।`
    },
    {
      icon: <Clock className="w-8 h-8 text-[#D4A017]" />,
      title: 'সারা দেশে দ্রুত ডেলিভারি',
      description: 'ঢাকায় মাত্র ২৪-৪৮ ঘণ্টায় এবং দেশের যেকোনো প্রান্তে ৩-৫ দিনের মধ্যে বিশ্বস্ত হোম ডেলিভারি সার্ভিস।'
    },
    {
      icon: <Award className="w-8 h-8 text-[#D4A017]" />,
      title: 'অরিজিনাল ইমপোর্টেড আইটেম',
      description: 'আন্তর্জাতিক বিউটি হাব থেকে পরীক্ষিত, পার্শ্বপ্রতিক্রিয়াহীন এবং চিকিৎসকদের দ্বারা সমাদৃত স্কিনকেয়ার সামগ্রী।'
    }
  ];

  return (
    <section id="why-us" className="py-20 bg-white text-[#222222] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4A017]">
            কেন গ্লোবুস্ট বেছে নেবেন?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif]">
            বাংলাদেশের রূপচর্চায় আপনার নির্ভরযোগ্য সঙ্গী
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            আমরা আপনার ত্বকের সুরক্ষায় শতভাগ আসল ও যাচাইকৃত বিউটি প্রোডাক্ট সরবরাহ করতে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#FAF7F0] border border-stone-200 hover:border-[#D4A017] transition-all duration-300 space-y-4 group shadow-2xs hover:shadow-xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-[#222222] font-['Playfair_Display','Noto_Serif_Bengali',serif]">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
