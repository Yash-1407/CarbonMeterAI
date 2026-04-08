# CarbonMeter Project Architecture & Overview

This document provides a comprehensive overview of the **CarbonMeter** project, detailing the technology stack, application architecture, core modules, frontend components, backend APIs, and external integrations. 

## 1. Project Overview
CarbonMeter is a modern web application designed to track, analyze, predict, and offset carbon footprints. It incorporates gamification (Carbon Avatars), social features (Community Feed, Leaderboard), an AI-powered prediction engine, Virtual IoT integration, and a Carbon Credit Token (CCCT) trading system.

## 2. Technology Stack

### Core Framework
- **Next.js 14**: Utilizing the App Router (`app/` directory) for routing, layouts, and server/client components.
- **Language**: TypeScript (`^5`) for end-to-end type safety.
- **React**: Version 18.

### Styling & UI
- **Tailwind CSS (`^4.1.9`)**: Core styling utility.
- **Radix UI**: Headless UI primitives for accessible components (Dialog, Accordion, Dropdown, Slider, Popover, Select, etc.).
- **next-themes**: For handling light and dark modes.
- **Lucide React**: Icon library.
- **Recharts**: For rendering data visualization and carbon footprint charts.
- **Embla Carousel React**: For slider/carousel components.

### Form Handling & Validation
- **React Hook Form**: For efficient form state management.
- **Zod**: For schema-based validation.
- **@hookform/resolvers**: Bridging Zod and React Hook Form.

### AI & Machine Learning
- **Vercel AI SDK**: Core AI stream handling (`ai`, `@ai-sdk/react`).
- **Groq**: Llama 3 model integration for AI-powered predictions and chatbots (`@ai-sdk/groq`).

### Database & Authentication
- **Supabase**: Backend-as-a-Service for PostgreSQL database, authentication, and edge functions. 
  - `@supabase/ssr` (Server-Side Rendering support)
  - `@supabase/supabase-js`

### Web3 / Gamification
- **Ethers.js (`^6.16.0`)**: Used for simulating/interacting with the Carbon Credit Token (CCCT) blockchain ledger.
- **Crypto-js**: Cryptographic utilities.

## 3. Directory Structure

The repository follows a typical Next.js App Router structure with customized aliases.

```text
CARBON__Meter/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
├── components/           # Reusable React components (UI and Feature-specific)
├── lib/                  # Utility functions, service wrappers, and configurations
├── hooks/                # Custom React hooks
├── public/               # Static assets (images, fonts)
├── styles/               # Global styling (if any outside globals.css)
└── package.json          # Project dependencies and scripts
```

## 4. Main Application Modules (`app/`)

### Pages
- **`/auth`**: Authentication flow (Login, Sign-up) integrated with Supabase.
- **`/dashboard`**: The main user hub (`page.tsx` and `layout.tsx`). Shows overview data, charts, and quick actions.
- **`/calculate`**: The core Carbon Footprint calculator wizard/interface.
- **`/carbon-trading`**: Interface for viewing CCCT balance, earning tokens, and peer-to-peer trading.
- **`/community`**: Social hub including feed and leaderboard sections.
- **`/game`** & **`/avatar`**: Gamification system where users interact with their "Carbon Avatar" representation.
- **`/insights`**: AI-driven insights and carbon data trends.
- **`/iot`**: Dashboard for creating, managing, and syncing "Virtual IoT" devices that automatically generate carbon data.
- **`/reports`**: Detailed, exportable carbon footprint reports.

### API Routes (`app/api/`)
- **`/api/ai`**: Core AI processing routes.
- **`/api/chat` & `/api/chat-claude`**: Endpoints for the AI Assistant / Chatbots.
- **`/api/predict-carbon`**: Interface to Groq Llama 3 for projecting future carbon usage.
- **`/api/carbon-trading/earn`**: Endpoint to mint/allocate CCCT to users for eco-friendly actions.
- **`/api/carbon-trading/trade`**: Endpoint to handle Peer-to-Peer token transfers.
- **`/api/cron`**: Automated scheduling tasks via external cron triggers.
- **`/api/run-recurring-activities`**: Trigger endpoint for Virtual IoT devices to sync their continuous data into the database.

## 5. Core Components (`components/`)

- **UI Primitives (`components/ui/`)**: Reusable base components (buttons, inputs, cards, dialogs) mostly based on `shadcn/ui`.
- **`CarbonAvatar.tsx` / `AvatarWidget.tsx`**: Renders the user's gamified avatar based on their eco-score.
- **`CarbonPrediction.tsx`**: Displays the AI-generated future carbon trend line.
- **`carbon-calculator.tsx`**: The main multi-step or single-page form for entering daily activities (transport, energy, food) to calculate the footprint.
- **`carbon-charts.tsx`**: Wrapper around Recharts for displaying footprint breakdown.
- **`community-feed.tsx`**: UI for viewing friends' activities and eco-achievements.
- **`leaderboard.tsx`**: Ranking UI for user vs user carbon savings.
- **`ai-chatbot.tsx` / `simple-chatbot.tsx`**: Conversational interface for user assistance.
- **`iot/` & `recurring/`**: Components responsible for managing virtual connected devices and their automated syncing periods.
- **`reports-dashboard.tsx`**: High-level data tables and exportable metrics view.

## 6. Library & Utilities (`lib/`)

- **`lib/supabase/`**: 
  - `client.ts`: Supabase browser client wrapper.
  - `server.ts`: Supabase server client wrapper for Server Components.
  - `middleware.ts`: Next.js middleware for maintaining authentication sessions.
  - `iot-service.ts`: Abstraction layer for handling CRUD operations on Virtual IoT devices in the database.
- **`lib/ai/`**:
  - `aiService.ts`: Core functions to call LLMs (Groq).
  - `dataAccess.ts`: Functions to strip or prepare database data as context for the AI.
  - `prompts.ts`: System instructions and templates for guiding the AI responses.
- **`lib/carbon-calculations.ts`**: Pure functions containing the business logic and emission factors required to convert activities (e.g., driving 10km) into CO2 equivalents (kg CO2e).
- **`lib/blockchain-ledger.ts`**: Core backend logic for the Carbon Credit Token. Handles verifying balances and recording transfer events securely.
- **`lib/utils.ts`**: Helper functions, primarily `cn` (clsx + tailwind-merge) for dynamic class name merging.
- **`lib/achievements.ts`**: Logic for checking if users meet criteria for new badges/awards.

## 7. Key Workflows

1. **Authentication State**: Handled by Supabase Auth and Next.js middleware. Unauthenticated users are naturally redirected.
2. **Data Logging**: User enters data in `carbon-calculator.tsx` -> `lib/carbon-calculations.ts` calculates CO2e -> Saved to Supabase DB.
3. **Earning Tokens**: After logging an eco-friendly activity, the client hits `/api/carbon-trading/earn` -> `lib/blockchain-ledger.ts` credits the user's balance.
4. **Virtual IoT Execution**: The user sets up a device in `/iot` -> A central cron job hits `/api/run-recurring-activities` -> `lib/supabase/iot-service.ts` updates footprints for all active Virtual IoT devices automatically.
5. **AI Insights Generation**: Dashboard triggers `/api/predict-carbon` -> `lib/ai/dataAccess.ts` fetches user history -> `lib/ai/aiService.ts` queries Groq -> Client renders chart via `CarbonPrediction.tsx`.

## 8. Development Commands
- `npm run dev` or `pnpm dev`: Starts the Next.js development server.
- `npm run build` or `pnpm build`: Compiles the bundle for production.
- `npm run lint` or `pnpm lint`: Runs ESLint for the project.
