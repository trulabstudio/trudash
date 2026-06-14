# Users Feature

Handles application profiles, roles, account status, and client profile linking.

Profiles are created by email. `profiles.user_id` is linked automatically to the matching Supabase Auth user on first login.

Business logic lives in `actions/user.action.ts`.
Validation schemas live in `schemas/user.schema.ts`.
Reusable user forms live in `components`.
