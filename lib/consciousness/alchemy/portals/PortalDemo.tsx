/**
 * Portal Demo: Same Crisis, Different Cultural Expressions
 *
 * Demonstrates how the SAME underlying experience (Lead stage crisis)
 * is presented differently across different population portals
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PortalEngine, PORTAL_CONFIGS, PopulationPortal } from './PortalArchitecture';

// Same underlying crisis state
const UNIVERSAL_CRISIS_STATE = {
  alchemicalStage: 'lead' as const,
  mercuryAspect: 'hermes-healer' as const,
  crisisLevel: 0.8,
  symptoms: [
    'loss_of_meaning',
    'identity_confusion',
    'spiritual_emergency',
    'anxiety_depression',
    'relationship_breakdown',
    'career_dissatisfaction'
  ],
  strengths: [
    'self_awareness',
    'motivation_to_change',
    'support_network_available',
    'previous_coping_success'
  ]
};

// How each portal presents the SAME crisis
const PortalPresentation: React.FC<{ portal: PopulationPortal }> = ({ portal }) => {
  const config = PORTAL_CONFIGS[portal];
  const translated = PortalEngine.translateConcepts(UNIVERSAL_CRISIS_STATE, portal);

  const getPortalSpecificContent = () => {
    switch (portal) {
      case 'shamanic':
        return {
          title: "🌙 Sacred Crisis Recognition",
          subtitle: "You are being called by the spirits",
          description: "What you're experiencing is a sacred initiation - the dark night of the soul that precedes your shamanic awakening. The old self must dissolve before the medicine person can be born.",
          guidance: "• Find a quiet place in nature and listen deeply\n• Your spirit guides are trying to reach you\n• This breakdown is actually a breakthrough\n• Consider seeking an elder or medicine person\n• Honor this as sacred time, not pathology",
          nextSteps: "Vision quest preparation, finding a shamanic mentor, dream work",
          supportType: "Sacred container holding with tribal elder",
          imagery: "🌳🦅🔥",
          color: "#8B4513"
        };

      case 'therapeutic':
        return {
          title: "📋 Crisis Assessment Complete",
          subtitle: "Acute adjustment disorder with mixed features",
          description: "You're experiencing a significant life transition with depression and anxiety symptoms. This appears to be an adjustment disorder triggered by multiple stressors. Clinical intervention recommended.",
          guidance: "• Establish safety and stabilization first\n• Consider cognitive-behavioral therapy (CBT)\n• Medication evaluation may be helpful\n• Build coping skills repertoire\n• Address underlying trauma if present",
          nextSteps: "Therapy referral, psychiatric evaluation, crisis planning",
          supportType: "Professional therapeutic intervention",
          imagery: "🧠📊💡",
          color: "#4169E1"
        };

      case 'corporate':
        return {
          title: "⚡ Leadership Crisis Identified",
          subtitle: "Executive performance optimization needed",
          description: "You're experiencing a classic leadership transition crisis. Your current leadership model is insufficient for your next level of responsibility. This is a growth opportunity.",
          guidance: "• Assess current leadership competencies\n• Identify performance gaps and strengths\n• Develop strategic vision for next role\n• Build emotional intelligence skills\n• Create succession planning strategy",
          nextSteps: "Executive coaching engagement, 360 feedback, leadership assessment",
          supportType: "High-performance executive coaching",
          imagery: "📈🎯🏆",
          color: "#2F4F4F"
        };

      case 'religious':
        return {
          title: "✟ Dark Night of the Soul",
          subtitle: "God is calling you deeper",
          description: "What you're experiencing is what St. John of the Cross called the 'dark night of the soul' - a necessary purification before deeper union with God. This is part of your spiritual journey.",
          guidance: "• Increase prayer and scripture reading\n• Seek spiritual direction\n• Practice contemplative prayer\n• Trust in God's plan for your life\n• Join a faith community for support",
          nextSteps: "Spiritual direction, retreat, contemplative practice",
          supportType: "Spiritual direction and pastoral care",
          imagery: "✝️🕊️📿",
          color: "#800080"
        };

      case 'recovery':
        return {
          title: "🔄 Step 4 Inventory Crisis",
          subtitle: "The pain is the invitation to healing",
          description: "This feels like the deep work of Step 4 - a searching and fearless moral inventory. Your Higher Power is showing you what needs to heal. This is recovery work.",
          guidance: "• Work with your sponsor closely\n• Attend more meetings for support\n• Use the Steps as your roadmap\n• Remember: progress not perfection\n• Share your experience with others",
          nextSteps: "Sponsor meeting, Step work, group sharing",
          supportType: "12-Step community and sponsorship",
          imagery: "🔄💪🤝",
          color: "#228B22"
        };

      case 'academic':
        return {
          title: "📚 Developmental Crisis Analysis",
          subtitle: "Lifespan development transition point",
          description: "You're experiencing what Erikson would call a developmental crisis - specifically the transition between life stages. Research shows this is a normal part of human development.",
          guidance: "• Review lifespan development literature\n• Apply evidence-based coping strategies\n• Consider cognitive restructuring techniques\n• Utilize social support networks\n• Document experience for insight",
          nextSteps: "Research review, peer consultation, methodical analysis",
          supportType: "Academic mentorship and peer review",
          imagery: "📖🔬📊",
          color: "#4B0082"
        };

      default:
        return {
          title: "Crisis Recognition",
          subtitle: "Support needed",
          description: "You're going through a difficult transition.",
          guidance: "Seek appropriate support",
          nextSteps: "Contact professional help",
          supportType: "General support",
          imagery: "❓",
          color: "#666666"
        };
    }
  };

  const content = getPortalSpecificContent();

  return (
    <motion.div
      className="portal-presentation"
      style={{
        background: `linear-gradient(135deg, ${content.color}22 0%, ${content.color}11 100%)`,
        border: `2px solid ${content.color}`,
        borderRadius: '12px',
        padding: '20px',
        margin: '15px',
        minHeight: '400px'
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>{content.imagery}</div>
        <h2 style={{ color: content.color, margin: '0' }}>{content.title}</h2>
        <h3 style={{ color: '#666', margin: '5px 0 0 0', fontStyle: 'italic' }}>
          {content.subtitle}
        </h3>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: content.color }}>Assessment:</h4>
        <p>{content.description}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: content.color }}>Guidance:</h4>
        <pre style={{
          whiteSpace: 'pre-line',
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {content.guidance}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: content.color }}>Next Steps:</h4>
        <p><strong>{content.nextSteps}</strong></p>
      </div>

      <div style={{
        backgroundColor: `${content.color}22`,
        padding: '10px',
        borderRadius: '6px',
        borderLeft: `4px solid ${content.color}`
      }}>
        <h4 style={{ color: content.color, margin: '0 0 5px 0' }}>Support Type:</h4>
        <p style={{ margin: '0' }}>{content.supportType}</p>
      </div>
    </motion.div>
  );
};

// Main Portal Demo Component
export const PortalDemo: React.FC = () => {
  const [selectedPortal, setSelectedPortal] = useState<PopulationPortal>('shamanic');

  const portals: PopulationPortal[] = ['shamanic', 'therapeutic', 'corporate', 'religious', 'recovery', 'academic'];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>🎭 Portal Architecture Demo</h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          <strong>Same Crisis State, Different Cultural Presentations</strong>
        </p>
        <p>
          Watch how the SAME underlying experience (Lead stage crisis) is presented
          differently for each population while maintaining the universal architecture.
        </p>
      </div>

      {/* Universal State Display */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '2px dashed #6c757d',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3>🔬 Universal Crisis State (Hidden from Users)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Alchemical Stage:</strong><br />
            <code>{UNIVERSAL_CRISIS_STATE.alchemicalStage}</code>
          </div>
          <div>
            <strong>Mercury Aspect:</strong><br />
            <code>{UNIVERSAL_CRISIS_STATE.mercuryAspect}</code>
          </div>
          <div>
            <strong>Crisis Level:</strong><br />
            <code>{UNIVERSAL_CRISIS_STATE.crisisLevel}/1.0</code>
          </div>
          <div>
            <strong>Symptoms:</strong><br />
            <code>{UNIVERSAL_CRISIS_STATE.symptoms.length} identified</code>
          </div>
        </div>
      </div>

      {/* Portal Selector */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h3>Select Population Portal:</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {portals.map(portal => {
            const config = PORTAL_CONFIGS[portal];
            return (
              <button
                key={portal}
                onClick={() => setSelectedPortal(portal)}
                style={{
                  padding: '10px 20px',
                  border: selectedPortal === portal ? `3px solid ${config.branding.colorScheme.primary}` : '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: selectedPortal === portal ? `${config.branding.colorScheme.primary}22` : 'white',
                  cursor: 'pointer',
                  fontWeight: selectedPortal === portal ? 'bold' : 'normal',
                  fontSize: '14px'
                }}
              >
                {config.branding.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Portal Presentation */}
      <PortalPresentation portal={selectedPortal} />

      {/* Architecture Benefits */}
      <div style={{
        marginTop: '40px',
        backgroundColor: '#e8f5e8',
        border: '2px solid #28a745',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h3 style={{ color: '#155724', margin: '0 0 15px 0' }}>
          🏗️ Architecture Benefits
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <strong>✅ Universal Backend:</strong><br />
            Same alchemical framework, crisis detection, and Mercury intelligence
          </div>
          <div>
            <strong>✅ Cultural Sensitivity:</strong><br />
            Meets people in their familiar language and cultural context
          </div>
          <div>
            <strong>✅ Scalable Development:</strong><br />
            Build once, deploy to multiple markets with different interfaces
          </div>
          <div>
            <strong>✅ Cross-Portal Learning:</strong><br />
            Insights from one population can benefit all others
          </div>
          <div>
            <strong>✅ Reduced Development Cost:</strong><br />
            Shared infrastructure with customized presentation layers
          </div>
          <div>
            <strong>✅ Maximum Impact:</strong><br />
            Serve diverse populations with proven consciousness technology
          </div>
        </div>
      </div>

    </div>
  );
};

export default PortalDemo;