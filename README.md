# MOSS — Thoughtfully Designed Everyday Essentials

![MOSS Brand Banner](https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85)

> A modern luxury lifestyle e-commerce experience for **MOSS**, crafted with a clean, minimal, refined, and editorial visual identity.

---

## 🌿 Brand Identity & Design System

* **Brand Name**: MOSS
* **Tagline**: *Live Simply. Live MOSS.*
* **Positioning**: A modern lifestyle brand focused on thoughtfully crafted everyday essentials: Japanese Hasami ceramics, European stonewashed linen, vegetable-tanned Tuscan leather, and botanical wellness rituals.
* **Palette**: Warm off-white (`#FAF8F5`), Light warm neutral (`#F5F2EB`), Deep moss green (`#1B2A1E`), Charcoal (`#1A1A1A`), Muted sandstone (`#DDD5C4`), Terracotta (`#9E583F`), Warm gold (`#C4924A`).
* **Typography**: Elegant editorial serif (*Cormorant Garamond*) for headlines paired with modern geometric sans-serif (*Plus Jakarta Sans*) for high-legibility UI and pricing.

---

## ⚡ Tech Stack & Architecture

* **Framework**: React 18 / 19 + TypeScript + Vite
* **Routing**: React Router DOM (v7) with route-level code splitting (`React.lazy` + `Suspense`)
* **Styling**: Tailwind CSS (custom editorial design tokens, transitions, and keyframe animations)
* **Icons**: Lucide React
* **State Management**: Zustand (persistent cart, wishlist, auth, recently viewed products)
* **Form Validation**: React Hook Form + Zod validation schemas
* **Service Architecture**: Magento-ready Service Layer Abstraction (`IProductService`, `ICartService`, `IOrderService`, `ICustomerService`, `IReviewService`, `IDiscountService`)

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+ and npm installed

### 2. Installation
```bash
# Clone or navigate to the project directory
cd D:\Project

# Install dependencies
npm install
```

### 3. Running Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Building for Production
```bash
npm run build
npm run preview
```

---

## 🗺️ Route Directory

### Public Storefront Routes
| Route | Description |
|---|---|
| `/` | **Homepage**: Hero, curated categories, new arrivals, brand story, best sellers, reviews, and newsletter. |
| `/shop` | **Shop Catalog**: Filterable product catalog (category, price, size, color, stock status), sorting, and active filter pills. |
| `/category/:slug` | **Category Collection**: Dedicated hero banner and filtered catalog for `home`, `apparel`, `accessories`, or `essentials`. |
| `/product/:slug` | **Product Detail (PDP)**: High-res gallery with thumbnail selector and full-screen zoom, color & size selectors, quantity selector, add-to-bag, 1-click buy now, wishlist toggle, specifications accordion, verified buyer reviews breakdown, and related curations. |
| `/search` | **Search Page**: Real-time keyword inquiry with instant highlights and empty state fallbacks. |
| `/cart` | **Shopping Bag**: Full shopping bag management, free shipping progress indicator, promo code applicator, gift notes, and financial breakdown. |
| `/checkout` | **Frictionless Checkout**: Contact info, shipping address, delivery tiers (Standard, Express, Overnight), mock payment simulator (Card, Apple Pay, Klarna), Zod form validation, and instant order creation. |
| `/checkout/success/:orderId` | **Order Confirmation**: Receipt view, order ID, delivery fulfillment tracking timeline, printable invoice, and items summary. |
| `/wishlist` | **Saved Objects**: Persistent wishlist grid with 1-click move to cart. |
| `/login` | **Member Sign In**: Customer login with 1-click instant demo shortcuts for Customer and Admin. |
| `/register` | **Member Registration**: Account registration with validation. |
| `/forgot-password` | **Password Recovery**: Self-service recovery simulator. |
| `/account` | **Customer Portal**: Account overview, lifetime stats, order history with tracking details modal, saved shipping addresses manager, and profile editor. |

### Brand & CMS Pages
| Route | Description |
|---|---|
| `/about` | **The MOSS Approach**: Brand manifesto, global atelier origins (Japan, France, Italy), and flagship showroom details. |
| `/contact` | **Concierge & Support**: Inquiry contact form with topic selectors, direct studio contact numbers, support hours, and Pearl District showroom address. |
| `/faq` | **Frequently Asked Questions**: Categorized accordion covering shipping, returns, fabric care, and trade partnerships. |
| `/shipping-returns` | **Shipping & Returns**: Carrier delivery rates table, 30-day sleep and trial policy, and self-service return portal simulator. |
| `/privacy` | **Privacy Policy**: GDPR and CCPA compliant data governance statement. |
| `/terms` | **Terms & Conditions**: Terms of sale and artisanal natural variance notice. |

