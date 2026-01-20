"use client";

/**
 * EMERGENCY KIT CARD
 *
 * Per-client safety information at your fingertips.
 * Critical information when you need it most.
 *
 * PRIVACY: Sensitive content is collapsed by default to prevent
 * shoulder-surfing, accidental screen shares, or client glimpses.
 * Practitioners must explicitly reveal to view details.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Phone,
  AlertTriangle,
  Pill,
  Heart,
  FileText,
  User,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { ClientEmergencyInfo, EmergencyContact, CrisisResource } from '@/lib/practitioner/sessionPrep';

interface EmergencyKitCardProps {
  info: ClientEmergencyInfo | null;
  clientName: string;
  onEdit?: () => void;
  variant?: 'full' | 'compact';
}

export default function EmergencyKitCard({
  info,
  clientName,
  onEdit,
  variant = 'full',
}: EmergencyKitCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Compact variant for quick access (unchanged)
  if (variant === 'compact' || !info) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-200">Emergency Kit</h3>
                <p className="text-xs text-gray-500">
                  {info ? 'Safety info on file' : 'No emergency info recorded'}
                </p>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-700/30 transition-colors"
            >
              {info ? 'View / Edit' : 'Add Info'}
            </button>
          </div>

          {/* Quick summary if info exists */}
          {info && (
            <div className="mt-3 flex flex-wrap gap-2">
              {info.emergency_contacts.length > 0 && (
                <span className="text-xs px-2 py-1 bg-gray-800/50 text-gray-400 rounded-full">
                  {info.emergency_contacts.length} contact{info.emergency_contacts.length > 1 ? 's' : ''}
                </span>
              )}
              {info.has_safety_plan && (
                <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                  Safety plan
                </span>
              )}
              {info.has_risk_factors && (
                <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                  Risk factors
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Helper: check if there's medical info
  const hasMedicalInfo = !!(info.medications || info.medical_conditions);

  // Full variant with reveal/hide pattern
  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-red-500/20">
      <CardHeader className="pb-2 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-100 flex items-center space-x-2">
                <span>Emergency Kit</span>
                {/* Sensitive badge when risk notes exist */}
                {info.has_risk_factors && (
                  <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                    Sensitive
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-gray-500">{clientName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Reveal/Hide button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setRevealed(!revealed)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center space-x-2 ${
                revealed
                  ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-300 border-gray-700/30'
                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {revealed ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Reveal</span>
                </>
              )}
            </motion.button>

            {/* Edit button (always visible) */}
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-700/30 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* COLLAPSED VIEW: Status chips only */}
        {!revealed && (
          <div className="space-y-4">
            {/* Status summary chips */}
            <div className="flex flex-wrap gap-2">
              {/* Contacts count (no names) */}
              {info.emergency_contacts.length > 0 && (
                <span className="text-xs px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-full flex items-center space-x-1.5">
                  <Phone className="w-3 h-3" />
                  <span>{info.emergency_contacts.length} emergency contact{info.emergency_contacts.length > 1 ? 's' : ''}</span>
                </span>
              )}

              {/* Safety plan indicator */}
              {info.has_safety_plan && (
                <span className="text-xs px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 flex items-center space-x-1.5">
                  <FileText className="w-3 h-3" />
                  <span>Safety plan on file</span>
                </span>
              )}

              {/* Risk factors indicator */}
              {info.has_risk_factors && (
                <span className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Risk notes present</span>
                </span>
              )}

              {/* Medical info indicator */}
              {hasMedicalInfo && (
                <span className="text-xs px-3 py-1.5 bg-pink-500/10 text-pink-400 rounded-full border border-pink-500/20 flex items-center space-x-1.5">
                  <Heart className="w-3 h-3" />
                  <span>Medical info</span>
                </span>
              )}

              {/* Crisis resources indicator */}
              {info.crisis_resources.length > 0 && (
                <span className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 flex items-center space-x-1.5">
                  <ExternalLink className="w-3 h-3" />
                  <span>{info.crisis_resources.length} crisis resource{info.crisis_resources.length > 1 ? 's' : ''}</span>
                </span>
              )}

              {/* Empty state */}
              {info.emergency_contacts.length === 0 &&
               !info.has_safety_plan &&
               !info.has_risk_factors &&
               !hasMedicalInfo &&
               info.crisis_resources.length === 0 && (
                <span className="text-xs text-gray-500 italic">
                  No safety information recorded yet
                </span>
              )}
            </div>

            {/* Last updated */}
            <div className="text-xs text-gray-600">
              Last updated: {new Date(info.updated_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>

            {/* Prompt to reveal */}
            <p className="text-xs text-gray-500 italic">
              Click &quot;Reveal&quot; to view sensitive details
            </p>
          </div>
        )}

        {/* REVEALED VIEW: Full content */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 overflow-hidden"
            >
              {/* Emergency Contacts */}
              <section>
                <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2 mb-3">
                  <Phone className="w-4 h-4 text-red-400" />
                  <span>Emergency Contacts</span>
                </h4>

                {info.emergency_contacts.length > 0 ? (
                  <div className="space-y-2">
                    {info.emergency_contacts.map((contact, i) => (
                      <EmergencyContactItem
                        key={i}
                        contact={contact}
                        onCopy={handleCopyPhone}
                        copied={copiedPhone === contact.phone}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No emergency contacts recorded</p>
                )}
              </section>

              {/* Risk Notes */}
              {info.risk_notes && (
                <section className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <h4 className="text-sm font-medium text-red-400 flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Risk Factors</span>
                  </h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {info.risk_notes}
                  </p>
                </section>
              )}

              {/* Safety Plan */}
              {info.safety_plan && (
                <section>
                  <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Safety Plan</span>
                  </h4>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {info.safety_plan}
                    </p>
                  </div>
                </section>
              )}

              {/* Medical Info */}
              {hasMedicalInfo && (
                <section>
                  <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>Medical Information</span>
                  </h4>

                  <div className="space-y-3">
                    {info.medications && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 flex items-center space-x-1">
                          <Pill className="w-3 h-3" />
                          <span>Medications</span>
                        </p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {info.medications}
                        </p>
                      </div>
                    )}

                    {info.medical_conditions && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Medical Conditions</p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {info.medical_conditions}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Crisis Resources */}
              <section>
                <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2 mb-3">
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span>Crisis Resources</span>
                </h4>

                {info.crisis_resources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {info.crisis_resources.map((resource, i) => (
                      <CrisisResourceItem
                        key={i}
                        resource={resource}
                        onCopy={handleCopyPhone}
                        copied={copiedPhone === resource.phone}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No crisis resources configured</p>
                )}
              </section>

              {/* Last Updated */}
              <div className="pt-3 border-t border-gray-800/50 text-xs text-gray-500">
                Last updated: {new Date(info.updated_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Sub-components

function EmergencyContactItem({
  contact,
  onCopy,
  copied,
}: {
  contact: EmergencyContact;
  onCopy: (phone: string) => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-200">{contact.name}</p>
          <p className="text-xs text-gray-500">{contact.relationship}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">{contact.phone}</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onCopy(contact.phone)}
          className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
          title="Copy phone number"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </motion.button>
        <a
          href={`tel:${contact.phone}`}
          className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
          title="Call"
        >
          <Phone className="w-4 h-4 text-green-400" />
        </a>
      </div>
    </div>
  );
}

function CrisisResourceItem({
  resource,
  onCopy,
  copied,
}: {
  resource: CrisisResource;
  onCopy: (phone: string) => void;
  copied: boolean;
}) {
  const typeColors = {
    hotline: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    hospital: 'bg-red-500/10 border-red-500/20 text-red-400',
    police: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    other: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  };

  return (
    <div className="p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-200">{resource.name}</p>
          <p className="text-sm text-gray-400 mt-0.5">{resource.phone}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[resource.type]}`}>
          {resource.type}
        </span>
      </div>

      <div className="flex items-center space-x-2 mt-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onCopy(resource.phone)}
          className="flex-1 py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-xs text-gray-300 flex items-center justify-center space-x-1"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </motion.button>
        <a
          href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
          className="flex-1 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors text-xs text-green-400 flex items-center justify-center space-x-1"
        >
          <Phone className="w-3 h-3" />
          <span>Call</span>
        </a>
      </div>
    </div>
  );
}
