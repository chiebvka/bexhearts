# App Store submission — the owner's checklist

> **Status:** prepared 2026-07-27. Everything here is drafted and ready to paste;
> the items marked **⚠️ OWNER** need your hands (App Store Connect, a device, or
> a decision). Nothing in this file is legal advice — the privacy answers below
> must stay consistent with `docs/PRIVACY_POLICY.md`, which is still a draft
> pending attorney review.

**Facts this file assumes** (change them here if they change):
bundle id `com.bexhearts.app` · version `1.0.0` · pricing $6.99/wk · $12.99/mo ·
$79.99/yr, all with a 3-day free trial, billed per couple ·
Privacy `https://bexhearts.com/privacy` · Terms `https://bexhearts.com/terms` ·
Support `support@bexhearts.com`.

---

## 1. ⚠️ THE DEMO ACCOUNT — do this first, or the build gets rejected

F2 locked **everything** behind the paywall. An App Review tester who can't get
past a paywall files a **Guideline 2.1 — App Completeness** rejection, and it
costs a full review cycle. This is the single highest-risk item in the whole
submission.

**Set it up (about 5 minutes):**

1. Create two real accounts in production — one for each side of a couple. Use
   addresses you control, e.g. `demo@bexhearts.com` and `demo2@bexhearts.com`.
2. **Grant them comp access** (migration `00036_comp_access.sql`, in Studio):
   ```sql
   INSERT INTO public.comp_access (email, label, notes)
   VALUES
     ('demo@bexhearts.com',  'app_review_demo', 'Apple/Google review'),
     ('demo2@bexhearts.com', 'app_review_demo', 'Apple/Google review partner');
   ```
3. Link them into a couple (one generates the invite code, the other enters it).
4. **Put data in it.** A reviewer looking at a blank app can't evaluate it: both
   partners complete today's devotional (lights the streak), add a shared prayer
   and mark one answered, add a Journal moment with a photo, complete one date,
   submit a weekly check-in on both sides.
5. Sign in on a clean device and confirm: no paywall anywhere, Profile shows
   **"Complimentary"**, every tab loads.

**Paste into App Store Connect → App Review Information:**

> **Sign-in required:** Yes
> **Username:** demo@bexhearts.com
> **Password:** *(set at step 1)*
>
> **Notes for the reviewer:**
> Bexhearts is used by two people together, so this account is already linked to
> a partner account and has sample data. Sign in with the credentials above —
> no paywall will appear; this account has complimentary access for review.
>
> A regular new user goes through: sign up → verify with a 6-digit code emailed
> to them → a short setup (name, relationship stage, what they want to grow in)
> → a 3-day free trial paywall → invite their partner. The subscription is
> billed once per couple; the invited partner never pays.
>
> Account deletion is in the app: **Profile → Delete account** (7-day grace
> period, then permanent).
> Restore Purchases: **Profile → Subscription → Restore Purchases**.
> Support: support@bexhearts.com

> ⚠️ Keep the demo account's comp grant in place for the life of the app —
> every future update is reviewed too. Never revoke it during a review.

---

## 2. Subscription disclosure — where it must appear

App Store 3.1.2 requires title, length, price and renewal terms to be visible
**where the purchase happens**, plus functional Terms and Privacy links.

**Already shipped in the app** (`src/features/subscription/components/Paywall.tsx`,
`src/features/subscription/plans.ts` — verified on the simulator 2026-07-27):

- "Start your 3-day free trial · Full access. No charge today."
- A three-step timeline: today unlocks · day 2 heads-up · day 3 the plan begins
- Three plans with prices and per-week equivalents
- `No charge today · then $79.99/yr · cancel anytime` under the CTA
- "Billed per couple — your partner joins free"
- **Restore · Terms · Privacy** links

**⚠️ OWNER — paste into the App Store Connect description** (Apple wants the
same terms in the listing text, not only in-app):

