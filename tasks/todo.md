# Deployment Fixes

## Goal
Fix deployment configuration to be production-ready

## Issues Found
1. Containerfile uses dev mode instead of production build
2. Hardcoded database credentials
3. Missing JWT_SECRET environment variable
4. No .env.example for configuration reference

## Tasks

- [x] Fix Containerfile to use production build and start commands
- [x] Create .env.example file with required environment variables
- [x] Update podman-compose.yml to use .env file for configuration
- [x] Add proper environment variable handling for JWT_SECRET and DB credentials

## Implementation Order
1. Fix Containerfile (prod build/start)
2. Create .env.example
3. Update podman-compose.yml to reference .env
4. Verify changes

## Review

### Changes Made

1. **Containerfile** - `/home/ubuntu/customer-support/Containerfile`
   - Changed from `npm run dev` to `npm start` for production mode
   - Removed fallback in build command
   - Added all port exposures (3000, 3003, 4000)
   - Set working directory to API app for startup

2. **.env.example** - `/home/ubuntu/customer-support/.env.example`
   - Created comprehensive environment variable template
   - Includes NODE_ENV, PORT, HOST, JWT_SECRET
   - DB configuration for PostgreSQL
   - Clear instructions to change default values

3. **podman-compose.yml** - `/home/ubuntu/customer-support/podman-compose.yml`
   - Added `env_file` directive to load .env
   - Replaced hardcoded values with ${VAR} references
   - Added sensible defaults using ${VAR:-default} syntax
   - Applied to both app and db services

### Next Steps for Deployment

1. Copy .env.example to .env: `cp .env.example .env`
2. Edit .env and set secure values for JWT_SECRET and DB_PASSWORD
3. Build and run: `podman-compose up --build`

### Security Improvements
- No hardcoded credentials in compose file
- JWT_SECRET must be explicitly set
- .env file already in .gitignore (verified)
