# CarbonMeter 🌍

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)](https://supabase.com/)
[![Powered by Groq](https://img.shields.io/badge/AI-Groq%20Llama%203-f55036)](https://groq.com/)

**Track Your Impact, Change the World.** 
CarbonMeter is a comprehensive platform empowering individuals to track, analyze, and reduce their environmental impact. 

## ✨ Features

- **📊 Comprehensive Carbon Calculator:** Log daily activities across transport, energy, and food to automatically calculate your carbon footprint.
- **🤖 AI Carbon Prediction Engine:** Receive intelligent insights and actionable recommendations powered by Groq's Llama 3 AI.
- **💰 CCCT (Carbon Credit Token) Trading:** Earn tokens for green activities and trade them securely on our decentralized-style ledger built atop Supabase.
- **👤 Dynamic Carbon Avatars:** Visualize your progress through gamified, evolving avatars based on your sustainability achievements.
- **🔌 Virtual IoT Sandbox:** Automatically synchronize hardware data directly into your personal dashboard using our simulated IoT device recurring tasks.
- **📈 Advanced Reporting:** Understand your data through interactive charts, reports, and detailed goal-tracking metrics.
- **👥 Active Community:** Connect with climate champions worldwide, share progress, and collaborate towards a greener future.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **AI Integration:** [Groq](https://groq.com/) (Llama 3 Model) via Vercel AI SDK
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/carbonmeter.git
   cd carbonmeter
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and configure your Supabase and Groq API keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   # or yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is licensed under the MIT License. Built for a sustainable future. 🌱
