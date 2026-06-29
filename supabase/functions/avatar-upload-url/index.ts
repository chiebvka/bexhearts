// Edge Function: avatar-upload-url (C3b)
// Returns a short-lived presigned PUT URL for uploading the caller's avatar to
// Cloudflare R2, plus the eventual public URL. R2 credentials live ONLY here as
// function secrets — never in the app. The app PUTs the image bytes to the
// presigned URL, then saves the public URL on its profile.
//
// Required secrets (set with `supabase secrets set ...`, or in the dashboard):
//   R2_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_BASE_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
// SUPABASE_URL / SUPABASE_ANON_KEY are injected automatically.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20';

const PRESIGN_EXPIRY_SECONDS = 600; // 10 minutes — used right away

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Identify the caller from their JWT (forwarded by supabase.functions.invoke).
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const body = await req.json().catch(() => ({}));
  const contentType =
    typeof body.contentType === 'string' ? body.contentType : 'image/jpeg';
  const ext = contentType === 'image/png' ? 'png' : 'jpg';

  const accountId = Deno.env.get('R2_ACCOUNT_ID')!;
  const bucket = Deno.env.get('R2_BUCKET')!;
  const publicBase = (Deno.env.get('R2_PUBLIC_BASE_URL') ?? '').replace(
    /\/$/,
    ''
  );

  // One key per upload, scoped to the user's id.
  const key = `avatars/${user.id}/${crypto.randomUUID()}.${ext}`;

  const r2 = new AwsClient({
    accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
    service: 's3',
    region: 'auto',
  });

  const endpoint =
    `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}` +
    `?X-Amz-Expires=${PRESIGN_EXPIRY_SECONDS}`;

  // signQuery puts the signature in the URL → the app can PUT with no auth headers.
  const signed = await r2.sign(new Request(endpoint, { method: 'PUT' }), {
    aws: { signQuery: true },
  });

  return json({ uploadUrl: signed.url, publicUrl: `${publicBase}/${key}` });
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
