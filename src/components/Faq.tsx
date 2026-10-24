import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { getStoredFaqs, FaqItem } from '../services/siteStorage';

export const Faq: React.FC = () => {
  const [faqsList, setFaqsList] = useState<FaqItem[]>(getStoredFaqs());
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  // Sync FAQs when updated from Admin Panel
  useEffect(() => {
    const handleSync = () => {
      setFaqsList(getStoredFaqs());
    };
    window.addEventListener('glowboost_faqs_updated', handleSync);
    return () => window.removeEventListener('glowboost_faqs_updated', handleSync);
  }, []);

  return (
    <section id="faq" className="py-20 bg-white text-[#222222] border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D4A017]">
            আপনার কোনো প্রশ্ন আছে?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif]">
            সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            গ্লোবুস্ট-এর অথেনটিক পণ্য, ডেলিভারি এবং অর্ডার প্রক্রিয়া সম্পর্কে প্রয়োজনীয় সকল তথ্য।
          </p>
        </div>

        <div className="space-y-4">
          {faqsList.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.id || idx}
                className="rounded-2xl bg-[#FAF7F0] border border-stone-200 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-[#222222] hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3 text-sm sm:text-base">
                    <HelpCircle className="w-5 h-5 text-[#D4A017] shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180 text-[#D4A017]' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-stone-600 leading-relaxed border-t border-stone-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
