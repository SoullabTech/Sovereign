import StudioMarkdown from '../_lib/StudioMarkdown';
import BookReader from './BookReader';

export const metadata = {
  title: 'Book · Elemental Alchemy',
};

export const dynamic = 'force-dynamic';

export default function BookPage() {
  return (
    <BookReader>
      <StudioMarkdown file="ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md" />
    </BookReader>
  );
}
