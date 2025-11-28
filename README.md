# CrowdGraph

A collaborative web platform that combines crowdsourcing and AI to help communities build structured knowledge graphs. CrowdGraph enables human-centered knowledge graph construction through a hybrid AI + human validation model.

## Features

- **Community-Based Knowledge Graphs**: Create and join communities to collaboratively build domain-specific knowledge graphs
- **AI-Assisted Node & Edge Proposals**: AI algorithms suggest potential nodes and relationships for validation
- **Crowdsourced Validation**: Community members vote on and validate AI-generated proposals
- **Interactive Graph Visualization**: Real-time 2D force-directed graph visualization using react-force-graph
- **Smart Search**: Query knowledge graphs with natural language and get AI-powered answers
- **Credit-Based Gamification**: Earn credits for contributing and validating knowledge
- **Contribution Queue**: Review and vote on pending node and edge proposals
- **Real-Time Collaboration**: See community activity through the community feed
- **Responsive Design**: Mobile-first design using Tailwind CSS v4
- **Modern UI Components**: Built with Radix UI primitives

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with custom themes
- **UI Components**: Radix UI primitives (Dialog, Dropdown, Tabs, etc.)
- **Routing**: React Router DOM v7
- **State Management**: TanStack React Query (for server state & caching)
- **HTTP Client**: Axios
- **Graph Visualization**: react-force-graph-2d
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: Sonner (toast notifications)
- **Code Quality**: ESLint with TypeScript support

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lakshaykun/CrowdGraph.git
   cd CrowdGraph
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server with Vite
- `npm run build` - Build the project for production (runs TypeScript checks first)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview the production build locally

## Project Structure

```
CrowdGraph/
├── public/                    # Static assets
│   └── images/                # Image assets
├── src/
│   ├── _auth/                 # Authentication routes
│   │   ├── AuthLayout.tsx     # Layout wrapper for auth pages
│   │   └── pages/
│   │       ├── Login.tsx      # User login page
│   │       └── Signup.tsx     # User registration page
│   ├── _root/                 # Main application routes
│   │   ├── RootLayout.tsx     # Main layout wrapper with Navbar
│   │   └── pages/
│   │       ├── Communities.tsx         # Browse & create communities
│   │       ├── CommunityDashboard.tsx  # Individual community view with graph
│   │       ├── Landing.tsx             # Landing/home page
│   │       ├── NotFound.tsx            # 404 error page
│   │       └── Profile.tsx             # User profile page
│   ├── components/
│   │   ├── shared/             # Reusable components across the app
│   │   │   ├── CommunityFeed.tsx       # Activity feed for community
│   │   │   ├── CommunityGrid.tsx       # Grid layout for communities
│   │   │   ├── ContributionCard.tsx    # Individual contribution display
│   │   │   ├── ContributionQueue.tsx   # Review pending proposals
│   │   │   ├── CreditsDisplay.tsx      # User credits badge
│   │   │   ├── KnowledgeGraph.tsx      # Interactive graph visualization
│   │   │   ├── Navbar.tsx              # Navigation bar
│   │   │   ├── NodeSearchDropdown.tsx  # Search nodes for edge creation
│   │   │   └── SearchBar.tsx           # Community search
│   │   └── ui/                 # UI component library (Radix UI)
│   │       ├── button.tsx      # Button component
│   │       ├── card.tsx        # Card component
│   │       ├── dialog.tsx      # Modal dialog component
│   │       ├── dropdown-menu.tsx  # Dropdown menu component
│   │       ├── input.tsx       # Input component
│   │       ├── separator.tsx   # Separator component
│   │       ├── tabs.tsx        # Tabs component
│   │       └── textarea.tsx    # Textarea component
│   ├── config/                # Application configuration
│   │   └── queryClient.ts     # React Query configuration
│   ├── constants/             # Application constants
│   │   └── images.ts          # Image assets and constants
│   ├── context/               # React context providers
│   │   ├── AuthContext.tsx    # Authentication context
│   │   └── ThemeContext.tsx   # Theme management context
│   ├── hooks/                 # Custom React hooks
│   │   ├── apiHook.ts         # Legacy API hooks
│   │   ├── useCacheInvalidation.ts  # Cache invalidation utilities
│   │   ├── useQueries.ts      # React Query hooks (40+ endpoints)
│   │   └── useQueryWithFeedback.ts  # Query hooks with toast feedback
│   ├── lib/                   # Utility libraries
│   │   └── utils.ts           # General utility functions
│   ├── schema/                # TypeScript types and interfaces
│   │   └── index.ts           # Schema definitions
│   ├── services/              # API services and data management
│   │   ├── api.ts             # API client configuration (Axios)
│   │   └── data.ts            # Mock data and utilities
│   ├── theme/                 # Theme configuration
│   │   ├── theme.css          # Theme CSS variables
│   │   └── themes.ts          # Theme definitions
│   ├── utils/                 # Additional utilities
│   │   └── imageUtils.ts      # Image handling utilities
│   ├── App.tsx                # Main application component
│   ├── globals.css            # Global CSS styles
│   └── main.tsx               # Application entry point
├── components.json            # shadcn/ui component configuration
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML template
├── package.json               # Project dependencies and scripts
├── tsconfig.app.json          # TypeScript config for app
├── tsconfig.json              # Base TypeScript configuration
├── tsconfig.node.json         # TypeScript config for Node.js
├── vite.config.ts             # Vite configuration
├── vercel.json                # Vercel deployment config
├── IMPLEMENTATION_SUMMARY.md  # React Query implementation docs
├── MIGRATION_GUIDE.md         # Migration guide for React Query
└── REACT_QUERY_GUIDE.md       # React Query usage guide
```

