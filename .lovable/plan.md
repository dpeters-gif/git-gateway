

# Fix: Login Not Redirecting After Successful Auth

## Root Cause

The auth backend works fine (logs show 200 status for both adult and child logins). The problem is **the LoginPage has no redirect logic**. After successful authentication:

1. `onAuthStateChange` fires and updates `useAuth` state with the user/session
2. But `LoginPage` is rendered on the `/login` route which is **outside** `ProtectedRoute`
3. Nothing in `LoginPage` checks if the user is now authenticated to redirect them to `/`
4. The user stays stuck on `/login` with no error

## Fix

**File: `src/components/auth/LoginPage.tsx`**
- Add `useAuth()` to get `user` state
- Add `useNavigate()` from react-router-dom
- Add a `useEffect` that navigates to `/` when `user` becomes non-null
- This handles both adult login (immediate) and child login (after `setSession` triggers `onAuthStateChange`)

```typescript
const { signIn, signInChild, user } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (user) {
    navigate("/", { replace: true });
  }
}, [user, navigate]);
```

This is a 5-line addition to one file. No other changes needed.

