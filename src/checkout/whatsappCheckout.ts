import { CartItem } from '../types';
import { getStoredSiteConfig } from '../services/siteStorage';

export interface CheckoutDetails {
  name: string;
  phone: string;
  address: string;
  location: string;
  deliveryFee: number;
}

export interface SingleProductOrderDetails {
  productName: string;
  price: number;
  quantity: number;
  name: string;
  phone: string;
  address: string;
  location: string;
  deliveryFee: number;
}

export function normalizeBdPhone(phone: string): string {
  const bengaliToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return phone.replace(/[০-৯]/g, (d) => bengaliToEnglish[d] || d).replace(/[\s-]/g, '');
}

export function isValidBdPhone(phone: string): boolean {
  const clean = normalizeBdPhone(phone);
  const regex = /^(?:\+?88)?01[3-9]\d{8}$/;
  return regex.test(clean);
}

export function generateWhatsAppOrderUrl(
  items: CartItem[],
  details?: CheckoutDetails
): string {
  const config = getStoredSiteConfig();
  const whatsappNumber = config.whatsappNumber;
  const codMsg = config.codMessage;

  let message = `*আসসালামু আলাইকুম GlowBoost! আমি অর্ডার করতে চাই:* 🛍️\n\n`;

  items.forEach((item, idx) => {
    const pPrice = item.product.priceTk ?? item.product.price ?? 0;
    message += `${idx + 1}. *${item.product.name}* (পরিমাণ: ${item.quantity}) - ৳${pPrice * item.quantity}\n`;
  });

  if (details) {
    const subtotal = items.reduce((sum, i) => sum + (i.product.priceTk ?? i.product.price ?? 0) * i.quantity, 0);
    const total = subtotal + details.deliveryFee;
    message += `\n*গ্রাহকের তথ্য:*\n• নাম: ${details.name.trim()}\n• ফোন নম্বর: ${normalizeBdPhone(details.phone.trim())}\n• ঠিকানা: ${details.address.trim()}\n• ডেলিভারি জোন: ${details.location}\n\n*মোট পণ্যের মূল্য:* ৳${subtotal}\n*ডেলিভারি চার্জ:* ৳${details.deliveryFee}\n*সর্বমোট:* ৳${total}\n\n_${codMsg}_\n_দয়া করে আমার অর্ডারটি কনফার্ম করুন!_`;
  } else {
    message += `\n_${codMsg}_\n_দয়া করে আমার অর্ডারটি কনফার্ম করুন!_`;
  }

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function generateSingleProductOrderUrl(details: SingleProductOrderDetails): string {
  const config = getStoredSiteConfig();
  const whatsappNumber = config.whatsappNumber;
  const codMsg = config.codMessage;

  const isInboxPrice = details.price <= 0;
  const subtotal = details.price * details.quantity;
  const total = subtotal + details.deliveryFee;

  let message = `*আসসালামু আলাইকুম GlowBoost! আমি অর্ডার করতে চাই:* 🛍️\n\n`;
  message += `*গ্রাহকের তথ্য:*\n`;
  message += `• নাম: ${details.name.trim()}\n`;
  message += `• ফোন নম্বর: ${normalizeBdPhone(details.phone.trim())}\n`;
  message += `• সম্পূর্ণ ঠিকানা: ${details.address.trim()}\n`;
  message += `• ডেলিভারি এলাকা: ${details.location}\n\n`;
  message += `*অর্ডারকৃত পণ্য:*\n`;
  message += `• পণ্য: *${details.productName}*\n`;
  message += `• পরিমাণ: ${details.quantity}টি\n`;
  if (!isInboxPrice) {
    message += `• পণ্যের মূল্য: ৳${subtotal}\n`;
    message += `• ডেলিভারি চার্জ: ৳${details.deliveryFee}\n`;
    message += `• *সর্বমোট প্রদেয়:* ৳${total}\n\n`;
  } else {
    message += `• মূল্য: ইনবক্সে আলোচনা সাপেক্ষে\n`;
    message += `• ডেলিভারি চার্জ: ৳${details.deliveryFee}\n\n`;
  }
  message += `_${codMsg}_\n`;
  message += `_দয়া করে আমার অর্ডারটি কনফার্ম করুন!_`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppSingleProduct(productName: string) {
  const config = getStoredSiteConfig();
  const whatsappNumber = config.whatsappNumber;
  const message = `আসসালামু আলাইকুম GlowBoost! আমি অর্ডার করতে চাই: ${productName} (পরিমাণ: ১)। দয়া করে কনফার্ম করুন।`;
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
}
