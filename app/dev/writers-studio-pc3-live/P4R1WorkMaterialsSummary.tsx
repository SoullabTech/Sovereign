'use client';

import Link from 'next/link';
import type { LivingWork, DeclaredMaterial } from '@/app/writers-studio/useLivingWorks';

type Props = {
  work: LivingWork;
};

function labelFor(material: DeclaredMaterial): string {
  if (material.materialType === 'idea') return 'Idea';
  if (material.materialType === 'source_upload') return 'Source';
  if (material.materialType === 'manuscript') return 'Writing';
  return 'Material';
}

function homeFor(material: DeclaredMaterial): { label: string; href: string } | null {
  if (material.materialType === 'idea') {
    return {
      label: 'Open Idea',
      href: `/maia/ideas/${encodeURIComponent(material.materialId)}`,
    };
  }
  if (material.materialType === 'source_upload') {
    return {
      label: 'Open Sources',
      href: '/writers-studio/sources',
    };
  }
  return null;
}

export default function P4R1WorkMaterialsSummary({ work }: Props) {
  if (work.materials.length === 0) return null;

  return (
    <section className="p4r1-home-materials" data-work-materials-summary>
      <header>
        <div>
          <p className="fr-home-eyebrow">What feeds this Work</p>
          <p>
            Relationships you declared. Nothing here is automatically read into the manuscript.
          </p>
        </div>
        <span>{work.materials.length}</span>
      </header>

      <ul>
        {work.materials.map((material) => {
          const home = homeFor(material);
          return (
            <li key={`${material.materialType}:${material.materialId}`}>
              <span className="p4r1-home-material-kind">{labelFor(material)}</span>
              <div>
                {material.sentence ? (
                  <blockquote>“{material.sentence}”</blockquote>
                ) : (
                  <p className="p4r1-home-material-unwritten">brought without a note</p>
                )}
                {home ? (
                  <Link href={home.href}>{home.label}</Link>
                ) : (
                  <span className="p4r1-home-material-home">{labelFor(material)} remains in its own place.</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
