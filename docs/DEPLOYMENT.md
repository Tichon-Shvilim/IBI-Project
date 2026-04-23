# Deployment — מצב נוכחי ומה נותר

## ✅ מה פעיל

| רכיב | סטטוס | הערות |
|------|--------|-------|
| GitHub repo | ✅ | `Tichon-Shvilim/IBI-Project` |
| Vercel project | ✅ | `natimanshori-2971s-projects/ibi-ai-management` |
| Production deploy | ✅ | https://ibi-ai-management-*.vercel.app (מוגן ע"י Deployment Protection של Vercel) |
| Neon Postgres | ✅ | משאב `neon-yellow-marble`, pgvector enabled, migrations רצו |
| DB seeding | ✅ | נתי + agent `strategic-advisor` + 9 אנשי מפתח |
| CI workflow | ✅ | `.github/workflows/ci.yml` — typecheck + lint + build ב-PR |
| Vercel Cron | ✅ | מוגדר ב-`vercel.json` (daily 05:00, weekly Sun 05:00) |

## ⚠️ נותר ידנית

### 1. Anthropic API Key (קריטי)
ה-`ANTHROPIC_API_KEY` ב-Vercel הוא placeholder. הסוכן לא יעבוד בלי.

```bash
# 1. קבל מפתח ב-https://console.anthropic.com/settings/keys
# 2. הפעל:
printf 'sk-ant-api03-YOUR-REAL-KEY' | vercel env add ANTHROPIC_API_KEY production --scope natimanshori-2971s-projects --force
# 3. הפעל redeploy:
vercel deploy --prod --yes --scope natimanshori-2971s-projects
```

### 2. Google OAuth Credentials (קריטי ל-login)
```bash
# 1. ב-https://console.cloud.google.com/apis/credentials:
#    - צור OAuth 2.0 Client ID (Web application)
#    - Authorized redirect URIs:
#      https://ibi-ai-management-natimanshori-2971s-projects.vercel.app/api/auth/callback/google
#      http://localhost:3000/api/auth/callback/google
# 2. ודא שה-APIs הבאים enabled (OAuth consent screen → Scopes):
#    - Gmail API (gmail.readonly, gmail.send)
#    - Google Drive API (drive.readonly)
#    - Google Calendar API (calendar.readonly)
# 3. העבר את הערכים ל-Vercel:
printf 'YOUR_CLIENT_ID' | vercel env add GOOGLE_CLIENT_ID production --scope natimanshori-2971s-projects --force
printf 'YOUR_CLIENT_SECRET' | vercel env add GOOGLE_CLIENT_SECRET production --scope natimanshori-2971s-projects --force
```

### 3. Deployment Protection (אופציונלי)
Vercel ברירת-מחדל מגן על production מאחורי Vercel SSO.
- אם נתי הוא המשתמש היחיד וגם הוא מחובר ל-Vercel בדפדפן — הכל עובד.
- כדי להסיר: Project Settings → Deployment Protection → Disabled.

### 4. WhatsApp Business (Phase 1C)
- פתח Meta Business account.
- צור WhatsApp Business App.
- שליחה לאישור (1-3 שבועות).
- אחרי אישור: הוסף ל-Vercel:
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_ACCESS_TOKEN`
  - `WHATSAPP_VERIFY_TOKEN`
  - `WHATSAPP_TO_NUMBER`

## מצב env vars כעת (Production)

| Var | סטטוס | מקור |
|-----|--------|------|
| `DATABASE_URL` | ✅ אמיתי | Neon integration |
| `DATABASE_URL_UNPOOLED` | ✅ אמיתי | Neon integration |
| `POSTGRES_*` | ✅ אמיתי | Neon integration |
| `AUTH_SECRET` | ✅ אמיתי | נוצר אוטומטית (`openssl rand`) |
| `AUTH_TRUST_HOST` | ✅ `true` | |
| `CRON_SECRET` | ✅ אמיתי | נוצר אוטומטית |
| `ANTHROPIC_API_KEY` | ❌ placeholder | ← פעולה נדרשת |
| `GOOGLE_CLIENT_ID` | ❌ placeholder | ← פעולה נדרשת |
| `GOOGLE_CLIENT_SECRET` | ❌ placeholder | ← פעולה נדרשת |

## הפעלה מקומית

```bash
# .env.local כבר נוצר אוטומטית ע"י Neon integration.
# יש בו DATABASE_URL אמיתי. צריך להוסיף ידנית:
echo 'AUTH_SECRET="$(openssl rand -base64 32)"' >> .env.local
echo 'ANTHROPIC_API_KEY="sk-ant-..."' >> .env.local
echo 'GOOGLE_CLIENT_ID="..."' >> .env.local
echo 'GOOGLE_CLIENT_SECRET="..."' >> .env.local

pnpm dev
# http://localhost:3000
```

## Migration workflow

```bash
# שינוי schema → migration חדש
pnpm dlx dotenv-cli -e .env.local -- pnpm prisma migrate dev --name feature_x

# בפרודקשן — Vercel build לא מריץ migrations. להריץ ידנית:
pnpm dlx dotenv-cli -e .env.local -- pnpm prisma migrate deploy
# (הערה: לייצור צוותי — להוסיף step ב-CI או build hook.)
```
