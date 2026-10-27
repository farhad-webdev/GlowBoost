import { Product, Review } from '../types';
import INITIAL_PRODUCTS from '../data/products.json';
import { db, auth } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryLocation: 'dhaka' | 'outside';
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: 'পেন্ডিং' | 'কনফার্মড' | 'ডেলিভার্ড' | 'বাতিল';
  notes?: string;
}

export interface SiteConfig {
  whatsappNumber: string;
  brandTagline: string;
  announcementText: string;
  dhakaDeliveryFee: number;
  outsideDeliveryFee: number;
  codMessage: string;
  adminPin: string;
}

export interface HeroConfig {
  headlineMain: string;
  headlineHighlight: string;
  subtitle: string;
  taglineText: string;
  highlight1Title: string;
  highlight1Desc: string;
  highlight2Title: string;
  highlight2Desc: string;
  highlight3Title: string;
  highlight3Desc: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

const PRODUCTS_KEY = 'glowboost_admin_products_v3';
// Bump this whenever src/data/products.json changes, so browsers with an
// older cached product list automatically reseed from the new bundle
// instead of showing stale images/prices forever.
const PRODUCTS_CACHE_VERSION = 'v16';
const PRODUCTS_VERSION_KEY = 'glowboost_products_version';
const ORDERS_KEY = 'glowboost_admin_orders_v2';
const CONFIG_KEY = 'glowboost_admin_config_v2';
const REVIEWS_KEY = 'glowboost_admin_reviews_v2';
const FAQS_KEY = 'glowboost_admin_faqs_v2';
const HERO_KEY = 'glowboost_admin_hero_v2';

export const DEFAULT_CONFIG: SiteConfig = {
  whatsappNumber: '8801401334498',
  brandTagline: '১০০% অথেনটিক বিউটি প্রোডাক্টস',
  announcementText: '🎉 সকল অর্ডারে সারা বাংলাদেশে ক্যাশ অন ডেলিভারি ও দ্রুত হোম ডেলিভারি!',
  dhakaDeliveryFee: 60,
  outsideDeliveryFee: 120,
  codMessage: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে',
  adminPin: '123456',
};

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  headlineMain: 'আপনার ত্বকের আসল রূপ ও',
  headlineHighlight: 'উজ্জ্বলতা',
  subtitle: 'আন্তর্জাতিক বিশ্বস্ত ব্র্যান্ড থেকে সরাসরি সংগৃহীত ১০০% আসল স্কিনকেয়ার, সিরাম এবং সানস্ক্রিন। কোনো নকল বা ক্ষতিকর কেমিক্যাল মুক্ত সুস্থ ও ন্যাচারাল গ্লো পান নিশ্চিন্তে।',
  taglineText: '১০০% অথেনটিক বিউটি প্রোডাক্টস',
  highlight1Title: '১০০% অথেনটিক',
  highlight1Desc: 'বারকোড স্ক্যান গ্যারান্টি',
  highlight2Title: 'ক্যাশ অন ডেলিভারি',
  highlight2Desc: 'সারা দেশে দ্রুত ডেলিভারি',
  highlight3Title: 'সহজ চেক পলিসি',
  highlight3Desc: 'দেখে মূল্য পরিশোধের সুযোগ',
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'গ্লোবুস্ট-এর প্রোডাক্টগুলো কি ১০০% অথেনটিক ও আসল?',
    answer: 'হ্যাঁ, একশো ভাগ নিশ্চিত থাকুন! আমাদের প্রতিটি পণ্য অনুমোদিত অফিশিয়াল গ্লোবাল ডিস্ট্রিবিউটর ও ব্র্যান্ডের কাছ থেকে সরাসরি আমদানিকৃত। আমরা কোনো ধরনের নকল, রেপ্লিকা বা অননুমোদিত পণ্য বিক্রি করি না।'
  },
  {
    id: 'faq-2',
    question: 'ডেলিভারি পেতে কত দিন সময় লাগে?',
    answer: 'ঢাকা সিটির ভেতরে মাত্র ২৪ থেকে ৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি পৌঁছে দেওয়া হয়। ঢাকার বাইরে সারা বাংলাদেশের যেকোনো জেলা বা থানা শহরে ৩ থেকে ৫ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে ডেলিভারি করা হয়।'
  },
  {
    id: 'faq-3',
    question: 'ক্যাশ অন ডেলিভারি (COD) কি সারা বাংলাদেশে পাওয়া যায়?',
    answer: 'হ্যাঁ! সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। আপনি পার্সেল হাতে পেয়ে, প্রোডাক্ট দেখে ও চেক করে তারপর ডেলিভারি ম্যানের কাছে টাকা পরিশোধ করতে পারবেন।'
  },
  {
    id: 'faq-4',
    question: 'রিটার্ন বা এক্সচেঞ্জের নিয়ম কী?',
    answer: 'যদি ডেলিভারির সময় প্রোডাক্টে কোনো ক্ষতি বা ত্রুটি পাওয়া যায়, ডেলিভারি ম্যান উপস্থিত থাকাকালীন সময়ে আমাদের সাথে যোগাযোগ করে সহজেই রিটার্ন বা এক্সচেঞ্জ করে নিতে পারবেন।'
  },
  {
    id: 'faq-5',
    question: 'আমি কীভাবে খুব সহজে অর্ডার করতে পারি?',
    answer: 'যেকোনো পণ্যের পাশে থাকা "হোয়াটসঅ্যাপে অর্ডার" বাটনে ক্লিক করলে সরাসরি আপনার পছন্দের পণ্যের নামসহ আমাদের হোয়াটসঅ্যাপ ইনবক্স খুলে যাবে। অথবা ওয়েবসাইটে কার্টে প্রোডাক্ট যোগ করে আপনার নাম, মোবাইল নম্বর ও ঠিকানা লিখে অর্ডার সেন্ড করতে পারবেন।'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'GB-1001',
    orderDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    customerName: 'তানজিলা রহমান',
    customerPhone: '01712345678',
    customerAddress: 'বাসা ৪২, রোড ৭, ধানমন্ডি, ঢাকা',
    deliveryLocation: 'dhaka',
    deliveryFee: 60,
    items: [
      {
        productId: 'gb-01',
        productName: 'Aurelia 20% Vitamin C Radiance Serum',
        quantity: 1,
        price: 1450,
      },
    ],
    subtotal: 1450,
    total: 1510,
    status: 'পেন্ডিং',
  },
  {
    id: 'GB-1002',
    orderDate: new Date(Date.now() - 3600000 * 20).toISOString(),
    customerName: 'সাইফুল ইসলাম',
    customerPhone: '01898765432',
    customerAddress: 'জিইসি মোড়, সিডিএ অ্যাভিনিউ, চট্টগ্রাম',
    deliveryLocation: 'outside',
    deliveryFee: 120,
    items: [
      {
        productId: 'gb-02',
        productName: 'Nurture Botanical Mineral Sunscreen SPF 50+',
        quantity: 2,
        price: 1250,
      },
    ],
    subtotal: 2500,
    total: 2620,
    status: 'কনফার্মড',
  },
  {
    id: 'GB-1003',
    orderDate: new Date(Date.now() - 3600000 * 48).toISOString(),
    customerName: 'নুসরাত জাহান',
    customerPhone: '01911223344',
    customerAddress: 'হাউজ ১২, ব্লক সি, বসুন্ধরা আর/এ, ঢাকা',
    deliveryLocation: 'dhaka',
    deliveryFee: 60,
    items: [
      {
        productId: 'gb-05',
        productName: 'The Ultimate Glow Radiance Gift Collection (5-in-1 Kit)',
        quantity: 1,
        price: 3450,
      },
    ],
    subtotal: 3450,
    total: 3510,
    status: 'ডেলিভার্ড',
  },
];

