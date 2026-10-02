'use client';

import Link from 'next/link';
import type { LivingWork, DeclaredMaterial } from '@/app/writers-studio/useLivingWorks';

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
    <section className="p4r1-blank-arrival" data-blank-writing-arrival>
      <div className="p4r1-blank-arrival-copy">
        <span className="p4r1-eyebrow">A blank page</span>
        <h2>Begin in the way that helps.</h2>
        <p>
          Nothing feeding this Work has been copied here. You can write freely, talk with MAIA,
          or return to something you already brought into the Work.
        </p>
      </div>

      <div className="p4r1-blank-arrival-actions">
        <button type="button" className="p4r1-blank-primary" onClick={onStartWriting}>
          <b>Just start writing</b>
          <span>Put the cursor on the page and begin in your own words.</span>
        </button>

        <button type="button" onClick={onTalkWithMaia}>
          <b>Talk with MAIA</b>
          <span>Talk about what you want to say before writing anything.</span>
        </button>

        <button type="button" onClick={onHelpBegin}>
          <b>Help me find a beginning</b>
          <span>MAIA can help you orient, but the question waits for you to send it.</span>
        </button>
      </div>

      {usableMaterials.length > 0 ? (
        <div className="p4r1-blank-materials">
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
