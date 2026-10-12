# VóBank

> A modern mobile app for tracking shared credit cards, splitting purchases, and knowing exactly who owes what each month.

<p align="left">
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-0.86-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
  <a href="https://docs.expo.dev/router/introduction/"><img src="https://img.shields.io/badge/Expo_Router-v57-4630EB?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Router" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.nativewind.dev/"><img src="https://img.shields.io/badge/NativeWind_v4-Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="NativeWind" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-0.39-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" /></a>
  <a href="https://zod.dev/"><img src="https://img.shields.io/badge/Zod-3.24-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" /></a>
  <a href="https://jwt.io/"><img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="https://jestjs.io/"><img src="https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-Fast_PM-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" /></a>
</p>

---

## 🎯 The Pain Point: Why VóBank?

Sharing a credit card with partners, family members, or friends is a common way to maximize rewards, leverage cashback, or share subscriptions and emergency purchases. However, managing the bill at the end of the month is usually a headache:

- **Spreadsheet chaos:** Cardholders often struggle to calculate who bought what and how much each person actually owes on the current statement.
- **Split purchases:** When a purchase is shared between the cardholder and one or more people (either in fixed amounts or percentage splits), manual math gets messy.
- **Long-term installments:** When someone buys a high-ticket item in 10x or 12x installments, tracking their recurring share across upcoming statements is prone to human error and forgotten debts.
- **Statement closing dates vs. due dates:** Purchases made right before or right after the card's closing date (_dia de fechamento_) fall onto different billing cycles, confusing settle-up deadlines.
- **Settlement ambiguity:** There is no easy way to record whether someone has already paid their portion of the month's invoice or if it is still pending.

**VóBank** eliminates this friction by treating shared credit card dynamics as first-class citizens. You register your cards, your co-spenders, and your purchases; the app calculates billing cycles, splits, and installment schedules, tracking who owes what and who has settled.

---

## ✨ Features

- 👥 **People Management:** Register friends, partners, or roommates with custom names and color badges for instant visual identification.
- 💳 **Credit Cards & Invoices:** Configure closing and due dates for each card. The app automatically assigns purchases to the correct billing cycle based on the transaction date.
- ➗ **Purchase Splitting:** Split purchases between the cardholder and multiple people by exact fixed amounts or percentages.
- 📅 **Installment Engine:** Automatically generates monthly installment schedules and tracks payment status (paid vs. pending) per person for each invoice.
- 🔔 **Due Date Reminders:** Local notifications (`expo-notifications`) alert you 1 day before and on the day of payment due dates.
- 🌓 **Adaptive Light & Dark Mode:** Full theme support with system color scheme detection and manual toggle, built with sleek micro-animations and haptic feedback.

---

## 🛠 Tech Stack

### Mobile Client

