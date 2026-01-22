export async function generateStaticParams() {
  return [{ slug: 'default', id: 'default' }, { slug: 'loralee', id: 'default' }];
}

export const dynamicParams = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
