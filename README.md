# GlowBoost — 100% Authentic Beauty Products

Welcome to **GlowBoost**, a mobile-first e-commerce landing page and shop website built for the GlowBoost Facebook Page in Bangladesh.

---

## 🌟 Features & Architecture

1. **Tech Stack**: React, Vite, Tailwind CSS, TypeScript. Fully responsive and optimized for mobile visitors across Bangladesh.
2. **Catalog Data Source**: All products are driven dynamically from `src/data/products.json`. No products are hardcoded in components.
3. **Order System (Phase 1 vs Phase 3)**:
   - **WhatsApp Order Mode**: Every product features an **"Order on WhatsApp"** button opening `https://wa.me/8801401334498?text=Hi%20GlowBoost!%20I%20want%20to%20order%3A%20...` with pre-filled product details and quantity.
   - **Cash on Delivery**: Clear notices stating *Cash on Delivery available all over Bangladesh*.
   - **Future-Proofing (`ORDER_MODE`)**: Configured via `src/config.ts`. Setting `ORDER_MODE = 'payment'` will activate online payment gateways (bKash, SSLCommerz, Stripe) housed in `src/checkout/` without modifying WhatsApp code.
4. **Facebook Auto-Sync**:
   - **Sync Script**: `scripts/sync-facebook.mjs` fetches posts from GlowBoost Page ID `61573758975647` using the Facebook Graph API.
   - **GitHub Action**: `.github/workflows/sync-products.yml` runs twice daily to update `products.json` automatically without duplicating items or overwriting prices.
   - **Fallback**: If API/tokens are missing, the site gracefully falls back to existing `products.json`.

---

## ⚙️ Setup & Configuration

### 1. Installation
```bash
npm install
```

### 2. Running Development Server
```bash
npm run dev
```

### 3. Order Mode Configuration (`src/config.ts`)
```ts
export const ORDER_MODE = 'whatsapp'; // Change to 'payment' in Phase 3
export const WHATSAPP_NUMBER = '8801401334498';
```

### 4. Facebook Token Setup (For Auto-Sync)
To enable automated Facebook post syncing:
1. Generate a **Long-Lived Page Access Token** from Meta for Developers for Page ID `61573758975647`.
2. Add it as a GitHub Repository Secret named `FB_PAGE_TOKEN`.
3. The GitHub Actions workflow will automatically sync posts twice daily.