```
SUBSCRIPTION TERMS
Bexhearts Premium is one subscription per couple — your partner joins free.

• Weekly — $6.99 / week
• Monthly — $12.99 / month
• Annual — $79.99 / year (best value)

Every plan starts with a 3-day free trial. Payment is charged to your Apple ID
at confirmation of purchase. Your subscription renews automatically unless you
turn off auto-renew at least 24 hours before the end of the current period.
Your account is charged for renewal within 24 hours before the period ends.
You can manage or cancel your subscription in your Apple ID account settings
after purchase. Any unused portion of a free trial is forfeited if you buy a
subscription.

Privacy Policy: https://bexhearts.com/privacy
Terms of Use: https://bexhearts.com/terms
```

**⚠️ Also required:** the **Terms of Use (EULA)** field in App Store Connect →
App Information must be set to `https://bexhearts.com/terms`. Leaving Apple's
standard EULA there while the app links elsewhere is an inconsistency reviewers
do flag.

---

## 3. ASO — name, subtitle, keywords

The app record currently reads just "Bexhearts", which no one searches for.
The name field is prime keyword real estate.

| Field | Limit | Recommended |
|---|---|---|
| **App Name** | 30 | `Bexhearts: Faith for Couples` (28) |
| **Subtitle** | 30 | `Devotionals, prayer & dates` (27) |
| **Keywords** | 100 | `christian,couple,marriage,devotional,prayer,bible,relationship,dating,engaged,faith,god` |

Notes that matter:
- **Never repeat** a word from the name or subtitle in keywords — Apple already
  indexes those, and duplicates waste the 100 characters.
- Commas, no spaces. Singular forms: Apple matches plurals automatically.
- The competitive set is Hallow, Abide, Paired, Lasting. "Christian couple" is
  the phrase with intent and thin competition; that's the beachhead.

**Promotional text** (170 chars, editable without a new build — use it for
campaigns):
```
Two people, one streak. Daily devotionals you finish together, a shared prayer
journal, and date ideas that actually get planned. Start free for 3 days.
```

---

## 4. Screenshots

**⚠️ OWNER — required sizes:** 6.9" (1320×2868) and 6.5" (1242×2688). Apple
scales 6.9" down for smaller devices, so those two cover the phone lineup.
Tablet is not needed — `supportsTablet: false`.

Capture from the **demo couple** (real data, dark or light — pick one and stay
consistent). Recommended order, because the first two are all most people see:

| # | Screen | Caption |
|---|---|---|
| 1 | Home with a live streak | **One streak. Both of you.** |
| 2 | Today's devotional | **A devotional you finish together** |
| 3 | Prayers (shared + answered) | **Pray for each other, every day** |
| 4 | Journal timeline with photos | **Your story, kept in one place** |
| 5 | Date ideas | **350+ dates you'll actually plan** |
| 6 | Us hub (streak + heatmap) | **Watch it add up** |

Capture command (with the app on the right screen):
```bash
xcrun simctl io booted screenshot ~/Desktop/bexhearts-01.png
```

> Do NOT show the paywall in a screenshot — Apple discourages it, and it's the
> weakest possible first impression.

---

## 5. Privacy nutrition labels

These must match `docs/PRIVACY_POLICY.md`. Answers derived from what the code
actually does as of 2026-07-27.

**Data used to track you across apps/websites:** **None.** No ad SDKs, no IDFA,
no App Tracking Transparency prompt needed.

**Data linked to you:**

| Data type | Why | Where it comes from |
|---|---|---|
| Email address | Account, sign-in | Supabase auth |
| Name | Shown to your partner | Profile |
| Photos | Journal moments, avatar | Cloudflare R2 |
| Other user content | Prayers, journal, check-ins, boundaries | Supabase |
| Purchase history | Subscription status | RevenueCat |
| Coarse location (country) | Leaderboard flag, date ideas by country | Device region |
| Sensitive info — **religious beliefs** | The app's whole purpose | Denomination, prayers, devotionals |
| Identifiers (user ID) | Product analytics | PostHog |
| Crash data / diagnostics | Stability | Sentry |