### Directory Explanations

- **`_auth/`**: Contains authentication-related pages and layouts. Users login/signup here.
- **`_root/`**: Houses the main application pages and layout. Core functionality after authentication.
- **`components/shared/`**: Reusable domain-specific components like graphs, feeds, and contribution displays.
- **`components/ui/`**: Low-level UI components built on Radix UI, following shadcn/ui patterns.
- **`config/`**: Application-wide configuration including React Query setup with cache timing strategies.
- **`constants/`**: Static values and assets that don't change at runtime.
- **`context/`**: React Context providers for global state (auth, theme).
- **`hooks/`**: Custom hooks including 40+ React Query hooks for all API endpoints with automatic caching.
- **`lib/`**: Utility functions and helper libraries.
- **`schema/`**: TypeScript interfaces for Community, User, Node, Edge, Proposal types, etc.
- **`services/`**: API client setup with Axios and centralized API functions.
- **`theme/`**: Theme system with CSS variables and theme switching logic.

## Key Features Explained

### AI-Assisted Knowledge Graph Construction
- AI suggests node and edge proposals based on community context
- Human validation ensures accuracy and reliability
- Voting system determines which proposals get accepted into the knowledge graph

### Credit System
- Earn credits for creating proposals, voting, and contributing
- Credits are displayed in user profiles and throughout the app
- Gamification encourages quality contributions

### React Query Caching
- Professional-grade caching with TanStack React Query
- Different cache timing strategies for various data types
- Automatic cache invalidation on mutations
- See `REACT_QUERY_GUIDE.md` for detailed documentation

### Knowledge Graph Visualization
- Interactive 2D force-directed graph using react-force-graph-2d
- Visual representation of nodes and relationships
- Zoom, pan, and click interactions
- Color-coded nodes and edges

## Contributing

Contributions are welcome! If you'd like to contribute to CrowdGraph:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and passes ESLint checks.

## Documentation

- **`IMPLEMENTATION_SUMMARY.md`**: Details about the React Query caching implementation
- **`REACT_QUERY_GUIDE.md`**: Comprehensive guide for using React Query in this project
- **`MIGRATION_GUIDE.md`**: Guide for migrating from old API hooks to React Query

## License

This project is part of an academic/research initiative for collaborative knowledge graph construction.

## Authors

- **lakshaykun** - [GitHub](https://github.com/lakshaykun)

---

Built with ❤️ using React, TypeScript, and modern web technologies.
