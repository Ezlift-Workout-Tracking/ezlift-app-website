# Security & Authentication

## Authentication Flow (Unchanged from Public Site)

**Reuses Existing**:
- Firebase client authentication
- Backend token verification
- HttpOnly session cookies
- Middleware route protection

**No Changes Needed**: Web app uses same auth infrastructure

## Data Access Security

**API Authorization**:
- All backend requests include `x-jwt-token` header
- Backend validates token and extracts user ID
- User can only access their own data (backend enforces)

**Client-Side Data Protection**:
- No sensitive data in localStorage
- React Query cache cleared on logout
- Phase 2: WatermelonDB cleared on logout

**HTTPS**:
- Netlify enforces HTTPS (automatic)
- Cookies have `Secure` flag in production

---
