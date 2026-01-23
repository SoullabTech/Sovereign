export async function generateStaticParams() {
  return [{ slug: 'default' }, { slug: 'loralee' }];
}

export const dynamicParams = true;

export default function NewSessionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
