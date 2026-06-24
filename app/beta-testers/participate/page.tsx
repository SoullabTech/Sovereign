import { getDoc } from '@/lib/beta-testers/docs';
import { Markdown } from '../_components/Markdown';

// Server component — reads the how-to-participate doctrine markdown.
export default function ParticipatePage() {
  const { content } = getDoc('how-to-participate');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-light text-zinc-100">How to Participate</h2>
      <Markdown content={content} />
    </div>
  );
}