### Store Admin Console Routes
| Route | Description |
|---|---|
| `/admin` | **Executive Dashboard**: Key KPI metric cards (Total Sales, Orders, Customers, Products, Low Stock Alert), monthly revenue trajectory chart, collection share breakdown, and recent orders table. |
| `/admin/products` | **Products Management**: Catalog table with search and category filters, Add Product modal, Edit Product modal, and Delete Product action. |
| `/admin/categories` | **Collections Management**: Category list with product counts, image previews, and Add/Edit Category modal. |
| `/admin/orders` | **Orders Management**: Order list with status filters (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), live tracking number and carrier status updater, and full invoice drawer. |
| `/admin/customers` | **Customer Relations**: Client directory with lifetime spend, VIP badges, and profile drawer. |
| `/admin/inventory` | **Warehouse & Stock**: Real-time SKU stock table, low stock alerts (≤ 5 units), and inline stock quantity editor with instant save. |
| `/admin/discounts` | **Promotions & Promo Codes**: Discount codes table, active toggles, expiration dates, and Create Promo Code modal. |
| `/admin/reviews` | **Reviews Moderation**: Review approval queue with star rating inspect, approve, and reject actions. |
| `/admin/settings` | **Store Settings**: General parameters (Free shipping threshold, tax rate, support email, currency) and Magento 2 GraphQL endpoint connection settings. |

---

## 👤 Demo Accounts

For fast review and demonstration, instant 1-click sign-in buttons are provided on the `/login` page:

| Role | Email | Capabilities |
|---|---|---|
| **VIP Customer** | `elena.rostova@example.com` | Pre-loaded order history (`MOS-2026-9812`), saved addresses in Portland OR, VIP tier status. |
| **Store Admin** | `admin@moss.com` | Full administrative access to `/admin` management suite (Products CRUD, Orders, Inventory, Discounts, Reviews, Settings). |

---

## 🎟️ Active Demo Promo Codes

Test these discount codes in the Cart or Checkout drawer:
* `WELCOME10` — 10% off your order (min spend $50).
* `MOSS20` — 20% off orders over $200.
* `FREESHIP` — Complimentary shipping on any order amount.

---

## 🔌 Magento 2 Headless Integration Architecture

This application was architected from day one so that the local mock layer can be connected to Magento 2 GraphQL / REST without rebuilding any UI components.

### Service Layer Design:
```
src/
  ├── services/
  │   ├── interfaces/
  │   │   ├── IProductService.ts     <-- Shared Product Contract
  │   │   ├── ICategoryService.ts    <-- Category Contract
  │   │   ├── IOrderService.ts       <-- Order Contract
  │   │   ├── ICustomerService.ts    <-- Customer & Address Contract
  │   │   ├── IReviewService.ts      <-- Review Moderation Contract
  │   │   └── IDiscountService.ts    <-- Promo Code Contract
  │   ├── mock/
  │   │   ├── MockProductService.ts  <-- Local Storage / In-Memory Mock
  │   │   └── ...
  │   ├── magento/
  │   │   └── MagentoProductService.ts <-- Magento 2 GraphQL Implementation
  │   └── apiClient.ts               <-- Service Registry / Factory
```

To switch from Mock to Magento 2 GraphQL:
1. In `.env`, set `VITE_USE_MAGENTO=true`.
2. Set `VITE_MAGENTO_GRAPHQL_URL=https://your-magento-domain.com/graphql`.
3. The UI seamlessly delegates all queries and mutations through `IProductService`.

---

## 📦 Production & Performance Highlights

* **Code Splitting**: Every page is split into independent asynchronous chunks via `React.lazy`.
* **Zero Layout Shifts**: Image aspect ratios (`aspect-[4/5]`, `aspect-[3/4]`, `aspect-square`) are preserved with background loading skeletons.
* **Semantic HTML & A11y**: Proper heading hierarchy (`h1`-`h4`), ARIA dialog attributes, keyboard trap and Escape dismissal in modals, visible focus states, and high contrast typography.
* **SEO Metadata & JSON-LD**: Dynamic `SEOHead` component injecting page titles, meta descriptions, Open Graph tags, canonical URLs, and structured `Product` JSON-LD schema.

---

© 2026 MOSS Lifestyle Inc. All rights reserved.
#   E - c o m m - W e b s i t e  
 