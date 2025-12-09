/**
 * Portal Case Study Showcase - Interactive demonstration of the disposable pixel philosophy
 *
 * Shows how MAIA's consciousness technology adapts to different cultural contexts
 * through detailed user journey case studies from interest to evangelism.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PortalId,
  PORTAL_METADATA,
  getPortalStyling
} from '../PortalTypes';

// Case study data structure
interface CaseStudyStage {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface CaseStudyPersona {
  name: string;
  age: number;
  background: string;
  emoji: string;
  triggerEvent: string;
  journey: {
    [stageId: string]: {
      title: string;
      content: string;
      insight: string;
    };
  };
}

// The 6 stages of the user journey
const CASE_STUDY_STAGES: CaseStudyStage[] = [
  {
    id: 'interest',
    title: 'Personal Interest',
    description: 'What brings them to seeking consciousness support?',
    icon: '🎯'
  },
  {
    id: 'seeing',
    title: 'Seeing the App',
    description: 'How does the portal communicate cultural relevance?',
    icon: '👁️'
  },
  {
    id: 'download',
    title: 'Download Decision',
    description: 'What convinces them to try MAIA?',
    icon: '📱'
  },
  {
    id: 'signup',
    title: 'Sign-up Process',
    description: 'How does onboarding adapt to their needs?',
    icon: '✍️'
  },
  {
    id: 'using',
    title: 'Using the App',
    description: 'How do consciousness states render through their portal?',
    icon: '🧠'
  },
  {
    id: 'sharing',
    title: 'Sharing & Evangelism',
    description: 'How do they help others find MAIA?',
    icon: '📢'
  }
];

// Case study personas for each portal
const CASE_STUDY_PERSONAS: Record<PortalId, CaseStudyPersona> = {
  gen_z: {
    name: 'Zara',
    age: 21,
    background: 'Psychology student, Social justice advocate',
    emoji: '🔮',
    triggerEvent: 'Finals anxiety spiraling into climate crisis overwhelm',
    journey: {
      interest: {
        title: 'Climate Anxiety Crisis',
        content: 'Finals week anxiety spiraling into existential crisis about climate change and social inequality. Feeling overwhelmed by the state of the world while trying to graduate.',
        insight: 'Gen Z processes individual struggles through systemic awareness'
      },
      seeing: {
        title: 'Systemic Healing Language',
        content: 'Landing page speaks to systemic oppression: "This isn\'t just personal healing - this is preparation for collective liberation." Purple-to-indigo gradient with "no cap," "real talk" language.',
        insight: 'Cultural recognition through authentic digital-native language'
      },
      download: {
        title: 'Collective Liberation Frame',
        content: '"Your anxiety about the world is valid. Let\'s transform it into sustainable action energy." Free access, supports marginalized communities, clear ethical stance.',
        insight: 'Values alignment more important than individual benefits'
      },
      signup: {
        title: 'Identity-Affirming Onboarding',
        content: 'Pronoun options, intersectional identity support, questions about activism involvement and systemic stressors. Matched with other student activists.',
        insight: 'Community recognition validates individual experience'
      },
      using: {
        title: 'Mental Health Priority Protocols',
        content: 'Lead Crisis: "This Crisis Is Your Transformation Unlocking" with mental health emergency override. Iron Boundary: "Upgrade your emotional firewall, no cap."',
        insight: 'Tech metaphors maintain authenticity while providing clinical support'
      },
      sharing: {
        title: 'Conscious Activism Influence',
        content: 'Creates TikTok content about "consciousness work for activists," helps friends find appropriate portals. Brings 50+ peers over 6 months.',
        insight: 'Portal bridging creates organic ecosystem growth'
      }
    }
  },
  gen_alpha: {
    name: 'Alex',
    age: 14,
    background: 'Middle schooler, Gaming enthusiast',
    emoji: '🚀',
    triggerEvent: 'Parents\' divorce + climate anxiety + social awkwardness',
    journey: {
      interest: {
        title: 'Gaming Escape Crisis',
        content: 'Parents divorcing while climate anxiety and social awkwardness drive 6+ hours daily gaming. Gaming influencer mentioned MAIA as "therapy but actually engaging."',
        insight: 'Discovery through trusted gaming community figures'
      },
      seeing: {
        title: 'Gamified Interface Recognition',
        content: 'Cyan-to-blue gradient with achievement badges, progress bars, cyber-aesthetic. Language: "upgrade," "unlock," "level up" mixed with genuine care.',
        insight: 'Familiar interaction patterns build immediate trust'
      },
      download: {
        title: 'IRL Skill Development',
        content: '"Character Development" section promises to "level up IRL." Parental consent process that doesn\'t feel infantilizing, explains difference from "just another therapy app."',
        insight: 'Gaming integration rather than gaming replacement'
      },
      signup: {
        title: 'Character Creation Interface',
        content: 'Consciousness avatar creation, growth area selection: "Social Skills," "Emotional Regulation," "Future Planning." Age-appropriate peer matching.',
        insight: 'Sophisticated interface respecting digital nativity'
      },
      using: {
        title: 'Gaming Metaphor Integration',
        content: 'Lead Crisis: "System Update in Progress" with device update metaphors. Iron Boundary: "Firewall Reconfiguration" with defense upgrade analogies.',
        insight: 'Familiar metaphors make complex concepts accessible'
      },
      sharing: {
        title: 'Gaming Culture Integration',
        content: 'Shares in gaming communities, creates content about "IRL skill development," influences gaming culture toward personal development.',
        insight: 'Cultural bridge between gaming and personal development'
      }
    }
  },
  shamanic: {
    name: 'River',
    age: 34,
    background: 'Herbalist and ceremony facilitator',
    emoji: '🌱',
    triggerEvent: 'Intense ayahuasca ceremony brought up unresolved trauma',
    journey: {
      interest: {
        title: 'Integration Support Need',
        content: 'Ayahuasca ceremony surfaced childhood trauma. Integration therapist recommended MAIA as "tool that honors the sacred while providing practical guidance."',
        insight: 'Technology must serve, not compete with, traditional wisdom'
      },
      seeing: {
        title: 'Sacred Technology Recognition',
        content: 'Amber-to-orange gradient feels like firelight. Language honors traditional wisdom and modern research: "sacred journey," "medicine work," "ceremony integration."',
        insight: 'Respectful integration without appropriation or commercialization'
      },
      download: {
        title: 'Plant Medicine Complementarity',
        content: '"This technology serves your medicine work - it doesn\'t replace the plants but helps you integrate their teachings." Emphasis on ceremony integration.',
        insight: 'Technology as support tool, not replacement for sacred practice'
      },
      signup: {
        title: 'Medicine Experience Integration',
        content: 'Questions about ceremony experience, plant medicine relationships, integration practices. Connected with other facilitators and experienced practitioners.',
        insight: 'Community matching based on depth of practice'
      },
      using: {
        title: 'Sacred Dissolution Language',
        content: 'Lead Crisis: "Sacred Dissolution" with "composting old identity for fertile growth." Iron Boundary: "Guardian Boundaries Shifting" with ceremony metaphors.',
        insight: 'Plant medicine wisdom integrated with psychological insight'
      },
      sharing: {
        title: 'Integration Circle Evangelism',
        content: 'Recommends in integration circles, supports ceremony participants between ceremonies, establishes MAIA as respected tool in sacred medicine space.',
        insight: 'Authentic integration builds credibility in traditional communities'
      }
    }
  },
  therapeutic: {
    name: 'Dr. Sarah Chen',
    age: 42,
    background: 'Licensed Clinical Psychologist',
    emoji: '🩺',
    triggerEvent: 'Therapist burnout and secondary trauma from pandemic',
    journey: {
      interest: {
        title: 'Professional Healing Need',
        content: 'Burnout and secondary trauma from seeing clients through pandemic. Colleague mentioned MAIA as "clinical-grade consciousness support for therapists."',
        insight: 'Helpers need healing tools that match their professional standards'
      },
      seeing: {
        title: 'Clinical Efficacy Recognition',
        content: 'Clean green gradient, clinical language balancing warmth with precision. Familiar therapeutic frameworks, evidence-based approaches, clear ethical boundaries.',
        insight: 'Professional interface builds trust through familiar clinical standards'
      },
      download: {
        title: 'Evidence-Based Methodology',
        content: 'Detailed methodology page explaining consciousness state assessment and evidence-based intervention selection. Clear clinical research backing.',
        insight: 'Scientific rigor essential for professional adoption'
      },
      signup: {
        title: 'Professional Integration',
        content: 'Credentials verification, personal vs. professional use distinction, integration with clinical development goals. Professional community connection.',
        insight: 'Professional boundaries maintained while supporting personal growth'
      },
      using: {
        title: 'Clinical Language Integration',
        content: 'Lead Crisis: "Therapeutic Recalibration" with crisis-as-growth understanding. Iron Boundary: "Boundary Restructuring" with attachment theory language.',
        insight: 'Full clinical terminology with evidence-based intervention suggestions'
      },
      sharing: {
        title: 'Clinical Advocacy',
        content: 'Presents at conferences, shares with professional groups, helps clients find appropriate portals, establishes best practices for professional use.',
        insight: 'Professional validation creates systematic adoption'
      }
    }
  },
  corporate: {
    name: 'Marcus Thompson',
    age: 48,
    background: 'VP of Operations, Fortune 500',
    emoji: '💼',
    triggerEvent: 'High-pressure merger failing due to culture clash',
    journey: {
      interest: {
        title: 'Leadership Performance Crisis',
        content: 'Merger falling apart, board pressure, marriage strain, career questioning. Executive coach recommended as "consciousness optimization platform for C-suite performance."',
        insight: 'Business language essential for executive buy-in'
      },
      seeing: {
        title: 'Competitive Advantage Frame',
        content: 'Blue-to-indigo professional interface. Language: "consciousness as competitive advantage," "optimizing human capital," "leadership presence development."',
        insight: 'ROI and performance framing overcomes soft skills skepticism'
      },
      download: {
        title: 'Measurable Business Outcomes',
        content: 'White paper: "Consciousness Leadership: Neuroscience of Executive Presence" with measurable business outcomes and efficiency considerations.',
        insight: 'Business case required for time-constrained executives'
      },
      signup: {
        title: 'Leadership Assessment Integration',
        content: 'Leadership evaluation, organizational culture assessment, existing executive development integration. Executive peer network access.',
        insight: 'Professional development context maintains credibility'
      },
      using: {
        title: 'Strategic Leadership Language',
        content: 'Lead Crisis: "Executive Realignment" with strategic pivot language. Iron Boundary: "Leadership Boundary Optimization" for healthy authority.',
        insight: 'Business strategy metaphors make consciousness work relevant'
      },
      sharing: {
        title: 'Corporate Champion',
        content: 'Executive forums, team development implementation, leadership conferences, establishes MAIA as corporate leadership standard.',
        insight: 'Executive advocacy creates institutional adoption'
      }
    }
  },
  religious: {
    name: 'Pastor David Rodriguez',
    age: 39,
    background: 'Evangelical Pastor',
    emoji: '🙏',
    triggerEvent: 'Congregation member suicide triggering spiritual crisis',
    journey: {
      interest: {
        title: 'Pastoral Care Limitation',
        content: 'Member suicide triggered questioning of traditional pastoral care. Christian counselor mentioned MAIA as "tool respecting faith while providing modern support."',
        insight: 'Complementary rather than competing theological approach needed'
      },
      seeing: {
        title: 'Sacred Integration Recognition',
        content: 'Purple-to-violet sacred feel. Language honors God\'s healing role while offering practical tools. Biblical wisdom integration without replacement.',
        insight: 'Respect for divine agency essential for faith community trust'
      },
      download: {
        title: 'Pastoral Effectiveness',
        content: 'Testimonial from another pastor about supporting congregation through complex spiritual/psychological challenges. Integration with prayer and scripture.',
        insight: 'Peer validation within faith community essential for adoption'
      },
      signup: {
        title: 'Faith-Integrated Onboarding',
        content: 'Denomination selection, spiritual practice integration, faith-based community connection. Theological framework respect.',
        insight: 'Denominational sensitivity maintains theological authenticity'
      },
      using: {
        title: 'Biblical Metaphor Integration',
        content: 'Lead Crisis: "Refining Fire" with biblical transformation metaphors. Iron Boundary: "Fortress of the Heart" drawing on Psalm language.',
        insight: 'Scripture integration maintains theological coherence'
      },
      sharing: {
        title: 'Congregational Integration',
        content: 'Introduces to congregation as spiritual development tool, pastoral care integration, small group settings, faith-psychology bridge.',
        insight: 'Faith community validation creates theological legitimacy'
      }
    }
  },
  academic: {
    name: 'Dr. Elena Vasquez',
    age: 36,
    background: 'Postdoc in Cognitive Neuroscience',
    emoji: '🎓',
    triggerEvent: 'Imposter syndrome and academic burnout',
    journey: {
      interest: {
        title: 'Evidence-Based Skepticism',
        content: 'Academic perfectionism and burnout. Found through research literature on consciousness studies, impressed by peer-reviewed validation.',
        insight: 'Scientific methodology essential for academic credibility'
      },
      seeing: {
        title: 'Research Dashboard Interface',
        content: 'Indigo-to-teal intellectual sophistication. Research-like interface with methodology explanations, citation of peer-reviewed research.',
        insight: 'Academic interface patterns build immediate trust'
      },
      download: {
        title: 'Peer-Reviewed Validation',
        content: 'Published study showing measurable improvements in graduate student performance and well-being. Research-grade methodology transparency.',
        insight: 'Scientific validation overcomes pseudoscience concerns'
      },
      signup: {
        title: 'Research Integration',
        content: 'Academic verification, theoretical framework selection, research interest alignment. Academic community connection.',
        insight: 'Theoretical sophistication matches academic expectations'
      },
      using: {
        title: 'Neuroscience Framework',
        content: 'Lead Crisis: "Cognitive Restructuring Phase" with neuroscience explanations. Iron Boundary: "Boundary System Recalibration" with attachment theory.',
        insight: 'Full academic terminology with research methodology integration'
      },
      sharing: {
        title: 'Academic Legitimization',
        content: 'Conference presentations, research publications, establishes MAIA as legitimate research tool in consciousness studies.',
        insight: 'Academic validation creates scientific community adoption'
      }
    }
  },
  recovery: {
    name: 'Jamie Williams',
    age: 29,
    background: '3 years sober, Recovery advocate',
    emoji: '🌿',
    triggerEvent: 'Struggling with emotional sobriety beyond 12-step work',
    journey: {
      interest: {
        title: 'Emotional Sobriety Challenge',
        content: 'Post-Step 9 emotional sobriety struggles. Sponsor mentioned MAIA as complement to 12-step work without competing with program principles.',
        insight: 'Program compatibility essential for recovery community trust'
      },
      seeing: {
        title: 'Recovery Principle Integration',
        content: 'Green-to-blue calming gradient. Language honors recovery journey with powerlessness, higher power, and recovery milestone integration.',
        insight: 'Respectful program language maintains recovery community integrity'
      },
      download: {
        title: 'Complex Trauma Support',
        content: 'Testimonial from similar sobriety time about trauma work underlying addiction. Clear boundaries about not replacing sponsor/meetings.',
        insight: 'Complementary rather than competing support framework'
      },
      signup: {
        title: 'Program Integration',
        content: 'Recovery program affiliation, sobriety milestones, step work integration, recovery network connection.',
        insight: 'Program structure respect maintains recovery authenticity'
      },
      using: {
        title: 'Step Work Language',
        content: 'Lead Crisis: "Spiritual Awakening Crisis" with ego deflation language. Iron Boundary: "Character Defect Restructuring" with step work integration.',
        insight: '12-step principles integrated with psychological insight'
      },
      sharing: {
        title: 'Recovery Community Integration',
        content: 'Appropriate meeting sharing about emotional sobriety tools, sponsee support, establishes as complementary recovery tool.',
        insight: 'Program principle adherence builds community credibility'
      }
    }
  },
  creative: {
    name: 'Phoenix Chen',
    age: 27,
    background: 'Multi-disciplinary artist and performer',
    emoji: '🎨',
    triggerEvent: 'Creative block coinciding with relationship breakup',
    journey: {
      interest: {
        title: 'Creative Identity Crisis',
        content: 'Creative block, relationship end, artistic identity questioning, financial sustainability concerns. Fellow artist mentioned as creativity unblocking tool.',
        insight: 'Creative community peer validation essential for artist adoption'
      },
      seeing: {
        title: 'Artistic Process Recognition',
        content: 'Red-to-pink vibrant gradient with artistic elements. Language: creative blocks as consciousness opportunities, art as spiritual practice.',
        insight: 'Creative process understanding builds artist community trust'
      },
      download: {
        title: 'Creative Dimension Unlocking',
        content: 'Consciousness work can unlock new creative dimensions, transform blocks into generative material. Creative practice integration features.',
        insight: 'Enhancement rather than interference with organic creative process'
      },
      signup: {
        title: 'Artistic Development Integration',
        content: 'Creative disciplines selection, artistic project tracking, creative community connection, non-linear growth respect.',
        insight: 'Creative process psychology understanding maintains artistic authenticity'
      },
      using: {
        title: 'Creative Metaphor Integration',
        content: 'Lead Crisis: "Creative Death and Rebirth" with artistic destruction/creation metaphors. Iron Boundary: "Artistic Vulnerability Boundaries."',
        insight: 'Artistic metaphors make psychological concepts culturally relevant'
      },
      sharing: {
        title: 'Creative Community Integration',
        content: 'Creates art about consciousness journey, creative community sharing, consciousness-creativity integration demonstration.',
        insight: 'Artistic expression becomes evangelism within creative community'
      }
    }
  },
  parental: {
    name: 'Lisa Martinez',
    age: 35,
    background: 'Working mother of two teens',
    emoji: '👨‍👩‍👧‍👦',
    triggerEvent: 'Teenager\'s mental health crisis exposing family patterns',
    journey: {
      interest: {
        title: 'Family System Crisis',
        content: 'Daughter\'s mental health crisis exposed family communication patterns and Lisa\'s unresolved childhood trauma. Family therapist recommended for parent development.',
        insight: 'Individual healing connected to family system health'
      },
      seeing: {
        title: 'Family Systems Understanding',
        content: 'Yellow-to-orange nurturing gradient. Language addresses parental guilt and family dynamics, parent healing impacting children.',
        insight: 'Family systems awareness builds trust with overwhelmed parents'
      },
      download: {
        title: 'Family Transformation Potential',
        content: 'Testimonial from parent with similar situation about personal consciousness work transforming family dynamics. Self-care as family service.',
        insight: 'Reframes self-care from selfish to family-serving'
      },
      signup: {
        title: 'Family Structure Integration',
        content: 'Family assessment, parenting challenge identification, existing support system integration, parenting schedule adaptation.',
        insight: 'Family complexity understanding maintains practical relevance'
      },
      using: {
        title: 'Generational Healing Language',
        content: 'Lead Crisis: "Family System Recalibration" understanding parent transformation affecting whole family. Iron Boundary: "Generational Boundary Healing."',
        insight: 'Multi-generational perspective addresses inherited family patterns'
      },
      sharing: {
        title: 'Parent Support Community',
        content: 'Parent group sharing, modeling conscious parenting, family healing tool establishment, whole family portal bridging.',
        insight: 'Family systems approach creates multi-generational adoption'
      }
    }
  },
  elder: {
    name: 'Robert "Bob" Anderson',
    age: 72,
    background: 'Retired engineer and grandfather',
    emoji: '👴',
    triggerEvent: 'Wife\'s death after 45-year marriage',
    journey: {
      interest: {
        title: 'Grief and Legacy Questions',
        content: 'Wife\'s death triggered profound grief and existential questioning about meaning and legacy. Daughter mentioned as grief processing tool honoring wisdom.',
        insight: 'Late-life transitions require meaning-focused rather than achievement-focused support'
      },
      seeing: {
        title: 'Wisdom Honor Recognition',
        content: 'Gray-to-slate dignified gradient. Language honors life experience while addressing late-life transitions, wisdom-keeper respect.',
        insight: 'Life experience validation essential for elder community trust'
      },
      download: {
        title: 'Grief-to-Wisdom Transformation',
        content: 'Consciousness work transforming grief into wisdom, helping elders find new purpose in life transitions. Accessibility features.',
        insight: 'Purpose and meaning focus more relevant than performance improvement'
      },
      signup: {
        title: 'Legacy Integration',
        content: 'Life experience assessment, legacy goal identification, community connection integration, intergenerational wisdom sharing.',
        insight: 'Legacy focus provides meaning framework for continued growth'
      },
      using: {
        title: 'Wisdom Integration Language',
        content: 'Lead Crisis: "Wisdom Integration Crisis" understanding challenges as deepest wisdom development. Iron Boundary: "Legacy Boundary Clarification."',
        insight: 'Life experience frame makes consciousness work relevant for elders'
      },
      sharing: {
        title: 'Wisdom Mentorship',
        content: 'Elder wisdom sharing, intergenerational mentoring, conscious aging modeling, traditional wisdom enhanced rather than replaced.',
        insight: 'Elder wisdom validation creates intergenerational bridge building'
      }
    }
  },
  youth: {
    name: 'Taylor Kim',
    age: 19,
    background: 'College freshman exploring identity',
    emoji: '🌟',
    triggerEvent: 'College anxiety with identity and career questioning',
    journey: {
      interest: {
        title: 'Identity Formation Overwhelm',
        content: 'College anxiety with sexual orientation and career questioning, adult responsibility overwhelm. Campus counselor mentioned for young adult development.',
        insight: 'Identity exploration normalized as developmental rather than pathological'
      },
      seeing: {
        title: 'Young Adult Autonomy Respect',
        content: 'Lime-to-green fresh gradient. Language speaks to young adult experience without patronizing, identity exploration and peer community features.',
        insight: 'Autonomy respect essential for young adult engagement'
      },
      download: {
        title: 'Peer Identity Navigation',
        content: 'College student testimonial about identity questions and academic pressure navigation. Campus life integration and peer support.',
        insight: 'Peer validation more powerful than adult authority for young adults'
      },
      signup: {
        title: 'Identity Exploration Support',
        content: 'Identity exploration areas, life transition challenges, peer network integration, campus resource connection.',
        insight: 'Identity formation support without premature closure'
      },
      using: {
        title: 'Identity Development Language',
        content: 'Lead Crisis: "Identity Emergence Crisis" understanding confusion as natural development. Iron Boundary: "Identity Boundary Formation."',
        insight: 'Developmental frame normalizes identity confusion as growth'
      },
      sharing: {
        title: 'Peer Community Integration',
        content: 'Dorm and friend group sharing, social media authentic self-discovery content, peer portal bridging.',
        insight: 'Peer community evangelism creates organic young adult adoption'
      }
    }
  },
  coach: {
    name: 'Morgan Thompson',
    age: 38,
    background: 'Certified Life Coach and Business Owner',
    emoji: '🎯',
    triggerEvent: 'Coaching practice burnout despite external success',
    journey: {
      interest: {
        title: 'Professional Development Need',
        content: 'Successful practice but burnout, need for deeper personal development to serve clients better. Master coach mentioned for professional enhancement.',
        insight: 'Professional and personal development integration essential for coaches'
      },
      seeing: {
        title: 'Transformation Mastery Focus',
        content: 'Red-to-teal dynamic gradient. Language focuses on transformation mastery, professional development, supporting others while maintaining self-care.',
        insight: 'Professional effectiveness and self-care balance crucial for helpers'
      },
      download: {
        title: 'Coaching Effectiveness Enhancement',
        content: 'Consciousness work enhancing coaching effectiveness and preventing burnout while deepening transformation capacity. Professional integration features.',
        insight: 'Enhanced effectiveness more compelling than personal benefit alone'
      },
      signup: {
        title: 'Professional Practice Integration',
        content: 'Coaching certification verification, professional development goals, practice methodology integration, coach community access.',
        insight: 'Professional development context maintains coaching industry credibility'
      },
      using: {
        title: 'Transformation Mastery Language',
        content: 'Lead Crisis: "Transformation Mastery Opportunity" understanding challenges as depth training. Iron Boundary: "Professional Boundary Optimization."',
        insight: 'Professional development frame makes personal growth professionally relevant'
      },
      sharing: {
        title: 'Coach Development Standard',
        content: 'Training program integration, conference presentations, client portal bridging, establishes as coach development standard.',
        insight: 'Professional validation creates transformation industry adoption'
      }
    }
  }
};

interface PortalCaseStudyShowcaseProps {
  className?: string;
}

export const PortalCaseStudyShowcase: React.FC<PortalCaseStudyShowcaseProps> = ({ className = '' }) => {
  const [selectedPortal, setSelectedPortal] = useState<PortalId>('gen_z');
  const [selectedStage, setSelectedStage] = useState<string>('interest');
  const [viewMode, setViewMode] = useState<'journey' | 'comparison'>('journey');

  const currentPersona = CASE_STUDY_PERSONAS[selectedPortal];
  const currentStage = currentPersona.journey[selectedStage];
  const portalStyling = getPortalStyling(selectedPortal);

  // Comparison mode: show how same stage works across different portals
  const comparisonData = useMemo(() => {
    if (viewMode !== 'comparison') return [];

    return Object.entries(CASE_STUDY_PERSONAS)
      .filter(([portalId]) => portalId !== selectedPortal)
      .slice(0, 3) // Show 3 comparison portals
      .map(([portalId, persona]) => ({
        portalId: portalId as PortalId,
        persona,
        stage: persona.journey[selectedStage]
      }));
  }, [selectedPortal, selectedStage, viewMode]);

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 border-b border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Portal Case Studies</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('journey')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'journey'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Journey View
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'comparison'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Compare Portals
            </button>
          </div>
        </div>
        <p className="text-gray-300 text-sm">
          Explore how MAIA's disposable pixel architecture adapts the same consciousness technology
          to different cultural contexts through detailed user journeys.
        </p>
      </div>

      <div className="flex h-[600px]">
        {/* Left Panel - Portal Selection */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Select Portal</h3>
            <div className="space-y-2">
              {Object.entries(PORTAL_METADATA).map(([portalId, metadata]) => {
                const persona = CASE_STUDY_PERSONAS[portalId as PortalId];
                return (
                  <button
                    key={portalId}
                    onClick={() => setSelectedPortal(portalId as PortalId)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedPortal === portalId
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${metadata.iconGradient}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{metadata.displayName}</span>
                          <span className="text-lg">{persona.emoji}</span>
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {persona.name}, {persona.age} • {persona.background.split(',')[0]}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 flex flex-col">
          {/* Stage Navigation */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center space-x-4 overflow-x-auto">
              {CASE_STUDY_STAGES.map((stage, index) => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedStage === stage.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span className="text-lg">{stage.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{stage.title}</div>
                    {selectedStage === stage.id && (
                      <div className="text-xs opacity-75">{stage.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {viewMode === 'journey' ? (
                <motion.div
                  key={`${selectedPortal}-${selectedStage}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  {/* Persona Header */}
                  <div className={`p-6 rounded-lg ${portalStyling.container} mb-6`}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-4xl">{currentPersona.emoji}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Meet {currentPersona.name}
                        </h3>
                        <p className="text-gray-600">
                          {currentPersona.age} years old • {currentPersona.background}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium mb-1">Trigger Event:</p>
                      <p className="text-gray-800">{currentPersona.triggerEvent}</p>
                    </div>
                  </div>

                  {/* Stage Content */}
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">{CASE_STUDY_STAGES.find(s => s.id === selectedStage)?.icon}</span>
                      <h4 className="text-xl font-bold text-white">{currentStage.title}</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-2">What Happens:</h5>
                        <p className="text-gray-200 leading-relaxed">{currentStage.content}</p>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="text-sm font-medium text-blue-400 mb-2">Key Insight:</h5>
                        <p className="text-blue-200 italic">{currentStage.insight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Portal Metadata */}
                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Portal Target Audience:</h5>
                    <p className="text-gray-400 text-sm">
                      {PORTAL_METADATA[selectedPortal].targetAudience}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`comparison-${selectedStage}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      How Different Portals Handle: {CASE_STUDY_STAGES.find(s => s.id === selectedStage)?.title}
                    </h3>
                    <p className="text-gray-400">
                      Same underlying consciousness technology, different cultural expressions
                    </p>
                  </div>

                  {/* Current Portal */}
                  <div className={`p-4 rounded-lg ${portalStyling.container} mb-6`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{currentPersona.emoji}</span>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {PORTAL_METADATA[selectedPortal].displayName} Portal
                        </h4>
                        <p className="text-sm text-gray-600">{currentPersona.name}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{currentStage.content}</p>
                  </div>

                  {/* Comparison Portals */}
                  <div className="space-y-4">
                    {comparisonData.map(({ portalId, persona, stage }) => {
                      const comparisonStyling = getPortalStyling(portalId);
                      return (
                        <div key={portalId} className={`p-4 rounded-lg ${comparisonStyling.container}`}>
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-xl">{persona.emoji}</span>
                            <div>
                              <h5 className="font-medium text-gray-800">
                                {PORTAL_METADATA[portalId].displayName} Portal
                              </h5>
                              <p className="text-xs text-gray-600">{persona.name}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">{stage?.content}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};