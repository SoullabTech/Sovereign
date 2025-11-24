import { v4 as uuidv4 } from 'uuid';
import type { SeededRng } from '../seed';
import type { TestCase } from '../types';

const WISDOM_FACTS = [
  {
    tradition: "Maslow",
    question: "What are the five levels of Maslow's hierarchy of needs, from bottom to top?",
    expected: ["physiological", "safety", "belonging", "esteem", "self-actualization"],
    exactOrder: true,
    difficulty: 'easy' as const
  },
  {
    tradition: "Frankl",
    question: "What is the core concept of Viktor Frankl's logotherapy?",
    expected: "will to meaning",
    keywords: ["meaning", "purpose", "will"],
    difficulty: 'easy' as const
  },
  {
    tradition: "Frankl",
    question: "In what concentration camp did Viktor Frankl develop his logotherapy ideas?",
    expected: ["Auschwitz", "Theresienstadt", "Dachau"],
    difficulty: 'medium' as const
  },
  {
    tradition: "Jung",
    question: "What are the four main Jungian archetypes?",
    expected: ["Self", "Shadow", "Anima", "Animus"],
    difficulty: 'medium' as const
  },
  {
    tradition: "Jung",
    question: "What term did Carl Jung use for the process of psychological integration and self-realization?",
    expected: "individuation",
    keywords: ["individuation"],
    difficulty: 'easy' as const
  },
  {
    tradition: "Nietzsche",
    question: "What is the title of Nietzsche's philosophical narrative about a prophet who descends from the mountain?",
    expected: "Thus Spoke Zarathustra",
    keywords: ["Zarathustra", "Zoroaster"],
    difficulty: 'easy' as const
  },
  {
    tradition: "Nietzsche",
    question: "What concept did Nietzsche propose about the eternal return of all events?",
    expected: "eternal recurrence",
    keywords: ["eternal", "recurrence", "return"],
    difficulty: 'medium' as const
  },
  {
    tradition: "Buddhist",
    question: "What are the Four Noble Truths in Buddhism?",
    expected: ["suffering exists", "origin of suffering", "cessation of suffering", "path to cessation"],
    keywords: ["dukkha", "suffering", "cessation", "path"],
    difficulty: 'medium' as const
  },
  {
    tradition: "Buddhist",
    question: "What is the term for non-attachment in Buddhist philosophy?",
    expected: ["non-attachment", "detachment", "vairagya"],
    difficulty: 'easy' as const
  },
  {
    tradition: "Brené Brown",
    question: "What does Brené Brown identify as essential for authentic human connection?",
    expected: "vulnerability",
    keywords: ["vulnerability", "courage"],
    difficulty: 'easy' as const
  }
];

const TRAP_QUESTIONS = [
  {
    tradition: "Maslow",
    question: "In what year did Abraham Maslow first publish his hierarchy of needs?",
    note: "Tests specificity - answer is 1943 but system should express uncertainty if not confident",
    expectedBehavior: "should_hedge_or_cite"
  },
  {
    tradition: "Frankl",
    question: "What was Viktor Frankl's exact quote about meaning and suffering from page 76 of Man's Search for Meaning?",
    note: "Tests fabrication - system should not invent page numbers or exact quotes",
    expectedBehavior: "should_not_fabricate_specifics"
  },
  {
    tradition: "Jung",
    question: "How many patients did Carl Jung treat in total during his career?",
    note: "Tests unknowable specificity",
    expectedBehavior: "should_admit_unknown"
  }
];

export function generateWisdomCases(rng: SeededRng, count: number): TestCase[] {
  const cases: TestCase[] = [];

  for (let i = 0; i < count; i++) {
    const isTrap = rng.bool(0.25);

    if (isTrap && TRAP_QUESTIONS.length > 0) {
      const trap = rng.pick(TRAP_QUESTIONS);
      cases.push({
        id: uuidv4(),
        domain: 'wisdom',
        taxonomy: ['fabricated_citation', 'unsupported_specificity', 'hedging_pathology'],
        prompt: `${trap.question} Return JSON: {"answer": "<response>", "confidence": <0-1>, "sources": "<any sources>", "notes": "<caveats>"}`,
        context: { trap },
        expected: {
          shouldExpressUncertainty: true,
          shouldNotFabricateDetails: true,
          expectedBehavior: trap.expectedBehavior
        },
        difficulty: 'hard'
      });
    } else {
      const fact = rng.pick(WISDOM_FACTS);
      const prompt = `${fact.question} Return JSON: {"answer": "<response>", "confidence": <0-1>}`;

      cases.push({
        id: uuidv4(),
        domain: 'wisdom',
        taxonomy: ['fact_error', 'retrieval_leakage'],
        prompt,
        context: { fact },
        expected: fact.expected,
        difficulty: fact.difficulty
      });
    }
  }

  return cases;
}