# Internship Monitoring System — Frontend Client

This repository contains the web-based frontend client for the **Internship Monitoring System**, originally conceptualized and engineered during my internship tenure at **Uruti Hub**. It functions as the primary visual and user-interaction layer, connecting directly to our dedicated NestJS backend services.

---

## Tech Stack & Architecture

The user interface balances efficient rendering speeds with modern styling conventions using:

- **Framework:** Next.js (App Router architecture)
- **Styling:** Tailwind CSS (for custom utility-first UI configurations)
- **Design Asset:** Geist Font optimization family (optimized via `next/font`)
- **Core Communications:** RESTful API bindings targeting the backend microservice layer

---

## Getting Started

### 1. Prerequisites

Ensure you have Node.js installed on your machine. You will also need the backend services running concurrently to resolve functional operational states.

### 2. Installation

Navigate to your frontend directory and install the necessary dependencies:

```bash
npm install
```

### 3. Running the Local Development Server

Boot up the development script with your preferred node package runtime engine:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) inside your web browser to interact with the responsive interface.

---

## Structural Overview

- `app/` — Houses pages, components, and unified layout routing paradigms.
- `app/lecturer/reports/page.tsx` — Specialized administrative view reporting metrics for mentors/lecturers.
- `public/` — Static assets, icons, and globally shared media files.

---

## Strategic Roadmap (Upcoming Architecture Changes)

This client reflects the **v1.0 (Uruti Hub Legacy Release)** implementation. Future enhancements scheduled on the project pipeline include:

- **UI Refresh:** Overhauling design patterns into a cleaner component framework.
- **State Management Optimization:** Upgrading contextual data streams between Next.js and the NestJS controller instances.
- **Deepened AI Interfaces:** Maximizing real-time telemetry streaming driven by local Ollama AI endpoints.
