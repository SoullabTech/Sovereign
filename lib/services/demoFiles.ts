/**
 * Demo Files Service - Provides sample content for Maya to reference
 * before users upload their own files, creating immediate value and
 * demonstrating file integration capabilities.
 */

export interface DemoFile {
  id: string;
  filename: string;
  category: string;
  content: string;
  relevance?: number;
  pageNumber?: number;
  sectionTitle?: string;
  preview: string;
}

export const DEMO_FILES: DemoFile[] = [
  {
    id: 'demo-journal-1',
    filename: 'reflection-notes.md',
    category: 'Personal',
    content: `# Daily Reflections - Week of Dec 2024

## Monday - Morning Pages
Feeling scattered today. Too many projects, not enough focus. Keep jumping between tasks without completing any. Need to practice single-tasking again.

## Tuesday - Evening Reflection  
Better focus today after setting three clear priorities. Noticed I work best in the morning when my mind is clear. Afternoon energy dips around 2-3pm consistently.

## Wednesday - Patterns
Third week in a row where I've felt overwhelmed by Wednesday. Maybe I'm front-loading too much at the start of the week? Should spread tasks more evenly.

## Friday - Breakthrough
Finally found flow state while writing. Two hours felt like minutes. Was completely absorbed in the work. This happens when I eliminate all distractions and set a single, clear intention.`,
    sectionTitle: 'Daily Reflections',
    pageNumber: 1,
    preview: 'Feeling scattered today. Too many projects, not enough focus...'
  },
  
  {
    id: 'demo-goals-1',
    filename: 'vision-2025.pdf',
    category: 'Planning',
    content: `VISION 2025 - ANNUAL REVIEW & PLANNING

WHAT WORKED WELL THIS YEAR:
• Morning routine - 6am wake up, meditation, journaling
• Weekly reviews every Sunday - kept me on track
• Saying no to commitments that didn't align with priorities
• Deep work blocks - 2 hour focused sessions

WHAT DIDN'T WORK:
• Too ambitious with side projects - spread myself thin
• Not enough time for relationships and community
• Burnout in Q3 from overcommitting

2025 FOCUS AREAS:
1. MASTERY: Go deeper in fewer areas rather than wider
2. PRESENCE: More quality time with people I care about  
3. HEALTH: Consistent exercise and sleep schedule
4. CREATIVITY: Protected time for exploration and play

KEY QUESTION FOR 2025:
"What would this look like if it were easy?"`,
    sectionTitle: 'Vision 2025',
    pageNumber: 2,
    preview: 'Morning routine - 6am wake up, meditation, journaling...'
  },

  {
    id: 'demo-insights-1',
    filename: 'book-notes-atomic-habits.md',
    category: 'Learning',
    content: `# Atomic Habits - James Clear
## Key Insights & Personal Applications

### The 1% Rule
Small improvements compound over time. Rather than trying to change everything at once, focus on tiny, sustainable improvements.

**My Application:** Instead of "read more," I committed to reading 2 pages every morning. Led to 15+ books this year.

### Identity-Based Habits
Focus on who you want to become, not what you want to achieve. Ask "What would a healthy person do?" rather than "How do I lose weight?"

**Personal Insight:** Started saying "I'm someone who writes daily" instead of "I want to be a writer." Changed everything.

### Environment Design
Make good habits obvious and bad habits invisible. Your environment is the invisible hand that shapes behavior.

**My Changes:**
- Put journal next to bed = consistent morning writing
- Removed apps from phone home screen = less mindless scrolling
- Water bottle on desk = drink more water`,
    sectionTitle: 'Key Insights',
    pageNumber: 3,
    preview: 'Small improvements compound over time. Rather than trying to change everything at once...'
  },

  {
    id: 'demo-project-1',
    filename: 'meditation-experiment.md',
    category: 'Experiments',
    content: `# 30-Day Meditation Experiment - Results

## Hypothesis
Daily 10-minute meditation will improve focus and reduce anxiety.

## Method
- 10 minutes every morning after waking
- Used Insight Timer app
- Tracked mood/focus daily (1-10 scale)
- Noted observations in evening journal

## Results (Week 4)
**Focus:** Improved from avg 6/10 to 8/10
**Anxiety:** Decreased from avg 7/10 to 4/10  
**Sleep Quality:** Better, falling asleep faster

## Key Observations
- Days 1-7: Restless, mind very busy
- Days 8-15: Started noticing gaps between thoughts
- Days 16-30: More calm throughout the day, less reactive

**Biggest Surprise:** Impact on relationships. More patient, better listener.

**Continuing Forward:** Meditation is now non-negotiable morning ritual.`,
    sectionTitle: '30-Day Results',
    pageNumber: 1,
    preview: 'Daily 10-minute meditation will improve focus and reduce anxiety...'
  }
];

/**
 * Simulates file search for demo purposes
 * Maya can reference these files to demonstrate file integration
 */
export function getDemoFileContext(query: string, limit = 3): DemoFile[] {
  // Simple keyword matching for demo purposes
  const queryLower = query.toLowerCase();
  
  const relevantFiles = DEMO_FILES.filter(file => {
    const searchText = `${file.filename} ${file.category} ${file.content}`.toLowerCase();
    const keywords = queryLower.split(' ');
    return keywords.some(keyword => searchText.includes(keyword));
  });

  // Add relevance scores based on keyword matches
  return relevantFiles
    .map(file => ({
      ...file,
      relevance: calculateRelevance(file, queryLower)
    }))
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, limit);
}

function calculateRelevance(file: DemoFile, query: string): number {
  const searchText = `${file.filename} ${file.category} ${file.content}`.toLowerCase();
  const keywords = query.split(' ');
  
  let relevance = 0;
  keywords.forEach(keyword => {
    if (searchText.includes(keyword)) {
      // Higher weight for filename/category matches
      if (file.filename.toLowerCase().includes(keyword)) relevance += 0.3;
      if (file.category.toLowerCase().includes(keyword)) relevance += 0.2;
      if (file.content.toLowerCase().includes(keyword)) relevance += 0.1;
    }
  });
  
  return Math.min(relevance, 1.0);
}

/**
 * Formats demo file context for Maya&apos;s prompts
 */
export function formatDemoFileContext(files: DemoFile[]): string {
  if (files.length === 0) return '';
  
  let context = '\n## From Your Personal Library:\n\n';
  
  files.forEach((file, index) => {
    context += `### ${file.filename}`;
    if (file.category) {
      context += ` (${file.category})`;
    }
    context += '\n';
    
    if (file.sectionTitle) {
      context += `**${file.sectionTitle}:**\n`;
    }
    
    context += `${file.content}\n\n`;
    
    if (index < files.length - 1) {
      context += '---\n\n';
    }
  });
  
  context += '\n*Note: When referencing this content, mention the source filename naturally, like "In your reflection-notes.md, you mentioned..." This helps build trust and shows the file integration working.*\n';
  
  return context;
}

/**
 * Check if user has uploaded files (placeholder for production)
 * In production, this would check the actual user's file count
 */
export function hasUserFiles(userId: string): boolean {
  // For demo purposes, always return false to show demo files
  // In production, this would check Supabase for user's actual files
  return false;
}