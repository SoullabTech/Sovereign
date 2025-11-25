/**
 * Listening Test Score Sheet Template Generator
 * Creates CSV/TSV files for Google Sheets, Excel, or Notion import
 */

// Generate CSV template with sample data
export function generateTestScoreTemplate(format: 'csv' | 'tsv' = 'csv'): string {
  const delimiter = format === 'csv' ? ',' : '\t';

  // Headers
  const headers = [
    'Participant',
    'Test_Round',
    'Mask_ID',
    'Mask_Name',
    'Test_Phrase',
    'Clarity_1to5',
    'Distinctiveness_1to5',
    'Symbolic_Fit_1to5',
    'Comfort_1to5',
    'Resonance_1to5',
    'Overall_Score',
    'Images_Evoked',
    'Emotions_Felt',
    'Archetypal_Associations',
    'Freeform_Notes',
    'Suggested_Adjustments',
    'Timestamp'
  ].join(delimiter);

  // Sample data rows
  const sampleRows = [
    // Maya Threshold samples
    [
      'Kelly',
      'Blind',
      'maya-threshold',
      'Maya of the Threshold',
      'Welcome to the space between worlds',
      '4',
      '5',
      '4',
      '4',
      '5',
      '=AVERAGE(F2:J2)', // Excel formula
      'doorway; light beam; crystal',
      'alert; curious; invited',
      'guardian; herald; psychopomp',
      'Bright and sharp - felt like crossing a gate',
      '',
      '=NOW()'
    ],
    [
      'Alex',
      'Revealed',
      'maya-threshold',
      'Maya of the Threshold',
      'The spiral turns and so do you',
      '5',
      '5',
      '5',
      '4',
      '4',
      '=AVERAGE(F3:J3)',
      'threshold; liminal space',
      'anticipation; readiness',
      'guide; initiate',
      'Very clear presence at the edge',
      'Could use slightly more warmth',
      '=NOW()'
    ],

    // Maya Deep Waters samples
    [
      'Kelly',
      'Blind',
      'maya-deep-waters',
      'Maya of Deep Waters',
      'I hear the depth beneath your words',
      '3',
      '4',
      '5',
      '5',
      '5',
      '=AVERAGE(F4:J4)',
      'ocean; underwater cave; womb',
      'held; safe; deep',
      'mother; crone; deep feminine',
      'Warm and oceanic - like grandmother voice',
      'Clarity could be improved - too much reverb?',
      '=NOW()'
    ],
    [
      'Sam',
      'Revealed',
      'maya-deep-waters',
      'Maya of Deep Waters',
      'What you resist persists',
      '4',
      '5',
      '5',
      '5',
      '5',
      '=AVERAGE(F5:J5)',
      'deep pool; ancient well',
      'compassion; witness; depth',
      'shadow holder; wise woman',
      'Perfect for shadow work - very holding',
      '',
      '=NOW()'
    ],

    // Maya Spiral samples
    [
      'Morgan',
      'Blind',
      'maya-spiral',
      'Maya of the Spiral',
      'The spiral turns and so do you',
      '4',
      '5',
      '4',
      '3',
      '5',
      '=AVERAGE(F6:J6)',
      'spiral staircase; DNA helix; galaxy',
      'dizzy; transforming; cycling',
      'shapeshifter; alchemist',
      'Hypnotic but slightly disorienting',
      'Reduce modulation depth by 20%',
      '=NOW()'
    ],

    // Miles Grounded samples
    [
      'Jordan',
      'Blind',
      'miles-grounded',
      'Miles',
      'Welcome to the space between worlds',
      '5',
      '4',
      '4',
      '5',
      '4',
      '=AVERAGE(F7:J7)',
      'mountain; oak tree; stone',
      'steady; safe; grounded',
      'father; sage; earth keeper',
      'Very solid and reliable feeling',
      '',
      '=NOW()'
    ]
  ];

  // Combine into CSV
  const rows = [headers, ...sampleRows.map(row => row.join(delimiter))];

  // Add summary formulas section (for Excel/Sheets)
  rows.push('');
  rows.push('SUMMARY STATISTICS');
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].join(delimiter));
  rows.push(['Mask ID', 'Avg Clarity', 'Avg Distinct', 'Avg Symbolic', 'Avg Comfort', 'Avg Resonance', 'Overall Avg', 'Sample Size', '', '', '', '', '', '', '', '', ''].join(delimiter));
  rows.push(['maya-threshold', '=AVERAGEIF($C:$C,"maya-threshold",$F:$F)', '=AVERAGEIF($C:$C,"maya-threshold",$G:$G)', '=AVERAGEIF($C:$C,"maya-threshold",$H:$H)', '=AVERAGEIF($C:$C,"maya-threshold",$I:$I)', '=AVERAGEIF($C:$C,"maya-threshold",$J:$J)', '=AVERAGE(B11:F11)', '=COUNTIF($C:$C,"maya-threshold")', '', '', '', '', '', '', '', '', ''].join(delimiter));
  rows.push(['maya-deep-waters', '=AVERAGEIF($C:$C,"maya-deep-waters",$F:$F)', '=AVERAGEIF($C:$C,"maya-deep-waters",$G:$G)', '=AVERAGEIF($C:$C,"maya-deep-waters",$H:$H)', '=AVERAGEIF($C:$C,"maya-deep-waters",$I:$I)', '=AVERAGEIF($C:$C,"maya-deep-waters",$J:$J)', '=AVERAGE(B12:F12)', '=COUNTIF($C:$C,"maya-deep-waters")', '', '', '', '', '', '', '', '', ''].join(delimiter));
  rows.push(['maya-spiral', '=AVERAGEIF($C:$C,"maya-spiral",$F:$F)', '=AVERAGEIF($C:$C,"maya-spiral",$G:$G)', '=AVERAGEIF($C:$C,"maya-spiral",$H:$H)', '=AVERAGEIF($C:$C,"maya-spiral",$I:$I)', '=AVERAGEIF($C:$C,"maya-spiral",$J:$J)', '=AVERAGE(B13:F13)', '=COUNTIF($C:$C,"maya-spiral")', '', '', '', '', '', '', '', '', ''].join(delimiter));
  rows.push(['miles-grounded', '=AVERAGEIF($C:$C,"miles-grounded",$F:$F)', '=AVERAGEIF($C:$C,"miles-grounded",$G:$G)', '=AVERAGEIF($C:$C,"miles-grounded",$H:$H)', '=AVERAGEIF($C:$C,"miles-grounded",$I:$I)', '=AVERAGEIF($C:$C,"miles-grounded",$J:$J)', '=AVERAGE(B14:F14)', '=COUNTIF($C:$C,"miles-grounded")', '', '', '', '', '', '', '', '', ''].join(delimiter));

  return rows.join('\n');
}