- **Framework:** [React Native](https://reactnative.dev/) (v0.86) with [Expo](https://expo.dev/) (SDK 57)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing with tab groups, modals, and route groups)
- **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS) + React Native Reusables / Shadcn UI inspired primitives
- **Icons & UI:** [Lucide Icons](https://lucide.dev/), `@expo/ui`, `react-native-reanimated`, and `react-native-gesture-handler`
- **Device Capabilities:** `expo-secure-store` (secure tokens), `expo-notifications`, `expo-haptics`

### Backend & API

- **API Runtime:** Expo Router API Routes (`src/app/api/...`)
- **Database & ORM:** PostgreSQL 18 with [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit
- **Validation & Auth:** [Zod](https://zod.dev/) schemas, JWT authentication, and `bcryptjs` password hashing

### Developer Tooling & Quality

- **Package Manager:** `pnpm` (strictly enforced across scripts)
- **Containerization:** Docker & Docker Compose (`compose.yml`)
- **Quality Suite:** ESLint 9, Prettier, TypeScript strict mode, and Jest (`jest-expo`) with in-memory domain testing

---

## 🏗 Project Architecture

The project strictly follows a **Feature-Based Architecture** across both mobile client code and server-side route logic:

```
finances/
├── compose.yml              # Docker Compose setup for PostgreSQL and containerized services
├── drizzle.config.ts        # Drizzle ORM configuration
├── src/
│   ├── app/                 # Expo Router file-based routes
│   │   ├── (auth)/          # Authentication routes (login, register)
│   │   ├── (tabs)/          # Main tab navigation (dashboard, cards, people, purchases)
│   │   ├── (modals)/        # Modal sheets for creating/editing resources
│   │   └── api/             # Integrated API route handlers (+api.ts)
│   │
│   ├── [feature]/           # Client-side mobile feature modules:
│   │   │                    # (auth, credit-cards, dashboard, notifications, people, purchases)
│   │   ├── components/      # Feature-specific UI components
│   │   ├── hooks/           # Feature-specific React hooks
│   │   ├── services/        # Client API services
│   │   ├── types/           # Domain type definitions
│   │   └── tests/           # Feature unit and component tests
│   │
│   ├── server/              # Isolated backend domain logic
│   │   ├── [feature]/       # Feature backend services, schemas, and repositories
│   │   │   ├── *.service.ts # Business logic services
│   │   │   ├── *.schema.ts  # Zod request/response validation schemas
│   │   │   └── tests/       # Isolated in-memory unit tests (run in CI without DB)
│   │   └── shared/          # Database client, auth middleware, and HTTP response helpers
│   │
│   └── shared/              # Reusable UI components, design tokens, hooks, and helpers
│       ├── components/      # Shared buttons, cards, forms, dialogs, inputs
│       ├── hooks/           # useTheme, haptics, bottom sheet dismiss helpers
│       └── utils/           # Formatters (currency, dates, split calculations)
```

> **Testing Philosophy:** Business logic services and repositories are tested in-memory. Unit and automated tests do **not** depend on live database connections or `.env` secrets during CI runs (`pnpm check`).

---

## 🚀 Getting Started

Follow the instructions below to run the project on a new machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v20 or newer recommended)
- **pnpm** (Required: `corepack enable` or `npm install -g pnpm`)
- **Docker & Docker Compose** (for running the PostgreSQL database)
- **Expo Go** app installed on your physical mobile device (iOS/Android), or an **Android Emulator** / **iOS Simulator**

---

### Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/JoaoPedro787/finances-mb.git
cd finances-mb
pnpm install
```

---

### Step 2: Configure Environment Variables

Create your local `.env` file from the provided template:

```bash
cp .env.example .env
```

Review and adjust the environment variables in `.env`:

```env
# Database (Local Postgres connection)
DATABASE_URL=postgresql://postgres:root@localhost:5432/finances

# Database (Docker Compose credentials)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root
POSTGRES_DB=finances
POSTGRES_PORT=5432

# Authentication
JWT_SECRET=supersecretjwtkeythatissufficientlylongandsecure12345

# Client API URL
# For testing with Expo Go on a physical phone, replace localhost with your machine's LAN IP:
# e.g., EXPO_PUBLIC_API_URL=http://192.168.1.100:8081
EXPO_PUBLIC_API_URL=http://localhost:8081
```

> 💡 **Tip for Physical Devices:** When running on a physical phone via Expo Go, your phone needs to reach your computer's API server. Use your computer's local IP address (e.g., `192.168.x.x`) in `EXPO_PUBLIC_API_URL`.

---

### Step 3: Start the PostgreSQL Database

Start the PostgreSQL database container in the background using Docker Compose:

```bash
pnpm docker:db
```

To verify that the database is running:

```bash
docker ps
```

---

### Step 4: Run Database Migrations

Apply the database schema to your PostgreSQL instance using Drizzle Kit:

```bash
pnpm db:push
```

_(Optional)_ To inspect your database through a web visualizer:

```bash
pnpm db:studio
```

---

### Step 5: Start the Expo Development Server

Start the Metro bundler:

```bash
pnpm start
```

Or target a specific environment:

```bash
pnpm android  # Launch on Android Emulator / connected device
pnpm ios      # Launch on iOS Simulator (macOS only)
pnpm web      # Run in a web browser
```

Once the terminal prints the QR code, scan it using:

- **Expo Go** on Android.
- The **Camera** app on iOS (with Expo Go installed).

---

## 📋 Available Scripts

| Command            | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `pnpm start`       | Starts the Expo development server (with tunnel support)             |
| `pnpm check`       | Runs full project validation: Prettier, ESLint, TypeScript, and Jest |
| `pnpm test`        | Runs Jest test suite                                                 |
| `pnpm lint`        | Runs ESLint checks                                                   |
| `pnpm lint:fix`    | Runs ESLint and auto-fixes issues                                    |
| `pnpm format`      | Formats code with Prettier                                           |
| `pnpm typecheck`   | Validates TypeScript types without emitting files                    |
| `pnpm db:push`     | Pushes the Drizzle schema directly to the database                   |
| `pnpm db:studio`   | Opens Drizzle Studio in the browser to inspect database tables       |
| `pnpm docker:db`   | Starts the PostgreSQL Docker container                               |
| `pnpm docker:down` | Stops and removes Docker Compose containers                          |
| `pnpm docker:logs` | Streams logs from running Docker containers                          |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
