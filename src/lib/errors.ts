// H2·M4 — one warm, consistent message for failed mutations. Never surfaces
// raw driver/HTTP text to the user; network-ish failures get the offline
// framing so people on bad connections know their tap didn't stick.
export function friendlyMutationError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (/network|fetch failed|failed to fetch|timeout|timed out|connection|offline/i.test(message)) {
    return "You're offline or the connection dropped — that change didn't save. Try again in a moment.";
  }
  return "Something didn't save. Please try again.";
}
