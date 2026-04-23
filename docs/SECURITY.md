# Security & Compliance

## עקרונות יסוד
- **הפרדה מוחלטת מאימון מודלים ציבוריים** — Anthropic API עם flag `anthropic-beta: no-training`, או חשבון Enterprise אם זמין.
- **Isolation לפי userId** — כל query ב-Prisma חייב לכלול `userId` של ה-session.
- **אימות בכל route** — middleware + בדיקת `auth()` לפני כל mutation.
- **Secrets ב-Vercel Env** — לעולם לא ב-git. `.env.example` בלבד מחזיק placeholders.

## הצפנה
- **At-rest**: Vercel Postgres מצפין ברמת השרת. Vercel Blob מצפין קבצים.
- **In-transit**: HTTPS בלבד (Vercel default).
- **Tokens של Google**: `access_token` ו-`refresh_token` נשמרים ב-`Account`. בעתיד לשקול הצפנה באפליקציה (AES-GCM עם key ב-env).

## Logging & PII
- אין logging של message bodies או tokens.
- Sentry (כשנוסיף) עם `beforeSend` שמסיר PII.
- `console.log` על tokens או content של מיילים — אסור.

## Rate limiting (Phase 2)
- Upstash Ratelimit על `/api/chat` (1 req/sec, burst 10).
- Usage tracking ב-DB + alert אם עלות יומית > threshold.

## Headers (Phase 2)
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

## WhatsApp
- `WHATSAPP_ACCESS_TOKEN` נדרש scope מינימלי.
- webhook verification עם `WHATSAPP_VERIFY_TOKEN`.

## Incident response
- דליפת secrets: rotate ב-Vercel, invalidate כל sessions (`prisma.session.deleteMany()`).
- חשד לגישה לא מורשית: בדוק `Account.updatedAt`, כפה re-auth.