// Generate iteration tracking template
export function generateIterationTemplate(format: 'csv' | 'tsv' = 'csv'): string {
  const delimiter = format === 'csv' ? ',' : '\t';

  const headers = [
    'Iteration',
    'Date',
    'Mask_ID',
    'Parameter_Changed',
    'Old_Value',
    'New_Value',
    'Reason',
    'Test_Score_Before',
    'Test_Score_After',
    'Improvement',
    'Notes'
  ].join(delimiter);

  const sampleRows = [
    [
      '1',
      '2024-03-15',
      'maya-deep-waters',
      'reverb_wetness',
      '45%',
      '35%',
      'Clarity score was 3.2 - too muddy',
      '3.2',
      '4.1',
      '+0.9',
      'Much clearer while maintaining depth'
    ],
    [
      '1',
      '2024-03-15',
      'maya-spiral',
      'modulation_depth',
      '0.3',
      '0.15',
      'Too disorienting - comfort was 3.0',
      '3.0',
      '3.8',
      '+0.8',
      'Still hypnotic but less vertigo-inducing'
    ],
    [
      '2',
      '2024-03-16',
      'maya-threshold',
      'eq_high_shelf',
      '+3dB',
      '+5dB',
      'Needs more presence to feel liminal',
      '4.2',
      '4.6',
      '+0.4',
      'Now has the alert quality we want'
    ],
    [
      '2',
      '2024-03-16',
      'miles-grounded',
      'pitch_shift',
      '-5',
      '-6',
      'Not distinct enough from maya-deep',
      '3.8',
      '4.3',
      '+0.5',
      'More earthy and distinct'
    ]
  ];

  return [
    headers,
    ...sampleRows.map(row => row.join(delimiter))
  ].join('\n');
}

