/**
 * /api/tenant/theme
 *
 * Stable internal contract for tenant theming.
 * Aliases to practitioner theme routes.
 *
 * Use this path when tenant may not always equal practitioner
 * (teams, clinics, schools - future).
 */

export { GET, PUT } from "@/app/api/practitioner/theme/route";
