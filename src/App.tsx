import React, { useState } from 'react';
import { Product, CartItem } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WhyUs } from './components/WhyUs';
import { ProductCatalog } from './components/ProductCatalog';
import { HowToOrder } from './components/HowToOrder';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppCheckoutModal } from './components/WhatsAppCheckoutModal';
import { Testimonials } from './components/Testimonials';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';

import { initFirestoreSync } from './services/siteStorage';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalInitialStep, setModalInitialStep] = useState<'details' | 'order'>('details');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'shop'>(() => (window.location.hash === '#shop' ? 'shop' : 'home'));
  const goToPage = (page: 'home' | 'shop') => {
    setCurrentPage(page);
    window.location.hash = page === 'shop' ? '#shop' : '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  React.useEffect(() => {
    const onHash = () => setCurrentPage(window.location.hash === '#shop' ? 'shop' : 'home');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [deliveryDetails, setDeliveryDetails] = useState<{
    name: string;
    phone: string;
    address: string;
    location: string;
    deliveryFee: number;
  } | null>(null);

  // Initialize Firebase Firestore sync
  React.useEffect(() => {
    initFirestoreSync();
  }, []);

  // Listen globally for Ctrl + Shift + A or Ctrl + Shift key combos to open Admin Portal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger when Ctrl + Shift + A is pressed
      if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectProduct = (product: Product, initialStep: 'details' | 'order' = 'details') => {
    setSelectedProduct(product);
    setModalInitialStep(initialStep);
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOpenWhatsAppCheckout = (details: {
    name: string;
    phone: string;
    address: string;
    location: string;
    deliveryFee: number;
  }) => {
    setDeliveryDetails(details);
    setIsCartOpen(false);
    setIsWhatsAppModalOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#222222] flex flex-col font-['Noto_Serif_Bengali',serif]">
      {/* 1. Header (Sticky) */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentPage={currentPage}
        onNavigate={goToPage}
      />

      {currentPage === 'shop' ? (
        <ProductCatalog
          onAddToCart={(product) => handleAddToCart(product, 1)}
          onSelectProduct={handleSelectProduct}
          fullFilters
          heading="সব প্রোডাক্ট"
        />
      ) : (
        <>
      {/* 2. Hero Section */}
      <Hero
        onSelectProduct={handleSelectProduct}
        onAddToCart={(product) => handleAddToCart(product, 1)}
      />

      {/* 3. Why GlowBoost (Why Us) */}
      <WhyUs />

      {/* 4. Latest Products (Home: latest 12 only) */}
      <ProductCatalog
        onAddToCart={(product) => handleAddToCart(product, 1)}
        onSelectProduct={handleSelectProduct}
        limit={12}
        showViewAllButton
        onViewAll={() => goToPage('shop')}
        heading="লেটেস্ট প্রোডাক্টস"
      />

      {/* 5. How to Order */}
      <HowToOrder />

      {/* 6. Customer Reviews */}
      <Testimonials />

      {/* 7. FAQ */}
      <Faq />

        </>
      )}

      {/* 8. Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        initialStep={modalInitialStep}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product, qty) => {
          handleAddToCart(product, qty);
          setSelectedProduct(null);
          setIsCartOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenWhatsAppCheckout={handleOpenWhatsAppCheckout}
      />

      <WhatsAppCheckoutModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        items={cart}
        deliveryDetails={deliveryDetails}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