// --- PRODUCTS ---
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    const ver = localStorage.getItem(PRODUCTS_VERSION_KEY);
    if (!raw || ver !== PRODUCTS_CACHE_VERSION) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_CACHE_VERSION);
      return INITIAL_PRODUCTS as Product[];
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS as Product[];
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_CACHE_VERSION);
    window.dispatchEvent(new Event('glowboost_products_updated'));

    // Sync each product to Firestore, stamped with the cache version
    products.forEach((p) => {
      setDoc(doc(db, 'products', p.id), { ...p, cacheVersion: PRODUCTS_CACHE_VERSION }).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `products/${p.id}`)
      );
    });
  } catch (e) {
    console.error('Failed to save products', e);
  }
}

export function resetProductsToDefault(): Product[] {
  saveProducts(INITIAL_PRODUCTS as Product[]);
  return INITIAL_PRODUCTS as Product[];
}

// --- HERO CONFIG ---
export function getStoredHeroConfig(): HeroConfig {
  try {
    const raw = localStorage.getItem(HERO_KEY);
    if (!raw) {
      localStorage.setItem(HERO_KEY, JSON.stringify(DEFAULT_HERO_CONFIG));
      return DEFAULT_HERO_CONFIG;
    }
    return { ...DEFAULT_HERO_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_HERO_CONFIG;
  }
}

export function saveHeroConfig(config: Partial<HeroConfig>): HeroConfig {
  const current = getStoredHeroConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(HERO_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('glowboost_hero_updated'));

    setDoc(doc(db, 'config', 'hero'), updated).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, 'config/hero')
    );
  } catch (e) {
    console.error('Failed to save hero config', e);
  }
  return updated;
}