> **⚠️ Declare "Sensitive Info" and be exact about it.** This is a Christian
> couples app: prayers and denomination *are* religious-belief data. Under-
> declaring is a rejection and a regulatory problem; declaring it plainly costs
> nothing with this audience.

**Data not linked to you:** product-interaction analytics.
As of the 2026-07-27 instrumentation, PostHog receives **structural events
only** — screen/funnel names and enum properties, enforced mechanically by
`src/features/analytics/schema.ts`. **No prayer text, journal content,
check-in notes, or names.** Identify sends the user UUID and nothing else —
not even the email.

**Also true, and worth saying in the review notes:** everything is deletable in
app (7-day grace, then permanent), and the journal is exportable to PDF.

---

## 6. Store-compliance pass — status

| Requirement | Status |
|---|---|
| Account deletion in-app (5.1.1(v)) | ✅ Profile → Delete account, 7-day grace |
| Sign in with Apple offered alongside Google (4.8) | ✅ `SocialAuthButtons` |
| **Apple token revocation on delete** | ✅ **BUILT 2026-07-30.** ⚠️ Needs migration `00037` applied + four Apple secrets set (below) — until then it degrades to a no-op and deletion still works. |
| Restore Purchases surfaced (3.1.1) | ✅ Profile → Subscription, and on the paywall |
| Subscription terms at point of purchase (3.1.2) | ✅ on the paywall |
| Terms + Privacy links in-app and in ASC | ✅ in-app · ⚠️ set the EULA field in ASC |
| Permission purpose strings match real use | ✅ **fixed 2026-07-27** — camera permission removed (never used); photo string now covers journal photos too |
| Export compliance | ✅ `ITSAppUsesNonExemptEncryption: false` added, so ASC stops asking per build |
| No private APIs / no hot-code-push of native code | ✅ |
| Age rating | Set **12+**. There is user-generated content between two linked partners only (no public feed), plus the opt-in leaderboard which shows **masked** names. |
| Demo account | ⚠️ §1 above — **blocking** |
| EU storefronts | Excluded at launch by owner decision (DSA trader display deferred) |

---

## 6b. ⚠️ Apple token revocation — the four secrets

Guideline 5.1.1(v) says an app offering Sign in with Apple must **revoke the
user's Apple tokens** when they delete their account. The code is built
(migration `00037`, edge function `apple-revoke`), but it stays inert until
these exist — and an inert revoke is a rejection.

**Get the key** — Apple Developer → Certificates, Identifiers & Profiles →
**Keys** → **+** → tick **Sign in with Apple** → configure it against the
`com.bexhearts.app` App ID → Continue → Register → **Download**. The `.p8`
downloads exactly once; there is no second chance, so put it somewhere safe
immediately.

**Set on the functions runtime** (locally `supabase/functions/.env`, then
restart `supabase functions serve`; on the VPS per `docs/EDGE_FUNCTIONS.md`):

| Secret | Where it comes from |
|---|---|
| `APPLE_TEAM_ID` | Apple Developer → Membership → Team ID (10 chars) |
| `APPLE_KEY_ID` | The Key ID shown next to the key you just made (10 chars) |
| `APPLE_PRIVATE_KEY` | The whole `.p8` file contents, BEGIN/END lines included |
| `APPLE_CLIENT_ID` | `com.bexhearts.app` |

> **The one that trips everyone up:** for **native** Sign in with Apple the
> `client_id` is the app's **bundle ID**, not a Services ID. A Services ID here
> returns `invalid_client` from Apple with no further explanation.

**Verify before submitting:**
1. Sign in with Apple on a dev build.
2. In Studio: `SELECT user_id, created_at, revoked_at FROM apple_credentials;`
   — a row should exist with `revoked_at` NULL.
