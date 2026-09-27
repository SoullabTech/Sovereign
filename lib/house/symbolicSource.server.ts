import { query } from '@/lib/db/postgres';

export type SymbolicEpistemicClass =
  | 'source_fact'
  | 'symbolic_tradition'
  | 'system_synthesis'
  | 'possible_expression'
  | 'member_meaning';

export type SymbolicSourceField = {
  epistemicClass: SymbolicEpistemicClass;
  label: string;
  value: string;
  authoredBy: 'member' | 'system' | 'tradition' | 'record';
};

export type DivinationSymbolicSourcePacket = {
  sourceFacet: 'divination';
  sourceRefId: string;
  kind: 'iching' | 'tarot' | 'runes';
  label: string;
  returnHref: string;
  fields: SymbolicSourceField[];
};

type DivinationKind = DivinationSymbolicSourcePacket['kind'];

function parseRef(value: string): { kind: DivinationKind; id: string } | null {
  const split = value.indexOf(':');
  if (split <= 0) return null;
  const kind = value.slice(0, split);
  const id = value.slice(split + 1);
  if ((kind !== 'iching' && kind !== 'tarot' && kind !== 'runes') || !id) return null;
  return { kind, id };
}
function field(
  epistemicClass: SymbolicEpistemicClass,
  label: string,
  value: string | null | undefined,
  authoredBy: SymbolicSourceField['authoredBy'],
): SymbolicSourceField | null {
  const clean = value?.trim();
  return clean ? { epistemicClass, label, value: clean, authoredBy } : null;
}

function packet(
  sourceRefId: string,
  kind: DivinationKind,
  label: string,
  fields: Array<SymbolicSourceField | null>,
): DivinationSymbolicSourcePacket {
  return {
    sourceFacet: 'divination',
    sourceRefId,
    kind,
    label,
    returnHref: '/oracle/reflections?reading=' + encodeURIComponent(sourceRefId),
    fields: fields.filter((item): item is SymbolicSourceField => Boolean(item)),
  };
}

function kindLabel(kind: DivinationKind): string {
  return kind === 'iching' ? 'I Ching' : kind === 'tarot' ? 'Tarot' : 'Runes';
}

export async function resolveDivinationSymbolicSourcePacket(
  memberId: string,
  sourceRefId: string,
): Promise<DivinationSymbolicSourcePacket | null> {
  const parsed = parseRef(sourceRefId);
  if (!parsed) return null;

  if (parsed.kind === 'iching') {
    const result = await query<{
      id: string;
      question: string | null;
      primary_hex: number;
      primary_hex_name: string;
      lower_trigram: string | null;
      upper_trigram: string | null;
      relating_hex: number | null;
      relating_hex_name: string | null;
      interpretation_text: string | null;
      guidance_text: string | null;
      member_notes: string | null;
    }>(
      `SELECT id::text AS id, question, primary_hex, primary_hex_name,
              lower_trigram, upper_trigram, relating_hex, relating_hex_name,
              interpretation_text, guidance_text, member_notes
         FROM divination_iching_readings
        WHERE id::text = $1 AND user_id = $2
        LIMIT 1`,
      [parsed.id, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;

    const cast = [
      `Hexagram ${row.primary_hex}: ${row.primary_hex_name}`,
      row.upper_trigram && row.lower_trigram
        ? `${row.upper_trigram} over ${row.lower_trigram}`
        : '',
      row.relating_hex
        ? `Relating hexagram ${row.relating_hex}: ${row.relating_hex_name || ''}`.trim()
        : '',
    ].filter(Boolean).join(' · ');

    return packet(sourceRefId, 'iching', kindLabel('iching'), [
      field('source_fact', 'Question asked', row.question, 'member'),
      field('source_fact', 'Cast', cast, 'record'),
      field('system_synthesis', 'Generated interpretation', row.interpretation_text, 'system'),
      field('system_synthesis', 'Generated guidance', row.guidance_text, 'system'),
      field('member_meaning', 'Your notes', row.member_notes, 'member'),
    ]);
  }

  if (parsed.kind === 'tarot') {
    const result = await query<{
      id: string;
      question: string | null;
      spread_type: string;
      cards_json: Array<{ card?: string; position?: string; reversed?: boolean }> | string;
      interpretation_text: string | null;
      guidance_text: string | null;
      member_notes: string | null;
    }>(
      `SELECT id::text AS id, question, spread_type, cards_json,
              interpretation_text, guidance_text, member_notes
         FROM divination_tarot_readings
        WHERE id::text = $1 AND user_id = $2
        LIMIT 1`,
      [parsed.id, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    const cards = typeof row.cards_json === 'string' ? JSON.parse(row.cards_json) : row.cards_json;
    const cardLine = Array.isArray(cards)
      ? cards.map((card) =>
          `${card.card || 'Card'}${card.reversed ? ' (reversed)' : ''}${card.position ? ' — ' + card.position : ''}`
        ).join('; ')
      : '';

    return packet(sourceRefId, 'tarot', kindLabel('tarot'), [
      field('source_fact', 'Question asked', row.question, 'member'),
      field('source_fact', 'Spread', row.spread_type.replace(/_/g, ' '), 'record'),
      field('source_fact', 'Cards drawn', cardLine, 'record'),
      field('system_synthesis', 'Generated interpretation', row.interpretation_text, 'system'),
      field('system_synthesis', 'Generated guidance', row.guidance_text, 'system'),
      field('member_meaning', 'Your notes', row.member_notes, 'member'),
    ]);
  }

  const result = await query<{
    id: string;
    question: string | null;
    cast_type: string;
    runes_json: Array<{
      rune?: string;
      position?: string;
      reversed?: boolean;
      meaning?: string;
    }> | string;
    wyrd_message: string | null;
    interpretation_text: string | null;
    guidance_text: string | null;
    member_notes: string | null;
  }>(
    `SELECT id::text AS id, question, cast_type, runes_json, wyrd_message,
            interpretation_text, guidance_text, member_notes
       FROM divination_runes_readings
      WHERE id::text = $1 AND user_id = $2
      LIMIT 1`,
    [parsed.id, memberId],
  );
  const row = result.rows[0];
  if (!row) return null;
  const runes = typeof row.runes_json === 'string' ? JSON.parse(row.runes_json) : row.runes_json;
  const runeLine = Array.isArray(runes)
    ? runes.map((rune) =>
        `${rune.rune || 'Rune'}${rune.reversed ? ' (merkstave)' : ''}${rune.position ? ' — ' + rune.position : ''}`
      ).join('; ')
    : '';
  const tradition = Array.isArray(runes)
    ? runes
        .filter((rune) => rune.meaning)
        .map((rune) => `${rune.rune || 'Rune'}: ${rune.meaning}`)
        .join('\n')
    : '';

  return packet(sourceRefId, 'runes', kindLabel('runes'), [
    field('source_fact', 'Question asked', row.question, 'member'),
    field('source_fact', 'Cast', row.cast_type.replace(/_/g, ' '), 'record'),
    field('source_fact', 'Runes drawn', runeLine, 'record'),
    field('symbolic_tradition', 'Stored rune meanings', tradition, 'tradition'),
    field('system_synthesis', 'Wyrd message', row.wyrd_message, 'system'),
    field('system_synthesis', 'Generated interpretation', row.interpretation_text, 'system'),
    field('system_synthesis', 'Generated guidance', row.guidance_text, 'system'),
    field('member_meaning', 'Your notes', row.member_notes, 'member'),
  ]);
}
