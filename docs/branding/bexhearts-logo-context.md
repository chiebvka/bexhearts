# Bexhearts logo context and design handoff

Prepared 2026-07-13 from the checked-out Bexhearts repository. This is an inspection and strategy document, not a production identity. No logo assets were generated or replaced.

## Repository inspection

### Scope and authority

- Inspected branch: `authflow`.
- The worktree already contained extensive owner changes before this inspection. They were preserved.
- Primary authority: active tokens and component code in `src/theme/`, then rendered screens and layouts in `app/`, shared components in `src/components/`, and feature UI in `src/features/`.
- Supporting authority: `app.config.ts`, `package.json`, `docs/PROGRESS.md`, `docs/MARKETING.md`, `docs/HANDOFF.md`, and `docs/bexhearts-product-context.md`.
- Secondary ecosystem reference only: [Bexoni.com](https://www.bexoni.com), inspected in its light and dark presentations on 2026-07-13. Bexoni did not override any Bexhearts code value.

### Relevant directories inspected

- `src/theme/`
- `src/components/ui/` and `src/components/layout/`
- `app/(auth)/`, `app/(onboarding)/`, `app/(tabs)/`, and `app/modal/`
- `src/features/auth/`, `onboarding/`, `dashboard/`, `devotional/`, `prayer/`, `check-in/`, `boundaries/`, `dates/`, `journal/`, `profile/`, and `subscription/`
- `src/api/` for implemented data surfaces
- `assets/`
- `docs/`

### Key source files

- `src/theme/colors.ts` — active light-only palette; highest palette authority.
- `src/theme/typography.ts` — platform font families and text roles.
- `src/theme/spacing.ts`, `src/theme/borderRadius.ts`, `src/theme/shadows.ts` — geometry and depth.
- `src/components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`, `Text.tsx`, `Badge.tsx`, and `Avatar.tsx` — active semantic use.
- `app/_layout.tsx` and `app/(tabs)/_layout.tsx` — root background, status bar, tab icon system, and navigation surfaces.
- `app/(onboarding)/welcome.tsx` — current editorial/devotional welcome direction.
- `app/(tabs)/index.tsx` and `src/features/dashboard/components/StreakCounter.tsx` — daily couple loop.
- `app/(tabs)/devotional/index.tsx` and `src/features/devotional/components/ScriptureBlock.tsx` — devotional language.
- `app/(tabs)/journal/index.tsx` and `src/features/journal/components/TimelineEntryCard.tsx` — relationship-story/editorial language.
- `src/features/subscription/components/Paywall.tsx` — premium utility expression.
- `app.config.ts` and `assets/` — configured app icon, adaptive icon, splash, favicon, and forced light mode.
- `docs/PROGRESS.md` — feature status and the documented, not-yet-implemented dark target.

### Rendered inspection

The booted iOS simulator was inspected on the welcome screen, profile setup, paywall, authenticated Home, and Journal. These views confirmed the code-level conclusions: warm cream backgrounds; off-white cards; vivid purple actions; strong black headings; Georgia-like serif devotional/editorial moments; neutral sans utility text; square primary controls; rounded cards, pills, and circular icon containers; and a Journal-specific polaroid motif.

### Limitations

- Bexhearts is actively light-only. `app.config.ts` forces `userInterfaceStyle: 'light'`, `src/theme/colors.ts` has no light/dark split, and the root status bar is fixed to dark content. Dark could not honestly be rendered. Its values below are documented targets or recommendations, not active UI.
- Several flows are code-complete but still await owner-run migrations, external service configuration, or two-user/live-database smoke testing. Code presence is not treated as proof of public release.
- The app is pre-launch: store builds, real products, store listings, and production verification remain incomplete.
- Simulator logs showed recurring Supabase auth-lock timeout warnings during inspection. Screens still rendered; the warning does not change the brand findings.
- Bexoni is a live external site and may change after the inspection date.

## Verified product summary

### Target users

Bexhearts is a faith-forward relationship app for Christian couples, with the marketing beachhead explicitly centered on dating, engaged, and newly married couples. It is designed around a linked pair growing closer to God and one another. Solo use is a graceful temporary state, not a marketed audience.

### Core emotional value

The product turns spiritual and relational intention into a shared rhythm: show up together, pray together, reflect honestly, notice growth, and preserve the story of the relationship. The emotional promise is companionship and faithful consistency, not romance-as-entertainment and not a claim to “fix” a relationship.

### Implemented and visible in the app

- Email authentication and OTP verification/recovery; social-auth UI and services exist subject to runtime/configuration constraints.
- Onboarding with name/tradition, relationship stage, growth focus, personalized plan summary, trial paywall, and partner invite/link.
- Home dashboard with both avatars, shared streak, daily trackables, quick actions, and today’s devotional.
- Daily devotionals with Scripture, reflection, couple action, completion, and answer-after-both partner reflection reveal.
- Shared and personal prayer lists, answered/archive lifecycle, realtime hooks, a focused prayer-session flow, and AI-composed prayer support through a server function.
- Weekly check-ins with ratings, notes, sharing controls, and answer-after-both partner comparison.
- Boundaries and grace-framed temptation plans, categories, stage-aware templates, retire/resolve history, and restore actions.
- Date library, filters, couple ratings, saving, planning, custom dates, completion notes, and memory handoff.
- Journal / “Our Story” timeline with Moments, Milestones/countdowns, multi-photo entries, reactions, answered prayers, and completed dates.
- Shared streak, activity heatmap, points history, achievements, and a privacy-aware couple leaderboard.
- Profile, avatars, appearance preference, restore-purchase entry, support/legal links, and account deletion.
- A three-day-trial paywall UI and entitlement wrappers.

### Implemented but incomplete, conditional, or hidden

- Apple/Google auth is wired but depends on a dev build and provider credentials; it is intentionally hidden in Expo Go and still needs on-device verification.
- Partner linking and multiple core flows are not fully certified against two real users and every owner-applied migration.
- Avatar and memory-photo pipelines exist, but deployment/function/native configuration is externally dependent.
- The entitlement system degrades open in unconfigured development. Store products, real keys, sandbox purchase verification, per-couple entitlement hardening, and production enforcement remain incomplete.
- Push token registration and response handling exist, but notification sending and per-type preferences do not.
- Appearance preference is stored and the selector is visible, but selecting Dark only saves the preference and shows an “upcoming update” message.
- Relationship stage and growth focus personalize the plan-summary copy but do not yet reliably filter the live content library.
- Dates are implemented but deliberately hidden from the bottom tab bar; they are reached through Home.
- Some implemented features still carry smaller follow-ups such as Android gallery zoom and fuller edit/delete flows.

### Planned or documented; do not present as released

- Daily private-answer question with partner reveal.
- Daily mood share.
- One-tap “Praying for you” partner push.
- Couple challenges.
- Home-screen widget.
- In-app Bible reader and licensed translation options.
- Long-distance mode and explicit unlink/breakup handling.
- Richer onboarding quiz and content-level personalization payoff.
- Full dark theme, accessibility/polish pass, and real launch icon/splash.
- Notification sending/preferences, install attribution, production analytics/crash visibility, and remaining production hardening.

### Unclear from local code alone

- Which external migrations and edge functions are currently applied in every owner environment.
- Whether real App Store / Play products and RevenueCat/Superwall campaigns are configured outside the repository.
- Which drafted devotional content has completed owner/theological approval in the live database.
- Final Bible-translation licensing scope.
- Final legal/trademark clearance for a future Bexhearts symbol and wordmark.

## Current visual language

### Brand personality and category lean

The current app is best described as **soft-tech relationship utility with a devotional-lifestyle core and an emerging editorial memory layer**. It is not purely wellness, not church-media design, and not a dating marketplace. The Home and paywall surfaces are practical and product-led; devotionals introduce quiet editorial weight; Journal adds an intimate scrapbook character.

The system reads warm, calm, optimistic, sincere, and increasingly premium. It is still visibly pre-launch because the app identity assets are defaults, some welcome imagery is placeholder emoji, and quick actions still use emoji.

### Gender expression

The purple, heart language, polaroids, and warmth create a mild feminine lean, while square controls, neutral sans text, high-contrast black headings, and restrained gold/green supporting colors keep the product broadly unisex. The logo should move the total identity toward balanced neutrality: intimate without being delicate, romantic without pink sentimentality, and spiritually meaningful without ministry aesthetics.

### Typography

- iOS sans: Avenir Next for headings, body, labels, and buttons.
- Android/default sans: platform sans-serif.
- Serif: Georgia on iOS and platform serif elsewhere.
- Serif roles: display headings and italic Scripture.
- No custom font files are bundled in `assets/fonts/`.
- Practical implication: the future wordmark should be a clear, humanist, contemporary custom sans or a restrained sans/serif hybrid—not script lettering. A small soft terminal, cut, ligature, or aperture can connect it to the symbol. The literal Bexoni oblique wordmark should not be copied.

### Component geometry

- Buttons and text inputs are intentionally square: `borderRadius.none = 0`.
- Cards use a soft 16px radius.
- General radius scale: 0, 8, 12, 16, 24, and full/pill.
- Avatars and small icon containers are circular.
- Chips, filters, badges, and selected-tab halos use pills or rounded capsules.
- The result is a productive tension between grounded square actions and gentle rounded content containers. A logo can echo this with a confident outer silhouette and softened interior joins.

### Spacing

The active spacing scale is compact and systematic: 4, 8, 16, 24, 32, 48, and 64px. Layouts use generous cream negative space, 16–24px content padding, and clear section separation.

### Icon and image style

- Main navigation uses Ionicons: outline when inactive, filled in purple when active.
- Active navigation icons sit in a light-purple rounded halo.
- Several quick actions and onboarding placeholders still use emoji.
- Journal uses fanned, lightly rotated white polaroid frames and a one-purple-family glyph rail.
- The logo must be a real vector-ready silhouette, not emoji-like and not dependent on the scrapbook treatment.

### Surfaces and depth

- Warm cream app canvas.
- Off-white card/input surfaces and pure-white elevated accents.
- Subtle warm-black shadows at low opacity.
- Purple tints provide selection, focus, and emotional emphasis.
- Green and gold are secondary semantic/support colors, not co-primary brand colors.
- No active gradients were found in the app. The logo should work flat first; gradients are optional campaign treatments only after the mark succeeds in one color.

### Motion and interaction

Motion is functional rather than expressive: right-to-left stack transitions, 200ms image transitions, haptics, timer state, and gallery gestures. Reanimated is installed but no active branded motion system was found. A future logo animation should therefore be simple—two forms meeting, a path resolving, or a light appearing—not a complex kinetic identity.

### Light-mode feel

Warm parchment/cream, intimate and calm, with crisp black editorial hierarchy and vivid purple interaction. It feels more devotional-editorial than the parent Bexoni site while retaining a modern product structure.

### Dark-mode feel

No active dark-mode feel exists yet. The documented target is neutral, near-black, modern, and restrained, with purple preserved. Future logo artwork must be tested against `#13161A`, `#171B20`, and `#1F2329`, but these are not evidence of a shipped dark UI.

### What to preserve

- `#9849FA` as the recognizable ecosystem link.
- Warm cream rather than sterile white as the primary light canvas.
- Strong, legible hierarchy and generous negative space.
- The blend of practical relationship utility and quiet devotional/editorial depth.
- Balanced geometry: grounded outer forms, softened joins, simple filled icon behavior.
- The idea of “two people plus God” as relationship structure, expressed subtly rather than literally.

### What to avoid

- Generic dating-app heart outlines, infinity hearts, stock couple silhouettes, hands holding hearts, rings, doves, or cartoon partners.
- A literal heart-plus-cross lockup, church window cliché, Bible clip art, ministry badge, or sermon-series aesthetic.
- Wedding-only symbolism, bridal scripts, pink/red Valentine palettes, and overtly feminine flourishes.
- Copying Bexoni’s exact faceted “B” slab, offset outline, or bold oblique wordmark.
- Fine-line details, tiny negative spaces, multiple fragile strands, 3D/chrome, shadows, or gradient dependence.
- Corporate-finance stiffness, juvenile gamification, or a symbol that reads as a medical/charity heart.

## Verified colour system

### Source-of-truth decision

`src/theme/colors.ts` is actively imported across the app and shared components and is the authoritative palette. The repository contains no competing runtime theme object and no NativeWind/Tailwind theme. Screen inspection matched the token values.

There is documentation drift that must remain explicit:

- `docs/PROGRESS.md` lists a future light primary text of `#141517`, while active `colors.text.primary` is `#1A1A17`.
- `docs/PROGRESS.md` lists a future border of `#DAD7D0`, while active cards/tab dividers use `colors.neutral[200]` = `#E8E8E2` and inputs use `colors.neutral[300]` = `#D4D4CC`.
- A prose note cites an active-tab tint of `#F1E7FE`, but the tab code uses `colors.primary[100]` = `#EEE7FF`.
- `app.config.ts` uses `#FAFAF8` behind the current placeholder splash/adaptive icon. That is configuration chrome, not the active app canvas (`#F8F4EC`).

### Active light mode

| Token | Exact hex / RGB | Active usage | Source | Confidence |
|---|---|---|---|---|
| Primary | `#9849FA` / rgb(152, 73, 250) | Primary actions, selected tabs, links, icons, focus borders | `src/theme/colors.ts` → `colors.primary[500]` | High — active |
| Primary foreground | `#FAFAF8` / rgb(250, 250, 248) | Text/icons on purple, gold, and danger buttons | `colors.text.inverse` | High — active |
| Secondary | `#D4963A` / rgb(212, 150, 58) | Secondary actions and warm supporting emphasis | `colors.secondary[500]` | High — active |
| Accent | `#5A8A6A` / rgb(90, 138, 106) | Answered/success-like relationship actions and rating accents | `colors.accent[500]` | High — active |
| App background | `#F8F4EC` / rgb(248, 244, 236) | Root, stacks, screens, and scroll containers | `colors.background` | High — active |
| Elevated surface | `#FFFFFF` / rgb(255, 255, 255) | Welcome polaroids and elevated white accents | `colors.surfaceElevated` | High — active |
| Card/input surface | `#FEFCF7` / rgb(254, 252, 247) | Cards, tab bar, and text-input fill | `colors.surface` | High — active |
| Primary text | `#1A1A17` / rgb(26, 26, 23) | Default text and strong headings | `colors.text.primary` | High — active |
| Muted text | `#5C5C54` / rgb(92, 92, 84) | Secondary copy and metadata | `colors.text.secondary` | High — active |
| Tertiary text | `#A8A89E` / rgb(168, 168, 158) | Placeholder text, timestamps, inactive labels | `colors.text.tertiary` | High — active |
| Border/divider | `#E8E8E2` / rgb(232, 232, 226) | Outlined cards, tab top border, row dividers | `colors.neutral[200]` | High — active |
| Input/control border | `#D4D4CC` / rgb(212, 212, 204) | Inputs, chips, unselected plan cards | `colors.neutral[300]` | High — active |
| Success | `#4A8A5A` / rgb(74, 138, 90) | Success semantic text/badges | `colors.success` | High — active |
| Warning | `#D49A3A` / rgb(212, 154, 58) | Warning semantic text/badges | `colors.warning` | High — active |
| Error | `#C05252` / rgb(192, 82, 82) | Errors, destructive actions, danger button | `colors.error` | High — active |
| Info | `#5A7A9A` / rgb(90, 122, 154) | Info semantic token; limited direct UI use | `colors.info` | High — active token, low use |
| Decorative purple halo | `#EEE7FF` / rgb(238, 231, 255) | Active-tab halo, icon circles, Journal rail, grace chip | `colors.primary[100]` | High — active |
| Decorative purple wash | `#F6F3FE` / rgb(246, 243, 254) | Selected cards, paywall plan, subtle feature surfaces | `colors.primary[50]` | High — active |
| Success tint | `#E8F5E9` / rgb(232, 245, 233) | Success badge background | `src/components/ui/Badge.tsx` | High — active, component-local |
| Warning tint | `#FFF8E1` / rgb(255, 248, 225) | Warning badge background | `src/components/ui/Badge.tsx` | High — active, component-local |
| Active gradients | None | No gradient component or gradient token is in active use | Repository search + `package.json` | High — absent |

### Dark mode: documented target and explicit recommendations

No row in this table should be described as an active app token. “Documented” values come from `docs/PROGRESS.md` Phase 8. “Recommended” values complete missing semantic roles for logo testing only and require accessibility validation when dark mode is implemented.

| Token | Exact hex / RGB | Intended use | Source/status | Confidence |
|---|---|---|---|---|
| Primary | `#9849FA` / rgb(152, 73, 250) | Brand action and symbol color | `colors.primary[500]`; docs say it remains unchanged — documented, not mode-wired | High value; inactive mode |
| Primary foreground | `#FAFAFA` / rgb(250, 250, 250) | Text/icon on primary | `docs/PROGRESS.md` near-white text — documented, not implemented | Medium |
| Secondary | `#D4963A` / rgb(212, 150, 58) | Supporting gold | Recommended reuse of `colors.secondary[500]` | Medium; validate contrast |
| Accent | `#5A8A6A` / rgb(90, 138, 106) | Supporting green | Recommended reuse of `colors.accent[500]` | Medium; validate contrast |
| App background | `#13161A` / rgb(19, 22, 26) | Root dark canvas | `docs/PROGRESS.md` Phase 8 — documented, not implemented | High target |
| Card surface | `#171B20` / rgb(23, 27, 32) | Base cards | `docs/PROGRESS.md` Phase 8 — documented, not implemented | High target |
| Elevated/accent surface | `#1F2329` / rgb(31, 35, 41) | Raised cards and inputs | `docs/PROGRESS.md` Phase 8 — documented; input role is recommended | High value / medium role |
| Primary text | `#FAFAFA` / rgb(250, 250, 250) | Main text | `docs/PROGRESS.md` Phase 8 — documented, not implemented | High target |
| Muted text | `#8B9098` / rgb(139, 144, 152) | Secondary text | `docs/PROGRESS.md` Phase 8 — documented, not implemented | High target |
| Border/divider | `#2A2E35` / rgb(42, 46, 53) | Borders and separators | `docs/PROGRESS.md` Phase 8 — documented, not implemented | High target |
| Input background | `#1F2329` / rgb(31, 35, 41) | Inputs and selected utility surfaces | Recommended mapping from documented accent surface | Medium |
| Success | `#4A8A5A` / rgb(74, 138, 90) | Success semantic | Recommended reuse of active light semantic | Medium; validate contrast |
| Warning | `#D49A3A` / rgb(212, 154, 58) | Warning semantic | Recommended reuse of active light semantic | Medium; validate contrast |
| Error | `#C05252` / rgb(192, 82, 82) | Error semantic | Recommended reuse of active light semantic | Medium; validate contrast |
| Decorative dark purple tint | `#29104A` / rgb(41, 16, 74) | Dark selection halo and quiet icon field | Recommended use of active `colors.primary[900]` | Medium |
| Active gradients | None | Dark mode is absent; no dark gradient exists | Verified absence | High |

## Existing asset inventory

| Asset | Dimensions / format | Configured purpose | Current status | Influence on future logo |
|---|---|---|---|---|
| `assets/icon.png` | 1024×1024 PNG | Expo app icon and notification icon | Default Expo grid/target placeholder | None; replace after identity approval |
| `assets/adaptive-icon.png` | 1024×1024 PNG with transparency | Android adaptive foreground | Default Expo grid/target placeholder | None; future symbol must be rebuilt for adaptive safe zones |
| `assets/splash-icon.png` | 1024×1024 PNG with transparency | Splash mark | Byte-identical to `adaptive-icon.png`; default placeholder | None; do not derive from it |
| `assets/favicon.png` | 48×48 PNG | Web favicon | Default Expo cube/dot placeholder | None; replace with simplified approved symbol |

Additional findings:

- No logo files, wordmarks, SVG brand marks, custom font files, or local onboarding photography exist in the repository.
- `assets/images/`, `assets/fonts/`, and `assets/animations/` contain no files.
- The welcome screen’s two photo slots are explicitly `null`; tinted emoji placeholders render instead.
- DiceBear profile avatars are remote/generated user avatars, not Bexhearts brand assets.
- The text “Bexhearts” on the welcome screen is a temporary Georgia-based text treatment, not an approved wordmark.

## Bexoni relationship

### Observed similarities

- The same vivid purple family, with `#9849FA` as the local Bexhearts anchor and the corresponding vivid purple used prominently by Bexoni.
- Warm off-white/light presentation and near-black/dark presentation.
- High-contrast black/white text, clear product hierarchy, neutral sans typography, restrained rounded geometry, and modern soft-tech presentation.

### Observed differences

- Bexoni is a design/technology parent brand. Its visible mark is a bold purple faceted “B” slab with an offset outline and a heavy oblique sans wordmark. The website is assertive, technical, and presentation-led.
- Bexhearts is intimate, devotional, and relationship-centered. It uses more cream, more serif/editorial moments, gentler card geometry, partner imagery, Scripture, Journal polaroids, and emotionally careful copy.

### What Bexhearts should inherit

- The exact purple lineage.
- Confident simple geometry, strong silhouette, and excellent light/dark behavior.
- A contemporary, legible wordmark with disciplined spacing.
- One subtle family cue such as a decisive cut, aperture, paired plane, or small offset—not a duplicated parent mark.

### What Bexhearts should soften or change

- Replace Bexoni’s aggressive oblique/tech energy with calmer, more human proportions.
- Use connection, rhythm, openness, and safe-space cues rather than a faceted industrial block.
- Avoid copying the Bexoni “B” slab, its outline layer, or its italic wordmark construction.
- Keep the faith layer secondary: meaningful on discovery, not the first literal read.

The goal is a recognizable sibling: shared purple and design discipline, different emotional job.

## Logo strategy

### Emotional goal

Create a mark that feels like two people choosing a shared spiritual rhythm: warm, intimate, composed, modern, trustworthy, emotionally intelligent, and quietly faith-centered. The first read should be connection and togetherness; the second read may reveal a “B,” third strand, guiding light, or understated cross.

### Symbolic territory

- Two forms becoming one.
- A B shaped by relationship rather than a standalone initial.
- Two paths with a third guiding strand.
- Shared heart or safe-space negative space.
- Open reflection/journal forms.
- A quiet light, flame, or star held between two people.
- A subtle cross created only by structural negative space.

### Recommended shape language

- One bold, compact, filled silhouette or two interdependent filled planes.
- Medium-soft curves paired with one decisive geometric cut/aperture.
- Broad internal negative spaces that survive at 16–32px.
- Balanced optical weight; no fragile outlines.
- A square-safe core that also reads under circular cropping.
- Flat one-color operation first; two-color purple/cream second.

### Typography direction

- Primary recommendation: custom humanist sans, upright, medium-to-bold, with generous counters and calm spacing.
- Secondary exploratory option: a restrained contemporary serif or a sans with one serif-like editorial detail, reflecting the app’s Georgia devotional layer.
- Keep “Bexhearts” correctly spelled and immediately legible.
- Avoid scripts, exaggerated italics, bubble lettering, bridal ligatures, or a copy of Bexoni’s oblique wordmark.

### Small-size requirements

- Recognizable at 16, 32, 64, and 180px.
- No text inside the app icon.
- No negative-space opening narrower than the visual equivalent of roughly 8–10% of the symbol width in the rough phase.
- Must survive one-color fill, iOS rounded-square masks, Android adaptive safe areas, a circle crop, favicon reduction, and monochrome notification use.
- Test both purple-on-cream and purple/near-white-on-near-black.

### Primary design risks

- Becoming another generic heart app.
- Reading as dating/swiping, wedding planning, a charity, or healthcare.
- Over-literalizing Christian symbolism.
- Becoming too feminine, too cute, or too “Valentine.”
- Creating an over-clever B/heart/cross puzzle that fails at small sizes.
- Looking too close to Bexoni or to an existing dating, wellness, journaling, or church mark.

### Originality safeguards

- Begin from six different structural ideas, not six surface variations of one heart.
- Require a distinct outer silhouette for every concept.
- Do not use stock heart contours, infinity loops, ring pairs, hands, doves, church roofs, literal Bible art, or clip-art crosses.
- Do not trace or adapt Bexoni’s existing faceted B.
- Before final production, run visual-similarity and trademark screening in the relevant app/software classes. This handoff is design direction, not legal clearance.

## Recommended Phase 1 concepts

These are deliberately different territories. Each should be explored as a standalone symbol, a rough `Bexhearts` wordmark, and a basic app-icon framing test.

1. **The Woven B / third strand** — Build a compact B from two broad partner ribbons with a subtle third vertical or diagonal strand holding the form together. The B is the first or second read; the faith meaning is the discovered “third strand.” Avoid braid detail.
2. **The Shared-Heart Aperture** — Two independent filled forms face each other and create a warm heart-shaped or teardrop-shaped interior aperture without drawing a heart outline. The pair should also imply two people and possibly a B counter.
3. **Two Paths, One Way** — Two clear paths enter separately and resolve into one upward or forward route. A tiny cross-like junction may emerge from negative space, but the primary read is shared direction and intentional growth.
4. **The Open Reflection** — Two simplified page/journal planes, or an open-book rhythm, create an embrace or B-shaped silhouette. This represents Scripture, reflection, and “Our Story” without depicting a literal Bible.
5. **The Held Light** — Two calm arcs or sheltering planes hold a single light/spark/flame at the center. The light is guidance and prayer; the outer forms are the couple. It must not resemble a wellness lotus, charity heart, or church flame logo.
6. **The Quiet Sanctuary** — Two mirrored arches or doorway forms create a shared interior home/safe space. A cross is possible only as a broad negative-space alignment. The silhouette should feel architectural but domestic and intimate, not ecclesiastical.

Phase 1 should remain rough and comparative. Do not select, polish, or export a final identity until the owner chooses one direction or combines named elements from multiple directions.
