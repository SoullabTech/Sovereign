"use client";

import React, { useState, useEffect } from "react";
import {
  UserHolisticProfile,
  HolisticDomain,
  DevelopmentStage,
  DevelopmentGoal,
  Milestone,
} from "../../../lib/types/holistic";

// Define missing types locally for now
interface PersonalizedPathway {
  userId: string;
  currentPhase: string;
  pathwaySteps: PathwayStep[];
  progressMetrics: ProgressMetric[];
}

interface PathwayStep {
  id: string;
  order: number;
  title: string;
  description: string;
  domains: HolisticDomain[];
  practices: Practice[];
  expectedDuration: number;
  completionCriteria: string[];
  completed: boolean;
}

interface Practice {
  id: string;
  title: string;
  instructions: string;
  duration: number;
  domains: HolisticDomain[];
  difficulty: DevelopmentStage;
}

interface ProgressMetric {
  domain: HolisticDomain;
  metricType: "quantitative" | "qualitative";
  currentValue: number | string;
  targetValue: number | string;
  trend: "improving" | "stable" | "declining";
  lastMeasured: Date;
}
import { AdaptiveInterface } from "./AdaptiveInterface";

interface HolisticDashboardProps {
  userId: string;
}

export const HolisticDashboard: React.FC<HolisticDashboardProps> = ({
  userId,
}) => {
  const [userProfile, setUserProfile] = useState<UserHolisticProfile | null>(
    null,
  );
  const [pathway, setPathway] = useState<PersonalizedPathway | null>(null);
  const [activeView, setActiveView] = useState<
    "overview" | "pathway" | "assessment"
  >("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const [profileResponse, pathwayResponse] = await Promise.all([
        fetch(`/api/holistic/profile/${userId}`),
        fetch(`/api/holistic/pathway/${userId}`),
      ]);

      const profileData = await profileResponse.json();
      const pathwayData = await pathwayResponse.json();

      setUserProfile(profileData);
      setPathway(pathwayData);
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserHolisticProfile) => {
    try {
      await fetch(`/api/holistic/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to Holistic Development
          </h2>
          <p className="text-gray-600 mb-6">
            Let&apos;s begin with an assessment to understand your current
            development across mind, body, spirit, and emotions.
          </p>
          <button
            onClick={() => setActiveView("assessment")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Holistic Development Dashboard
            </h1>
            <div className="flex space-x-4">
              {["overview", "pathway", "assessment"].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-md capitalize ${
                    activeView === view
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {activeView === "overview" && (
          <div className="space-y-6">
            <HolisticOverview profile={userProfile} pathway={pathway} />
            <AdaptiveInterface
              userProfile={userProfile}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        )}

        {activeView === "pathway" && pathway && (
          <PathwayView
            pathway={pathway}
            onStepComplete={(stepId) => {
              // Handle step completion
            }}
          />
        )}

        {activeView === "assessment" && (
          <AssessmentView
            currentProfile={userProfile}
            onAssessmentComplete={handleProfileUpdate}
          />
        )}
      </main>
    </div>
  );
};

interface HolisticOverviewProps {
  profile: UserHolisticProfile;
  pathway: PersonalizedPathway | null;
}

const HolisticOverview: React.FC<HolisticOverviewProps> = ({
  profile,
  pathway,
}) => {
  const getProgressPercentage = () => {
    if (!pathway) return 0;
    const completed = pathway.pathwaySteps.filter(
      (step) => step.completed,
    ).length;
    return (completed / pathway.pathwaySteps.length) * 100;
  };

  const getDomainColor = (level: number) => {
    if (level >= 7) return "bg-green-500";
    if (level >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Current State Summary */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Development Overview</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {profile.domains.map((domain) => (
            <div key={domain.domain} className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full border-4 border-gray-200 flex items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-full ${getDomainColor(domain.currentLevel)} flex items-center justify-center text-white font-bold`}
                >
                  {domain.currentLevel.toFixed(1)}
                </div>
              </div>
              <h3 className="font-medium capitalize">{domain.domain}</h3>
              <p className="text-xs text-gray-600">{domain.developmentStage}</p>
            </div>
          ))}
        </div>

        {/* Current Phase */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Current Phase</h3>
          <p className="text-blue-700">
            {pathway?.currentPhase || "Assessment Complete"}
          </p>

          {pathway && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>Progress</span>
                <span>{getProgressPercentage().toFixed(1)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-medium mb-3">Current State</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stress Level</span>
              <span className="text-sm font-medium">
                {profile.stressLevel}/10
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Energy Level</span>
              <span className="text-sm font-medium">
                {profile.energyLevel}/10
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">State</span>
              <span className="text-sm font-medium capitalize">
                {profile.currentState}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-medium mb-3">Development Goals</h3>
          {profile.developmentGoals.length > 0 ? (
            <div className="space-y-2">
              {profile.developmentGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="text-sm">
                  <div className="font-medium">{goal.description}</div>
                  <div className="text-gray-600 capitalize">{goal.domain}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No goals set yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface PathwayViewProps {
  pathway: PersonalizedPathway;
  onStepComplete: (stepId: string) => void;
}

const PathwayView: React.FC<PathwayViewProps> = ({
  pathway,
  onStepComplete,
}) => {
  const nextStep = pathway.pathwaySteps.find((step) => !step.completed);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">
          Your Personalized Pathway
        </h2>
        <p className="text-gray-600 mb-4">
          Current Phase:{" "}
          <span className="font-medium">{pathway.currentPhase}</span>
        </p>

        {nextStep && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Next Step</h3>
            <h4 className="font-medium mb-2">{nextStep.title}</h4>
            <p className="text-sm text-blue-700 mb-3">{nextStep.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">
                Expected duration: {nextStep.expectedDuration} days
              </span>
              <button
                onClick={() => onStepComplete(nextStep.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Begin Step
              </button>
            </div>
          </div>
        )}
      </div>

      {/* All Pathway Steps */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Pathway Steps</h3>
        <div className="space-y-4">
          {pathway.pathwaySteps.map((step, index) => (
            <PathwayStepCard
              key={step.id}
              step={step}
              stepNumber={index + 1}
              onComplete={() => onStepComplete(step.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface PathwayStepCardProps {
  step: PathwayStep;
  stepNumber: number;
  onComplete: () => void;
}

const PathwayStepCard: React.FC<PathwayStepCardProps> = ({
  step,
  stepNumber,
  onComplete,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-lg p-4 ${step.completed ? "bg-green-50 border-green-200" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {step.completed ? "✓" : stepNumber}
            </div>
            <div>
              <h4 className="font-medium">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>

          {expanded && (
            <div className="ml-11 space-y-3">
              <div>
                <h5 className="text-sm font-medium mb-2">Practices:</h5>
                <div className="space-y-2">
                  {step.practices.map((practice) => (
                    <div key={practice.id} className="bg-gray-50 rounded p-3">
                      <div className="font-medium text-sm">
                        {practice.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {practice.instructions}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {practice.duration} minutes
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">
                  Completion Criteria:
                </h5>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {step.completionCriteria.map((criteria, idx) => (
                    <li key={idx}>{criteria}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {expanded ? "▼" : "▶"}
          </button>
          {!step.completed && (
            <button
              onClick={onComplete}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface AssessmentViewProps {
  currentProfile: UserHolisticProfile | null;
  onAssessmentComplete: (profile: UserHolisticProfile) => void;
}

const AssessmentView: React.FC<AssessmentViewProps> = ({
  currentProfile,
  onAssessmentComplete,
}) => {
  const [assessmentData, setAssessmentData] = useState<any>({});
  const [currentDomain, setCurrentDomain] = useState<HolisticDomain>(
    HolisticDomain.MIND,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const domains = Object.values(HolisticDomain);
  const currentDomainIndex = domains.indexOf(currentDomain);

  const handleDomainResponse = (responses: Record<string, string>) => {
    setAssessmentData((prev: any) => ({
      ...prev,
      [currentDomain]: responses,
    }));

    if (currentDomainIndex < domains.length - 1) {
      setCurrentDomain(domains[currentDomainIndex + 1]);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/holistic/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentProfile?.userId || "new-user",
          assessmentData: {
            ...assessmentData,
            stressLevel: 5,
            energyLevel: 5,
            learningStyle: "mixed",
          },
        }),
      });

      const newProfile = await response.json();
      onAssessmentComplete(newProfile);
    } catch (error) {
      console.error("Assessment submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Processing your assessment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Holistic Assessment:{" "}
              {currentDomain.charAt(0).toUpperCase() + currentDomain.slice(1)}
            </h2>
            <span className="text-sm text-gray-600">
              {currentDomainIndex + 1} of {domains.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentDomainIndex + 1) / domains.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <DomainAssessmentForm
          domain={currentDomain}
          onComplete={handleDomainResponse}
        />
      </div>
    </div>
  );
};

interface DomainAssessmentFormProps {
  domain: HolisticDomain;
  onComplete: (responses: Record<string, string>) => void;
}

const DomainAssessmentForm: React.FC<DomainAssessmentFormProps> = ({
  domain,
  onComplete,
}) => {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const questions = {
    [HolisticDomain.MIND]: [
      {
        question: "How clear and focused do you feel in your daily thinking?",
        options: ["very_clear", "mostly_clear", "somewhat_foggy", "very_foggy"],
      },
      {
        question: "How well do you communicate your thoughts and ideas?",
        options: ["excellently", "well", "adequately", "poorly"],
      },
      {
        question:
          "How effectively do you solve problems and learn new concepts?",
        options: ["very_effectively", "effectively", "somewhat", "struggle"],
      },
    ],
    [HolisticDomain.BODY]: [
      {
        question: "How connected do you feel to your physical body?",
        options: ["very_connected", "connected", "somewhat", "disconnected"],
      },
      {
        question: "How would you rate your overall physical energy levels?",
        options: ["high", "good", "moderate", "low"],
      },
      {
        question: "How well do you maintain physical wellness practices?",
        options: ["consistently", "regularly", "occasionally", "rarely"],
      },
    ],
    [HolisticDomain.SPIRIT]: [
      {
        question: "How connected do you feel to your life purpose?",
        options: ["deeply", "connected", "searching", "lost"],
      },
      {
        question:
          "How often do you experience moments of transcendence or deep meaning?",
        options: ["frequently", "regularly", "occasionally", "rarely"],
      },
      {
        question: "How aligned do your actions feel with your values?",
        options: ["fully", "mostly", "somewhat", "misaligned"],
      },
    ],
    [HolisticDomain.EMOTIONS]: [
      {
        question: "How well do you understand and process your emotions?",
        options: ["very_well", "well", "adequately", "poorly"],
      },
      {
        question: "How effectively do you express emotions in healthy ways?",
        options: ["very_effectively", "effectively", "somewhat", "struggle"],
      },
      {
        question: "How resilient are you in emotional challenges?",
        options: ["very_resilient", "resilient", "somewhat", "fragile"],
      },
    ],
  };

  const domainQuestions = questions[domain] || [];

  const handleSubmit = () => {
    if (Object.keys(responses).length === domainQuestions.length) {
      onComplete(responses);
    }
  };

  const formatOptionLabel = (option: string) => {
    return option.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {domainQuestions.map((q, index) => (
        <div key={index}>
          <h3 className="font-medium mb-3">{q.question}</h3>
          <div className="space-y-2">
            {q.options.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`q${index}`}
                  value={option}
                  checked={responses[`q${index}`] === option}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [`q${index}`]: e.target.value,
                    }))
                  }
                  className="text-blue-600"
                />
                <span className="text-sm">{formatOptionLabel(option)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={Object.keys(responses).length < domainQuestions.length}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {domain === HolisticDomain.EMOTIONS
          ? "Complete Assessment"
          : "Continue to Next Domain"}
      </button>
    </div>
  );
};
