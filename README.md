<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AfriEstate — Real Estate Marketplace

AfriEstate is an online property marketplace connecting landlords, agents, and developers
with tenants, buyers, and investors across Africa. The platform focuses on affordable
housing, student rentals, and township/rural properties, alongside general residential
and commercial markets.

The app is built as a single-page React application powered by Vite, with Supabase for
data and authentication, Firebase for additional services, and Google Gemini for the AI
features (chatbot, voice chat, listing improvements, neighborhood explorer, and more).

## Features

- **Property listings** — browse, search, filter, and compare residential, commercial,
  affordable-housing, student-rental, and township/rural properties.
- **Rich property details** — detail modals, image galleries, VR tours, and tour
  scheduling.
- **Multi-role experience** — dedicated dashboards for Users, Agents, and Investors,
  including agent profiles, leads, reviews, and investment requests.
- **AI-powered tools** (via Google Gemini):
  - Chatbot and voice assistant
  - AI Creative Suite for listing copy
  - Listing improvement suggestions
  - Lifestyle matcher and neighborhood explorer
  - Personalized property recommendations
- **Financial tools** — mortgage calculator, market insights, and real-time news.
- **Community** — blog, neighborhood guides, forum posts, and agent reviews.
- **Internationalization** — multi-language and multi-currency support via React
  contexts.
- **Messaging & notifications** — in-app messages, inquiries, and a notifications panel.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (via CDN) with a custom AfriEstate theme
- **Backend / data:** Supabase (`@supabase/supabase-js`)
- **Auth / extras:** Firebase
- **AI:** Google Gemini (`@google/genai`, `@google-ai/generativelanguage`)
- **UI:** Heroicons, `react-markdown`, `rehype-raw`

## Run locally

**Prerequisites:** [Node.js](https://nodejs.org/) (LTS recommended)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the project root and set your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   You can get a key from [Google AI Studio](https://aistudio.google.com/).
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000.

## Available scripts

- `npm run dev` — start the Vite development server
- `npm run build` — produce a production build
- `npm run preview` — preview the production build locally

## Project structure

```
.
├── App.tsx                 # Root application component and routing
├── index.tsx / index.html  # Vite entry points
├── components/             # UI components, modals, dashboards, and pages
│   ├── pages/              # About, Contact, Services, Pricing pages
│   ├── dashboards/         # User, Agent, and Investor dashboards
│   └── icons/              # Icon components
├── contexts/               # React contexts (language, currency, etc.)
├── lib/                    # Supabase client, data access, and utilities
├── constants.ts            # App-wide constants (categories, achievements, ...)
├── translations.ts         # i18n strings
├── types.ts                # Shared TypeScript types
├── migration.sql           # Supabase schema migration
└── vite.config.ts          # Vite configuration
```

## AI Studio

This app was originally scaffolded with Google AI Studio. You can view the original
app entry here:
https://ai.studio/apps/431f6619-2bb6-47f8-88cb-c451b67768ba
