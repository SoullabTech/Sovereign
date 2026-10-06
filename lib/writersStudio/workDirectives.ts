export const WORK_DIRECTIVE_KINDS = ['protect', 'decision', 'open_question'] as const;
export type WorkDirectiveKind = typeof WORK_DIRECTIVE_KINDS[number];

export const WORK_DIRECTIVE_LABEL: Record<WorkDirectiveKind, string> = {
  protect: 'What to protect',
  decision: 'Decisions we’ve made',
  open_question: 'Still open',
};

export type WorkDirectiveEvent = 'revise' | 'retire' | 'restore';

export interface WorkDirective {
  id: string;
  workId: string;
  kind: WorkDirectiveKind;
  text: string;
  active: boolean;
  createdAt: string;
  lastChangedAt: string;
}

export function isWorkDirectiveKind(value: unknown): value is WorkDirectiveKind {
  return typeof value === 'string'
    && (WORK_DIRECTIVE_KINDS as readonly string[]).includes(value);
}

export function isWorkDirectiveEvent(value: unknown): value is WorkDirectiveEvent {
  return value === 'revise' || value === 'retire' || value === 'restore';
}

export function workDirectiveContext(directives: readonly WorkDirective[]): string {
  const active = directives.filter((directive) => directive.active);
  if (active.length === 0) return '';

  const groups: Record<WorkDirectiveKind, string[]> = {
    protect: [],
    decision: [],
    open_question: [],
  };
  for (const directive of active) groups[directive.kind].push(directive.text);

  const lines = [
    'WRITER DIRECTIVES — current Work-level editorial context, authored by the writer.',
    'These statements guide how you understand and discuss this Work. They are not manuscript prose and do not authorize edits.',
  ];

  const add = (kind: WorkDirectiveKind, instruction: string) => {
    if (groups[kind].length === 0) return;
    lines.push('', WORK_DIRECTIVE_LABEL[kind].toUpperCase());
    for (const value of groups[kind]) lines.push('- ' + value);
    lines.push(instruction);
  };

  add(
    'protect',
    'Protect these when proposing editorial changes. If a requested change would conflict, name the conflict rather than silently overriding the writer.',
  );
  add(
    'decision',
    'Treat these as the writer’s current settled editorial decisions for this Work unless the writer revises them.',
  );
  add(
    'open_question',
    'These remain unresolved. Do not convert them into settled meaning or structure.',
  );

  return lines.join('\n');
}
