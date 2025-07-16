# 🚀 NextJS Chat App

A modern, production-ready real-time chat application built with Next.js 14, Supabase, and TypeScript. Features include real-time messaging, voice/video calls, embedded games, PWA support, and comprehensive testing.

![Chat App Preview](https://via.placeholder.com/800x400/25D366/FFFFFF?text=NextJS+Chat+App)

## ✨ Features

### 🎨 UI/UX
- **Modern Design**: Clean, WhatsApp-inspired interface with beautiful animations
- **Sidebar**: Chat list with avatars, unread count badges, and search functionality
- **Chat Window**: Messages with timestamps, delivery status ticks, and typing indicators
- **Attachments**: Image/document preview and upload support
- **Emoji Picker**: Rich emoji selection for message reactions
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Online/Offline Status**: Real-time user presence indicators
- **Responsive Design**: Mobile-first approach with touch-friendly interactions

### 🔧 Core Functionality
- **Real-time Messaging**: Instant message delivery with Supabase real-time subscriptions
- **Voice & Video Calls**: WebRTC-powered calling with in-call controls
- **Group & Direct Chats**: Support for both 1-on-1 and group conversations
- **Message Status**: Sent, delivered, and read indicators
- **Typing Indicators**: See when others are typing in real-time
- **File Attachments**: Upload and share images, documents, and media
- **Message Encryption**: Client-side encryption for enhanced security

### 🎮 Interactive Features
- **Embedded Games**: Tic-tac-toe and Rock-Paper-Scissors games within chat
- **Game Invitations**: Send game invites directly in conversations
- **Real-time Gameplay**: Synchronized game state across players

### 📱 PWA Features
- **Progressive Web App**: Full PWA with offline capabilities
- **Push Notifications**: Real-time notifications even when app is closed
- **Install Prompt**: Smart PWA installation prompts
- **Offline Support**: Basic functionality when disconnected
- **App-like Experience**: Native app feel on mobile devices

### 🔐 Security & Authentication
- **Secure Authentication**: Supabase Auth with email/password
- **Row Level Security**: Database-level security policies
- **Message Encryption**: Optional end-to-end encryption
- **HTTPS Enforcement**: Secure communication protocols
- **Input Validation**: Comprehensive client and server-side validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **Styling**: Tailwind CSS, Custom CSS Variables
- **State Management**: Zustand with persistence
- **Real-time**: Supabase Real-time subscriptions
- **Video Calls**: WebRTC with simple-peer
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel/Netlify ready
- **PWA**: next-pwa with service worker

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nextjs-chat-app.git
cd nextjs-chat-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Run the database migration:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Update the values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="NextJS Chat App"

# WebRTC Configuration
NEXT_PUBLIC_PEER_CONFIG_ICE_SERVERS='[{"urls":"stun:stun.l.google.com:19302"}]'

# Security
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Account

1. Click "Don't have an account? Sign up"
2. Fill in your details and create an account
3. Start chatting!

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npx playwright test --ui
```

### Testing Features

- **Crypto Functions**: Unit tests for message encryption/decryption
- **Utility Functions**: Tests for date formatting, validation, etc.
- **Authentication Flow**: E2E tests for login/signup
- **Chat Functionality**: Integration tests for messaging
- **Real-time Features**: Mock Supabase real-time subscriptions

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables** in Vercel dashboard:
   - Add all variables from `.env.example`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
   - Update `NEXTAUTH_URL` to your Vercel domain

3. **Set up Custom Domain** (optional):
   - Go to Vercel dashboard > Settings > Domains
   - Add your custom domain
   - Update environment variables accordingly

### Deploy to Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Environment Variables**: Add same variables as Vercel
4. **Functions**: Enable Netlify Functions for API routes

### Deploy Supabase

Your Supabase project is already hosted. For production:

1. **Upgrade Plan**: Consider upgrading from free tier for production
2. **Custom Domain**: Set up custom domain in Supabase dashboard
3. **Backup Strategy**: Set up automated backups
4. **Monitoring**: Enable logging and monitoring

## 📁 Project Structure

```
nextjs-chat-app/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── chat/            # Chat-related components
│   │   ├── call/            # Video call components
│   │   ├── game/            # Game components
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   │   └── useRealtime.ts   # Real-time subscriptions
│   ├── lib/                 # Utility libraries
│   │   └── supabase.ts      # Supabase client
│   ├── store/               # Zustand stores
│   │   └── index.ts         # Global state management
│   ├── types/               # TypeScript definitions
│   │   ├── index.ts         # Main type definitions
│   │   └── database.ts      # Supabase types
│   └── utils/               # Utility functions
│       └── index.ts         # Helper functions
├── supabase/
│   └── migrations/          # Database migrations
├── tests/
│   ├── unit/               # Unit tests
│   ├── e2e/                # E2E tests
│   └── __mocks__/          # Test mocks
├── public/                 # Static assets
│   ├── icons/              # PWA icons
│   └── manifest.json       # PWA manifest
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── jest.config.js          # Jest configuration
├── playwright.config.ts    # Playwright configuration
└── README.md              # This file
```

## 🔧 Configuration

### Supabase Setup

The application requires several Supabase features:

1. **Authentication**: Email/password auth enabled
2. **Database**: PostgreSQL with RLS policies
3. **Real-time**: For live messaging and presence
4. **Storage**: For file attachments and avatars

### PWA Configuration

PWA features are configured in:
- `next.config.js`: PWA settings with next-pwa
- `public/manifest.json`: App manifest
- `public/icons/`: App icons (generate with PWA tools)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL for PWA | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXT_PUBLIC_TURN_SERVER_URL` | TURN server for calls | No |

## 🎮 Games

### Adding New Games

1. Create game component in `src/components/game/`
2. Add game type to `src/types/index.ts`
3. Update `GameModal.tsx` to include new game
4. Add game logic and real-time synchronization

### Supported Games

- **Tic Tac Toe**: Classic 3x3 grid game
- **Rock Paper Scissors**: Simple choice-based game
- **Quiz Games**: Extensible quiz framework (planned)

## 🔐 Security

### Message Encryption

The app includes optional end-to-end encryption:

```typescript
import { encryptMessage, decryptMessage, generateKeyPair } from '@/utils';

// Generate key pair
const keyPair = await generateKeyPair();

// Encrypt message
const encrypted = await encryptMessage('Hello!', keyPair.publicKey);

// Decrypt message
const decrypted = await decryptMessage(encrypted, keyPair.privateKey);
```

### Database Security

- **Row Level Security**: All tables use RLS policies
- **User Authentication**: Required for all operations
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries

## 🚨 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**:
   - Check environment variables
   - Verify Supabase project is active
   - Check RLS policies

2. **Real-time Not Working**:
   - Ensure Supabase real-time is enabled
   - Check network connectivity
   - Verify subscription setup

3. **Video Calls Failing**:
   - Check microphone/camera permissions
   - Verify STUN/TURN server configuration
   - Test WebRTC compatibility

4. **PWA Installation Issues**:
   - Ensure HTTPS is enabled
   - Check manifest.json validity
   - Verify service worker registration

### Debug Mode

Enable debug mode by setting:

```env
NODE_ENV=development
```

This enables:
- Console logging
- Error boundaries
- Development tools

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the excellent backend platform
- [Next.js](https://nextjs.org) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [WebRTC](https://webrtc.org) for real-time communication protocols

## 📞 Support

- Create an issue for bug reports
- Join our Discord for community support
- Check the docs for common solutions
- Email support@yourapp.com for enterprise support

---

Built with ❤️ using Next.js and Supabase