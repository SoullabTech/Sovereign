import type { Metadata } from 'next';
import { WriterDoorway } from './WriterDoorway';

export const metadata: Metadata = {
  title: 'Writer’s Studio · Write what only you can write',
  description:
    'A writing intelligence designed to strengthen your work without replacing the person behind it.',
};

export default function WritersStudioDiscoverPage() {
  return <WriterDoorway />;
}
