<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

# Internship Monitoring System — Backend Core

This repository contains the enterprise-grade RESTful API service for the **Internship Monitoring System**, originally developed during my internship at **Uruti Hub**. It provides structural data persistence, access controls, business logic handling, and local AI analytical integrations.

---

## Architecture & Core Technologies

The backend microservice handles relational data tracking and security layers using:

- **Framework:** NestJS (TypeScript-based progressive Node.js architecture)
- **Database Layer:** TypeORM with fully assertive type-safe entity mappings (`user.entity.ts`)
- **Database Engine:** SQLite (configured locally for quick, portable deployment presets)
- **Intelligence Layer:** Ollama AI integration for context-aware internship telemetry and metrics analysis

---

## Getting Started

### 1. Prerequisites

Ensure you have Node.js and your local Ollama AI engine instance initialized on your server environment.

### 2. Project Setup

Navigate to the backend directory and install the required workspace dependencies:

```bash
npm install
```

### 3. Compile and Run the Server

Run the application locally using standard or active watch scripts:

```bash
# development mode
npm run start

# watch mode (auto-reloads on file saves)
npm run start:dev

# production build mode
npm run start:prod
```

Once initialized, the API microservice will boot up securely on its assigned port.

---

## Structural Highlights

- `src/users/` — Explicit user entity schemas (`user.entity.ts`), data decorators, services, and routing controllers.
- `tsconfig.json` — Modern configuration running clean `nodenext` modules without deprecated legacy resolution options.

---

## Rebuild Roadmap (Upcoming Refactoring)

This build preserves the **v1.0 (Uruti Hub Legacy Release)** backend engine. The upcoming architectural overhaul will focus on:

- **Prisma Migration:** Transitioning our ORM layer from TypeORM to Prisma for enhanced database query handling.
- **Extended Guard Schemes:** Introducing stricter authentication decorators across relational student/lecturer paths.
- **Streamlined AI Pipelines:** Enhancing the speed of contextual responses delivered by local Ollama engines.
