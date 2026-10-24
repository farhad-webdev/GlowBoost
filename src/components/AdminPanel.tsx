import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import {
  getStoredProducts,
  saveProducts,
  resetProductsToDefault,
  getStoredOrders,
  saveOrders,
  updateOrderStatus,
  deleteOrderRecord,
  getStoredSiteConfig,
  saveSiteConfig,
  getStoredHeroConfig,
  saveHeroConfig,
  getStoredReviews,
  saveReviews,
  getStoredFaqs,
  saveFaqs,
  Order,
  SiteConfig,
  HeroConfig,
  FaqItem,
} from '../services/siteStorage';
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  RotateCcw,
  LogOut,
  X,
  Eye,
  MessageCircle,
  Phone,
  Save,
  Check,
  Sparkles,
  Lock,
  DollarSign,
  AlertCircle,
  FileText,
  Star,
  HelpCircle,
  Sliders
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onProductsUpdated,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('glowboost_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Tab: 'dashboard' | 'products' | 'orders' | 'content' | 'settings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'content' | 'settings'>('dashboard');

  // Content SubTab: 'hero' | 'reviews' | 'faqs'
  const [contentSubTab, setContentSubTab] = useState<'hero' | 'reviews' | 'faqs'>('hero');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<SiteConfig>(getStoredSiteConfig());
  const [heroConfig, setHeroConfigState] = useState<HeroConfig>(getStoredHeroConfig());
  const [reviews, setReviewsState] = useState<Review[]>(getStoredReviews());
  const [faqs, setFaqsState] = useState<FaqItem[]>(getStoredFaqs());

  // Search & Filter
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('সবগুলো');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('সবগুলো');

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Review Edit Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);

  // FAQ Edit Modal
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FaqItem> | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load latest data when panel opens
  const loadData = () => {
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());
    setConfig(getStoredSiteConfig());
    setHeroConfigState(getStoredHeroConfig());
    setReviewsState(getStoredReviews());
    setFaqsState(getStoredFaqs());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentConfig = getStoredSiteConfig();
    if (pinInput.trim() === currentConfig.adminPin) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('glowboost_admin_auth', 'true');
      } catch {}
      setPinError(null);
      setPinInput('');
      showToast('এডমিন ব্যাকএন্ড প্যানেলে স্বাগতম!');
    } else {
      setPinError('ভুল পিন কোড! সঠিক পিন কোড দিয়ে চেষ্টা করুন।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('glowboost_admin_auth');
    } catch {}
  };

  // Product Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    const currentList = getStoredProducts();
    let updatedList: Product[];

    if (editingProduct.id) {
      updatedList = currentList.map((p) =>
        p.id === editingProduct.id ? ({ ...p, ...editingProduct } as Product) : p
      );
      showToast('প্রোডাক্ট তথ্য সফলভাবে আপডেট করা হয়েছে!');
    } else {
      const newProduct: Product = {
        id: `gb-${Date.now().toString().slice(-4)}`,
        name: editingProduct.name || 'নতুন প্রোডাক্ট',
        category: editingProduct.category || 'স্কিন কেয়ার',
        priceTk: editingProduct.priceTk !== undefined ? Number(editingProduct.priceTk) : 1200,
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : null,
        rating: editingProduct.rating || 5.0,
        reviewsCount: editingProduct.reviewsCount || 1,
        image: editingProduct.image || '/src/assets/images/hero_glowboost_banner_1792822293638.jpg',
        badge: editingProduct.badge || 'নতুন',
        benefit: editingProduct.benefit || 'উচ্চমানের বিউটি প্রোডাক্ট',
        benefits: editingProduct.benefits && editingProduct.benefits.length > 0 ? editingProduct.benefits : ['১০০% অথেনটিক বিউটি প্রোডাক্ট'],
        ingredients: editingProduct.ingredients || 'বিশুদ্ধ প্রাকৃতিক উপাদান',
        howToUse: editingProduct.howToUse || 'প্রতিদিন ব্যবহার করুন',
        inStock: editingProduct.inStock ?? true,
      };
      updatedList = [newProduct, ...currentList];
      showToast('নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!');
    }

    saveProducts(updatedList);
    setProducts(updatedList);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    if (onProductsUpdated) onProductsUpdated();
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`আপনি কি সত্যিই "${productName}" মুছে ফেলতে চান?`)) {
      const currentList = getStoredProducts();
      const updatedList = currentList.filter((p) => p.id !== productId);
      saveProducts(updatedList);
      setProducts(updatedList);
      showToast('প্রোডাক্টটি মুছে ফেলা হয়েছে।');
      if (onProductsUpdated) onProductsUpdated();
    }
  };

  const handleToggleStock = (product: Product) => {
    const currentList = getStoredProducts();
    const updatedList = currentList.map((p) =>
      p.id === product.id ? { ...p, inStock: !p.inStock } : p
    );
    saveProducts(updatedList);
    setProducts(updatedList);
    showToast(`স্টক স্ট্যাটাস পরিবর্তন করা হয়েছে: ${!product.inStock ? 'স্টকে আছে' : 'আউট অফ স্টক'}`);
    if (onProductsUpdated) onProductsUpdated();
  };

  const handleResetProducts = () => {
    if (confirm('আপনি কি পূর্বের ডিফল্ট প্রোডাক্ট ডাটায় ফিরে যেতে চান?')) {
      const def = resetProductsToDefault();
      setProducts(def);
      showToast('ডিফল্ট প্রোডাক্ট ডাটা রিস্টোর করা হয়েছে।');
      if (onProductsUpdated) onProductsUpdated();
    }
  };

  // Orders
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    setOrders(getStoredOrders());
    showToast(`অর্ডার ${orderId} এর স্ট্যাটাস '${status}' সেট করা হয়েছে।`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`অর্ডার ${orderId} কি স্থায়ীভাবে ডিলিট করবেন?`)) {
      deleteOrderRecord(orderId);
      setOrders(getStoredOrders());
      showToast('অর্ডার মুছে ফেলা হয়েছে।');
    }
  };

  // Hero Save
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveHeroConfig(heroConfig);
    setHeroConfigState(updated);
    showToast('হিরো সেকশন কন্টেন্ট সফলভাবে আপডেট করা হয়েছে!');
  };

  // Review Save
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editingReview.name) return;

    const currentList = getStoredReviews();
    let updatedList: Review[];

    if (editingReview.id) {
      updatedList = currentList.map((r) =>
        r.id === editingReview.id ? ({ ...r, ...editingReview } as Review) : r
      );
      showToast('রিভিউ আপডেট করা হয়েছে!');
    } else {
      const newRev: Review = {
        id: `rev-${Date.now()}`,
        name: editingReview.name || 'গ্রাহক',
        rating: editingReview.rating || 5,
        date: editingReview.date || 'সম্প্রতি',
        comment: editingReview.comment || 'চমৎকার অরিজিনাল প্রোডাক্ট!',
        verified: true,
        productName: editingReview.productName || 'GlowBoost Beauty Product',
      };
      updatedList = [newRev, ...currentList];
      showToast('নতুন রিভিউ যোগ করা হয়েছে!');
    }

    saveReviews(updatedList);
    setReviewsState(updatedList);
    setIsReviewModalOpen(false);
    setEditingReview(null);
  };

  const handleDeleteReview = (revId: string) => {
    if (confirm('রিভিউটি ডিলিট করতে চান?')) {
      const currentList = getStoredReviews();
      const updatedList = currentList.filter((r) => r.id !== revId);
      saveReviews(updatedList);
      setReviewsState(updatedList);
      showToast('রিভিউ ডিলিট করা হয়েছে।');
    }
  };

  // FAQ Save
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question) return;

    const currentList = getStoredFaqs();
    let updatedList: FaqItem[];

    if (editingFaq.id) {
      updatedList = currentList.map((f) =>
        f.id === editingFaq.id ? ({ ...f, ...editingFaq } as FaqItem) : f
      );
      showToast('FAQ আপডেট করা হয়েছে!');
    } else {
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        question: editingFaq.question || 'প্রশ্ন',
        answer: editingFaq.answer || 'উত্তর',
      };
      updatedList = [...currentList, newFaq];
      showToast('নতুন FAQ যুক্ত করা হয়েছে!');
    }

    saveFaqs(updatedList);
    setFaqsState(updatedList);
    setIsFaqModalOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = (faqId: string) => {
    if (confirm('FAQ টি ডিলিট করতে চান?')) {
      const currentList = getStoredFaqs();
      const updatedList = currentList.filter((f) => f.id !== faqId);
      saveFaqs(updatedList);
      setFaqsState(updatedList);
      showToast('FAQ ডিলিট করা হয়েছে।');
    }
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveSiteConfig(config);
    setConfig(updated);
    showToast('সাইট সেটিংস সেভ করা হয়েছে!');
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'কনফার্মড' || o.status === 'ডেলিভার্ড')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'পেন্ডিং').length;
  const totalProductsCount = products.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#141414] text-stone-100 flex flex-col w-full h-full min-h-screen overflow-y-auto animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#D4A017] text-black font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-black shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LOGIN STANDALONE PAGE */}
      {!isAuthenticated ? (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative bg-[#121212]">
          {/* Top Bar with Return to Website */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D4A017] flex items-center justify-center text-black font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-base tracking-wider font-mono">GlowBoost Admin</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-stone-700"
            >
              <Eye className="w-4 h-4 text-[#D4A017]" />
              <span>ওয়েবসাইটে ফিরে যান</span>
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-stone-100 my-auto">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F5C542] via-[#D4A017] to-[#B8860B] flex items-center justify-center mx-auto text-[#141414] shadow-xl shadow-[#D4A017]/20">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif] text-white">
                এডমিন পোর্টালে প্রবেশ
              </h2>
              <p className="text-xs text-stone-400">
                গ্লোবুস্ট ওয়েবসাইট ব্যাকএন্ড ড্যাশবোর্ডে অ্যাক্সেস করতে ৬ ডিজিটের সিকিউরিটি পিন দিন।
              </p>
            </div>

            {pinError && (
              <div className="p-3.5 mb-4 bg-red-950/70 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  সিকিউরিটি পিন কোড:
                </label>
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(null);
                  }}
                  placeholder="••••••"
                  className="w-full px-4 py-3.5 bg-stone-950 border border-stone-700 rounded-xl text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-[#D4A017] transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-[#141414] font-extrabold text-sm hover:brightness-105 active:scale-[0.98] transition-all shadow-lg shadow-[#D4A017]/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" /> ব্যাকএন্ড ড্যাশবোর্ডে প্রবেশ করুন
              </button>
            </form>

            <p className="text-[11px] text-center text-stone-500 mt-6">
              💡 শর্টকাট: কিবোর্ডে <span className="font-mono text-[#F5C542]">Ctrl + Shift + A</span> চেপে যেকোনো সময় এডমিন পেজে আসা যাবে।
            </p>
          </div>
        </div>
      ) : (
        /* MAIN STANDALONE ADMIN BACKEND PAGE */
        <div className="w-full min-h-screen h-full flex flex-col bg-[#141414] text-stone-100">
          
          {/* Header Bar */}
          <header className="bg-stone-900 border-b border-stone-800 px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F5C542] via-[#D4A017] to-[#B8860B] flex items-center justify-center text-stone-950 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>GlowBoost</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-[#D4A017]/20 text-[#F5C542] px-2 py-0.5 rounded-md border border-[#D4A017]/30">
                      ADMIN PORTAL
                    </span>
                  </h1>
                  <p className="text-[11px] text-stone-400">সাইটের পণ্য, পেজ কন্টেন্ট, অর্ডার ও সেটিংস কন্ট্রোল</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-[#D4A017] text-stone-950 font-bold shadow-md shadow-[#D4A017]/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ড
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-[#D4A017] text-stone-950 font-bold shadow-md shadow-[#D4A017]/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" /> পণ্যসমূহ ({products.length})
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-[#D4A017] text-stone-950 font-bold shadow-md shadow-[#D4A017]/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>অর্ডারসমূহ</span>
                {pendingOrdersCount > 0 && (
                  <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'content'
                    ? 'bg-[#D4A017] text-stone-950 font-bold shadow-md shadow-[#D4A017]/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" /> পেজ কন্টেন্ট
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#D4A017] text-stone-950 font-bold shadow-md shadow-[#D4A017]/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" /> সেটিং
              </button>
            </div>

            {/* Quick Actions Right */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> সাইট ভিউ
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" /> লগআউট
              </button>
            </div>
          </header>

          {/* Main Scrollable Workspace */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#181818] text-stone-200">
            
            {/* 1. DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                  <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-stone-400 text-xs">
                      <span>মোট কনফার্মড সেলস</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">৳{totalRevenue}</div>
                    <p className="text-[11px] text-emerald-400">কনফার্মড ও ডেলিভার্ড অর্ডার থেকে</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-stone-400 text-xs">
                      <span>মোট অর্ডার রেকর্ড</span>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">{orders.length}টি</div>
                    <p className="text-[11px] text-amber-400">{pendingOrdersCount}টি পেন্ডিং রয়েছে</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-stone-400 text-xs">
                      <span>এক্টিভ প্রোডাক্টস</span>
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">{totalProductsCount}টি</div>
                    <p className="text-[11px] text-sky-400">লাইভ ক্যাটালগে প্রদর্শিত</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-stone-400 text-xs">
                      <span>অফিশিয়াল হোয়াটসঅ্যাপ</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-sm font-mono font-bold text-[#F5C542]">+{config.whatsappNumber}</div>
                    <p className="text-[11px] text-stone-400">ডাইরেক্ট অর্ডার মেসেজ রিসিভার</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4A017]" /> দ্রুত কাজসমূহ (Quick Actions)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setEditingProduct({});
                        setIsProductModalOpen(true);
                      }}
                      className="p-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#D4A017] text-stone-950 flex items-center justify-center font-bold">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">নতুন পণ্য যোগ করুন</h4>
                        <p className="text-[11px] text-stone-400">ক্যাটালগে নতুন বিউটি আইটেম আপলোড</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('content')}
                      className="p-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-500 text-stone-950 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">পেজ কন্টেন্ট এডিট করুন</h4>
                        <p className="text-[11px] text-stone-400">হিরো টাইটেল, রিভিউ ও FAQ এডিটিং</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="p-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-sky-500 text-stone-950 flex items-center justify-center font-bold">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">হোয়াটসঅ্যাপ পরিবর্তন করুন</h4>
                        <p className="text-[11px] text-stone-400">নম্বর ও ডেলিভারি চার্জ সেটিং</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCTS MANAGER TAB */}
            {activeTab === 'products' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-stone-900 p-4 rounded-2xl border border-stone-800">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        placeholder="পণ্য সার্চ করুন..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#D4A017]"
                    >
                      <option value="সবগুলো">সকল ক্যাটাগরি</option>
                      <option value="স্কিন কেয়ার">স্কিন কেয়ার</option>
                      <option value="সান কেয়ার">সান কেয়ার</option>
                      <option value="হেয়ার কেয়ার">হেয়ার কেয়ার</option>
                      <option value="গিফট কিট">গিফট কিট</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetProducts}
                      className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> রিস্টোর
                    </button>

                    <button
                      onClick={() => {
                        setEditingProduct({});
                        setIsProductModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-105 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> নতুন প্রোডাক্ট যোগ করুন
                    </button>
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-300">
                      <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] border-b border-stone-800">
                        <tr>
                          <th className="p-3.5">ছবি</th>
                          <th className="p-3.5">প্রোডাক্টের নাম</th>
                          <th className="p-3.5">ক্যাটাগরি</th>
                          <th className="p-3.5">মূল্য</th>
                          <th className="p-3.5">স্টক স্ট্যাটাস</th>
                          <th className="p-3.5 text-right">একশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800">
                        {products
                          .filter((p) => {
                            const matchCat = productCategoryFilter === 'সবগুলো' || p.category === productCategoryFilter;
                            const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
                            return matchCat && matchSearch;
                          })
                          .map((p) => {
                            const pPrice = p.priceTk ?? p.price ?? 0;
                            return (
                              <tr key={p.id} className="hover:bg-stone-800/60 transition-colors">
                                <td className="p-3">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-11 h-11 object-cover rounded-lg bg-stone-950 border border-stone-800 shrink-0"
                                  />
                                </td>
                                <td className="p-3 max-w-xs">
                                  <div className="font-bold text-white truncate">{p.name}</div>
                                  <div className="text-[11px] text-stone-400 line-clamp-1">{p.benefit}</div>
                                </td>
                                <td className="p-3">
                                  <span className="px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-300 font-medium text-[11px]">
                                    {p.category}
                                  </span>
                                </td>
                                <td className="p-3 font-extrabold text-[#F5C542]">
                                  {pPrice > 0 ? `৳${pPrice}` : 'ইনবক্সে দাম'}
                                </td>
                                <td className="p-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStock(p)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                                      p.inStock
                                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                                        : 'bg-red-950/60 text-red-400 border-red-800'
                                    }`}
                                  >
                                    {p.inStock ? '✓ স্টকে আছে' : '✕ স্টক আউট'}
                                  </button>
                                </td>
                                <td className="p-3 text-right space-x-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ORDERS MANAGER TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900 p-4 rounded-2xl border border-stone-800">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      placeholder="অর্ডার আইডি, গ্রাহকের নাম বা মোবাইল নম্বর সার্চ..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#D4A017]"
                  >
                    <option value="সবগুলো">সকল স্ট্যাটাস</option>
                    <option value="পেন্ডিং">পেন্ডিং</option>
                    <option value="কনফার্মড">কনফার্মড</option>
                    <option value="ডেলিভার্ড">ডেলিভার্ড</option>
                    <option value="বাতিল">বাতিল</option>
                  </select>
                </div>

                <div className="space-y-3.5">
                  {orders
                    .filter((ord) => {
                      const matchStatus = orderStatusFilter === 'সবগুলো' || ord.status === orderStatusFilter;
                      const matchSearch =
                        ord.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        ord.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        ord.customerPhone.includes(orderSearch);
                      return matchStatus && matchSearch;
                    })
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3.5 hover:border-stone-700 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#F5C542] text-sm sm:text-base">{ord.id}</span>
                            <span className="text-[11px] text-stone-500">
                              • {new Date(ord.orderDate).toLocaleString('bn-BD')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-400 font-medium">স্ট্যাটাস:</span>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
                                ord.status === 'পেন্ডিং'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                                  : ord.status === 'কনফার্মড'
                                  ? 'bg-sky-950/80 text-sky-300 border-sky-700'
                                  : ord.status === 'ডেলিভার্ড'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                                  : 'bg-red-950/80 text-red-300 border-red-700'
                              }`}
                            >
                              <option value="পেন্ডিং">পেন্ডিং</option>
                              <option value="কনফার্মড">কনফার্মড</option>
                              <option value="ডেলিভার্ড">ডেলিভার্ড</option>
                              <option value="বাতিল">বাতিল</option>
                            </select>

                            <button
                              onClick={() => handleDeleteOrder(ord.id)}
                              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                            <div className="font-bold text-white text-sm">{ord.customerName}</div>
                            <div className="text-stone-300 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#D4A017]" />
                              <span>{ord.customerPhone}</span>
                            </div>
                            <div className="text-stone-400 pt-1">
                              📍 {ord.customerAddress} ({ord.deliveryLocation === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})
                            </div>
                          </div>

                          <div className="space-y-1 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                            <div className="font-semibold text-stone-300 mb-1">অর্ডারকৃত আইটেমসমূহ:</div>
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-stone-200">
                                <span>• {item.productName} (x{item.quantity})</span>
                                <span className="font-bold">৳{item.price * item.quantity}</span>
                              </div>
                            ))}
                            <div className="border-t border-stone-800 pt-1.5 flex justify-between font-bold text-white">
                              <span>সর্বমোট প্রদেয়:</span>
                              <span className="text-[#F5C542]">৳{ord.total}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `আসসালামু আলাইকুম ${ord.customerName}! GlowBoost থেকে আপনার অর্ডার (${ord.id}) নিশ্চিতকরণের জন্য যোগাযোগ করা হয়েছে।`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" /> গ্রাহককে হোয়াটসঅ্যাপে মেসেজ পাঠান
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 4. PAGE CONTENT MANAGER TAB */}
            {activeTab === 'content' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Content SubTabs */}
                <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
                  <button
                    onClick={() => setContentSubTab('hero')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      contentSubTab === 'hero'
                        ? 'bg-[#D4A017] text-stone-950'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    হিরো সেকশন
                  </button>

                  <button
                    onClick={() => setContentSubTab('reviews')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      contentSubTab === 'reviews'
                        ? 'bg-[#D4A017] text-stone-950'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    গ্রাহক রিভিউ ({reviews.length})
                  </button>

                  <button
                    onClick={() => setContentSubTab('faqs')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      contentSubTab === 'faqs'
                        ? 'bg-[#D4A017] text-stone-950'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    প্রশ্নোত্তর FAQ ({faqs.length})
                  </button>
                </div>

                {/* SubTab 1: HERO CONTENT EDIT */}
                {contentSubTab === 'hero' && (
                  <form onSubmit={handleSaveHero} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 max-w-3xl">
                    <h3 className="text-sm font-bold text-white border-b border-stone-800 pb-2">
                      হিরো সেকশন টেক্সট ও হাইলাইট এডিটর
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-300">মূল শিরোনাম প্রথম অংশ:</label>
                        <input
                          type="text"
                          required
                          value={heroConfig.headlineMain}
                          onChange={(e) => setHeroConfigState({ ...heroConfig, headlineMain: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-300">গোল্ডেন হাইলাইট শব্দ (যেমন "উজ্জ্বলতা"):</label>
                        <input
                          type="text"
                          required
                          value={heroConfig.headlineHighlight}
                          onChange={(e) => setHeroConfigState({ ...heroConfig, headlineHighlight: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-[#F5C542] font-bold focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-300">হিরো বর্ণনা / সাবটাইটেল:</label>
                      <textarea
                        rows={3}
                        required
                        value={heroConfig.subtitle}
                        onChange={(e) => setHeroConfigState({ ...heroConfig, subtitle: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017] resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-300">ট্যাগলাইন ট্যাক্সট:</label>
                      <input
                        type="text"
                        required
                        value={heroConfig.taglineText}
                        onChange={(e) => setHeroConfigState({ ...heroConfig, taglineText: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>

                    {/* Highlights Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-800 pt-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-stone-400">হাইলাইট ১ টাইটেল:</label>
                        <input
                          type="text"
                          value={heroConfig.highlight1Title}
                          onChange={(e) => setHeroConfigState({ ...heroConfig, highlight1Title: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          value={heroConfig.highlight1Desc}
                          onChange={(e) => setHeroConfigState({ ...heroConfig, highlight1Desc: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-[11px] text-stone-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-stone-400">হাইলাইট ২ টাইটেল:</label>
                        <input
                          type="text"
                          value={heroConfig.highlight2Title}
                          onChange={(e) => setHeroConfigState({ ...heroConfig, highlight2Title: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          value={heroConfig.highlight2Desc}
                          onChange={(e) => setHeroConfigState({ ...heroConfig, highlight2Desc: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-[11px] text-stone-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-stone-400">হাইলাইট ৩ টাইটেল:</label>
                        <input
                          type="text"
                          value={heroConfig.highlight3Title}
                          onChange={(e) => setHeroConfigState({ ...heroConfig, highlight3Title: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          value={heroConfig.highlight3Desc}
                          onChange={(e) => setHeroConfigState({ ...heroConfig, highlight3Desc: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-[11px] text-stone-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-stone-950 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:brightness-105 transition-all shadow cursor-pointer mt-2"
                    >
                      <Save className="w-4 h-4" /> হিরো কন্টেন্ট সেভ করুন
                    </button>
                  </form>
                )}

                {/* SubTab 2: REVIEWS EDIT */}
                {contentSubTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">গ্রাহক রিভিউ তালিকা</h3>
                      <button
                        onClick={() => {
                          setEditingReview({});
                          setIsReviewModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#D4A017] text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> নতুন রিভিউ যোগ করুন
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{rev.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#F5C542] font-bold text-xs">★ {rev.rating}.0</span>
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-stone-300 italic">"{rev.comment}"</p>
                          <div className="text-[11px] text-[#F5C542] font-semibold">পণ্য: {rev.productName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SubTab 3: FAQS EDIT */}
                {contentSubTab === 'faqs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">সাধারণ জিজ্ঞাসা (FAQ) তালিকা</h3>
                      <button
                        onClick={() => {
                          setEditingFaq({});
                          setIsFaqModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#D4A017] text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> নতুন FAQ যোগ করুন
                      </button>
                    </div>

                    <div className="space-y-3">
                      {faqs.map((f) => (
                        <div key={f.id} className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4 text-[#D4A017]" /> {f.question}
                            </span>
                            <button
                              onClick={() => handleDeleteFaq(f.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-stone-400">{f.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 5. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
                <form onSubmit={handleSaveSettings} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-3">
                    <Settings className="w-5 h-5 text-[#D4A017]" /> ওয়েবসাইট সিকিউরিটি ও কনফিগারেশন
                  </h3>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-300">
                      অফিশিয়াল হোয়াটসঅ্যাপ মোবাইল নম্বর:
                    </label>
                    <input
                      type="text"
                      required
                      value={config.whatsappNumber}
                      onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-300">
                      ব্র্যান্ড ট্যাগলাইন:
                    </label>
                    <input
                      type="text"
                      required
                      value={config.brandTagline}
                      onChange={(e) => setConfig({ ...config, brandTagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-300">
                        ঢাকার ভেতরে ডেলিভারি চার্জ (৳):
                      </label>
                      <input
                        type="number"
                        required
                        value={config.dhakaDeliveryFee}
                        onChange={(e) => setConfig({ ...config, dhakaDeliveryFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-300">
                        ঢাকার বাইরে ডেলিভারি চার্জ (৳):
                      </label>
                      <input
                        type="number"
                        required
                        value={config.outsideDeliveryFee}
                        onChange={(e) => setConfig({ ...config, outsideDeliveryFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-stone-800 pt-4">
                    <label className="block text-xs font-bold text-stone-300">
                      এডমিন পিন কোড পরিবর্তন করুন:
                    </label>
                    <input
                      type="text"
                      required
                      value={config.adminPin}
                      onChange={(e) => setConfig({ ...config, adminPin: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs font-mono text-[#F5C542] focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-stone-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> সেটিংস সেভ করুন
                  </button>
                </form>
              </div>
            )}

          </main>
        </div>
      )}

      {/* EDIT / ADD PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div
            className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 space-y-5 text-stone-100 relative my-auto shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsProductModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-['Playfair_Display','Noto_Serif_Bengali',serif] text-white flex items-center gap-2 border-b border-stone-800 pb-3">
              <Package className="w-5 h-5 text-[#D4A017]" />
              {editingProduct?.id ? 'প্রোডাক্ট তথ্য এডিট করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-300">প্রোডাক্টের নাম:</label>
                <input
                  type="text"
                  required
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="যেমন: Aurelia Vitamin C Radiance Serum"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-300">ক্যাটাগরি:</label>
                  <select
                    value={editingProduct?.category || 'স্কিন কেয়ার'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  >
                    <option value="স্কিন কেয়ার">স্কিন কেয়ার</option>
                    <option value="সান কেয়ার">সান কেয়ার</option>
                    <option value="হেয়ার কেয়ার">হেয়ার কেয়ার</option>
                    <option value="গিফট কিট">গিফট কিট</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-300">ব্যাজ (Badge):</label>
                  <input
                    type="text"
                    value={editingProduct?.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="যেমন: বেস্ট সেলার, ট্রেন্ডিং"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-300">বিক্রি মূল্য (৳):</label>
                  <input
                    type="number"
                    value={editingProduct?.priceTk ?? editingProduct?.price ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        priceTk: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="যেমন: 1450 (0 দিলে ইনবক্সে দাম)"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-300">পূর্বে মূল্য (৳):</label>
                  <input
                    type="number"
                    value={editingProduct?.originalPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="যেমন: 1850"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-300">ইমেজ লিংক / ছবি পাথ:</label>
                <input
                  type="text"
                  required
                  value={editingProduct?.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-300">সংক্ষিপ্ত সুবিধা/উপকারিতা বিবরণ:</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct?.benefit || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, benefit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4A017] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={editingProduct?.inStock ?? true}
                  onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D4A017] focus:ring-[#D4A017] bg-stone-950 border-stone-700 cursor-pointer"
                />
                <label htmlFor="inStockCheck" className="text-xs font-bold text-stone-200 cursor-pointer">
                  স্টকে আছে (In Stock Available)
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs hover:bg-stone-700 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F5C542] via-[#D4A017] to-[#B8860B] text-stone-950 font-bold text-xs hover:brightness-105 transition-all cursor-pointer"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / ADD REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 text-stone-100 relative">
            <button
              onClick={() => {
                setIsReviewModalOpen(false);
                setEditingReview(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white border-b border-stone-800 pb-2">
              নতুন গ্রাহক রিভিউ যোগ করুন
            </h3>

            <form onSubmit={handleSaveReview} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">গ্রাহকের নাম:</label>
                <input
                  type="text"
                  required
                  value={editingReview?.name || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                  placeholder="যেমন: ফারহানা ইয়াসমিন"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">প্রোডাক্টের নাম:</label>
                <input
                  type="text"
                  required
                  value={editingReview?.productName || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, productName: e.target.value })}
                  placeholder="যেমন: Aurelia Vitamin C Radiance Serum"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">রিভিউ মন্তব্য:</label>
                <textarea
                  rows={3}
                  required
                  value={editingReview?.comment || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  placeholder="প্রোডাক্টটি খুব ভালো এবং ১০০% অরিজিনাল..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D4A017] text-stone-950 font-bold text-xs hover:brightness-105"
              >
                রিভিউ সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / ADD FAQ MODAL */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 text-stone-100 relative">
            <button
              onClick={() => {
                setIsFaqModalOpen(false);
                setEditingFaq(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white border-b border-stone-800 pb-2">
              নতুন FAQ যোগ করুন
            </h3>

            <form onSubmit={handleSaveFaq} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">প্রশ্ন:</label>
                <input
                  type="text"
                  required
                  value={editingFaq?.question || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="যেমন: ডেলিভারি পেতে কত দিন সময় লাগে?"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">উত্তর:</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq?.answer || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="ঢাকায় ২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি দেওয়া হয়..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D4A017] text-stone-950 font-bold text-xs hover:brightness-105"
              >
                FAQ সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
