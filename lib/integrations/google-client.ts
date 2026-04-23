import { google } from "googleapis";
import { prisma } from "@/lib/db";

// Load Google OAuth client pre-bound to a user's saved tokens.
// Auto-refresh: when access_token expired, we exchange refresh_token for a new
// one and persist it back to the Account row.
export async function googleClientForUser(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account) throw new Error("google_account_not_connected");
  if (!account.access_token) throw new Error("google_access_token_missing");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Persist refreshed tokens automatically
  oauth2Client.on("tokens", async (tokens) => {
    if (!tokens.access_token && !tokens.refresh_token) return;
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: tokens.access_token ?? account.access_token,
        refresh_token: tokens.refresh_token ?? account.refresh_token,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : account.expires_at,
      },
    });
  });

  return oauth2Client;
}
