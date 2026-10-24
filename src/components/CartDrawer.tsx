import React, { useState } from 'react';
import { CartItem, CheckoutMode } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { ORDER_MODE, COD_MESSAGE } from '../config';
import { processCheckout } from '../checkout';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOpenWhatsAppCheckout: (deliveryDetails: { name: string; phone: string; address: string; location: string; deliveryFee: number }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOpenWhatsAppCheckout,
}) => {
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>(ORDER_MODE);
  const [deliveryLocation, setDeliveryLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gatewaySimulated, setGatewaySimulated] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const deliveryFee = deliveryLocation === 'dhaka' ? 60 : 120;
  const subtotal = items.reduce((sum, item) => sum + (item.product.priceTk ?? item.product.price ?? 0) * item.quantity, 0);
  const total = subtotal + (items.length > 0 ? deliveryFee : 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setFormError('অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    const details = {
      name,
      phone,
      address,
      location: deliveryLocation === 'dhaka' ? 'ঢাকার ভেতরে (৳৬০)' : 'ঢাকার বাইরে (৳১২০)',
      deliveryFee,
    };

    await processCheckout(items, details, () => {
      onOpenWhatsAppCheckout(details);
    });

    if (checkoutMode === 'payment') {
      setGatewaySimulated(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white border-l border-stone-200 h-full flex flex-col text-[#222222] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D4A017]" />
            <h2 className="text-lg font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif]">আপনার শপিং ব্যাগ ({items.length}টি)</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-stone-100 text-[#222222] hover:bg-stone-200" aria-label="বন্ধ করুন">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER_MODE Architecture Flag Badge */}
        <div className="p-4 bg-[#FAF7F0] border-b border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-600">চেকআউট মোড:</span>
            <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {checkoutMode === 'whatsapp' ? 'হোয়াটসঅ্যাপ অর্ডার' : 'পেমেন্ট গেটওয়ে'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCheckoutMode('whatsapp')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                checkoutMode === 'whatsapp'
                  ? 'bg-[#D4A017] text-white shadow'
                  : 'bg-white border border-stone-200 text-[#222222] hover:bg-stone-50'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপে অর্ডার
            </button>
            <button
              onClick={() => setCheckoutMode('payment')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                checkoutMode === 'payment'
                  ? 'bg-[#D4A017] text-white shadow'
                  : 'bg-white border border-stone-200 text-[#222222] hover:bg-stone-50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> অনলাইন পেমেন্ট (বিকাশ)
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm text-stone-500 font-medium">আপনার শপিং ব্যাগটি বর্তমানে খালি রয়েছে।</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#D4A017] text-white text-xs font-bold rounded-full shadow hover:opacity-90"
              >
                শপিং শুরু করুন
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemPrice = item.product.priceTk ?? item.product.price ?? 0;
              return (
                <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl bg-[#FAF7F0] border border-stone-200">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-white border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#222222] line-clamp-1 font-['Playfair_Display','Noto_Serif_Bengali',serif]">
                        {item.product.name}
                      </h4>
                      <span className="text-xs font-extrabold text-[#D4A017]">৳{itemPrice}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="p-1 hover:text-[#D4A017]"
                          aria-label="কমান"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="p-1 hover:text-[#D4A017]"
                          aria-label="বাড়ান"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        aria-label="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Checkout Form */}
        {items.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-[#FAF7F0] space-y-4">
            {gatewaySimulated ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800">পেমেন্ট গেটওয়ে সফলভাবে সিমুলেট হয়েছে!</h4>
                <p className="text-xs text-stone-600">
                  ভবিষ্যতে বিকাশ/কার্ড চালু করার জন্য মডিউল প্রস্তুত রয়েছে।
                </p>
                <button
                  onClick={() => setGatewaySimulated(false)}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  কার্টে ফিরে যান
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                {formError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                    {formError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="আপনার নাম *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-[#222222] placeholder-stone-400 focus:outline-none focus:border-[#D4A017]"
                  />
                  <input
                    type="tel"
                    placeholder="মোবাইল নম্বর (০১৭...) *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-[#222222] placeholder-stone-400 focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                <textarea
                  placeholder="ডেলিভারি ঠিকানা (বাসা/রোড, এলাকা, জেলা) *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-[#222222] placeholder-stone-400 focus:outline-none focus:border-[#D4A017] resize-none"
                />

                {/* Delivery Location selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-600">ডেলিভারি এলাকা নির্বাচন করুন</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('dhaka')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex justify-between ${
                        deliveryLocation === 'dhaka'
                          ? 'bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]'
                          : 'bg-white border-stone-300 text-stone-700'
                      }`}
                    >
                      <span>ঢাকার ভেতরে</span>
                      <span>৳৬০</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('outside')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex justify-between ${
                        deliveryLocation === 'outside'
                          ? 'bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]'
                          : 'bg-white border-stone-300 text-stone-700'
                      }`}
                    >
                      <span>ঢাকার বাইরে</span>
                      <span>৳১২০</span>
                    </button>
                  </div>
                </div>

                {/* COD Badge Notice */}
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-center font-medium">
                  ✓ {COD_MESSAGE}
                </div>

                {/* Subtotal & Total */}
                <div className="pt-2 space-y-1 border-t border-stone-200 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>মোট পণ্যের মূল্য</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>ডেলিভারি চার্জ</span>
                    <span>৳{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#222222] pt-1">
                    <span>সর্বমোট প্রদেয়</span>
                    <span className="text-[#D4A017]">৳{total}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F5C542] to-[#D4A017] text-[#141414] font-bold text-xs hover:opacity-95 transition-opacity shadow-lg flex items-center justify-center gap-2"
                >
                  {checkoutMode === 'whatsapp' ? (
                    <>
                      <MessageCircle className="w-4 h-4" /> কনফার্ম করুন ও হোয়াটসঅ্যাপে পাঠান
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> ৳{total} টাকা অনলাইন পেমেন্ট করুন
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
