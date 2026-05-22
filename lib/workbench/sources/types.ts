/**
 * Workbench source adapter types.
 *
 * A "source" is anything the Shelf can pull cards from:
 *   uploaded — files dropped into the Workbench from outside MAIA
 *   ideas    — MAIA Ideas (Slice 3)
 *   keep     — Keep captures (Slice 3)
 *   journals — Journal entries (Slice 3)
 *   decisions — Studio Decisions (Slice 3)
 *
 * Each adapter implements WorkbenchSource and is responsible for filtering
 * out Sanctuary-marked captures before returning. The Shelf endpoint fans
 * out across all enabled sources.
 *
 * Cards are pointers, not copies — content is resolved at read time via
 * adapter.resolve(ref). See WORKBENCH_ARCHITECTURE_v0.md §5.
 */

export type WorkbenchSourceKind =
  | 'uploaded'
  | 'ideas'
  | 'keep'
  | 'journals'
  | 'decisions';

export interface WorkbenchCardRef {
  source: WorkbenchSourceKind;
  ref: string;          // source-native id (uuid for uploads, idea_id for ideas, etc.)
  title: string;        // short display
  preview: string;      // first ~140 chars
  createdAt: string;    // ISO 8601
  tags?: string[];
}

export interface WorkbenchSourceQuery {
  arrangerId: string;
  text?: string;
  from?: string;        // ISO date
  to?: string;
  tag?: string;
}

export interface ResolvedCard {
  content: string;
  meta: Record<string, unknown>;
}

export interface WorkbenchSource {
  kind: WorkbenchSourceKind;
  search(q: WorkbenchSourceQuery): Promise<WorkbenchCardRef[]>;
  resolve(ref: string, arrangerId: string): Promise<ResolvedCard | null>;
}

/**
 * Card pointer as stored inside workbench_tables.layout JSON.
 * Stable shape — changing this requires a layout migration.
 */
export interface CardPointer {
  id: string;           // c_<uuid>
  source: WorkbenchSourceKind;
  ref: string;
}

export interface TableGroup {
  id: string;           // g_<uuid>
  name: string;
  cards: CardPointer[];
}

export interface TableLayout {
  groups: TableGroup[];
}
