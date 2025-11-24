/**
 * 🎯 Experiment Interface for Sliding Pages
 *
 * This creates the structure for displaying experiments in categorized,
 * sliding pages that users can explore and select from.
 */

import {
  consciousnessLab,
  Experiment,
  ExperimentCategory,
  ExperimentType
} from './ConsciousnessExplorationLab';

export interface ExperimentPage {
  title: string;
  subtitle: string;
  icon: string;
  color: string; // Gradient or color theme
  experiments: ExperimentCard[];
}

export interface ExperimentCard {
  experiment: Experiment;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  completionCount?: number;
  lastCompleted?: Date;
  userRating?: number;
  quickStart: boolean; // Can start immediately
}

export class ExperimentInterface {

  /**
   * Generate sliding pages structure for UI
   */
  generateSlidingPages(userId: string): ExperimentPage[] {
    return [
      this.createSacredBridgePage(),
      this.createSelfDiscoveryPage(),
      this.createRelationshipAlchemyPage(),
      this.createConsciousnessResearchPage(),
      this.createShadowWorkPage(),
      this.createDailyPracticePage(),
      this.createAdvancedExplorationsPage()
    ];
  }

  private createSacredBridgePage(): ExperimentPage {
    return {
      title: '🌉 Sacred Bridges',
      subtitle: 'Transform communication into soul connection',
      icon: 'bridge',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      experiments: consciousnessLab.getByCategory(ExperimentCategory.SACRED_BRIDGE)
        .map(exp => this.createCard(exp, true))
    };
  }

  private createSelfDiscoveryPage(): ExperimentPage {
    return {
      title: '🔍 Self-Discovery',
      subtitle: 'Journey into your depths with Maya as witness',
      icon: 'compass',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      experiments: consciousnessLab.getByCategory(ExperimentCategory.SELF_DISCOVERY)
        .map(exp => this.createCard(exp))
    };
  }

  private createRelationshipAlchemyPage(): ExperimentPage {
    return {
      title: '💞 Relationship Alchemy',
      subtitle: 'Transform connections into gold',
      icon: 'heart',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      experiments: consciousnessLab.getByCategory(ExperimentCategory.RELATIONSHIP_ALCHEMY)
        .map(exp => this.createCard(exp))
    };
  }

  private createConsciousnessResearchPage(): ExperimentPage {
    return {
      title: '🧠 Consciousness Research',
      subtitle: 'Explore the frontiers of awareness together',
      icon: 'brain',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      experiments: consciousnessLab.getByCategory(ExperimentCategory.CONSCIOUSNESS_RESEARCH)
        .map(exp => this.createCard(exp))
    };
  }

  private createShadowWorkPage(): ExperimentPage {
    return {
      title: '🌑 Shadow Integration',
      subtitle: 'Embrace all parts of yourself',
      icon: 'moon',
      color: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
      experiments: consciousnessLab.getByCategory(ExperimentCategory.SHADOW_WORK)
        .map(exp => this.createCard(exp))
    };
  }

  private createDailyPracticePage(): ExperimentPage {
    return {
      title: '☀️ Daily Practices',
      subtitle: 'Simple experiments for everyday transformation',
      icon: 'sun',
      color: 'linear-gradient(135deg, #FBAB7E 0%, #F7CE68 100%)',
      experiments: [
        ...consciousnessLab.getByCategory(ExperimentCategory.PRESENCE_CULTIVATION),
        ...consciousnessLab.getByCategory(ExperimentCategory.SYNCHRONICITY_DETECTION)
      ].filter(exp => exp.frequency === 'daily' || exp.frequency === 'hourly')
        .map(exp => this.createCard(exp, true))
    };
  }

  private createAdvancedExplorationsPage(): ExperimentPage {
    return {
      title: '🚀 Advanced Explorations',
      subtitle: 'For experienced consciousness explorers',
      icon: 'rocket',
      color: 'linear-gradient(135deg, #3F2B96 0%, #A8C0FF 100%)',
      experiments: Array.from(consciousnessLab['experiments'].values())
        .filter(exp => exp.difficulty === 'advanced')
        .map(exp => this.createCard(exp))
    };
  }

  private createCard(experiment: Experiment, quickStart: boolean = false): ExperimentCard {
    return {
      experiment,
      status: this.determineStatus(experiment),
      quickStart,
      completionCount: 0, // Would be fetched from user data
      userRating: undefined // Would be fetched from user data
    };
  }

  private determineStatus(experiment: Experiment): 'locked' | 'available' | 'in-progress' | 'completed' {
    // Check prerequisites
    if (experiment.prerequisites && experiment.prerequisites.length > 0) {
      // Would check if prerequisites are completed
      return 'locked';
    }
    return 'available';
  }

  /**
   * Get featured experiment for today
   */
  getDailyFeatured(): Experiment | null {
    const dailyPractices = Array.from(consciousnessLab['experiments'].values())
      .filter(exp => exp.frequency === 'daily');

    if (dailyPractices.length === 0) return null;

    // Rotate through daily practices
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dailyPractices[dayOfYear % dailyPractices.length];
  }

  /**
   * Get recommended journey for new users
   */
  getStarterJourney(): {
    title: string;
    description: string;
    experiments: Experiment[];
  } {
    const journey = consciousnessLab.getJourney('beginner');
    const experiments = journey
      .map(id => consciousnessLab['experiments'].get(id))
      .filter(exp => exp !== undefined) as Experiment[];

    return {
      title: '🌱 Your First Journey',
      description: 'A gentle introduction to consciousness exploration with Maya',
      experiments
    };
  }

