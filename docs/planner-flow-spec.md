# Monde Méandre — Planner Flow Build Spec (3 Pages)

Build direction for the `/plan` experience: a three-step flow with a persistent progress map, ending in a free itinerary that converts to a saved account via the detailed-report unlock. Strategic goal: **registered users with saved travel profiles** (the report is the carrot; the saved profile + account is the asset).

Reads persona data from `travel-personas.json`. Itinerary generation runs server-side (Netlify function) using `personaVoice.js`.

---

## Progress map (persistent, top of all three pages)

A horizontal stepper, always visible, so users see exactly how much remains. **Only three nodes** — keep it to three so the effort looks short. The account signup happens *inside* step 3, not as a fourth node (deliberate: don't advertise the signup as extra work).

Nodes:
1. **Travel Profile**
2. **Trip Details**
3. **Your Itinerary**

Behavior: current step filled with Falu red (#7F1D1A), completed steps filled/checked, upcoming steps muted gray, connector line between. Clicking a completed step returns to it with data intact. Mirror the clean Zicasso-style stepper aesthetic but in the brand palette (cool gray base, Falu-red active).

Mobile: condense to "Step 2 of 3 · Trip Details" with a slim progress bar if three full nodes don't fit.

---

## Page 1 — Create Your Travel Profile

The showpiece. Lead here because the persona cards are the most engaging, lowest-friction screen. Keep everything after the persona selection light — persona carries most of the personalization weight.

**Fields:**
- **Persona selection** (the existing selector): one **primary** + up to two **influences**, from the twelve cards in `travel-personas.json`. Reuse the selector component already built.
- **Interests** (multi-select chips, pick any): Food & dining, History & heritage, Nature & outdoors, Art & architecture, Markets & shopping, Nightlife, Wellness & relaxation, Adventure & activity, Beaches & coast, Local life & people. Keep to ~10 chips, quick taps.
- **Pace** (single select): Relaxed · Balanced · Packed.
- **Dietary** (optional chips): Vegetarian · Vegan · Halal · No restriction.

That's it for Page 1 — persona + interests + two quick toggles. Resist adding more; length kills the flow.

**CTA:** "Next: Trip Details →"

---

## Page 2 — Trip Details

The transactional half. Zicasso's field set is a good checklist; mirror it.

**Fields:**
- **Destination** — searchable select, with "Add country" for multi-country trips.
- **Departure date** — date picker + "I'm flexible on dates" checkbox.
- **Trip length** — slider in nights (e.g., 3–30), live label ("7 nights").
- **Adults** — number stepper (− / +).
- **Traveling with children** — checkbox; if checked, reveal a simple count/ages input.
- **Budget band** (optional, single select): Budget · Comfortable · Premium · No limit. (Helps the engine; keep optional so it's not friction.)

**CTA:** "Create my itinerary →" (triggers generation, advances to Page 3)

---

## Page 3 — Your Itinerary

The conversion hinge. Generate and show the **free** itinerary in-page immediately, then present the account unlock for the **detailed** version.

### 3a. Free itinerary (shown to everyone, no signup)
Generated server-side on arrival. The free tier is the **overview** — genuinely useful, proves the engine, but clearly not the full thing:
- The trip's geographic clustering (the wuwei "shape" of the plan)
- Persona-matched framing/voice (so they feel the personalization)
- A handful of flagship recommendations per cluster
- NOT the full day-by-day, NOT the matched dining, NOT bookable specifics

### 3b. The unlock (account creation)
Directly beneath the free output:

> **Unlock your detailed itinerary**
> Create your free account to get the full day-by-day plan — and we'll save your travel profile so your next trip starts ready.
> ☑ Include Bib Gourmand dining matched to your travel profile
> [ email ] [ password ]  → **Create account & unlock**
> Already have an account? Log in.

Notes:
- The **Bib Gourmand checkbox lives here**, inside the detailed unlock — it's a signed-up perk, not a free-tier option. It's pre-checked and framed as included; it's one of the strongest reasons to sign up, so feature it.
- Frame the signup around BOTH the report and the saved profile (the saved profile is why the account has lasting value).
- On success: render the detailed itinerary in place, write the profile + trip to Supabase, user is now logged in.
- Keep the user on-page through signup (inline email+password, see auth below) — do not bounce them away mid-flow.

### 3c. Detailed itinerary (post-signup)
Full day-by-day plan, per-day structure, the Bib Gourmand matched dining applied, specific recommendations. This is what the account unlocks.

---

## Auth & data layer (Supabase)

This is the backbone of the user-count/saved-data strategy — build it properly, not as a quick email grab.

**Auth:** Supabase Auth, email + password, inline on Page 3 (keeps users in-flow; magic link is an acceptable alternative but interrupts the flow by sending them to email). Add a consent checkbox at signup linking the privacy policy.

**Schema:**

```sql
-- profiles: one per user, holds the durable travel profile
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  persona_primary text,             -- slug, e.g. 'street-food-wanderer'
  persona_influences text[],        -- up to 2 slugs
  interests text[],
  pace text,
  dietary text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- trips: many per user, each a planned itinerary
create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  destination text,
  countries text[],
  depart_date date,
  flexible_dates boolean default false,
  nights int,
  adults int,
  children boolean default false,
  child_ages text[],
  budget_band text,
  bib_gourmand boolean default false,
  itinerary_basic jsonb,            -- the free overview
  itinerary_detailed jsonb,         -- the unlocked full plan
  created_at timestamptz default now()
);
```

**Row-level security:** enable RLS on both; policy = users can select/insert/update/delete only rows where `id`/`user_id = auth.uid()`. Non-negotiable — without it any user could read others' data.

**Write timing:** anonymous users hold form state client-side (sessionStorage/localStorage is fine in the real site) through Pages 1–2 and the free report. On signup, write `profiles` (from Page 1 data) and `trips` (from Page 2 + generated itineraries) in one transaction.

---

## Returning-user flow (the payoff — don't skip this)

The saved account is worthless if a returning user has to re-enter everything. This path is what makes the strategy real:

- **Logged-in user hits `/plan`:** detect the Supabase session. Skip/pre-fill Page 1 from their saved `profiles` row. Greet: "Welcome back — your travel style's set. Planning another trip?" Drop them at **Page 2 (Trip Details)**.
- They fill trip details → generate → **detailed itinerary available immediately** (no second signup; they already have an account). Bib Gourmand on by default.
- Each trip saves as a new `trips` row tied to their account.
- Provide an "Edit my travel profile" affordance so they can adjust persona/interests, writing back to `profiles`.

So: **profile created once, trips planned many times against it.** That repeat-use loop is the engagement metric the funding story rests on.

---

## Generation engine (dependency)

Page 3 calls a **Netlify function** that builds the itinerary. It imports `personaVoice.js` (already parked in `netlify/functions/`) to convert the persona selection into writing guidance, and reads `foodWeighting` from the persona data. The function returns two tiers from the same inputs:
- `basic` — the overview (clusters, flagship picks, persona voice)
- `detailed` — full day-by-day + Bib Gourmand matched dining (only rendered/saved after signup)

Keep the model call server-side so the API key never reaches the browser. (This engine isn't built yet; this spec defines the output contract it must satisfy.)

---

## Privacy / legal (in scope from user #1)

Storing personal data against identities triggers basic obligations — cheaper to do now than retrofit:
- A simple **privacy policy** page, linked from the signup consent checkbox.
- **Account & data deletion** (a "delete my account" action; `on delete cascade` in the schema already handles the data side).
- Don't put any personal data in URLs/query strings.

---

## Build sequencing (discrete commits)

1. **Progress map + 3-page shell** with form state persisted across steps (no generation yet).
2. **Page 1 + Page 2** fully wired, data held client-side.
3. **Generation function** (basic + detailed contract) server-side.
4. **Page 3 free output** rendering from the function.
5. **Supabase auth + schema + RLS**, the signup-unlock writing profile + trip.
6. **Returning-user flow** (session detection, profile pre-load, skip to Page 2).
7. **Privacy policy + account deletion.**

Verify each before the next — especially RLS (5) and the returning-user path (6), the two pieces most likely to be silently broken.
