import { redirect } from 'next/navigation';

interface Props {
  params: { handle: string };
}

export default function GoPage({ params }: Props) {
  redirect(`/signin?u=${encodeURIComponent(params.handle)}`);
}
