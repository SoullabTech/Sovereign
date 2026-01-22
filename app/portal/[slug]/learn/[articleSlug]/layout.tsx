export async function generateStaticParams() {
  return [{ slug: 'default', articleSlug: 'default' }, { slug: 'loralee', articleSlug: 'default' }];
}

export const dynamicParams = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
