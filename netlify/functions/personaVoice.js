/**
 * personaVoice.js — Monde Méandre itinerary engine
 * ------------------------------------------------------------
 * Translates a traveler's persona selection (one primary + up to two
 * influences) into a block of guidance that steers how the itinerary is
 * written and which places/restaurants get favored.
 *
 * Keyed to the same slugs as travel-personas.json. Pair each persona's VOICE
 * (tone + content steer) with its foodWeighting (already in the JSON) when
 * building the engine's system prompt.
 *
 * Usage:
 *   import { buildPersonaDirective } from "./personaVoice";
 *   const directive = buildPersonaDirective("street-food-wanderer",
 *                       ["fearless-eater", "fast-friend"], personasById);
 *   // inject `directive` into the itinerary-generation system prompt.
 */

// Full voice instruction — used for the PRIMARY persona (full weight).
export const PERSONA_VOICE = {
  "street-food-wanderer":
    "Write in an earthy, street-level voice. Build the plan around hawker stalls, night markets, and hole-in-the-wall spots locals actually eat at — cheap, authentic, unpretentious. Favor walkable food neighborhoods and the route between stalls over polished destinations. Avoid tourist-trap restaurants and fine dining.",
  "fearless-eater":
    "Write with adventurous, curious energy. Foreground unusual, regional, and challenging dishes most travelers skip — markets, specialty stalls, bold local specialties. Encourage trying the unfamiliar, always framed with cultural respect and a little context, never as a stunt.",
  "literary-observer":
    "Write in a reflective, observational, unhurried voice. Favor slow travel — trains, long walks, quiet cafés, and the places between the famous sights. Emphasize atmosphere, history, and people-watching over ticking off attractions. Lean on enduring local institutions.",
  "philosophical-drifter":
    "Write loose and unhurried. Avoid rigid scheduling — offer open-ended suggestions with room to wander and permission to detour. Favor scenic routes, spontaneous discovery, and unplanned time over a packed agenda. Frame the journey itself as the point.",
  "self-discoverer":
    "Write calm and contemplative. Favor stillness — temples, gardens, quiet mornings, meditative spaces, gentle nature. Build in real downtime and reflection rather than a full schedule. Keep food simple, healthful, and mindful. Steer away from crowds and rush.",
  "camera-eye":
    "Write with a visual, atmospheric eye. Prioritize photogenic places, golden-hour timing, characterful streets, and candid human moments. Call out the best light and vantage points. Favor visually rich, textured locations over generic landmarks.",
  "fast-friend":
    "Write warm and social. Favor communal tables, lively shared dining, food halls, sociable bars, and places to actually meet people. Emphasize conviviality and connection; frame the trip around the people as much as the sights.",
  "luxury-curator":
    "Write refined and discerning. Recommend the best-considered version of each thing — a standout table, a beautiful room, a seamless experience — quality over quantity and over value. Offer the one well-judged choice rather than many. Tasteful and understated, never flashy.",
  "adventurer":
    "Write active and energetic. Favor physical, outdoor, kinetic experiences — hikes, dives, climbs, early starts, the earned view. Build movement and a little challenge into each day. Keep food hearty and casual, near the action.",
  "restorative":
    "Write soothing and unhurried. Favor wellness and rest — spas, hot springs, slow mornings, quiet retreats — with generous downtime built in. Keep food light, healthful, and nourishing. Optimize for how restored the trip feels, not how much it covers.",
  "culture-driven":
    "Write engaged and curious about local life. Favor heritage, history, language, festivals, and locally significant experiences. Recommend regional, traditional dishes with genuine cultural context. Emphasize understanding the place, not just seeing it.",
  "nightlifer":
    "Write energetic and after-dark. Favor nightlife — music, rooftops, bars, buzzing districts, the city at night — and skew the daily rhythm later. Recommend late-night eats and the liveliest areas. Frame the destination through its nights as much as its days.",
};

// Short voice tag — used for INFLUENCE personas (lighter weight).
export const PERSONA_VOICE_SHORT = {
  "street-food-wanderer": "a pull toward authentic local street food",
  "fearless-eater": "a taste for the bold and unfamiliar",
  "literary-observer": "a slow, observational, unhurried streak",
  "philosophical-drifter": "a loose, wander-friendly looseness",
  "self-discoverer": "a need for stillness and reflection",
  "camera-eye": "an eye for photogenic, atmospheric moments",
  "fast-friend": "a warm, social, meet-people instinct",
  "luxury-curator": "a taste for the refined and well-considered",
  "adventurer": "an appetite for active, outdoor challenge",
  "restorative": "a craving for rest and wellness",
  "culture-driven": "a hunger to understand local culture",
  "nightlifer": "an after-dark, nightlife-seeking energy",
};

/**
 * Builds the persona directive to inject into the itinerary system prompt.
 *
 * @param {string} primaryId            slug of the primary persona
 * @param {string[]} influenceIds       up to two influence slugs
 * @param {Object} personasById         map of id -> persona object (from JSON),
 *                                       used to pull name + foodWeighting
 * @returns {string} directive text
 */
export function buildPersonaDirective(primaryId, influenceIds = [], personasById = {}) {
  const primary = personasById[primaryId];
  const primaryName = primary?.name ?? primaryId;
  const primaryFood = primary?.foodWeighting ?? "";

  let out =
    `TRAVELER STYLE — write the entire itinerary to fit this traveler.\n` +
    `Primary style: ${primaryName}. ${PERSONA_VOICE[primaryId] ?? ""}\n` +
    (primaryFood ? `Food preference: ${primaryFood}\n` : "");

  const valid = influenceIds.filter((id) => id && id !== primaryId && PERSONA_VOICE_SHORT[id]);
  if (valid.length) {
    const tags = valid
      .map((id) => `${personasById[id]?.name ?? id} (${PERSONA_VOICE_SHORT[id]})`)
      .join(" and ");
    out +=
      `Secondary influences: also let ${tags} subtly shade the plan — ` +
      `present but secondary, never overriding the primary style.\n`;
  }

  out +=
    `Resolve conflicts in favor of the primary style. Keep the voice consistent ` +
    `with it throughout, including how you describe places and food.`;

  return out;
}

/**
 * Convenience: turn the JSON personas array into an id-keyed map.
 *   import personasData from "../data/travel-personas.json";
 *   const personasById = indexPersonas(personasData.personas);
 */
export function indexPersonas(personasArray = []) {
  return personasArray.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
}

/* ------------------------------------------------------------------
 * EXAMPLE — where this plugs into the engine's LLM call:
 *
 *   import personasData from "../data/travel-personas.json";
 *   import { buildPersonaDirective, indexPersonas } from "./personaVoice";
 *
 *   const personasById = indexPersonas(personasData.personas);
 *   const directive = buildPersonaDirective(primaryId, influenceIds, personasById);
 *
 *   const systemPrompt =
 *     `You are the Monde Méandre itinerary planner. Build a clustered, ` +
 *     `geography-first plan for the traveler's destination and dates.\n\n` +
 *     directive;
 *
 *   // ...pass systemPrompt as the system message in the model call.
 * ------------------------------------------------------------------ */
