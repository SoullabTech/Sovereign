// lib/consciousness/frameworkRouter.ts

export type FrameworkLens =
  | "Jung"
  | "Somatic"
  | "CBT"
  | "IFS"
  | "Taoist"
  | "Coaching"
  | "Shamanic"
  | "Relational";

export type FrameworkRoute = {
  primary: FrameworkLens;
  secondary?: FrameworkLens;
  lensesUsed: FrameworkLens[]; // always includes primary (+secondary if present)
  reason: string; // internal only
};

export function routeFrameworkLens(input: string): FrameworkRoute {
  const t = input.toLowerCase();

  // Explicit user requests always win
  if (/(jung|archetype|shadow|anima|animus)/i.test(t))
    return { primary: "Jung", lensesUsed: ["Jung"], reason: "explicit jung request" };
  if (/(cbt|distortion|reframe|thoughts|catastroph)/i.test(t))
    return { primary: "CBT", lensesUsed: ["CBT"], reason: "explicit cbt request" };
  if (/(ifs|parts|protector|exile|manager|firefighter)/i.test(t))
    return { primary: "IFS", lensesUsed: ["IFS"], reason: "explicit ifs request" };
  if (/(somatic|body|nervous system|breath|ground)/i.test(t))
    return { primary: "Somatic", lensesUsed: ["Somatic"], reason: "explicit somatic request" };
  if (/(tao|wu wei|yin|yang|dao)/i.test(t))
    return { primary: "Taoist", lensesUsed: ["Taoist"], reason: "explicit taoist request" };
  if (/(ritual|ceremony|spirit|entity|attachment|soul retrieval)/i.test(t))
    return { primary: "Shamanic", lensesUsed: ["Shamanic"], reason: "explicit shamanic request" };

  // Implicit cues
  const traumaCue = /(panic|trauma|freeze|shutdown|hypervigilant)/i.test(t);
  const cognitionCue = /(overthink|ruminat|intrusive|thought loop|worry)/i.test(t);
  const relationshipCue = /(partner|relationship|conflict|argument|boundary)/i.test(t);
  const meaningCue = /(meaning|pattern|dream|symbol|myth)/i.test(t);

  // Relationship context takes priority when present (e.g., "my partner and I fight" + "I panic" → Relational primary)
  if (relationshipCue) return { primary: "Relational", secondary: traumaCue ? "Somatic" : "IFS", lensesUsed: traumaCue ? ["Relational", "Somatic"] : ["Relational", "IFS"], reason: "relational conflict cue" };
  if (traumaCue) return { primary: "Somatic", secondary: "Relational", lensesUsed: ["Somatic", "Relational"], reason: "trauma/regulation cue" };
  if (cognitionCue) return { primary: "CBT", secondary: "Somatic", lensesUsed: ["CBT", "Somatic"], reason: "cognitive loop cue" };
  if (meaningCue) return { primary: "Jung", secondary: "Somatic", lensesUsed: ["Jung", "Somatic"], reason: "meaning/symbol cue" };

  // Default: bond-safe practical guidance
  return { primary: "Relational", secondary: "Coaching", lensesUsed: ["Relational", "Coaching"], reason: "default" };
}

export function formatFrameworkRouterBlock(route: FrameworkRoute): string {
  const lenses = route.secondary ? `${route.primary} + ${route.secondary}` : route.primary;

  return `
FRAMEWORK ROUTER (internal)
- Primary lens: ${route.primary}
${route.secondary ? `- Secondary lens: ${route.secondary}` : ""}
- Use these lenses to shape the response (tone + moves).
- Do NOT name the lens unless the user asks (or Trust & Transparency is enabled).
- Avoid mixing more than 2 lenses in one answer.
- If user asks, you may offer: "Want this Jungian, somatic, or practical coaching?"
Chosen: ${lenses}
`.trim();
}
