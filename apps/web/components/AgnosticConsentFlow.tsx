/**
 * Agnostic Consent Flow - Safety Terms and User Protection
 * 
 * Implements the consent UI for the agnostic experience framework,
 * presenting clear safety boundaries and user autonomy protections
 * without imposing any particular worldview.
 */

'use client';

import React, { useState } from 'react';
import { SAFETY_TERMS_OF_USE, PROFESSIONAL_REFERRALS } from '../backend/src/core/SafetyTermsOfUse';

interface AgnosticConsentFlowProps {
  consentType: 'basic_terms' | 'high_risk_exploration';
  consentMessage?: string;
  onConsentGiven: (consentType: string) => void;
  onConsentDeclined: () => void;
}

export function AgnosticConsentFlow({
  consentType,
  consentMessage,
  onConsentGiven,
  onConsentDeclined
}: AgnosticConsentFlowProps) {
  const [currentStep, setCurrentStep] = useState<'overview' | 'terms' | 'confirm'>('overview');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleItemCheck = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  const isBasicConsent = consentType === 'basic_terms';
  const requiredChecks = isBasicConsent ? 4 : 6; // Different requirements based on consent type
  const canProceed = checkedItems.size >= requiredChecks;

  if (currentStep === 'overview') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-blue-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {SAFETY_TERMS_OF_USE.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {SAFETY_TERMS_OF_USE.preamble}
          </p>
        </div>

        {consentMessage && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            consentType === 'high_risk_exploration' 
              ? 'bg-amber-50 border-amber-400' 
              : 'bg-blue-50 border-blue-400'
          }`}>
            <p className="text-sm whitespace-pre-line">{consentMessage}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              {SAFETY_TERMS_OF_USE.what_we_provide.title}
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              {SAFETY_TERMS_OF_USE.what_we_provide.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              {SAFETY_TERMS_OF_USE.what_we_dont_claim.title}
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {SAFETY_TERMS_OF_USE.what_we_dont_claim.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep('terms')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue to Review Terms
          </button>
          <button
            onClick={onConsentDeclined}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'terms') {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-blue-200">
        <div className="mb-6">
          <button
            onClick={() => setCurrentStep('overview')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            Terms of Use - Please Review Carefully
          </h2>
        </div>

        <div className="space-y-6 mb-6 max-h-96 overflow-y-auto">
          {/* Safety Boundaries */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3">
              {SAFETY_TERMS_OF_USE.safety_boundaries.title}
            </h3>
            <div className="space-y-2">
              {SAFETY_TERMS_OF_USE.safety_boundaries.items.map((item, index) => (
                <label key={index} className="flex items-start text-sm text-red-700">
                  <input
                    type="checkbox"
                    checked={checkedItems.has(`safety_${index}`)}
                    onChange={() => handleItemCheck(`safety_${index}`)}
                    className="mt-1 mr-3 text-red-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* User Agency */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">
              {SAFETY_TERMS_OF_USE.user_agency.title}
            </h3>
            <div className="space-y-2">
              {SAFETY_TERMS_OF_USE.user_agency.principles.slice(0, 3).map((principle, index) => (
                <label key={index} className="flex items-start text-sm text-blue-700">
                  <input
                    type="checkbox"
                    checked={checkedItems.has(`agency_${index}`)}
                    onChange={() => handleItemCheck(`agency_${index}`)}
                    className="mt-1 mr-3 text-blue-600"
                  />
                  <span>{principle}</span>
                </label>
              ))}
            </div>
          </div>

          {/* High-risk specific consent */}
          {consentType === 'high_risk_exploration' && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-3">
                {SAFETY_TERMS_OF_USE.when_to_seek_help.title}
              </h3>
              <div className="space-y-2">
                {SAFETY_TERMS_OF_USE.when_to_seek_help.red_flags.slice(0, 3).map((flag, index) => (
                  <label key={index} className="flex items-start text-sm text-amber-700">
                    <input
                      type="checkbox"
                      checked={checkedItems.has(`help_${index}`)}
                      onChange={() => handleItemCheck(`help_${index}`)}
                      className="mt-1 mr-3 text-amber-600"
                      required
                    />
                    <span>I understand: "{flag}" requires professional support</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Consent Acknowledgments */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">
              {SAFETY_TERMS_OF_USE.consent_acknowledgments.title}
            </h3>
            <div className="space-y-2">
              {SAFETY_TERMS_OF_USE.consent_acknowledgments.items.slice(0, isBasicConsent ? 4 : 7).map((item, index) => (
                <label key={index} className="flex items-start text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={checkedItems.has(`consent_${index}`)}
                    onChange={() => handleItemCheck(`consent_${index}`)}
                    className="mt-1 mr-3 text-gray-600"
                    required
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">
              {checkedItems.size} of {requiredChecks} required items acknowledged
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (checkedItems.size / requiredChecks) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep('confirm')}
              disabled={!canProceed}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                canProceed
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canProceed ? 'Proceed to Final Consent' : `Select ${requiredChecks - checkedItems.size} more items`}
            </button>
            <button
              onClick={onConsentDeclined}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-green-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Final Consent Confirmation
          </h2>
          <p className="text-gray-600">
            You&apos;ve reviewed the terms and understand the boundaries of this exploration tool.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">You&apos;ve confirmed:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Understanding this is an exploration tool, not professional guidance</li>
            <li>• Commitment to maintaining connections with trusted people</li>
            <li>• Agreement to seek professional help when experiences become concerning</li>
            <li>• Recognition of your autonomy over interpreting your experiences</li>
            {consentType === 'high_risk_exploration' && (
              <>
                <li>• Awareness of when professional support is needed</li>
                <li>• Understanding the importance of safety measures</li>
              </>
            )}
          </ul>
        </div>

        {consentType === 'high_risk_exploration' && (
          <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Resources Available:</h3>
            <div className="text-sm text-amber-700 space-y-2">
              <p><strong>Crisis Support:</strong> {PROFESSIONAL_REFERRALS.crisis_support.resources[0]}</p>
              <p><strong>Mental Health:</strong> Psychology Today directory with spiritual/religious filters</p>
              <p><strong>Remember:</strong> Your safety and wellbeing are always the top priority.</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onConsentGiven(consentType)}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            I Give My Informed Consent
          </button>
          <button
            onClick={() => setCurrentStep('terms')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Review Terms Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Professional Resources Display Component
 */
export function ProfessionalResourcesDisplay() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-blue-200">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Professional Support Resources
        </h2>
        <p className="text-gray-600">
          These resources are available whenever you need additional support beyond what this tool can provide.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(PROFESSIONAL_REFERRALS).map(([key, resource]) => (
          <div key={key} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setExpandedSection(expandedSection === key ? null : key)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium text-gray-800">{resource.title}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSection === key ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === key && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <p className="text-gray-700 mb-3">{resource.description}</p>
                
                {'finding_help' in resource && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800 mb-2">Finding Help:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {(resource as any).finding_help.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {'options' in resource && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800 mb-2">Options Available:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {(resource as any).options.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {'resources' in resource && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800 mb-2">Contact Information:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {(resource as any).resources.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {'when_needed' in resource && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">When to Seek This Help:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {(resource as any).when_needed.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Remember:</h3>
        <p className="text-sm text-blue-700">
          Seeking professional support is a sign of wisdom and self-care, not weakness. 
          Many professionals are experienced with spiritual and unusual experiences and 
          can provide helpful perspective while respecting your personal beliefs.
        </p>
      </div>
    </div>
  );
}