# Unit Track - Solar Energy Dashboard ☀️

Unit Track is a modern, responsive web application designed to help users track and manage their daily solar energy usage. Built with a mobile-first approach, it functions as a Progressive Web App (PWA) for a native app-like experience on mobile devices.

## 🚀 Features

- **Dashboard Overview**: Quick glance at energy usage for Today, Yesterday, This Month, and This Year.
- **Usage Analytics**: Interactive charts showing energy consumption trends across Daily (7 days), Monthly (Current Month), and Yearly (Current Year) periods.
- **Easy Data Entry**: Streamlined form for recording solar generation, grid import, and export readings with automatic "Unit Used" calculation.
- **History Management**: Comprehensive log of all entries with search capabilities and the ability to edit or delete records.
- **PWA Support**: Installable on Android and iOS devices for quick access directly from the home screen.
- **Modern UI/UX**: Clean, premium design with support for both Light and Dark modes.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/) (shadcn/ui)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn
- A PostgreSQL database (e.g., Neon)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd solar-energy-dashboard
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your database URL:
    ```env
    DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
    ```

4.  **Database Setup**:
    Run Prisma migrations and seed the database with initial data:
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

5.  **Run the development server**:
    ```bash
    npm run dev
    ```

6.  **Open the application**:
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Mobile Installation (PWA)

To install **Unit Track** on your phone:

- **Android (Chrome)**: Tap the menu (three dots) -> **Install app**.
- **iOS (Safari)**: Tap the Share button -> **Add to Home Screen**.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
