# BeyondChats Article Enhancement Platform

A full-stack MERN application that scrapes articles from BeyondChats blog, enhances them using AI and Google search insights, and displays both versions in a professional React interface.

## 🎯 Overview

**3-Phase System:**

1. **Scrape** articles from BeyondChats blog (last page, 5 oldest articles) → Store in MongoDB
2. **Enhance** articles using Google Search + AI/LLM (searches title, scrapes top 2 results, improves with GPT-4/Claude)
3. **Display** both original and enhanced versions in a React frontend

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Axios, Cheerio  
**AI/LLM:** OpenAI GPT-4 / Anthropic Claude, SerpAPI  
**Frontend:** React.js, Tailwind CSS, React Router  
**Deploy:** Render/Railway (Backend), Vercel (Frontend), MongoDB Atlas

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (Tailwind CSS)    │
│   - Article List  - Detail Pages   │
└─────────────────┬───────────────────┘
                  │ REST API
┌─────────────────▼───────────────────┐
│   Express.js Backend                │
│   - CRUD APIs   - Scraper Service   │
│   - Search      - LLM Integration   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│   MongoDB (Articles Collection)     │
│   - Original    - Enhanced          │
└─────────────────────────────────────┘
```

## 🚀 Quick Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- API Keys: OpenAI/Anthropic, SerpAPI (optional)

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

**Environment Variables (.env):**

```env
MONGODB_URI=mongodb://localhost:27017/beyondchats
OPENAI_API_KEY=your_key_here
LLM_PROVIDER=openai
FRONTEND_URL=http://localhost:3000
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

### Run Scripts

```bash
# Scrape articles from BeyondChats
cd server
npm run scrape

# Enhance articles with AI
npm run enhance
```

## 📚 API Documentation

**Base URL:** `http://localhost:5000/api`

### Endpoints

| Method | Endpoint          | Description                                                 |
| ------ | ----------------- | ----------------------------------------------------------- |
| GET    | `/articles`       | Get all articles (query: `?versionType=original\|enhanced`) |
| GET    | `/articles/:id`   | Get single article                                          |
| POST   | `/articles`       | Create article                                              |
| PUT    | `/articles/:id`   | Update article                                              |
| DELETE | `/articles/:id`   | Delete article                                              |
| GET    | `/articles/stats` | Get statistics                                              |

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Article Title",
      "author": "Author Name",
      "versionType": "original",
      "parentArticleId": null,
      "references": [],
      "contentHtml": "<p>...</p>",
      "contentText": "..."
    }
  ]
}
```

## 🤖 AI Enhancement Workflow

```
1. Fetch original articles from API
   ↓
2. Search article title on Google (SerpAPI/scraping)
   ↓
3. Get top 2 blog/article results
   ↓
4. Scrape content, headings, structure from references
   ↓
5. Call LLM API with prompt:
   - Original article
   - Reference articles (top-ranking)
   - Instructions: Improve SEO, structure, clarity
   ↓
6. Generate enhanced article (HTML)
   ↓
7. Add reference citations
   ↓
8. Save to database (linked via parentArticleId)
```

## 📁 Project Structure

```
BeyondCA/
├── server/
│   ├── src/
│   │   ├── config/          # Database, LLM config
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Error handling, rate limit
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Scrape & enhance scripts
│   │   ├── services/        # Scraper, search services
│   │   └── index.js         # Main server
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client
│   │   └── App.js
│   └── package.json
│
└── README.md
```

## 🌐 Deployment

### Backend (Render/Railway)

1. Push to GitHub
2. Connect repo to Render/Railway
3. Add environment variables
4. Deploy

### Frontend (Vercel)

```bash
cd client
npm install -g vercel
vercel
```

### Database (MongoDB Atlas)

1. Create cluster at mongodb.com
2. Get connection string
3. Update `MONGODB_URI` in backend

## 🧪 Testing

```bash
# Test API
curl http://localhost:5000/api/health
curl http://localhost:5000/api/articles

# Test scraping
cd server && npm run scrape

# Test enhancement
cd server && npm run enhance
```

## ✨ Features

### Backend

✅ RESTful CRUD APIs  
✅ Web scraping (BeyondChats blog)  
✅ Google Search integration  
✅ AI/LLM enhancement (OpenAI/Claude)  
✅ Error handling & validation  
✅ Rate limiting & security

### Frontend

✅ Responsive design (Tailwind)  
✅ Article listing with filters  
✅ Detail pages with tabs  
✅ Original ↔ Enhanced linking  
✅ References display  
✅ Loading & error states

## 📝 License

MIT

---

**Live Demo:** [Add your deployed links here]

**Assignment for:** BeyondChats Full Stack Web Developer Intern Position