// Generate symbolic pattern tracking template
export function generateSymbolicTemplate(format: 'csv' | 'tsv' = 'csv'): string {
  const delimiter = format === 'csv' ? ',' : '\t';

  const headers = [
    'Mask_ID',
    'Intended_Archetype',
    'Common_Images',
    'Common_Emotions',
    'Common_Associations',
    'Alignment_Score',
    'Misalignments',
    'Adjustments_Needed'
  ].join(delimiter);

  const rows = [
    [
      'maya-threshold',
      'Liminal guide / threshold guardian',
      'doorway; light; crystal; gate; bridge',
      'alert; curious; anticipatory; ready',
      'herald; psychopomp; guardian; initiate',
      '4.5',
      'None significant',
      'Consider adding slight echo for space'
    ],
    [
      'maya-deep-waters',
      'Shadow holder / maternal depths',
      'ocean; cave; womb; well; depths',
      'held; safe; emotional; witnessed',
      'mother; crone; wise woman; ancestor',
      '4.8',
      'None',
      'Perfect as is'
    ],
    [
      'maya-spiral',
      'Integration / transformation',
      'spiral; helix; vortex; wheel; cycle',
      'shifting; changing; dizzy; moving',
      'shapeshifter; alchemist; dancer',
      '3.9',
      'Too disorienting for some',
      'Reduce motion effects slightly'
    ],
    [
      'miles-grounded',
      'Earth father / steady presence',
      'mountain; tree; stone; earth; roots',
      'stable; safe; grounded; solid',
      'sage; father; elder; earth-keeper',
      '4.2',
      'Could be more distinct from Maya',
      'Deepen pitch further; reduce any reverb'
    ]
  ];

  return [
    headers,
    ...rows.map(row => row.join(delimiter))
  ].join('\n');
}

// Helper to save templates to files
export function downloadTemplate(type: 'scores' | 'iterations' | 'symbolic', filename?: string): void {
  let content: string;
  let defaultFilename: string;

  switch (type) {
    case 'scores':
      content = generateTestScoreTemplate('csv');
      defaultFilename = 'voice_mask_test_scores.csv';
      break;
    case 'iterations':
      content = generateIterationTemplate('csv');
      defaultFilename = 'voice_mask_iterations.csv';
      break;
    case 'symbolic':
      content = generateSymbolicTemplate('csv');
      defaultFilename = 'voice_mask_symbolic_patterns.csv';
      break;
  }

  // In browser environment
  if (typeof window !== 'undefined') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || defaultFilename;
    link.click();
  }

  // For Node.js environment (if needed)
  if (typeof window === 'undefined') {
    const fs = require('fs');
    fs.writeFileSync(filename || defaultFilename, content);
  }
}

// Rating scale reference for team alignment
export const RATING_SCALE_REFERENCE = `
RATING SCALE (1-5):

1 = Very Poor / Not Aligned
   - Clarity: Muddy, hard to understand
   - Distinctiveness: Sounds same as others
   - Symbolic Fit: Doesn't match description at all
   - Comfort: Unpleasant or fatiguing
   - Resonance: No emotional impact

3 = Neutral / Acceptable
   - Clarity: Understandable but not crisp
   - Distinctiveness: Somewhat different
   - Symbolic Fit: Partially matches
   - Comfort: Neither pleasant nor unpleasant
   - Resonance: Some emotional response

5 = Excellent / Fully Aligned
   - Clarity: Crystal clear articulation
   - Distinctiveness: Immediately recognizable
   - Symbolic Fit: Perfect archetypal match
   - Comfort: Very pleasant to hear
   - Resonance: Deeply moving/impactful

FREEFORM NOTES PROMPTS:
- What images came to mind?
- What emotions did you feel?
- What archetypes or myths did it evoke?
- Any specific memories or associations?
- What worked well? What felt off?
`;