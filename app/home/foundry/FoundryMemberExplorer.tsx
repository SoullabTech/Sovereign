'use client';

import { useMemo, useState } from 'react';
import type { MemberResearchEntry } from '@/lib/foundry/memberResearch';
import styles from './member-foundry.module.css';

interface FoundryMemberExplorerProps {
  entries: MemberResearchEntry[];
}

/**
 * Plain client-side search/filter on a static curated public research list.
 * No fetch, accounts, telemetry, localStorage, model calls or tool execution.
 */
export function FoundryMemberExplorer({ entries }: FoundryMemberExplorerProps) {
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [lane, setLane] = useState('all');

  const areas = useMemo(
    () => [...new Set(entries.map((item) => item.area))].sort(),
    [entries],
  );
  const lanes = useMemo(
    () => [...new Set(entries.flatMap((item) => item.could_inform))].sort(),
    [entries],
  );
  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return entries.filter((item) => {
      if (area !== 'all' && item.area !== area) return false;
      if (lane !== 'all' && !item.could_inform.includes(lane)) return false;
      if (!q) return true;
      return [
        item.name, item.area, item.purpose, item.research_caution,
        ...item.could_inform,
      ].join(' ').toLocaleLowerCase().includes(q);
    });
  }, [entries, search, area, lane]);

  const hasFilters = Boolean(search || area !== 'all' || lane !== 'all');
  const clear = () => { setSearch(''); setArea('all'); setLane('all'); };

  return (
    <div className={styles.explorer}>
      <div className={styles.filters} role="search" aria-label="Search Foundry research sources">
        <label className={styles.searchInput}>
          <span>Find a source or idea</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try writing, local AI, evaluation…"
            autoComplete="off"
          />
        </label>
        <label>
          <span>Area</span>
          <select value={area} onChange={(event) => setArea(event.target.value)}>
            <option value="all">All research areas</option>
            {areas.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Could inform</span>
          <select value={lane} onChange={(event) => setLane(event.target.value)}>
            <option value="all">Every Soullab area</option>
            {lanes.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className={styles.resultBar}>
        <p role="status" aria-live="polite">
          <strong>{visible.length}</strong> of {entries.length} public research leads
        </p>
        {hasFilters && (
          <button type="button" className={styles.clear} onClick={clear}>
            Clear filters
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <div className={styles.cards}>
          {visible.map((source) => (
            <article key={source.id} className={styles.sourceCard}>
              <div className={styles.sourceTop}>
                <p className={styles.sourceArea}>{source.area}</p>
                <span className={styles.sourceStanding}>Under study</span>
              </div>
              <h3>{source.name}</h3>
              <p className={styles.sourcePurpose}>{source.purpose}</p>
              <div className={styles.sourceTags} aria-label="Potential areas of study">
                {source.could_inform.map((topic) => <span key={topic}>{topic}</span>)}
              </div>
              <details className={styles.sourceDetails}>
                <summary>What remains to be checked?</summary>
                <p>{source.research_caution}</p>
                <p>
                  Exact software licenses, dependencies, security and product
                  suitability are not yet approved.
                </p>
              </details>
              <div className={styles.sourceFooter}>
                <span>
                  {source.source_standing === 'DOCUMENTATION_SURVEYED'
                    ? 'Public documentation explored'
                    : 'Public link nominated; review pending'}
                </span>
                <a
                  href={source.public_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={'View public source for ' + source.name + ' (opens external website)'}
                >
                  View source <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No research leads match these filters.</p>
          <button type="button" onClick={clear}>Show all sources</button>
        </div>
      )}
    </div>
  );
}
