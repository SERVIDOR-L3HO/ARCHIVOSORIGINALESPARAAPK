# UltraGol - Football Streaming & Statistics Platform

## Overview

UltraGol is a comprehensive Spanish-language football (soccer) platform that provides live streaming, match statistics, team information, and news for Liga MX and other major European leagues. The platform is branded "by L3HO" and serves as a central hub for football fans to access match schedules, standings, player statistics, and live streaming links.

The application is built as a client-side focused web platform with Express.js backends serving static content and handling payment integrations. It features a modern, responsive design with a primary orange/gold color scheme (#ff9933, #ff6b35) and includes real-time updates, Firebase integration for authentication and data storage, and monetization through Google AdSense and PayPal donations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- Pure HTML5, CSS3, and JavaScript (no frontend framework)
- Firebase SDK 9.22.0 (compat mode) for authentication and data storage
- Responsive design with mobile-first approach
- Bottom navigation bar for mobile experience
- Splash screen on initial load

**Design System:**
- Primary colors: Orange (#ff9933, #ff6b35), Navy Blue (#003366), Dark backgrounds (#0a0a0a, #1a1a1a)
- Typography: Inter, Roboto, Playfair Display (Google Fonts)
- Glassmorphism and gradient effects throughout
- Animated components with custom CSS keyframes
- Font Awesome 6.0.0 for icons

**Key UI Components:**
- Professional hero sections with particle animations
- Bottom navigation bar (sticky, glassmorphism effect)
- Match cards with live indicators
- Team profile pages with dynamic theming
- Modal systems for streams and interactions
- Carousel components for featured content

### Backend Architecture

**Main Server (server.js):**
- Express.js 5.1.0 application
- Port: 5000 (configurable via environment variable)
- Serves static files from root directory
- Security middleware: Helmet.js with CSP disabled for iframe support
- Session management with express-session
- Cookie parsing support
- CORS enabled for cross-origin requests

**ULTRA Streaming Module (ULTRA/server.js):**
- Separate Express.js 4.21.2 server for streaming features
- Serves the live streaming interface
- Independent deployment from main application

**Key Middleware:**
- Helmet for security headers (CSP disabled for embedded content)
- CORS with credentials support
- Cookie-parser for cookie handling
- Express-session for user sessions
- Cache-Control headers to prevent caching issues

### Data Storage Solutions

**Firebase Integration:**
- Firebase Authentication for user management
- Firestore for real-time data storage (user profiles, comments, notifications, chat messages)
- Firebase Storage for media uploads
- Collections: `users`, `notifications`, `comments`, `matchLinks`, `chatMessages`

**Static JSON Data:**
- `/data/fixtures.json` - Match fixtures and results
- `/data/standings.json` - League standings
- `/data/teams.json` - Team information and statistics
- `/data/jornadas.json` - Match schedule by gameweek
- `/data/videos-highlights.json` - Video content URLs
- `/data/fixtures-all-leagues.json` - Multi-league fixture data

**Session Storage:**
- Cookie-based user preferences
- Session management for authenticated users
- GDPR-compliant cookie consent tracking

### Authentication and Authorization

**Firebase Authentication:**
- Email/password authentication
- Google OAuth sign-in
- Authentication state observer for real-time updates
- User profile creation on registration with favorite team selection
- Admin user list (hardcoded): `admin@ultragol.com`, `l3ho@admin.com`

**User Profile System:**
- Automatic profile creation in Firestore on signup
- Profile fields: displayName, email, favoriteTeam, photoURL, createdAt, lastLogin
- User preferences stored in Firestore
- Profile pages with posts, videos, and achievements

**Authorization Levels:**
- Public users: Read-only access to standings, fixtures, news
- Authenticated users: Can comment, share links, participate in chat
- Admin users: Dashboard access for content moderation (planned feature)

## External Dependencies

### Third-Party APIs

**UltraGol API (https://ultragol-api3.onrender.com):**
- Primary data source for live match scores (`/marcadores`)
- Streaming links (`/transmisiones`)
- League-specific endpoints: `/premier`, `/laliga`, `/seriea`, `/bundesliga`, `/ligue1`
- News content (`/noticias`)
- 5-minute client-side caching implemented

**YouTube Embed API:**
- Video highlights and match replays
- Embedded via iframe with YouTube video IDs

### Payment Integration

**PayPal SDK:**
- `@paypal/paypal-server-sdk` version 1.1.0
- Used for donation processing on `/donaciones.html`
- Dynamic SDK loading based on environment (sandbox/production)
- Server endpoints: `/api/paypal/orders`, `/api/paypal/orders/:orderId/capture`

**Stripe (Installed but not implemented):**
- `stripe` version 18.5.0 in dependencies
- Not actively used in codebase

### Analytics and Advertising

**Google AdSense:**
- Publisher ID: `ca-pub-3612607805789879`
- Loaded on most pages via async script tag
- Used for monetization

### CDN Resources

**Firebase:**
- Hosted on Google CDN
- Version 9.22.0 (compat mode) and 10.7.1 (modular)
- Services: Auth, Firestore, Storage

**Font Awesome:**
- Version 6.0.0 via CDN
- Icon library for UI components

**Google Fonts:**
- Roboto (weights: 300, 400, 500, 700)
- Inter (weights: 400-900)
- Playfair Display (weights: 400-900)
- Poppins (weights: 700-900)

### Node.js Dependencies

**Production Dependencies:**
- `express` (5.1.0 main, 4.21.2 ULTRA): Web server framework
- `cors` (2.8.5): Cross-origin resource sharing
- `helmet` (8.1.0): Security headers
- `cookie-parser` (1.4.7): Cookie parsing middleware
- `express-session` (1.18.2): Session management
- `@paypal/paypal-server-sdk` (1.1.0): PayPal integration
- `stripe` (18.5.0): Payment processing (installed but unused)

### Browser APIs

**Service Worker Capabilities:**
- Push notifications (planned)
- Offline support (planned)
- Background sync for real-time updates

**Media APIs:**
- Video embedding via iframes
- Picture-in-Picture support for video player

**Storage APIs:**
- LocalStorage for user preferences
- SessionStorage for temporary data
- Cookies for consent and session management

### Development Considerations

**Environment Variables (Expected):**
- `PORT`: Server port (default: 5000)
- `SESSION_SECRET`: Session encryption key
- `NODE_ENV`: Environment mode (development/production)
- `PAYPAL_CLIENT_ID`: PayPal API credentials
- `PAYPAL_CLIENT_SECRET`: PayPal API credentials

**Security Features:**
- Helmet.js for HTTP headers
- CORS configured for credential support
- Session cookies with httpOnly flag
- Content Security Policy disabled to allow iframe embeds
- GDPR-compliant cookie consent system

**Performance Optimizations:**
- Client-side caching for API responses (5-minute TTL)
- Cache-Control headers to prevent stale content
- Query string versioning for CSS/JS files
- Lazy loading for images (planned)
- Code splitting by page/feature