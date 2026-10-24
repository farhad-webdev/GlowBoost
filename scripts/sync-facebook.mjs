/**
 * GlowBoost Facebook Page Auto-Sync Script
 * Fetches latest posts from Facebook Graph API (Page ID: 61573758975647)
 * and updates src/data/products.json without duplicates.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGE_ID = '552680001269348'; // Graph API Page ID (web profile ID 61573758975647 does NOT work in Graph calls)
const TOKEN = process.env.FB_PAGE_TOKEN;
const PRODUCTS_JSON_PATH = path.join(__dirname, '../src/data/products.json');

async function syncFacebookProducts() {
  console.log('Starting GlowBoost Facebook product sync...');

  if (!TOKEN) {
    console.warn('⚠️ FB_PAGE_TOKEN environment variable is missing. Skipping Facebook API sync and keeping existing products.json.');
    return;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${PAGE_ID}/posts?fields=message,full_picture,permalink_url,created_time&access_token=${TOKEN}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Facebook API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const posts = data.data || [];

    if (posts.length === 0) {
      console.log('No posts found from Facebook Page.');
      return;
    }

    // Read existing products.json
    let existingProducts = [];
    if (fs.existsSync(PRODUCTS_JSON_PATH)) {
      const fileContent = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8');
      existingProducts = JSON.parse(fileContent);
    }

    const existingUrls = new Set(existingProducts.map((p) => p.facebookPostUrl));
    let newProductsAdded = 0;

    // Cutoff: only posts from 22 Oct 2026 onward (Asia/Dhaka midnight) show on the website.
    // Older posts are skipped so a later sync never re-adds them.
    const CUTOFF_DATE = new Date('2026-10-22T00:00:00+06:00');

    for (const post of posts) {
      if (!post.full_picture || !post.message) continue; // Skip posts without image or text
      if (post.created_time && new Date(post.created_time) < CUTOFF_DATE) continue; // Skip pre-22-Oct-2026 posts
      if (post.permalink_url && post.permalink_url.includes('/reel/')) continue; // Skip Reels — website shows photo-post products only

      const postUrl = post.permalink_url || `https://facebook.com/${PAGE_ID}`;
      if (existingUrls.has(postUrl)) continue; // Avoid duplicate

      // Extract title/name from first line of message
      const lines = post.message.split('\n').filter((l) => l.trim().length > 0);
      const title = lines[0] ? lines[0].slice(0, 60) : 'গ্লোবুস্ট বিউটি প্রোডাক্ট';
      const description = post.message.slice(0, 200) + '...';

      const newProduct = {
        id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: title,
        category: 'স্কিন কেয়ার',
        priceTk: null, // null indicates price not set yet -> site shows "ইনবক্সে দাম জানুন"
        originalPrice: null,
        rating: 5.0,
        reviewsCount: 1,
        image: post.full_picture,
        badge: 'স্কিন কেয়ার',
        benefit: description,
        benefits: [
          'গ্লোবুস্ট অফিশিয়াল ফেসবুক পেজ থেকে সরাসরি সিঙ্ক করা',
          '১০০% আসল ও অনুমোদিত ডিস্ট্রিবিউটর থেকে সংগৃহীত'
        ],
        ingredients: 'প্রোডাক্টের প্যাকেজিং দেখুন অথবা বিস্তারিত জানতে হোয়াটসঅ্যাপে ইনবক্স করুন।',
        howToUse: 'প্যাকেজিংয়ে বর্ণিত নির্দেশনাবলী অনুযায়ী ব্যবহার করুন।',
        inStock: true,
        facebookPostUrl: postUrl
      };

      existingProducts.unshift(newProduct); // Add to top
      existingUrls.add(postUrl);
      newProductsAdded++;
      console.log(`✨ Added new product from FB post: ${title}`);
    }

    if (newProductsAdded > 0) {
      fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(existingProducts, null, 2), 'utf-8');
      console.log(`Successfully synced ${newProductsAdded} new products to products.json.`);
    } else {
      console.log('Products.json is already up to date with latest Facebook posts.');
    }

  } catch (error) {
    console.error('❌ Error syncing Facebook posts:', error.message);
    console.log('Falling back to existing products.json. Site remains operational.');
  }
}

syncFacebookProducts();
