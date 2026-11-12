/**
 * MAIA knows the Astrology Pro workstation's own tools.
 *
 * Modeled on lib/writersStudio/studioGuide.ts (Design 1A). Given to MAIA in
 * every Pro "Talk with MAIA" question (not the deep reading), so that when an
 * astrologer asks how to do something she points to the real control instead
 * of guessing.
 *
 * Founder direction 2026-11-11: in Pro, MAIA mainly speaks about technical,
 * platform and astrology questions.
 *
 * ⛔ Every `label` must be text the workstation actually shows. The guard test
 * (`__tests__/proGuide.test.ts`) fails if a label is absent from the UI
 * source, so MAIA is never told about a control that does not exist.
 * ⛔ She describes and points; she cannot press anything, save a chart, make a
 * link or change a setting for the astrologer.
 */

export type ProControl = {
  /** Exactly as shown on screen. */
  readonly label: string;
  readonly where: string;
  readonly does: string;
};

export const PRO_CONTROLS: readonly ProControl[] = [
  // Opening a chart
  { label: 'Open my chart', where: 'in the middle of the screen when no chart is open', does: 'opens the astrologer\'s own chart from the birth details held by their account' },
  { label: 'Edit my birth details', where: 'under Open my chart', does: 'goes to account settings, where the astrologer\'s own birth details are kept' },
  { label: 'Close chart', where: 'top bar, while a chart is open', does: 'closes the open chart' },
  { label: 'Calculation method and limits', where: 'the ⓘ button beside the house system in the top bar', does: 'shows how the chart is calculated and its declared limits' },
  // The wheel
  { label: 'Max orb', where: 'above the wheel', does: 'filters which aspect lines are drawn by orb' },
  { label: 'Orbs', where: 'above the wheel, beside Max orb', does: 'sets the orb allowed for each aspect' },
  // The rail
  { label: 'Chart', where: 'first tool on the rail (key 1)', does: 'the selected point\'s position and aspects, with tabs for Aspects, Views and Houses' },
  { label: 'Explore', where: 'in the Chart tool, beside Calculated', does: 'background on the selected point' },
  { label: 'My notes', where: 'in the Chart tool, beside Explore', does: 'the astrologer\'s own notes on the selected point' },
  { label: 'Aspects', where: 'a tab in the Chart tool, and a switch above the wheel', does: 'the aspect grid and declinations; the switch shows or hides aspect lines' },
  { label: 'Views', where: 'a tab in the Chart tool', does: 'alternative views of the chart (sidereal, harmonic, chart points)' },
  { label: 'Houses', where: 'a tab in the Chart tool, and a switch above the wheel', does: 'the Spiralogic house wheel; the switch shows or hides house lines' },
  { label: 'Timing', where: 'second tool on the rail (key 2)', does: 'transits, progressions and a graphical ephemeris' },
  { label: 'Show transits', where: 'in Timing → Transits, beside the date and time', does: 'puts the sky at that moment on an outer ring' },
  { label: 'Live clock', where: 'in Timing → Transits', does: 'keeps the outer ring at the present moment' },
  { label: 'Progressions', where: 'a tab in Timing', does: 'progressed positions for a chosen date' },
  { label: 'Ephemeris', where: 'a tab in Timing', does: 'a graphical ephemeris' },
  { label: 'Relationships', where: 'third tool on the rail (key 3)', does: 'two charts compared, and questions for relational awareness' },
  { label: 'Two charts', where: 'a tab in Relationships', does: 'chooses a second saved chart and compares the two' },
  { label: 'Places', where: 'fourth tool on the rail (key 4)', does: 'the astro map and relocation' },
  { label: 'Draw astro map', where: 'in Places', does: 'draws the angle lines of each planet across a world map' },
  { label: 'Relocate', where: 'in Places, beside a city field', does: 'recalculates the chart for a chosen place; clicking the map also chooses a place' },
  { label: 'Traditions', where: 'fifth tool on the rail (key 5)', does: 'the same birth moment in the Vedic, Chinese and Mayan systems' },
  { label: 'Ayanamsa', where: 'in Traditions, when Vedic is chosen', does: 'chooses the sidereal correction' },
  { label: 'Ten-year cycles', where: 'in Traditions, when Chinese is chosen', does: 'the luck pillars (Da Yun), with the direction chosen by the astrologer' },
  { label: 'Path of life', where: 'in Traditions, when Mayan is chosen', does: 'the Dreamspell path of life (a modern system, separate from the traditional count)' },
  { label: 'Readings', where: 'sixth tool on the rail (key 6)', does: 'written readings: Deep reading, Soul Portrait and Tradition report' },
  { label: 'Deep reading', where: 'a tab in Readings', does: 'a long reading MAIA writes when asked, optionally with life notes the astrologer adds' },
  { label: 'Tradition report', where: 'a tab in Readings', does: 'what tradition says about the placements' },
  { label: 'Research', where: 'seventh tool on the rail (key 7)', does: 'a table of calculated positions, chart and geometric houses, motion and aspects' },
  { label: 'Study', where: 'eighth tool on the rail (key 8)', does: 'short lessons on method, and one lesson per tool, using the open chart as the example' },
  { label: 'Saved charts', where: 'ninth tool on the rail (key 9)', does: 'charts for other people, which only the astrologer can see' },
  { label: 'New chart', where: 'in Saved charts', does: 'adds a chart for another person; the astrologer must confirm they have that person\'s permission to keep the birth details' },
  { label: 'Open chart', where: 'on each saved chart', does: 'opens that chart in the wheel' },
  { label: 'Share link', where: 'on each saved chart', does: 'the same private client link as Share with client' },
  { label: 'Share with client', where: 'top bar, while a saved chart is open', does: 'makes a private, view-only link to that person\'s chart and transits, only after the astrologer ticks that the person agreed; it can be turned off at any time' },
  // MAIA
  { label: 'Talk with MAIA', where: 'top bar, and the bar at the foot of the tools while a chart is open', does: 'opens this conversation about the open chart; before a chart is open it opens How do I…? help' },
  { label: 'Back to the tools', where: 'top of this conversation', does: 'returns to the tools; key M toggles' },
  { label: 'Mentor', where: 'top right of this conversation, beside Ask', does: 'teaching the technique, with the chart only as the example' },
  { label: 'How do I…?', where: 'top right of this conversation, beside Ask and Mentor, and in this conversation before a chart is open', does: 'questions about the workstation and techniques in general; MAIA reads no chart in this mode' },
  { label: 'In depth', where: 'in this conversation, beside Brief', does: 'a fuller answer' },
  { label: 'Draw on all systems', where: 'in this conversation', does: 'adds progressions, the Four Pillars and the Maya count to what MAIA reads' },
  { label: 'Read this with what you know about me', where: 'in this conversation, for the astrologer\'s own chart only', does: 'MAIA reads the chart alongside what the astrologer has chosen to keep with her, for this conversation only' },
];

export function proGuideInstruction(): string {
  const lines = PRO_CONTROLS.map((c) => `- "${c.label}" (${c.where}): ${c.does}.`);
  return [
    'THE WORKSTATION YOU ARE IN',
    'This is Astrology Pro, a private preview. Here you mainly help with three kinds of question: astrology (the chart in front of them, techniques, and the traditions), the workstation itself (where something is, what a tool does, how saving and sharing work), and its technical side (how figures are calculated and the declared limits). If they ask about something else, answer briefly and say this space is for astrology and the workstation; the main MAIA conversation is the place for the rest of life.',
    'When they ask how to do something here, name the real control and say where it is, using the list below. Only name controls from this list. If what they want is not here, say plainly that you do not know of a control for it; do not invent one or guess at a location. You cannot press any control, save a chart, make a link or change a setting for them; they do it themselves. The rule to use only the facts below applies to the chart; this list is for how the workstation works.',
    'Declared limits: astronomical accuracy is not yet independently certified; birthplaces beyond 66° latitude are not supported; some historical time zones cannot be calculated exactly; lunar nodes are mean positions; the source of a stored birth time is not established, so a time to the minute is not necessarily accurate to the minute.',
    ...lines,
  ].join('\n');
}
