# AJ Finance Frontend

A premium, high-performance personal finance dashboard built with React, Vite, and Tailwind CSS.


## 📁 Project Structure

The codebase follows a modular React architecture:

- `src/components/`: Reusable UI components (Buttons, Inputs, Modals) and domain-specific components (Security, Transactions).
- `src/context/`: Global state management using React Context API.
- `src/hooks/`: Custom React hooks for business logic and data fetching.
- `src/layouts/`: Main application layouts (Root, Sidebar, Topbar).
- `src/pages/`: Page-level components (Dashboard, Accounts, Settings).
- `src/services/`: API client configuration and backend service functions.
- `src/lib/`: Utility libraries (Haptics, Helpers).

## 🛡️ Security Architecture

The application implements a multi-layered security flow managed by `SecurityContext.jsx`:

1. **PIN Lock**: Users can set a 4-digit PIN. On launch or after a security trigger, a `PatternLockOverlay` prevents access until the correct PIN is entered (SHA-256 hashed and verified).
2. **Biometric Authentication**: Supports WebAuthn (FaceID/Fingerprint) for seamless unlocking on supported devices.
3. **15-Minute Timeout**: An inactivity tracker monitors user interactions (`mousedown`, `mousemove`, `keypress`, etc.). After 15 minutes of inactivity, the app automatically locks. A warning toast appears 60 seconds before locking.
4. **Intruder snapshots**: If enabled, the app can capture and log intruder snapshots during failed access attempts.

## 🧠 State Management: SecurityContext.jsx

`SecurityContext.jsx` acts as the global security orchestrator:

- **Global State**: Manages variables like `isAppLocked`, `isPatternLockEnabled`, and `isBiometricEnabled`.
- **Cloud Sync**: Automatically synchronizes security preferences with the backend upon authentication.
- **Inactivity Logic**: Uses `useRef` and `useCallback` to manage high-precision timers for session timeouts.
- **Methods**: Provides functions like `setPIN()`, `verifyPIN()`, `authenticateBiometrically()`, and `toggleIntruderSnapshot()` to components throughout the app.

## 🌐 Environment Variables (Vercel)

When deploying to Vercel, ensure the following environment variables are configured:

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | The production URL of your FastAPI backend (e.g., `https://api.yourdomain.com`) |

> [!NOTE]
> All environment variables in Vite must be prefixed with `VITE_` to be accessible via `import.meta.env`.

## 🛠️ Development

1. **Install Dependencies**: `npm install`
2. **Run Dev Server**: `npm run dev`
3. **Build Producton**: `npm run build`