const DEFAULT_10_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'ফারহানা ইয়াসমিন (ঢাকা)',
    rating: 5,
    date: '২ দিন আগে',
    comment: 'গ্লোবুস্ট-এর ভিটামিন সি সিরাম ব্যবহার করে আমার মুখের কালচে দাগ অনেক কমে গেছে এবং স্কিনে অন্যরকম এক গ্লো এসেছে! ১০০% অরিজিনাল প্রোডাক্ট। ঢাকায় মাত্র ১ দিনেই ডেলিভারি পেয়েছি। অসংখ্য ধন্যবাদ!',
    verified: true,
    productName: 'Aurelia 20% Vitamin C Radiance Serum'
  },
  {
    id: 'rev-2',
    name: 'নুসরাত জাহান মিম (চট্টগ্রাম)',
    rating: 5,
    date: '৩ দিন আগে',
    comment: 'আমি আল্টিমেট গ্লো কিট অর্ডার করেছিলাম। বক্সের প্যাকেজিং সত্যি রাজকীয় ছিল! আর সানস্ক্রিনটা এত সুন্দর ম্যাট হয়, একটুও সাদা দাগ থাকে না। গরমের দিনে ব্যবহারের জন্য সেরা।',
    verified: true,
    productName: 'The Ultimate Glow Radiance Gift Collection (5-in-1 Kit)'
  },
  {
    id: 'rev-3',
    name: 'সাদিয়া আফরিন (সিলেট)',
    rating: 5,
    date: '৪ দিন আগে',
    comment: 'হোয়াটসঅ্যাপে অর্ডার কনফার্ম করা একদম সহজ ছিল। কাস্টমার কেয়ারের আপু অনেক সুন্দর করে বুঝিয়ে দিয়েছেন। প্রোডাক্ট হাতে পেয়ে বারকোড স্ক্যান করে অথেনটিসিটি চেক করে পেমেন্ট করেছি। থ্যাংক ইউ GlowBoost!',
    verified: true,
    productName: 'Nurture Botanical Mineral Sunscreen SPF 50+'
  },
  {
    id: 'rev-4',
    name: 'তানিয়া সুলতানা (রাজশাহী)',
    rating: 5,
    date: '৫ দিন আগে',
    comment: 'আমি হাইয়ালুরোনিক অ্যাসিড জেলি ক্রিমটা নিয়েছি। আমার স্কিন অনেক ড্রাই ছিল, ব্যবহারের পর এখন সবসময় সফট ও প্লাম্প থাকে। অর্জিনাল কোরিয়ান প্রোডাক্টের গুণমানই আলাদা!',
    verified: true,
    productName: 'Glow Hyaluronic Acid Hydrating Gel Cream'
  },
  {
    id: 'rev-5',
    name: 'রাইসা ইসলাম (বরিশাল)',
    rating: 5,
    date: '১ সপ্তাহ আগে',
    comment: 'ঢাকার বাইরে কুরিয়ারে মাত্র ২ দিনেই ক্যাশ অন ডেলিভারিতে পার্সেল পেয়েছি। পার্সেল খুলে চেক করে টাকা দিয়েছি। অরিজিনাল প্রোডাক্ট দেওয়ার জন্য গ্লোবুস্টকে ৫ স্টার!',
    verified: true,
    productName: 'Botanical Hydrating Gentle Facial Cleanser'
  },
  {
    id: 'rev-6',
    name: 'মেহজাবীন কায়সার (ঢাকা)',
    rating: 5,
    date: '১ সপ্তাহ আগে',
    comment: 'নাইট সিরাম আর সানস্ক্রিন দুটোই একসাথে অর্ডার করেছিলাম। ২ সপ্তাহ ধরে প্রতিদিন ব্যবহার করছি, স্কিনের টেক্সচার অনেক স্মুথ আর গ্লোয়িং হয়েছে। ফ্রেন্ডদেরও রেকমেন্ড করেছি।',
    verified: true,
    productName: 'Overnight Renewal Retinol Repair Serum'
  },
  {
    id: 'rev-7',
    name: 'সামিরা খাতুন (খুলনা)',
    rating: 5,
    date: '২ সপ্তাহ আগে',
    comment: 'প্রোডাক্টের বারকোড স্ক্যান করে অরিজিনালিটি ১০০% কনফার্ম হয়েছি। দাম অনুযায়ী কোয়ালিটি বেশ ভালো এবং খুব সুন্দর সুবাস। আবার অর্ডার করবো ইনশাআল্লাহ।',
    verified: true,
    productName: 'Aurelia 20% Vitamin C Radiance Serum'
  },
  {
    id: 'rev-8',
    name: 'আফসানা মিমি (কুমিল্লা)',
    rating: 5,
    date: '২ সপ্তাহ আগে',
    comment: 'হোয়াটসঅ্যাপে মাত্র ১ মিনিটে ঠিকানা আর ফোন নাম্বার দিয়ে অর্ডার করেছি, কোনো ঝামেলাই হয়নি। কুরিয়ার ম্যান অনেক ভদ্র ছিল। প্রোডাক্টের সার্ভিস ও প্যাকেজিং ১০ এ ১০!',
    verified: true,
    productName: 'Nurture Botanical Mineral Sunscreen SPF 50+'
  },
  {
    id: 'rev-9',
    name: 'নাসরিন আক্তার (ময়মনসিংহ)',
    rating: 5,
    date: '৩ সপ্তাহ আগে',
    comment: 'গ্লোবুস্ট থেকে প্রথমবার কেনাকাটা করলাম। স্কিন কেয়ার কিটের প্রোডাক্টগুলো অসাধারণ! কালচে ভাব দূর হয়ে মুখ একদম সতেজ দেখাচ্ছে। সততার জন্য ধন্যবাদ।',
    verified: true,
    productName: 'The Ultimate Glow Radiance Gift Collection (5-in-1 Kit)'
  },
  {
    id: 'rev-10',
    name: 'রোকসানা পারভীন (রংপুর)',
    rating: 5,
    date: '১ মাস আগে',
    comment: 'অনলাইনে কতো নকল পণ্য বিক্রি হয়, কিন্তু গ্লোবুস্ট একশো ভাগ আসল পণ্য দেয়। আমার সেনসিটিভ স্কিনেও কোনো এলার্জি বা সমস্যা হয়নি। অত্যন্ত সন্তুষ্ট!',
    verified: true,
    productName: 'Glow Hyaluronic Acid Hydrating Gel Cream'
  }
];

