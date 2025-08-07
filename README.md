# Token Price Explorer

A modern, responsive cryptocurrency token price converter with real-time market data. Built with React, TypeScript, and Vite.

![Token Price Explorer](https://img.shields.io/badge/React-19.0.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Vite](https://img.shields.io/badge/Vite-6.0-purple)

## Features

- 🚀 Real-time token price conversion
- 💱 Bidirectional conversion between cryptocurrencies
- 📱 Fully responsive design for mobile and desktop
- ✨ Premium glassmorphism UI with smooth animations
- 🎨 Modern gradient design with professional aesthetics
- ⚡ Built with Vite for lightning-fast development
- 🔒 Secure API key management with environment variables
- 📦 TypeScript for type safety
- 🎯 ESLint and Prettier for code quality
- 🪝 Husky and lint-staged for pre-commit hooks

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (v8 or higher)
  ```bash
  npm install -g pnpm
  ```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/fun.xyz.git
cd fun.xyz
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your FunKit API key:

```env
VITE_FUNKIT_API_KEY=your_api_key_here
```

> To get an API key, visit [FunKit](https://funkit.com) and sign up for an account.

### 4. Start the development server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Start development server         |
| `pnpm build`        | Build for production             |
| `pnpm preview`      | Preview production build locally |
| `pnpm lint`         | Run ESLint                       |
| `pnpm format`       | Format code with Prettier        |
| `pnpm format:check` | Check code formatting            |
| `pnpm typecheck`    | Run TypeScript type checking     |
| `pnpm prepare`      | Set up Husky git hooks           |

## Project Structure

```
fun.xyz/
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   ├── vite-env.d.ts        # Vite type definitions
│   ├── hooks/
│   │   └── useDebounce.ts   # Debounce hook for input optimization
│   └── services/
│       └── tokenService.ts  # Token API service with caching
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier configuration
├── eslint.config.js        # ESLint configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # TypeScript Node configuration
├── vite.config.ts          # Vite configuration
├── vercel.json             # Vercel deployment config
├── package.json            # Project dependencies
└── pnpm-lock.yaml          # Locked dependencies

```

## Development

### Code Quality

The project uses several tools to maintain code quality:

- **TypeScript**: Strict mode enabled for maximum type safety
- **ESLint**: Enforces code quality rules
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks to run linting and formatting

### API Integration

The application uses the FunKit API to fetch real-time token prices. The service includes:

- Response caching with 5-minute TTL
- Error handling with fallback data
- TypeScript interfaces for type safety

### Supported Tokens

- USDC (USD Coin)
- USDT (Tether)
- ETH (Ethereum)
- BONKE
- GIGA
- POPCAT
- SPX

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Build

```bash
# Build the application
pnpm build

# Preview the build
pnpm preview
```

The built files will be in the `dist/` directory.

## Environment Variables

| Variable              | Description                   | Required |
| --------------------- | ----------------------------- | -------- |
| `VITE_FUNKIT_API_KEY` | FunKit API key for token data | Yes      |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Technical Decisions & Assumptions

### Architecture Decisions

1. **React 19 with TypeScript**
   - Leverages latest React features for better performance
   - TypeScript strict mode ensures type safety and reduces runtime errors
   - Component-based architecture for maintainability

2. **Vite as Build Tool**
   - Near-instant HMR (Hot Module Replacement) for better DX
   - Optimized production builds with tree-shaking
   - Native ES modules support

3. **API Integration Strategy**
   - 5-minute cache TTL balances freshness vs API usage
   - Fallback prices for resilience when API is unavailable
   - Performance monitoring tracks cache efficiency

4. **Error Handling**
   - Error boundaries prevent app crashes
   - Graceful fallbacks for API failures
   - User-friendly error messages

5. **Performance Optimizations**
   - Debounced input (300ms) reduces unnecessary calculations
   - React.memo for expensive components
   - Lazy loading for code splitting (prepared for future features)
   - Performance monitoring utilities for production insights

### Key Assumptions

1. **Token Prices**
   - Prices update every 5 minutes (cache TTL)
   - USD as base currency for all conversions
   - Linear price conversion (1 TOKEN_A \* PRICE_A = X USD = Y TOKEN_B)

2. **Supported Tokens**
   - Limited to major tokens (USDC, USDT, ETH, WBTC)
   - Each token has a primary chain ID
   - Icons use Unicode symbols for consistency

3. **User Experience**
   - Users primarily convert between two tokens
   - Mobile-first responsive design
   - Keyboard navigation support for accessibility

4. **Security**
   - API keys stored in environment variables
   - No sensitive operations (read-only API calls)
   - No wallet connections or transactions

5. **Browser Support**
   - Modern browsers only (ES2020+)
   - CSS Grid and Flexbox required
   - JavaScript enabled (no SSR fallback)

### Trade-offs

- **Simplicity over Features**: Focused on core conversion functionality
- **Client-side only**: No SSR for simpler deployment
- **Static token list**: Not dynamically fetched to reduce complexity
- **No historical data**: Real-time prices only

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Vite