3. Delete the account in-app (Profile → Delete account).
4. Re-run the query: `revoked_at` is now set.
5. Belt-and-braces: **Settings → Apple Account → Sign in with Apple** on the
   device should no longer list Bexhearts.

If step 4 leaves `revoke_error` populated, read it — it's Apple's own error
string, and `invalid_client` almost always means the client-id note above.

---

## 7. Localized store listings — Spanish & Portuguese

The app stays **English-only** (PROGRESS i18n decision). Store listings are
different: they're free to localize, they surface the app in Spanish- and
Portuguese-language searches, and they cost nothing to maintain. Localizing the
listing while the app is English is normal and permitted — but say so, which the
last line of each description does.

### Español (es-MX / es-ES)

**Nombre:** `Bexhearts: Fe en Pareja` (24)
**Subtítulo:** `Devocionales y oración` (22)
**Palabras clave:** `cristiano,pareja,matrimonio,devocional,oracion,biblia,noviazgo,fe,dios,relacion`

**Descripción:**
```
Bexhearts es la app para parejas cristianas que quieren crecer juntas — en su fe
y el uno con el otro.

UNA RACHA, LOS DOS
Cada día tienen un devocional corto. Cuando los dos lo terminan, su racha crece.
No es la racha de uno: es de ambos.

OREN JUNTOS
Un diario de oración compartido. Añade una petición, avisa a tu pareja que estás
orando por ella, y marquen juntos las oraciones respondidas.

SU HISTORIA, EN UN SOLO LUGAR
Momentos con fotos, aniversarios, las citas que sí hicieron. Todo en una línea
de tiempo que van llenando entre los dos.

CITAS QUE DE VERDAD PASAN
Más de 350 ideas de citas — muchas gratis, para cualquier presupuesto, y con
opciones para parejas a distancia.

UNA SUSCRIPCIÓN POR PAREJA
Tu pareja entra gratis. Prueba 3 días sin costo.

Nota: la aplicación está actualmente en inglés.
```

### Português (pt-BR)

**Nome:** `Bexhearts: Fé a Dois` (20)
**Subtítulo:** `Devocionais e oração` (20)
**Palavras-chave:** `cristao,casal,casamento,devocional,oracao,biblia,namoro,fe,deus,relacionamento`

**Descrição:**
```
Bexhearts é o app para casais cristãos que querem crescer juntos — na fé e um
com o outro.

UMA SEQUÊNCIA, OS DOIS
Todo dia tem um devocional curto. Quando os dois terminam, a sequência aumenta.
Ela não é de um: é do casal.

OREM JUNTOS
Um diário de oração compartilhado. Adicione um pedido, avise que está orando
pelo outro, e marquem juntos as orações respondidas.

A HISTÓRIA DE VOCÊS, EM UM LUGAR SÓ
Momentos com fotos, datas importantes, os encontros que realmente aconteceram —
tudo numa linha do tempo construída pelos dois.

ENCONTROS QUE ACONTECEM DE VERDADE
Mais de 350 ideias de encontros — muitas gratuitas, para qualquer orçamento, e
com opções para casais à distância.

UMA ASSINATURA POR CASAL
Seu par entra de graça. Teste 3 dias sem pagar nada.

Observação: o aplicativo está atualmente em inglês.
```

> ⚠️ Each localization also needs its own **screenshots** in App Store Connect.
> Reusing the English ones is allowed and is what to do at launch — swap them
> only if these markets actually convert.

---

## 8. Order of operations

1. ⚠️ Apply `00037` + set the four Apple secrets, then verify revocation (§6b)
2. ⚠️ Demo account created, comped, populated, verified (§1)
3. J1 dev build → F3 sandbox purchase (`docs/J1_F3_RUNBOOK.md`)
4. Screenshots from the demo couple (§4)
5. ASC: name/subtitle/keywords, description + subscription terms, EULA field,
   privacy labels, age rating, review notes (§2, §3, §5, §6)
6. Localizations (§7)
7. Upload the build, submit
