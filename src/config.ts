/**
 * গ্লোবুস্ট (GlowBoost) কনফিগারেশন
 * ORDER_MODE: 'whatsapp' (ফেজ ১) | 'payment' (ফেজ ৩ - পেমেন্ট গেটওয়ে)
 * WHATSAPP_NUMBER: অফিসিয়াল হোয়াটসঅ্যাপ নম্বর (+8801401334498)
 */
export const ORDER_MODE: 'whatsapp' | 'payment' = 'whatsapp';
export const WHATSAPP_NUMBER = '8801401334498';
export const COD_MESSAGE = 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে';
export const BRAND_TAGLINE = '১০০% অথেনটিক বিউটি প্রোডাক্টস';

/**
 * MANUAL PAYMENT (Option 1) — DUMMY values for now.
 * Farhad will replace these with real numbers/accounts later.
 * Edit ONLY this block when real details arrive — the checkout UI reads from here.
 * No PIN, password or OTP is ever stored here.
 */
export const MANUAL_PAYMENT = {
  bkashNumber: '01XXX-XXXXXX',
  bkashType: 'Personal',
  nagadNumber: '01XXX-XXXXXX',
  bankName: 'Dummy Bank',
  bankAccountName: 'GlowBoost',
  bankAccountNumber: '0000-0000-0000',
  bankBranch: 'Dummy Branch',
  isDummy: true,
};
