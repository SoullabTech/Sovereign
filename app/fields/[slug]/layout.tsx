import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import { fieldThemeToCSSVars } from '@/lib/masters/theme';

export async function generateStaticParams() {
  const { getAllActiveSlugs } = await import('@/lib/masters/registry');
  return getAllActiveSlugs().map((slug) => ({ field: slug }));
}

export default async function FieldLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);

  if (!master) notFound();

  const cssVars = fieldThemeToCSSVars(master.theme);
  const style = Object.entries(cssVars).reduce(
    (acc, [k, v]) => ({ ...acc, [k]: v }),
    {} as React.CSSProperties
  );

  return (
    <div
      className="field-root min-h-screen"
      style={{
        ...style,
        backgroundColor: 'var(--field-color-bg)',
        color: master.palette.text,
        fontFamily: 'var(--field-font-body)',
      }}
      data-field={slug}
    >
      {children}
    </div>
  );
}