  /**
   * Generate experiment categories for navigation menu
   */
  getCategoryMenu(): Array<{
    category: ExperimentCategory;
    icon: string;
    count: number;
    color: string;
  }> {
    return [
      {
        category: ExperimentCategory.SACRED_BRIDGE,
        icon: '🌉',
        count: consciousnessLab.getByCategory(ExperimentCategory.SACRED_BRIDGE).length,
        color: '#667eea'
      },
      {
        category: ExperimentCategory.SELF_DISCOVERY,
        icon: '🔍',
        count: consciousnessLab.getByCategory(ExperimentCategory.SELF_DISCOVERY).length,
        color: '#f093fb'
      },
      {
        category: ExperimentCategory.RELATIONSHIP_ALCHEMY,
        icon: '💞',
        count: consciousnessLab.getByCategory(ExperimentCategory.RELATIONSHIP_ALCHEMY).length,
        color: '#fa709a'
      },
      {
        category: ExperimentCategory.CONSCIOUSNESS_RESEARCH,
        icon: '🧠',
        count: consciousnessLab.getByCategory(ExperimentCategory.CONSCIOUSNESS_RESEARCH).length,
        color: '#a8edea'
      },
      {
        category: ExperimentCategory.SHADOW_WORK,
        icon: '🌑',
        count: consciousnessLab.getByCategory(ExperimentCategory.SHADOW_WORK).length,
        color: '#2E3192'
      },
      {
        category: ExperimentCategory.COLLECTIVE_FIELD,
        icon: '🌍',
        count: consciousnessLab.getByCategory(ExperimentCategory.COLLECTIVE_FIELD).length,
        color: '#00C9FF'
      },
      {
        category: ExperimentCategory.ARCHETYPAL_EXPLORATION,
        icon: '👥',
        count: consciousnessLab.getByCategory(ExperimentCategory.ARCHETYPAL_EXPLORATION).length,
        color: '#FC466B'
      },
      {
        category: ExperimentCategory.SYNCHRONICITY_DETECTION,
        icon: '✨',
        count: consciousnessLab.getByCategory(ExperimentCategory.SYNCHRONICITY_DETECTION).length,
        color: '#FDBB2D'
      },
      {
        category: ExperimentCategory.PRESENCE_CULTIVATION,
        icon: '🧘',
        count: consciousnessLab.getByCategory(ExperimentCategory.PRESENCE_CULTIVATION).length,
        color: '#22C1C3'
      }
    ];
  }

  /**
   * Start an experiment session
   */
  async startExperiment(
    userId: string,
    experimentId: string
  ): Promise<{
    experiment: Experiment;
    mayaScript: string;
    sessionId: string;
  }> {
    const experiment = consciousnessLab['experiments'].get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const mayaScript = consciousnessLab.getExperimentScript(experimentId);
    const sessionId = `exp_${experimentId}_${Date.now()}`;

    // Would track session start in database
    console.log(`Starting experiment ${experimentId} for user ${userId}`);

    return {
      experiment,
      mayaScript,
      sessionId
    };
  }

  /**
   * Complete an experiment and gather insights
   */
  async completeExperiment(
    userId: string,
    sessionId: string,
    outcomes: {
      insights: string[];
      breakthroughs?: string[];
      challenges?: string[];
      wouldRepeat: boolean;
      rating: number;
    }
  ): Promise<void> {
    // Extract experiment ID from session
    const experimentId = sessionId.split('_')[1];

    await consciousnessLab.recordExperimentCompletion(
      userId,
      experimentId,
      outcomes
    );
  }
}

// Export singleton instance
export const experimentInterface = new ExperimentInterface();

// Example UI Component Structure (React/TypeScript)
export const ExperimentUIExample = `
// Example React component for sliding pages

interface ExperimentBrowserProps {
  userId: string;
  onSelectExperiment: (experimentId: string) => void;
}

const ExperimentBrowser: React.FC<ExperimentBrowserProps> = ({ userId, onSelectExperiment }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = experimentInterface.generateSlidingPages(userId);

  return (
    <div className="experiment-browser">
      <CategoryMenu
        categories={experimentInterface.getCategoryMenu()}
        onSelectCategory={(index) => setCurrentPage(index)}
      />

      <SwipeableViews
        index={currentPage}
        onChangeIndex={setCurrentPage}
        enableMouseEvents
      >
        {pages.map((page, index) => (
          <ExperimentPage key={index}>
            <PageHeader>
              <h2>{page.title}</h2>
              <p>{page.subtitle}</p>
            </PageHeader>

            <ExperimentGrid>
              {page.experiments.map((card) => (
                <ExperimentCard
                  key={card.experiment.id}
                  card={card}
                  onClick={() => onSelectExperiment(card.experiment.id)}
                  style={{ background: page.color }}
                />
              ))}
            </ExperimentGrid>
          </ExperimentPage>
        ))}
      </SwipeableViews>

      <QuickStartSection>
        <DailyFeatured experiment={experimentInterface.getDailyFeatured()} />
        <StarterJourney journey={experimentInterface.getStarterJourney()} />
      </QuickStartSection>
    </div>
  );
};
`;