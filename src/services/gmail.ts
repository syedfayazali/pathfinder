/**
 * Gmail Quick Access — requires Google OAuth in Google Cloud Console.
 * Add VITE_GOOGLE_CLIENT_ID and enable Gmail API.
 * Redirect URI: http://localhost:5173/settings (or your production URL)
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

export function isGmailConfigured() {
  return Boolean(CLIENT_ID);
}

export function startGmailOAuth() {
  if (!CLIENT_ID) {
    throw new Error("Set VITE_GOOGLE_CLIENT_ID in .env");
  }
  const redirect = `${window.location.origin}/settings`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirect,
    response_type: "token",
    scope: SCOPES,
    include_granted_scopes: "true",
    state: "gmail",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function parseGmailTokenFromHash(): string | null {
  if (!window.location.hash.includes("access_token")) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("access_token");
}

export async function fetchRecentEmails(accessToken: string, max = 10) {
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=" + max,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error("Gmail API error");
  const json = await res.json();
  const messages = json.messages ?? [];
  const details = await Promise.all(
    messages.map(async (m: { id: string }) => {
      const r = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const msg = await r.json();
      const headers = msg.payload?.headers ?? [];
      const subject = headers.find((h: { name: string }) => h.name === "Subject")?.value ?? "";
      const from = headers.find((h: { name: string }) => h.name === "From")?.value ?? "";
      return { id: m.id, subject, from, snippet: msg.snippet };
    }),
  );
  return details;
}
