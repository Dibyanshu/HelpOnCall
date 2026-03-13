# 2-Factor Authentication (TOTP) Plan

## Goal
Require a valid TOTP code for admin sign-in, while keeping a safe migration path for existing admin users.

## Phase 1: Design and Security Decisions
1. Define rollout mode:
   - Optional first (admins can enable), then enforce for roles admin/super_admin.
2. Decide whether to include backup codes in v1 (recommended).
3. Add environment secret for encryption key used to protect TOTP secrets at rest.
4. Define brute-force controls:
   - Maximum OTP attempts per time window.
   - Temporary lockout after repeated failures.

## Phase 2: Data Model Changes (API)
1. Extend users table in `src/db/schema.ts`:
   - `twoFactorEnabled` (boolean, default false)
   - `totpSecretEnc` (encrypted text, nullable)
   - `twoFactorEnabledAt` (timestamp, nullable)
   - `twoFactorBackupCodesHash` (optional, nullable, if backup codes enabled)
2. Add migration and bootstrap compatibility checks.

## Phase 3: Backend Crypto + TOTP Utilities
1. Add utility for encrypt/decrypt of TOTP secret (AES-256-GCM) in `src/utils`.
2. Add TOTP helper using a library (for example `otplib`) with:
   - Secret generation (Base32)
   - `otpauth` URI generation for Google Authenticator
   - Code verification with small clock-skew window (for example, +/- 1 step)
3. Add QR generation support (for example `qrcode`) returning data URL or SVG.

## Phase 4: 2FA Enrollment APIs
1. Add protected endpoints in `src/routes/auth.ts`:
   - `POST /auth/admin/2fa/setup`
     - Verifies current password
     - Generates secret
     - Returns QR + manual key (not yet enabled)
   - `POST /auth/admin/2fa/enable`
     - Verifies first TOTP code
     - Stores encrypted secret
     - Sets `twoFactorEnabled` true
   - `POST /auth/admin/2fa/disable`
     - Verifies password + TOTP (or backup code)
     - Clears secret and disables 2FA
2. Ensure only `admin`/`super_admin` can enroll/disable.

## Phase 5: Admin Login Flow Update
1. Modify `/auth/admin/login` behavior in `src/routes/auth.ts`:
   - If credentials valid and 2FA disabled: return JWT as today.
   - If credentials valid and 2FA enabled: return `mfaRequired` and short-lived pre-auth token/challenge.
2. Add `POST /auth/admin/login/2fa/verify`:
   - Accepts challenge + TOTP code
   - Verifies challenge validity and OTP
   - Returns final JWT on success
3. Keep error responses generic to avoid account enumeration.

## Phase 6: Frontend Admin UX
1. Update `Apps/web/src/pages/admin/AdminLoginPage.jsx`:
   - Step 1: email/password
   - Step 2: TOTP input when `mfaRequired=true`
2. Add admin profile/security UI for setup/enable/disable 2FA (can start on dashboard page).
3. Keep public routes unchanged; this only affects admin auth flow.

## Phase 7: Hardening and Validation
1. Add server-side rate limiting for login + OTP verify endpoints.
2. Add audit logs for 2FA enabled/disabled and failed OTP attempts.
3. Add tests:
   - Unit tests for TOTP and encryption utilities
   - Integration tests for:
     - login without 2FA
     - login with 2FA
     - invalid OTP
     - expired challenge
4. Update docs in `ROUTES.md` and admin usage notes.

## Phase 8: Rollout
1. Deploy with optional mode first.
2. Ask admins to enroll.
3. Flip enforcement flag for `admin`/`super_admin` after adoption window.

## Google Authenticator Compatibility
- This approach uses standard TOTP (`otpauth://`) that Google Authenticator supports.
- It does not require Google APIs or Google servers.
- It is also compatible with other TOTP apps (Authy, Microsoft Authenticator, 1Password, etc.).

## Suggested v1 Scope for Implementation
1. Mandatory TOTP for `admin` and `super_admin`.
2. No backup codes in v1.
3. Full setup + verify + login challenge flow.