// --- REVIEWS / TESTIMONIALS ---
export function getStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(DEFAULT_10_REVIEWS));
      return DEFAULT_10_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length < 10) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(DEFAULT_10_REVIEWS));
      return DEFAULT_10_REVIEWS;
    }
    return parsed;
  } catch {
    return DEFAULT_10_REVIEWS;
  }
}

export function saveReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event('glowboost_reviews_updated'));
  } catch (e) {
    console.error('Failed to save reviews', e);
  }
}

// --- FAQS ---
export function getStoredFaqs(): FaqItem[] {
  try {
    const raw = localStorage.getItem(FAQS_KEY);
    if (!raw) {
      localStorage.setItem(FAQS_KEY, JSON.stringify(DEFAULT_FAQS));
      return DEFAULT_FAQS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FAQS;
  }
}

export function saveFaqs(faqs: FaqItem[]): void {
  try {
    localStorage.setItem(FAQS_KEY, JSON.stringify(faqs));
    window.dispatchEvent(new Event('glowboost_faqs_updated'));
  } catch (e) {
    console.error('Failed to save faqs', e);
  }
}

// --- ORDERS ---
export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('glowboost_orders_updated'));

    orders.forEach((o) => {
      setDoc(doc(db, 'orders', o.id), o).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `orders/${o.id}`)
      );
    });
  } catch (e) {
    console.error('Failed to save orders', e);
  }
}

