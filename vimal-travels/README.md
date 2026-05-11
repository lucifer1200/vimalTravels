# Vimal Travels — Next.js Website

A full-stack travel agency website built with **Next.js 14**, **Tailwind CSS**, and **MongoDB Atlas**.

## 🗂 Project Structure

```
vimal-travels/
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout (Navbar + Footer)
│   ├── globals.css           # Global styles + Tailwind
│   ├── services/page.tsx     # Services page
│   ├── packages/page.tsx     # Tour packages page
│   ├── passport-visa/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── admin/enquiries/page.tsx  # 🔐 Admin panel
│   └── api/
│       ├── enquiry/route.ts           # POST — save enquiry
│       └── admin/enquiries/route.ts   # GET/PATCH — manage enquiries
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── WhatsAppButton.tsx
│   └── QuickEnquiryForm.tsx
├── models/
│   ├── Enquiry.ts            # Mongoose model
│   └── Subscriber.ts
└── lib/
    └── mongodb.ts            # DB connection singleton
```

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Set up MongoDB Atlas (Free)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign up
2. Create a **free M0 cluster**
3. Create a database user (username + password)
4. Under **Network Access**, add `0.0.0.0/0` (allow all — needed for Vercel)
5. Click **Connect → Connect your application**
6. Copy the connection string

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/vimal-travels?retryWrites=true&w=majority
ADMIN_SECRET=pick-any-strong-secret-string
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Admin Panel

Visit [http://localhost:3000/admin/enquiries](http://localhost:3000/admin/enquiries)

Enter your `ADMIN_SECRET` token to log in. You can:
- View all enquiries
- Filter by status (New / Contacted / Closed)
- Update enquiry status
- WhatsApp customers directly

---

## ☁️ Deploy to Vercel

### Option A — GitHub (Recommended)

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Add environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `ADMIN_SECRET` = your admin token
5. Click **Deploy** ✅

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts, then:
vercel env add MONGODB_URI
vercel env add ADMIN_SECRET
vercel --prod
```

---

## 🎨 Customization

| What | Where |
|------|-------|
| Colors (navy/orange) | `tailwind.config.ts` + `globals.css` |
| Phone number | `Navbar.tsx`, `Footer.tsx`, `WhatsAppButton.tsx` |
| Tour packages | `app/packages/page.tsx` |
| Services | `app/services/page.tsx` |
| Testimonials | `app/page.tsx` (testimonials array) |
| Business info | `components/Footer.tsx` |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas (free) |
| ODM | Mongoose |
| Fonts | Playfair Display + DM Sans |
| Icons | Lucide React |
| Hosting | Vercel (free tier) |

---

## 📞 Support

For any issues, contact [info@vimaltravels.in](mailto:info@vimaltravels.in)
