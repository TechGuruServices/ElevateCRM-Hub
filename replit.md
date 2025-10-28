# ElevateCRM Management System by TECHGURU

## Overview

ElevateCRM is a modern CRM and inventory management platform designed for small-to-medium businesses. The application combines customer relationship management with real-time inventory tracking, providing a unified solution that balances simplicity with enterprise-grade functionality. Built as a multi-tenant SaaS platform, it supports white-label deployments and extensible integrations with third-party services.

The system follows an API-first architecture with a FastAPI backend and Next.js frontend, emphasizing modularity, scalability, and developer experience.

## Recent Changes (October 28, 2025)

**Vercel to Replit Migration Completed**:
- Successfully migrated full-stack application to Replit environment
- Fixed PostgreSQL database connection (removed asyncpg-incompatible `sslmode` parameter)
- Updated configuration to properly handle Replit-provided DATABASE_URL
- Removed wildcard (*) from CORS settings for improved security
- AI analytics module temporarily disabled (ML dependencies not installed)
- Real-time features (Redis) disabled (service not available in current Replit setup)
- Both frontend (port 5000) and backend (port 8000) running successfully
- All database tables created in Replit PostgreSQL database

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design tokens (TechGuru blue/purple branding)
- **Component Library**: Radix UI primitives with shadcn/ui patterns
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Features**: Custom WebSocket hooks (`useRealtime.ts`) for live updates
- **Special Features**: 
  - Barcode/QR scanner integration (`html5-qrcode`)
  - Demo mode toggle with localStorage persistence
  - Splash screen animation on initial load
  - Responsive dashboard layouts with mobile support

**Design Decisions**:
- Server-side rendering disabled (`output: 'export'`) for static deployment compatibility
- Component-driven architecture with reusable UI primitives
- Dark mode support via CSS variables and theme system
- Accessibility-focused with skip-to-content links and ARIA labels

### Backend Architecture

**Framework**: FastAPI with async/await patterns
- **Server**: Uvicorn ASGI server
- **ORM**: SQLAlchemy 2.x with async support
- **Migrations**: Alembic for database versioning
- **Validation**: Pydantic v2 for request/response schemas
- **Authentication**: JWT-based with refresh token support
- **Background Jobs**: Designed for Celery/Dramatiq workers (integration points present)

**Key Architectural Patterns**:
1. **Multi-tenancy with RLS**: PostgreSQL Row-Level Security for tenant isolation
   - `TenantContextManager` sets session-local `elevatecrm.tenant_id`
   - All queries automatically filtered by tenant
   - Middleware (`TenantMiddleware`) extracts tenant from JWT or subdomain
   
2. **Modular Domain Design**:
   - Separate modules for CRM, Inventory, Orders, Integrations
   - Service layer (`TenantAwareService`) abstracts database operations
   - API versioning (`/api/v1/`) for backward compatibility

3. **Real-time System**:
   - Redis pub/sub for WebSocket message broadcasting
   - Event-driven updates for inventory and order changes
   - `realtime_service.py` handles connection pooling and channel management

4. **Database Strategy**:
   - Primary: PostgreSQL with asyncpg driver
   - Development: SQLite fallback (limited RLS support)
   - Schema includes audit fields (`created_at`, `updated_at`, `company_id`)
   - JSONB columns for flexible metadata storage

### Data Storage

**Primary Database**: PostgreSQL 13+
- **Connection Pooling**: AsyncPG with SQLAlchemy async engine
- **Tenant Isolation**: Row-Level Security policies on all tenant-scoped tables
- **Key Tables**:
  - `companies`: Tenant root entities
  - `users`: Per-tenant users with role-based access
  - `contacts`, `products`, `orders`: Core CRM/inventory entities
  - `integrations`: OAuth tokens and connector configurations
  - `stock_locations`, `stock_moves`: Inventory tracking with barcode support

**Caching Layer**: Redis
- Session storage for WebSocket connections
- Pub/sub channels for real-time events
- Rate limiting and API response caching (planned)

**File Storage**: 
- Local filesystem for development
- S3/Cloudflare R2 integration points for production (not yet implemented)

### Authentication & Authorization

**Authentication Flow**:
1. User registers with email/password + company info
2. Backend issues JWT access token (short-lived) and refresh token
3. Tokens include `user_id`, `company_id` (tenant), and `roles`
4. Middleware validates JWT and sets tenant context per request

**Security Measures**:
- Password hashing with bcrypt via Passlib
- JWT signing with HS256 (configurable to RS256 for key rotation)
- CORS middleware with configurable origins
- Security headers middleware (planned in `SecurityMiddleware`)
- MFA support planned via TOTP/WebAuthn

**Authorization**:
- Role-based access control embedded in JWT claims
- Tenant-level isolation enforced at database layer
- API endpoints check roles via dependency injection

## External Dependencies

### Third-Party Integrations

**E-commerce Platforms**:
- **Shopify**: OAuth 2.0 flow, webhook handlers for products/orders
- **WooCommerce**: REST API with key-based auth
- **Amazon**: Placeholder adapter (MWS/SP-API integration planned)

**Accounting Systems**:
- **QuickBooks**: OAuth 2.0 stubs for invoice sync
- **Xero**: Similar OAuth flow with token refresh logic

**Communication**:
- **Gmail/Google Workspace**: OAuth 2.0 for email and calendar sync
- **Microsoft 365**: Equivalent integration for Outlook/Calendar

**Payment Gateways**:
- **Stripe**: Full SDK integration with webhook verification
- **PayPal**: REST SDK with sandbox mode toggle

**AI/ML Services** (Disabled by Default):
- Sentence transformers for semantic search
- Custom forecasting models for demand prediction
- Lead scoring and churn prediction algorithms
- **Note**: ML dependencies (~2-3GB) excluded from base install

### Infrastructure Services

**Development Tools**:
- PyInstaller for Windows .exe packaging
- Docker Compose for local multi-service orchestration
- Alembic for database migrations
- Pytest for backend testing

**Monitoring & Observability** (Planned):
- Sentry for error tracking (frontend and backend)
- OpenTelemetry for distributed tracing
- Structured logging with JSON formatting

**Deployment Targets**:
- Replit (current environment)
- Vercel (frontend static export)
- Docker containers (backend FastAPI)
- Standalone Windows executable (PyInstaller builds)

### Key Configuration

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string (async/sync variants)
- `REDIS_URL`: Redis connection for real-time features
- `JWT_SECRET_KEY`: Signing key for authentication tokens
- `CORS_ORIGINS`: Allowed frontend domains
- `DEBUG`: Development mode flag

**Feature Flags**:
- Demo mode (frontend localStorage)
- AI analytics module (disabled, requires ML dependencies)
- Real-time WebSocket features (requires Redis)