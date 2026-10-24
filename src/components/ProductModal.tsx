import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import {
  X,
  Star,
  ShieldCheck,
  Check,
  ShoppingBag,
  Plus,
  Minus,
  MessageCircle,
  User,
  Phone,
  MapPin,
  Truck,
  ArrowLeft,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  generateSingleProductOrderUrl,
  isValidBdPhone,
  openWhatsAppSingleProduct
} from '../checkout';
import { COD_MESSAGE } from '../config';
import { addOrderRecord } from '../services/siteStorage';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  initialStep?: 'details' | 'order';
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  initialStep = 'details'
}) => {
  const [step, setStep] = useState<'details' | 'order'>(initialStep);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Customer order form states
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem('glowboost_customer_name') || '';
    } catch {
      return '';
    }
  });
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem('glowboost_customer_phone') || '';
    } catch {
      return '';
    }
  });
  const [address, setAddress] = useState(() => {
    try {
      return localStorage.getItem('glowboost_customer_address') || '';
    } catch {
      return '';
    }
  });
  const [deliveryLocation, setDeliveryLocation] = useState<'dhaka' | 'outside'>(() => {
    try {
      return (localStorage.getItem('glowboost_delivery_location') as 'dhaka' | 'outside') || 'dhaka';
    } catch {
      return 'dhaka';
    }
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Sync step whenever product or initialStep changes
  useEffect(() => {
    if (product) {
      setStep(initialStep);
      setQuantity(1);
      setFormError(null);
    }
  }, [product, initialStep]);

  if (!product) return null;

  const priceVal = product.priceTk ?? product.price ?? 0;
  const isInboxPrice = priceVal <= 0;
  const deliveryFee = deliveryLocation === 'dhaka' ? 60 : 120;
  const subtotal = priceVal * quantity;
  const total = isInboxPrice ? deliveryFee : subtotal + deliveryFee;

  const handleAdd = () => {
    if (isInboxPrice) {
      setStep('order');
      return;
    }
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleGoToOrderStep = () => {
    setFormError(null);
    setStep('order');
  };

  const handleConfirmWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict validation for Name, Phone, and Address
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      setFormError('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    if (trimmedName.length < 2) {
      setFormError('অনুগ্রহ করে একটি সঠিক ও পূর্ণ নাম লিখুন।');
      return;
    }

    if (!trimmedPhone) {
      setFormError('অনুগ্রহ করে আপনার মোবাইল নম্বর দিন।');
      return;
    }
    if (!isValidBdPhone(trimmedPhone)) {
      setFormError('অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।');
      return;
    }

    if (!trimmedAddress) {
      setFormError('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }
    if (trimmedAddress.length < 6) {
      setFormError('অনুগ্রহ করে বিস্তারিত ঠিকানা দিন (বাসা/রোড, এলাকা ও জেলা)।');
      return;
    }

    // Save to localStorage for convenience
    try {
      localStorage.setItem('glowboost_customer_name', trimmedName);
      localStorage.setItem('glowboost_customer_phone', trimmedPhone);
      localStorage.setItem('glowboost_customer_address', trimmedAddress);
      localStorage.setItem('glowboost_delivery_location', deliveryLocation);
    } catch {
      // ignore localStorage quota errors
    }

    // Save order record to Admin Backend
    try {
      addOrderRecord({
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        customerAddress: trimmedAddress,
        deliveryLocation,
        deliveryFee,
        items: [
          {
            productId: product.id,
            productName: product.name,
            quantity,
            price: priceVal,
          },
        ],
        subtotal,
        total,
        status: 'পেন্ডিং',
      });
    } catch (err) {
      console.error('Failed to log order', err);
    }

    // Generate WhatsApp Order URL with customer Name, Phone, and Address
    const orderUrl = generateSingleProductOrderUrl({
      productName: product.name,
      price: priceVal,
      quantity,
      name: trimmedName,
      phone: trimmedPhone,
      address: trimmedAddress,
      location: deliveryLocation === 'dhaka' ? 'ঢাকার ভেতরে (৳৬০)' : 'ঢাকার বাইরে (৳১২০)',
      deliveryFee,
    });

    // Launch WhatsApp
    window.open(orderUrl, '_blank');
    onClose();
  };

  const listBenefits = product.benefits && product.benefits.length > 0 ? product.benefits : [product.benefit];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto text-[#222222] shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/95 backdrop-blur text-[#222222] border border-stone-200 shadow-md hover:bg-stone-100 transition-all hover:scale-105 cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Product Details View */}
        {step === 'details' && (
          <div className="flex flex-col">
            {/* Top: Image */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-stone-100 overflow-hidden rounded-t-3xl border-b border-stone-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-[#141414] text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Bottom: Texts & Actions */}
            <div className="p-5 sm:p-7 flex flex-col space-y-6">
              <div className="space-y-4">
                {/* Category & Rating */}
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold px-2.5 py-1 bg-stone-100 rounded-full">{product.category}</span>
                  <div className="flex items-center gap-1 text-[#D4A017]">
                    <Star className="w-4 h-4 fill-[#D4A017]" />
                    <span className="font-bold text-[#222222]">{product.rating}</span>
                    <span>({product.reviewsCount}টি রিভিউ)</span>
                  </div>
                </div>

                {/* Product Name */}
                <h2 className="text-xl sm:text-2xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif] text-[#222222] leading-snug">
                  {product.name}
                </h2>

                {/* Price & COD */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  {!isInboxPrice ? (
                    <>
                      <span className="text-2xl font-extrabold text-[#222222]">৳{priceVal}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-stone-400 line-through">৳{product.originalPrice}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-base font-bold text-[#D4A017] bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
                      ইনবক্সে দাম জানুন
                    </span>
                  )}
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> ক্যাশ অন ডেলিভারি
                  </span>
                </div>

                {/* Short benefit */}
                <p className="text-sm text-stone-600 leading-relaxed">
                  {product.benefit}
                </p>

                {/* Key Benefits */}
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-[#D4A017]">মূল উপকারিতাসমূহ</h4>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    {listBenefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ingredients & How to Use */}
                <div className="text-xs text-stone-500 space-y-1.5 pt-2 border-t border-stone-100">
                  {product.ingredients && <p><strong className="text-[#222222]">উপাদান:</strong> {product.ingredients}</p>}
                  {product.howToUse && <p><strong className="text-[#222222]">ব্যবহারবিধি:</strong> {product.howToUse}</p>}
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-semibold">পরিমাণ নির্ধারণ করুন:</span>
                  <div className="flex items-center gap-3 bg-stone-100 border border-stone-200 rounded-full px-3 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 hover:text-[#D4A017] transition-colors cursor-pointer"
                      aria-label="পরিমাণ কমান"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm w-6 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 hover:text-[#D4A017] transition-colors cursor-pointer"
                      aria-label="পরিমাণ বাড়ান"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {!isInboxPrice && (
                    <button
                      type="button"
                      onClick={handleAdd}
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        added
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 border border-stone-200 text-[#222222] hover:bg-stone-200 active:scale-[0.98]'
                      }`}
                    >
                      {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      {added ? 'যুক্ত হয়েছে' : 'কার্টে যোগ করুন'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleGoToOrderStep}
                    className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-[#141414] hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-[#D4A017]/25 cursor-pointer ${
                      isInboxPrice ? 'col-span-full' : ''
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 text-[#141414]" />
                    হোয়াটসঅ্যাপে অর্ডার
                  </button>
                </div>

                <p className="text-[11px] text-center text-stone-500">
                  ⚡ হোয়াটসঅ্যাপে অর্ডারে ক্লিক করে আপনার নাম ও ঠিকানা দিলে সরাসরি কনফার্মেশন পাবেন
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Required Customer Details Form (Name, Phone, Address) */}
        {step === 'order' && (
          <div className="p-5 sm:p-7 space-y-5 animate-fadeIn">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#D4A017] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> পণ্য বিবরণে ফিরুন
              </button>
              <span className="text-[11px] font-bold text-[#D4A017] bg-[#FAF7F0] border border-[#D4A017]/30 px-2.5 py-1 rounded-full">
                ক্যাশ অন ডেলিভারি
              </span>
            </div>

            {/* Form Title */}
            <div>
              <h3 className="text-xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif] text-[#222222]">
                হোয়াটসঅ্যাপে অর্ডার নিশ্চিত করুন
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                অর্ডারটি সম্পূর্ণ করতে দয়া করে আপনার সঠিক নাম, মোবাইল নম্বর ও ডেলিভারি ঠিকানা প্রদান করুন।
              </p>
            </div>

            {/* Selected Product Mini-Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FAF7F0] border border-stone-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-xl bg-white border border-stone-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-[#222222] truncate font-['Playfair_Display','Noto_Serif_Bengali',serif]">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-stone-600">
                    {!isInboxPrice ? `৳${priceVal} × ${quantity} = ৳${subtotal}` : 'ইনবক্সে নির্ধারিত মূল্য'}
                  </span>
                  {/* Mini quantity adjuster */}
                  <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-2 py-0.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-stone-500 hover:text-[#D4A017] p-0.5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs w-4 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-stone-500 hover:text-[#D4A017] p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Fields: Name, Phone, Address */}
            <form onSubmit={handleConfirmWhatsAppOrder} className="space-y-4">
              {/* 1. Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  আপনার নাম <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="আপনার পুরো নাম লিখুন"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-[#222222] placeholder-stone-400 focus:outline-none focus:border-[#D4A017] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* 2. Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="যেমন: 01712345678"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-[#222222] placeholder-stone-400 focus:outline-none focus:border-[#D4A017] focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[10px] text-stone-500">
                  অর্ডারের কনফার্মেশন কলের জন্য সক্রিয় ১১ ডিজিটের নম্বর দিন।
                </p>
              </div>

              {/* 3. Delivery Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="বাসা নং, রোড নং, এলাকা, থানা এবং জেলা"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-[#222222] placeholder-stone-400 focus:outline-none focus:border-[#D4A017] focus:bg-white transition-colors resize-none"
                  />
                </div>
              </div>

              {/* 4. Delivery Area Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  ডেলিভারি এলাকা নির্ধারণ করুন
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('dhaka')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryLocation === 'dhaka'
                        ? 'border-[#D4A017] bg-[#FAF7F0] shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#222222]">ঢাকার ভেতরে</span>
                      <span className="text-xs font-extrabold text-[#D4A017]">৳৬০</span>
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-0.5">২-৩ কার্যদিবস</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('outside')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryLocation === 'outside'
                        ? 'border-[#D4A017] bg-[#FAF7F0] shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#222222]">ঢাকার বাইরে</span>
                      <span className="text-xs font-extrabold text-[#D4A017]">৳১২০</span>
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-0.5">৩-৫ কার্যদিবস</span>
                  </button>
                </div>
              </div>

              {/* Price Calculation Summary Box */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs">
                {!isInboxPrice ? (
                  <>
                    <div className="flex justify-between text-stone-600">
                      <span>পণ্যের মোট মূল্য ({quantity}টি):</span>
                      <span className="font-semibold text-[#222222]">৳{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-semibold text-[#222222]">৳{deliveryFee}</span>
                    </div>
                    <div className="border-t border-stone-200 pt-1.5 flex justify-between font-bold text-sm text-[#222222]">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span className="text-[#D4A017]">৳{total}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-stone-600">
                      <span>পণ্য মূল্য:</span>
                      <span className="font-semibold text-[#D4A017]">ইনবক্সে আলোচনা সাপেক্ষে</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-semibold text-[#222222]">৳{deliveryFee}</span>
                    </div>
                  </>
                )}
                <p className="text-[11px] text-emerald-700 font-medium pt-1 text-center border-t border-stone-200/60 mt-1">
                  ✓ {COD_MESSAGE}
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-[#141414] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-[#D4A017]/25 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#141414]" />
                হোয়াটসঅ্যাপে অর্ডার কনফার্ম করুন
              </button>
            </form>

            <p className="text-[11px] text-center text-stone-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> GlowBoost এর অফিসিয়াল হোয়াটসঅ্যাপে নিরাপদ ও সরাসরি যোগাযোগ
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
