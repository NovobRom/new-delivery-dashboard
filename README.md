# Nova Post Operations Dashboard

A modern, responsive Single Page Application (SPA) designed for analyzing end-to-end logistics metrics, courier performance, and generating vital data insights.

## 🚀 Features

- **Data Import via CSV**: Easily upload reports directly into the application with robust file parsing (via Papa Parse).
- **Interactive Dashboards**: Advanced charting features (via Recharts) for visualization of delivery metrics.
- **Detailed Analytics**:
  - Delivery Analysis
  - Pickup Analysis
  - Couriers Metrics
- **Multi-language Support (i18n)**: Seamless switching between languages (Ukrainian, English).
- **Dark/Light Mode**: Full theme customization, including automatic system preference detection.
- **Responsive Layout**: Designed to work gracefully across desktop and tablet interfaces.

## 🛠 Tech Stack

- **Core**: React 19, TypeScript
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing**: React Router (`react-router`)
- **Styling**: Tailwind CSS, Framer Motion (animations)
- **Data Visualization**: Recharts
- **Internationalization**: i18next, react-i18next
- **Build Tool**: Vite
- **Validation**: Zod (schema-based data validation)
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/en/) installed on your machine (`v18` or later recommended).

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd new-delivery-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build

To build the application for production:

```bash
npm run build
```

The compiled output will be generated in the `dist` directory. You can preview the production build locally using:

```bash
npm run preview
```

## 🧹 Code Quality & Testing

- **Linting**: Enforced with ESLint and TypeScript compilation checks. Run `npm run lint`.
- **Testing**: Using Vitest and React Testing Library. Run `npm run test` or `npm run test:ci` for continuous integration test flows.

## 📂 Project Structure

```
new-delivery-dashboard/
├── public/                 # Static assets (favicon, logos, etc.)
├── src/
│   ├── components/         # Reusable UI components and page layouts
│   ├── store/              # Redux slices and store configuration
│   ├── i18n/               # Internationalization logic and locales
│   ├── App.tsx             # Root React component with routing logic
│   └── main.tsx            # Application entry point
├── index.html              # HTML template
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite bundler configuration
└── package.json            # Project metadata and dependencies
```

## 📄 License

This project is private and intended for internal use only.
