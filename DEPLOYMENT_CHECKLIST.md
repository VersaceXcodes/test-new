# Deployment Checklist for User Registration Fix

## Pre-Deployment Verification

### 1. Code Changes Review
- [x] CORS configuration updated for production domain
- [x] Database connection logic improved
- [x] Error handling enhanced with logging
- [x] Request timeout handling added (30s)
- [x] Health check endpoint enhanced
- [x] Environment variables configured
- [x] Global error handler added
- [x] Frontend axios instance with timeout

### 2. Build Verification
- [x] Backend TypeScript compilation successful
- [x] Frontend Vite build successful
- [x] No build errors or warnings (except public directory notice)

### 3. Configuration Files
- [x] `backend/.env` - NODE_ENV=production, CORS origins configured
- [x] `vitereact/.env` - API base URL set to production domain
- [x] `backend/package.json` - Production start script added

## Deployment Steps

### Step 1: Deploy Backend
```bash
cd /app/backend
npm run build
npm start
```

**Expected Output:**
- "Using PostgreSQL for production..."
- "Database connection successful"
- "TodoGenie server running on port 3000 and listening on 0.0.0.0"

### Step 2: Deploy Frontend
```bash
cd /app/vitereact
npm run build
```

**Expected Output:**
- Built files in `public/` directory
- Assets optimized and compressed

### Step 3: Verify Services
```bash
# Test health endpoint
curl https://123test-new.launchpulse.ai/api/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "database": "connected",
#   "environment": "production"
# }
```

### Step 4: Run API Tests
```bash
cd /app
./test_registration_api.sh
```

**Expected Results:**
- ✓ Health check passed
- ✓ Registration successful
- ✓ Auth verification passed
- ✓ Login successful

## Post-Deployment Testing

### Browser Testing Checklist
1. [ ] Open https://123test-new.launchpulse.ai
2. [ ] Open browser console (F12)
3. [ ] Navigate to registration page
4. [ ] Fill in registration form:
   - Email: `testuser@example.com`
   - Password: `TestPass123!`
   - Name: `Test User`
5. [ ] Click "Create account" button
6. [ ] Verify in console:
   - [ ] No CORS errors
   - [ ] No 502 errors
   - [ ] Request completes successfully
   - [ ] Response contains user object and token
7. [ ] Verify in UI:
   - [ ] No error messages displayed
   - [ ] User is redirected to dashboard
   - [ ] User info appears in navigation

### Error Scenario Testing
1. [ ] Test duplicate email registration
   - Should show: "User with this email already exists"
2. [ ] Test invalid email format
   - Should show validation error
3. [ ] Test empty fields
   - Should show required field errors
4. [ ] Test network timeout (disconnect network briefly)
   - Should show: "Network error. Please check your connection..."

## Database Requirements

**Important:** Ensure PostgreSQL database is configured with:
- Tables: `users`, `tasks`, `auth_tokens`, `search_filters`
- Required fields as per schema
- Database connection details in environment variables

If database needs initialization, run:
```sql
-- See backend/db.sql for full schema
```

## Monitoring Points

### Key Logs to Monitor
1. Registration attempts: `"Registration attempt: { email: ... }"`
2. Database operations: `"Creating user: { user_id: ..., email: ... }"`
3. Success: `"Registration successful for user: ..."`
4. Errors: `"Registration error: ..."`

### Key Metrics to Track
- Registration success rate
- Average response time (should be < 30s)
- CORS error rate (should be 0)
- 502 error rate (should be 0)
- Database connection status

## Rollback Plan

If issues occur:
1. Check server logs for errors
2. Verify database connectivity
3. Check CORS configuration
4. Review environment variables
5. If needed, revert to previous version:
   ```bash
   git checkout <previous-commit>
   cd backend && npm run build && npm start
   cd vitereact && npm run build
   ```

## Success Criteria

Deployment is successful when:
- [x] Health check returns 200 with database: "connected"
- [ ] User can successfully register new account
- [ ] Registration redirects to dashboard
- [ ] No CORS errors in browser console
- [ ] No 502 errors
- [ ] All API endpoints return valid JSON
- [ ] Error messages are user-friendly
- [ ] Console logs show proper flow

## Support Information

**Test URLs:**
- Frontend: https://123test-new.launchpulse.ai
- Backend: https://123test-new.launchpulse.ai
- Health: https://123test-new.launchpulse.ai/api/health

**Key Files Modified:**
- `backend/server.ts` - CORS, database, error handling, logging
- `backend/.env` - Environment configuration
- `vitereact/src/store/main.tsx` - API calls, timeout, error handling
- `backend/package.json` - Production scripts

**Documentation:**
- See `REGISTRATION_FIX_SUMMARY.md` for detailed fixes
- See `test_registration_api.sh` for automated testing
