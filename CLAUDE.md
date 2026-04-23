@AGENTS.md

# IBI AI Management — פרויקט context

## מה זה
פלטפורמת ניהול סוכני AI לנתי מנשורי (יועץ אסטרטגי ל-IBI Capital, מגזר חרדי).
הסוכן הראשון: "יועץ אסטרטגי" לפי האפיון המלא ב-[docs/SPEC.md](docs/SPEC.md).

## Tech
- Next.js 16 (App Router, RSC)
- TypeScript strict
- Tailwind CSS v4 (CSS variables, לא tailwind.config.js)
- shadcn/ui style, custom components ב-[components/ui/](components/ui/)
- NextAuth v5 beta (Auth.js) עם Google Provider
- Prisma 7 + PostgreSQL + pgvector
- Vercel AI SDK v6 עם `@ai-sdk/anthropic`
- Deploy ל-Vercel, קוד ב-GitHub

## עקרונות עיצוב
- RTL native (`dir="rtl"` ב-html, sidebar בימין)
- עברית-first (Heebo font)
- פלטת stone + teal accent, לא נוצצת (מגזר חרדי)
- Mobile-first (נתי בתנועה)

## הסוכן האסטרטגי
- **System prompt:** [lib/ai/prompts/strategic-advisor.ts](lib/ai/prompts/strategic-advisor.ts) — source of truth אחרי `docs/SPEC.md`.
- **מבנה פלט קבוע:** תמצית → דגשים לפי אנשי מפתח → 3 משימות → טיוטת WhatsApp.
- **Verification Loop:** לפני שמירת פרט חדש, הסוכן קורא ל-`verify_with_user`.
- **Tools:** `search_memory`, `search_docs`, `read_gmail`, `verify_with_user`, `draft_whatsapp` — ב-[lib/ai/tools/](lib/ai/tools/).

## קבצים קריטיים
- [prisma/schema.prisma](prisma/schema.prisma) — data model.
- [lib/auth.ts](lib/auth.ts) — NextAuth עם Google scopes (Gmail+Drive+Calendar).
- [app/api/chat/route.ts](app/api/chat/route.ts) — core של אינטראקציית הסוכן.
- [app/layout.tsx](app/layout.tsx) — RTL root + Heebo + ThemeProvider.
- [proxy.ts](proxy.ts) — auth guard על כל `/dashboard/*` (Next.js 16 rename מ-middleware).

## אין ל-commit
- `.env.local`, `.env`, כל קובץ עם secrets.
- `node_modules/`, `.next/`.

## פקודות
- `pnpm dev` — dev server (http://localhost:3000).
- `pnpm typecheck` — TypeScript.
- `pnpm lint` — ESLint.
- `pnpm build` — production build.
- `pnpm prisma migrate dev` — migration חדש.
- `pnpm prisma studio` — GUI ל-DB.
- `pnpm tsx prisma/seed.ts` — seed את נתי + אנשי מפתח (דורש `SEED_USER_EMAIL`).

## סדר הקמה ראשונה
1. `cp .env.example .env.local` + מילוי ערכים (לפחות `DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `ANTHROPIC_API_KEY`).
2. `pnpm prisma migrate dev --name init` — ייצור schema ב-DB.
3. `pnpm tsx prisma/seed.ts` — יצירת user + agent.
4. `pnpm dev` → http://localhost:3000/login.

## חשיבויות בעת פיתוח
- **לעולם לא לשנות את `docs/SPEC.md` ואת `strategic-advisor.ts` ללא אישור מפורש של נתי.**
- Tool של `verify_with_user` — לא לשמור memory לפני אישור משתמש ב-UI.
- אין שמירת טוקנים/secrets ב-log.
