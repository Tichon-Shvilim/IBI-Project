# IBI AI Management

ממשק ניהול סוכני AI אישיים עבור נתי מנשורי (יועץ אסטרטגי ל-IBI Capital, מגזר חרדי).

## מה זה
פלטפורמה שמארחת מספר סוכני AI עם חיבור ל-Gmail, Google Drive, ובהמשך WhatsApp Business API.
הסוכן הראשון: "יועץ אסטרטגי" לפי [docs/SPEC.md](docs/SPEC.md).

## Tech
Next.js 16 · TypeScript · Tailwind v4 · Prisma + PostgreSQL + pgvector · NextAuth v5 · Anthropic Claude · Vercel AI SDK v6 · Vercel deploy.

## הפעלה מקומית
```bash
# 1. התקנה
pnpm install

# 2. העתק env + מלא ערכים
cp .env.example .env.local

# 3. צור schema ב-DB
pnpm prisma migrate dev --name init

# 4. seed (יוצר user + agent + אנשי מפתח)
pnpm tsx prisma/seed.ts

# 5. הפעל
pnpm dev
```

פתח http://localhost:3000/login.

## Scripts
- `pnpm dev` — dev server
- `pnpm typecheck` — TS check
- `pnpm lint` — ESLint
- `pnpm build` — production build
- `pnpm prisma studio` — GUI ל-DB

## מבנה
- [app/](app/) — routes (App Router)
- [components/](components/) — UI components
- [lib/](lib/) — auth, db, AI tools, utils
- [prisma/](prisma/) — schema + migrations + seed
- [docs/](docs/) — SPEC + SECURITY

ראה [CLAUDE.md](CLAUDE.md) להנחיות פיתוח.

## Deploy
1. Push ל-GitHub.
2. Import ב-Vercel, חבר Vercel Postgres.
3. הוסף env vars: `AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `ANTHROPIC_API_KEY`.
4. Deploy.
