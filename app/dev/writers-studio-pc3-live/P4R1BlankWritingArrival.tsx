'use client';

import Link from 'next/link';
import type { LivingWork, DeclaredMaterial } from '@/app/writers-studio/useLivingWorks';
import { FIRST_PAGE_COPY } from '@/lib/writersStudio/inspirationOpening';

type Props = {
  work: LivingWork;
  onStartWriting: () => void;
  onTalkWithMaia: () => void;
  onHelpBegin: () => void;
};

function materialLabel(material: DeclaredMaterial): string {
  if (material.materialType === 'idea') return 'Idea';
  if (material.materialType === 'source_upload') return 'Source';
  return 'Material';
}

function materialHref(material: DeclaredMaterial): string | null {
  if (material.materialType === 'idea') {
    return `/maia/ideas/${encodeURIComponent(material.materialId)}`;
  }
  if (material.materialType === 'source_upload') {
    return '/writers-studio/sources';
  }
  return null;
}

export default function P4R1BlankWritingArrival({
  work,
  onStartWriting,
  onTalkWithMaia,
  onHelpBegin,
}: Props) {
  const usableMaterials = work.materials.filter((material) =>
    material.materialType === 'idea' || material.materialType === 'source_upload',
  );

  return (
    /* B · The First Page (JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · S3). Not a card over the page: one invitation
       line where the first sentence will go, and MAIA nearby, silent until shown the page. The three beginnings stay,
       as quiet words rather than a menu of boxes. */
    <section className="p4r1-blank-arrival p4r1-blank-arrival--invitation" data-blank-writing-arrival data-first-page-invitation>
      <button type="button" className="p4r1-blank-invitation" onClick={onStartWriting}>
        {FIRST_PAGE_COPY.invitation}
      </button>
      <p className="p4r1-blank-presence">{FIRST_PAGE_COPY.presence}</p>

      <div className="p4r1-blank-arrival-ways">
        <button type="button" className="p4r1-blank-primary" onClick={onStartWriting}>Just start writing</button>
        <button type="button" onClick={onTalkWithMaia}>Talk with MAIA</button>
        <button type="button" onClick={onHelpBegin}>Help me find a beginning</button>
      </div>

      {usableMaterials.length > 0 ? (
        <div className="p4r1-blank-materials">
          <p className="p4r1-blank-presence">Nothing feeding this Work has been copied here.</p>
          <header>
            <b>Start from something already feeding this Work</b>
            <span>Opening it does not copy it into this page.</span>
          </header>
          <ul>
            {usableMaterials.map((material) => {
              const href = materialHref(material);
              if (!href) return null;
              return (
                <li key={`${material.materialType}:${material.materialId}`}>
                  <span className="p4r1-blank-material-kind">{materialLabel(material)}</span>
                  <div>
                    {material.sentence ? (
                      <p>“{material.sentence}”</p>
                    ) : (
                      <p className="p4r1-blank-material-unwritten">brought without a note</p>
                    )}
                    <Link href={href}>
                      Open {materialLabel(material)}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