export function addOrderRecord(orderData: Omit<Order, 'id' | 'orderDate'>): Order {
  const existing = getStoredOrders();
  const nextNum = 1000 + existing.length + 1;
  const newOrder: Order = {
    ...orderData,
    id: `GB-${nextNum}`,
    orderDate: new Date().toISOString(),
  };
  const updated = [newOrder, ...existing];
  saveOrders(updated);

  // Sync new order directly to Firestore
  setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((err) =>
    handleFirestoreError(err, OperationType.WRITE, `orders/${newOrder.id}`)
  );

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: Order['status']): void {
  const orders = getStoredOrders();
  const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
  saveOrders(updated);
}

export function deleteOrderRecord(orderId: string): void {
  const orders = getStoredOrders();
  const updated = orders.filter((o) => o.id !== orderId);
  saveOrders(updated);

  deleteDoc(doc(db, 'orders', orderId)).catch((err) =>
    handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`)
  );
}

// --- SITE CONFIG ---
export function getStoredSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveSiteConfig(config: Partial<SiteConfig>): SiteConfig {
  const current = getStoredSiteConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('glowboost_config_updated'));

    setDoc(doc(db, 'config', 'site'), updated).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, 'config/site')
    );
  } catch (e) {
    console.error('Failed to save config', e);
  }
  return updated;
}

// --- INITIALIZE REAL-TIME FIRESTORE LISTENERS ---
export function initFirestoreSync() {
  try {
    // Sync Products from Firestore
    onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreProducts: Product[] = [];
        snapshot.forEach((docSnap) => {
          firestoreProducts.push(docSnap.data() as Product);
        });
        // Ignore Firestore docs saved by older app versions (stale images):
        // only apply docs stamped with the current cache version.
        const stamped = firestoreProducts.filter(
          (p) => (p as unknown as { cacheVersion?: string }).cacheVersion === PRODUCTS_CACHE_VERSION
        );
        if (stamped.length > 0) {
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(stamped));
          localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_CACHE_VERSION);
          window.dispatchEvent(new Event('glowboost_products_updated'));
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));

    // Sync Orders from Firestore
    onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          firestoreOrders.push(docSnap.data() as Order);
        });
        if (firestoreOrders.length > 0) {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(firestoreOrders));
          window.dispatchEvent(new Event('glowboost_orders_updated'));
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    // Sync Site Config from Firestore
    onSnapshot(doc(db, 'config', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        const remoteConfig = docSnap.data() as SiteConfig;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(remoteConfig));
        window.dispatchEvent(new Event('glowboost_config_updated'));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'config/site'));

  } catch (err) {
    console.warn('Firestore sync init error:', err);
  }
}
