"use client";

/**
 * EMERGENCY KIT FORM
 *
 * Edit form for client emergency/safety information.
 * Dignified, clear, comprehensive.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Phone,
  AlertTriangle,
  Pill,
  Heart,
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import type {
  ClientEmergencyInfo,
  EmergencyContact,
  CrisisResource,
  CreateEmergencyInfoInput,
} from '@/lib/practitioner/sessionPrep';

interface EmergencyKitFormProps {
  info: ClientEmergencyInfo | null;
  defaultResources?: CrisisResource[];
  onSave: (data: CreateEmergencyInfoInput) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function EmergencyKitForm({
  info,
  defaultResources = [],
  onSave,
  onCancel,
  isSaving = false,
}: EmergencyKitFormProps) {
  // Form state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    info?.emergency_contacts || []
  );
  const [safetyPlan, setSafetyPlan] = useState(info?.safety_plan || '');
  const [medications, setMedications] = useState(info?.medications || '');
  const [medicalConditions, setMedicalConditions] = useState(info?.medical_conditions || '');
  const [riskNotes, setRiskNotes] = useState(info?.risk_notes || '');
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>(
    info?.crisis_resources || defaultResources
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      emergency_contacts: emergencyContacts.filter(c => c.name && c.phone),
      safety_plan: safetyPlan || undefined,
      medications: medications || undefined,
      medical_conditions: medicalConditions || undefined,
      risk_notes: riskNotes || undefined,
      crisis_resources: crisisResources.filter(r => r.name && r.phone),
    });
  };

  // Emergency contact helpers
  const addContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      { name: '', relationship: '', phone: '', is_primary: false },
    ]);
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string | boolean) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  const removeContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  // Crisis resource helpers
  const addResource = () => {
    setCrisisResources([
      ...crisisResources,
      { name: '', phone: '', type: 'hotline' },
    ]);
  };

  const updateResource = (index: number, field: keyof CrisisResource, value: string) => {
    const updated = [...crisisResources];
    updated[index] = { ...updated[index], [field]: value } as CrisisResource;
    setCrisisResources(updated);
  };

  const removeResource = (index: number) => {
    setCrisisResources(crisisResources.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardHeader className="pb-2 border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-100">Edit Emergency Kit</CardTitle>
                <p className="text-sm text-gray-500">Safety information for this client</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Emergency Contacts Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-red-400" />
                <span>Emergency Contacts</span>
              </h4>
              <button
                type="button"
                onClick={addContact}
                className="text-xs text-sacred-gold hover:text-sacred-gold/80 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            {emergencyContacts.length > 0 ? (
              <div className="space-y-3">
                {emergencyContacts.map((contact, i) => (
                  <div key={i} className="p-4 bg-gray-800/30 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Contact {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeContact(i)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={contact.name}
                        onChange={(e) => updateContact(i, 'name', e.target.value)}
                        className="px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sacred-gold/30"
                      />
                      <input
                        type="text"
                        placeholder="Relationship"
                        value={contact.relationship}
                        onChange={(e) => updateContact(i, 'relationship', e.target.value)}
                        className="px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sacred-gold/30"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={contact.phone}
                        onChange={(e) => updateContact(i, 'phone', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sacred-gold/30"
                      />
                      <label className="flex items-center space-x-2 text-xs text-gray-400">
                        <input
                          type="checkbox"
                          checked={contact.is_primary}
                          onChange={(e) => updateContact(i, 'is_primary', e.target.checked)}
                          className="rounded border-gray-700/30 bg-gray-900/50 text-sacred-gold focus:ring-sacred-gold/30"
                        />
                        <span>Primary</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic p-3 bg-gray-800/20 rounded-lg">
                No emergency contacts. Click &quot;Add Contact&quot; to add one.
              </p>
            )}
          </section>

          {/* Risk Notes Section */}
          <section>
            <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Risk Factors</span>
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              Note any risk factors, warning signs, or safety concerns.
              <span className="block mt-1 text-gray-600">
                Keep de-identified where possible (no names, employers, or exact dates).
              </span>
            </p>
            <textarea
              value={riskNotes}
              onChange={(e) => setRiskNotes(e.target.value)}
              placeholder="Practitioner notes on risk factors..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/30 resize-none"
            />
          </section>

          {/* Safety Plan Section */}
          <section>
            <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Safety Plan</span>
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              Document the client&apos;s safety plan if one exists
            </p>
            <textarea
              value={safetyPlan}
              onChange={(e) => setSafetyPlan(e.target.value)}
              placeholder="Client's safety plan..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/30 resize-none"
            />
          </section>

          {/* Medical Info Section */}
          <section>
            <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>Medical Information</span>
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              Optional. Only include if relevant to safety coordination.
            </p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                  <Pill className="w-3 h-3" />
                  <span>Medications</span>
                </label>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="Current medications and dosages..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500/30 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Medical Conditions</label>
                <textarea
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="Relevant medical conditions..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500/30 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Crisis Resources Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>Crisis Resources</span>
              </h4>
              <button
                type="button"
                onClick={addResource}
                className="text-xs text-sacred-gold hover:text-sacred-gold/80 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Resource</span>
              </button>
            </div>

            {crisisResources.length > 0 ? (
              <div className="space-y-3">
                {crisisResources.map((resource, i) => (
                  <div key={i} className="p-4 bg-gray-800/30 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <select
                        value={resource.type}
                        onChange={(e) => updateResource(i, 'type', e.target.value)}
                        className="text-xs px-2 py-1 bg-gray-900/50 border border-gray-700/30 rounded text-gray-300 focus:outline-none focus:border-blue-500/30"
                      >
                        <option value="hotline">Hotline</option>
                        <option value="hospital">Hospital</option>
                        <option value="police">Police</option>
                        <option value="other">Other</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeResource(i)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Resource name"
                        value={resource.name}
                        onChange={(e) => updateResource(i, 'name', e.target.value)}
                        className="px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/30"
                      />
                      <input
                        type="tel"
                        placeholder="Phone / Text number"
                        value={resource.phone}
                        onChange={(e) => updateResource(i, 'phone', e.target.value)}
                        className="px-3 py-2 bg-gray-900/50 border border-gray-700/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/30"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic p-3 bg-gray-800/20 rounded-lg">
                No crisis resources. Click &quot;Add Resource&quot; to add hotlines, hospitals, etc.
              </p>
            )}
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800/50">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <motion.button
              type="submit"
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-sm bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg border border-sacred-gold/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Emergency Kit</span>
                </>
              )}
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
