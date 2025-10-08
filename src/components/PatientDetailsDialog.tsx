import React from 'react';
import { X, User, Calendar, Weight, Pill, Clock, Repeat, Info, Shield, Lightbulb, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  weight: number;
  drug: string;
  doseRange: string;
  frequency: string;
  duration: string;
  allergies: string;
  disease: string;
  status: 'active' | 'completed' | 'pending';
  notes: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

interface PatientDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export function PatientDetailsDialog({ isOpen, onClose, patient }: PatientDetailsDialogProps) {
  if (!isOpen || !patient) return null;

  // Parse the comprehensive notes from Doctor Panel
  const parseAnalysisNotes = (notes: string) => {
    const sections = {
      dosageRecommendation: '',
      precautions: '',
      keepInMind: '',
      patientContext: '',
      additionalNotes: ''
    };

    const lines = notes.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.includes('DOSAGE RECOMMENDATION:')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] = currentContent.join('\n');
        }
        currentSection = 'dosageRecommendation';
        currentContent = [];
      } else if (line.includes('CLINICAL GUIDANCE:')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] = currentContent.join('\n');
        }
        currentSection = 'precautions';
        currentContent = [];
      } else if (line.includes('PATIENT CONTEXT:')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] = currentContent.join('\n');
        }
        currentSection = 'patientContext';
        currentContent = [];
      } else if (line.includes('Additional Notes:')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] = currentContent.join('\n');
        }
        currentSection = 'additionalNotes';
        currentContent = [];
      } else if (line.trim() !== '' && !line.includes('===')) {
        currentContent.push(line);
      }
    }

    // Save the last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection as keyof typeof sections] = currentContent.join('\n');
    }

    return sections;
  };

  const analysisSections = parseAnalysisNotes(patient.notes);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full h-10 w-10 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-blue-700 flex items-center">
              <User className="h-7 w-7 mr-3 text-blue-500" />
              {patient.name} - Detailed Analysis
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              AI-generated dosage recommendation and clinical guidance
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-600" />
                <p className="text-slate-700">Gender: <span className="font-semibold">{patient.gender}</span></p>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <p className="text-slate-700">Age: <span className="font-semibold">{patient.age} years</span></p>
              </div>
              <div className="flex items-center space-x-3">
                <Weight className="h-5 w-5 text-blue-600" />
                <p className="text-slate-700">Weight: <span className="font-semibold">{patient.weight} kg</span></p>
              </div>
              <div className="flex items-center space-x-3">
                <Pill className="h-5 w-5 text-blue-600" />
                <p className="text-slate-700">Drug: <span className="font-semibold">{patient.drug}</span></p>
              </div>
            </div>

            {/* Dosage Recommendation */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Dosage Recommendation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Info className="h-5 w-5 text-green-600" />
                  <p className="text-slate-700">Dose Range: <span className="font-semibold text-green-800">{patient.doseRange}</span></p>
                </div>
                <div className="flex items-center space-x-3">
                  <Repeat className="h-5 w-5 text-green-600" />
                  <p className="text-slate-700">Frequency: <span className="font-semibold text-green-800">{patient.frequency}</span></p>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <p className="text-slate-700">Duration: <span className="font-semibold text-green-800">{patient.duration}</span></p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active Treatment
                  </Badge>
                </div>
              </div>
            </div>

            {/* AI Analysis Details */}
            {analysisSections.dosageRecommendation && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  AI Analysis Details
                </h3>
                <pre className="text-slate-700 whitespace-pre-wrap text-sm">{analysisSections.dosageRecommendation}</pre>
              </div>
            )}

            {/* Clinical Guidance */}
            {analysisSections.precautions && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Clinical Guidance & Precautions
                </h3>
                <pre className="text-slate-700 whitespace-pre-wrap text-sm">{analysisSections.precautions}</pre>
              </div>
            )}

            {/* Patient Context */}
            {analysisSections.patientContext && (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Patient Context
                </h3>
                <pre className="text-slate-700 whitespace-pre-wrap text-sm">{analysisSections.patientContext}</pre>
              </div>
            )}

            {/* Additional Notes */}
            {analysisSections.additionalNotes && (
              <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-200">
                <h3 className="text-lg font-semibold text-teal-800 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Additional Clinical Notes
                </h3>
                <pre className="text-slate-700 whitespace-pre-wrap text-sm">{analysisSections.additionalNotes}</pre>
              </div>
            )}

            {/* Timestamps */}
            {patient.created_at && (
              <div className="text-xs text-slate-500 text-right border-t pt-4 mt-6 border-slate-200">
                Analysis created: {new Date(patient.created_at).toLocaleString()}
                {patient.updated_at && patient.updated_at !== patient.created_at && (
                  <span> | Last updated: {new Date(patient.updated_at).toLocaleString()}</span>
                )}
              </div>
            )}
          </CardContent>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
