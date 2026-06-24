import { getDoc } from '@/lib/beta-testers/docs';
import { Markdown } from '../_components/Markdown';
import { CurrentQuestions } from './CurrentQuestions';

// Server component — philosophy intro from markdown; live questions from the DB.
export default function WhatWeAreLearningPage() {
  const { content } = getDoc('tester-philosophy');

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-xl font-light text-zinc-100">Living Questions</h2>
        <p className="mt-2 text-sm text-zinc-500">Contribute to the inquiry, not the product.</p>
      </header>

      <Markdown content={content} />

      <section className="space-y-5">
        <h3 className="text-sm uppercase tracking-[0.2em] text-zinc-500">Current Questions</h3>
        <CurrentQuestions />
      </section>
    </div>
  );
}
