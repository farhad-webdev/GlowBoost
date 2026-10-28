import React from 'react';
import { CartItem } from '../types';
import { X, MessageCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { WHATSAPP_NUMBER, COD_MESSAGE } from '../config';
import { paymentMethodLabel } from '../checkout/whatsappCheckout';
import { addOrderRecord } from '../services/siteStorage';

interface WhatsAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryDetails: { name: string; phone: string; address: string; location: string; deliveryFee: number; paymentMethod?: import('../types').PaymentMethod; transactionId?: string } | null;
}

export const WhatsAppCheckoutModal: React.FC<WhatsAppCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryDetails,
}) => {
  if (!isOpen || !deliveryDetails) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.product.priceTk ?? item.product.price ?? 0) * item.quantity, 0);
  const total = subtotal + deliveryDetails.deliveryFee;

  const itemsListText = items
    .map((item, idx) => {
      const pPrice = item.product.priceTk ?? item.product.price ?? 0;
      return `${idx + 1}. ${item.product.name} (পরিমাণ: ${item.quantity}) - ৳${pPrice * item.quantity}`;
    })
    .join('\n');

  const message = `*আসসালামু আলাইকুম GlowBoost! আমি অর্ডার করতে চাই:* 🛍️\n\n*গ্রাহকের তথ্য:*\n• নাম: ${deliveryDetails.name}\n• ফোন নম্বর: ${deliveryDetails.phone}\n• ঠিকানা: ${deliveryDetails.address}\n• ডেলিভারি এলাকা: ${deliveryDetails.location}\n• পেমেন্ট: ${paymentMethodLabel(deliveryDetails.paymentMethod)}${deliveryDetails.transactionId ? `\n• Transaction ID: ${deliveryDetails.transactionId}` : ''}\n\n*অর্ডারকৃত পণ্যসমূহ:*\n${itemsListText}\n\n*পণ্যের মূল্য:* ৳${subtotal}\n*ডেলিভারি চার্জ:* ৳${deliveryDetails.deliveryFee}\n*সর্বমোট প্রদেয়:* ৳${total}\n\n_${deliveryDetails.paymentMethod && deliveryDetails.paymentMethod !== 'cod' ? 'পেমেন্ট ম্যানুয়ালি যাচাই করে কনফার্ম করবেন' : COD_MESSAGE}_\n_দয়া করে আমার অর্ডারটি কনফার্ম করুন!_`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full text-[#222222] shadow-2xl relative p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-[#222222] border border-stone-200 hover:bg-stone-200"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif]">হোয়াটসঅ্যাপে অর্ডার পাঠানোর প্রস্তুতি সম্পন্ন</h2>
          <p className="text-xs sm:text-sm text-stone-600">
            নিচের বাটনে ক্লিক করলেই আপনার অর্ডারের সকল তথ্যসহ গ্লোবুস্টের অফিসিয়াল হোয়াটসঅ্যাপে চ্যাট চালু হবে।
          </p>
        </div>

        {/* Order Summary Box */}
        <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-stone-200 space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between font-semibold text-[#D4A017]">
            <span>প্রাপক: {deliveryDetails.name}</span>
            <span>{deliveryDetails.phone}</span>
          </div>
          <p className="text-stone-600">📍 {deliveryDetails.address} ({deliveryDetails.location})</p>

          <div className="border-t border-stone-200 pt-2 space-y-1">
            {items.map((item) => {
              const pPrice = item.product.priceTk ?? item.product.price ?? 0;
              return (
                <div key={item.product.id} className="flex justify-between text-stone-700">
                  <span>{item.product.name} (x{item.quantity})</span>
                  <span>৳{pPrice * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-sm text-[#222222]">
            <span>সর্বমোট প্রদেয়:</span>
            <span className="text-[#D4A017]">৳{total}</span>
          </div>
          <div className="text-xs text-stone-700 pt-1">
            পেমেন্ট: <b>{paymentMethodLabel(deliveryDetails.paymentMethod)}</b>{deliveryDetails.transactionId ? ` — Transaction ID: ${deliveryDetails.transactionId}` : ''}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium text-center pt-1">
            ✓ {deliveryDetails.paymentMethod && deliveryDetails.paymentMethod !== 'cod' ? 'পেমেন্ট ম্যানুয়ালি যাচাই করে অর্ডার কনফার্ম করা হবে' : COD_MESSAGE}
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              try {
                addOrderRecord({
                  customerName: deliveryDetails.name,
                  customerPhone: deliveryDetails.phone,
                  customerAddress: deliveryDetails.address,
                  deliveryLocation: deliveryDetails.location === 'ঢাকার ভেতরে' || deliveryDetails.location === 'dhaka' ? 'dhaka' : 'outside',
                  deliveryFee: deliveryDetails.deliveryFee,
                  items: items.map((i) => ({
                    productId: i.product.id,
                    productName: i.product.name,
                    quantity: i.quantity,
                    price: i.product.priceTk ?? i.product.price ?? 0,
                  })),
                  subtotal,
                  total,
                  status: 'পেন্ডিং',
                });
              } catch (e) {
                console.error(e);
              }
              onClose();
            }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#F5C542] to-[#D4A017] text-[#141414] font-bold text-sm hover:opacity-95 transition-opacity shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" /> হোয়াটসঅ্যাপ খুলুন ও অর্ডার পাঠান
          </a>
          <p className="text-[11px] text-center text-stone-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> গ্লোবুস্টের অফিসিয়াল হোয়াটসঅ্যাপের সাথে নিরাপদ ও সরাসরি চ্যাট
          </p>
        </div>

      </div>
    </div>
  );
};
