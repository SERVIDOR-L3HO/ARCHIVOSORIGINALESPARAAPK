# UltraGol - Football Streaming and Information Platform

## Overview

UltraGol is a comprehensive Spanish-language football platform focused on Liga MX, developed by L3HO. It offers live streaming discovery, real-time match information, team statistics, user authentication, and social features. The platform aims to be a central hub for football fans to find streams, follow teams, engage with a community, and support the platform. It comprises a main website for Liga MX information and an "ULTRA Platform" for live streaming and user-generated content. The platform has expanded to include major international leagues like Premier League, La Liga, Serie A, Bundesliga, and Ligue 1, providing multi-league news, videos, and standings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
UltraGol uses pure HTML5, CSS3, and vanilla JavaScript (ES6+ modules), without frameworks, focusing on a responsive, mobile-first design with PWA capabilities. The main site features an orange and blue gradient theme, while the ULTRA Platform uses a dark black, green, and orange theme, both incorporating modern UI/UX with glassmorphism and custom typography (Space Grotesk, Inter, JetBrains Mono). Key components include interactive team profiles, an advanced calendar system, real-time match tracking, user authentication, social interaction features, and a picture-in-picture video player.

### Backend Architecture
The backend is built with Express.js 5.x, operating with two separate server instances for the main website and the ULTRA platform. It includes CORS, static file serving, and session management. Core APIs handle PayPal and Stripe payments, as well as cookie consent. Security is managed with Helmet.js, cookie-parser, and secure session management.

### Data Storage
The platform utilizes Firebase for dynamic, real-time data: Firestore for user data, streams, comments, and notifications; Firebase Authentication for user login (email/password, Google OAuth); and Firebase Storage for media uploads. Static data like standings, team info, and fixtures are stored in local JSON files to optimize costs.

### Authentication System
UltraGol supports multi-provider authentication (email/password, Google OAuth) with session persistence. It includes a comprehensive user profile system with favorite team selection, avatar management, activity tracking, and an achievement system. Authorization features include an admin role system and user-specific content access.

### Third-Party Service Integration
The platform integrates PayPal (server SDK) and Stripe (SDK) for payment processing, supporting donations and future subscription models. Video and media integration includes YouTube embeds, a custom video player, and iframe-based live stream embedding. It also facilitates external links to UltraGol LIVE and social media sharing.

## External Dependencies

### NPM Packages
- **Main Project**: `express`, `cors`, `helmet`, `cookie-parser`, `express-session`, `@paypal/paypal-server-sdk`, `stripe`.
- **ULTRA Platform**: `express`, `cors`.

### CDN Dependencies
- **Firebase SDK**: v9.22.0 and v10.7.1 (firebase-app-compat, firebase-auth-compat, firebase-firestore-compat, firebase-storage-compat, modular SDK).
- **Font Awesome** (v6.0.0).
- **Google Fonts**: Roboto, Space Grotesk, Inter, JetBrains Mono, Playfair Display.

### Firebase Services
- **Project**: `ligamx-daf3d`
- **Services**: Authentication (Email/password, Google OAuth), Firestore, Storage, Hosting.

### External APIs
- YouTube API
- PayPal REST API
- Stripe API
- Google OAuth API
- UltraGol API (`ultragol-api3.onrender.com`) for real-time standings, news, teams, and live transmissions across multiple leagues.

### Environment Configuration
- `PORT`
- `SESSION_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NODE_ENV`

### Deployment Platform
- Replit (Autoscale deployment type, host binding to 0.0.0.0).