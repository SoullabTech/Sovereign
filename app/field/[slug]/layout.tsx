import { notFound } from 'next/navigation';
import { resolveField } from '@/lib/field/resolve';
import { fieldThemeToCSSVars } from '@/lib/masters/theme';
import { FieldProvider } from '@/lib/field/FieldProvider';

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

export default async function FieldSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const field = await resolveField(slug);

  if (!field) notFound();

  const cssVars = fieldThemeToCSSVars(field.theme);
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
        color: field.palette.text,
        fontFamily: 'var(--field-font-body)',
      }}
      data-field={slug}
      data-tone={field.theme.tone}
    >
      <FieldProvider field={field}>
        {children}
      </FieldProvider>
    </div>
  );
}
