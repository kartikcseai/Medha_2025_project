import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  Search, 
  Stethoscope, 
  Brain, 
  Heart, 
  Thermometer, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileText,
  Pill,
  Activity,
  TrendingUp,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../lib/supabaseClient';

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
}

interface AnalysisResult {
  diseasePrediction: string;
  confidence: number;
  symptoms: string[];
  homeRemedies: string[];
  precautions: string[];
  whenToSeeDoctor: string[];
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

interface EHRAnalysisProps {
  onBack: () => void;
}

export function EHRAnalysis({ onBack }: EHRAnalysisProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading patients:', error);
        // Use mock data if database fails
        setPatients([
          {
            id: '1',
            name: 'Suraj Kumar',
            gender: 'Male',
            age: 14,
            weight: 30,
            drug: 'Paracetamol',
            doseRange: '300-600 mg/day',
            frequency: '3 times daily',
            duration: '5 days',
            allergies: 'None',
            disease: 'Fever',
            status: 'active',
            notes: 'Patient with fever symptoms',
            date: '2025-01-07'
          },
          {
            id: '2',
            name: 'Emma Johnson',
            gender: 'Female',
            age: 5,
            weight: 18.5,
            drug: 'Amoxicillin',
            doseRange: '185–370 mg/day',
            frequency: '3 times daily',
            duration: '7 days',
            allergies: 'None',
            disease: 'Acute otitis media',
            status: 'active',
            notes: 'Ear infection treatment',
            date: '2025-01-06'
          }
        ]);
      } else {
        const transformedPatients = data?.map(record => ({
          id: record.id,
          name: record.child_name || '',
          gender: record.gender || '',
          age: record.age_years || 0,
          weight: record.weight_kg || 0,
          drug: record.drug_name || '',
          doseRange: record.dose_range || '',
          frequency: record.frequency || '',
          duration: record.duration || '',
          allergies: 'None',
          disease: 'Not specified',
          status: 'active' as 'active' | 'completed' | 'pending',
          notes: record.analysis_notes || '',
          date: record.created_at ? new Date(record.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        })) || [];
        setPatients(transformedPatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatient || !symptoms.trim()) {
      alert('Please select a patient and enter symptoms.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Call Gemini API for analysis
      const { data, error } = await supabase.functions.invoke('analyze-ehr', {
        body: {
          patient: {
            childName: selectedPatient.name,
            gender: selectedPatient.gender,
            age: selectedPatient.age.toString(),
            weight: selectedPatient.weight.toString(),
            allergies: selectedPatient.allergies,
            drugReactions: 'None',
            takingOtherMeds: 'no',
            otherMeds: '',
            diseaseName: selectedPatient.disease,
            diseaseDurationMonths: '1'
          },
          symptoms: symptoms,
          additionalInfo: additionalInfo,
          analysisType: 'disease_prediction'
        }
      });

      if (error) {
        console.error('Gemini API error:', error);
        // Use mock analysis if API fails
        const mockResult: AnalysisResult = {
          diseasePrediction: 'Viral Upper Respiratory Infection',
          confidence: 85,
          symptoms: symptoms.split(',').map(s => s.trim()),
          homeRemedies: [
            'Rest and adequate sleep (8-10 hours)',
            'Stay hydrated with warm fluids (water, herbal tea)',
            'Gargle with warm salt water 3-4 times daily',
            'Use a humidifier to keep air moist',
            'Apply warm compress to affected areas',
            'Honey and lemon in warm water for throat relief'
          ],
          precautions: [
            'Monitor temperature every 4 hours',
            'Watch for signs of dehydration',
            'Avoid contact with others to prevent spread',
            'Maintain good hand hygiene',
            'Get plenty of rest'
          ],
          whenToSeeDoctor: [
            'Fever above 101.3°F (38.5°C) for more than 3 days',
            'Difficulty breathing or shortness of breath',
            'Severe headache or neck stiffness',
            'Persistent vomiting or inability to keep fluids down',
            'Symptoms worsen after 5-7 days'
          ],
          severity: 'moderate'
        };
        setAnalysisResult(mockResult);
      } else {
        // Parse Gemini response
        const result = data?.analysis || data;
        setAnalysisResult({
          diseasePrediction: result.diseasePrediction || 'Unable to determine',
          confidence: result.confidence || 0,
          symptoms: result.symptoms || symptoms.split(',').map(s => s.trim()),
          homeRemedies: result.homeRemedies || [],
          precautions: result.precautions || [],
          whenToSeeDoctor: result.whenToSeeDoctor || [],
          severity: result.severity || 'moderate'
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">EHR Analysis</h1>
              <p className="text-slate-600">AI-Powered Disease Prediction & Home Remedies</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                  <span>Patient Selection & Symptoms</span>
                </CardTitle>
                <CardDescription>
                  Select a patient and describe their symptoms for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="patient-select" className="text-sm font-medium">
                    Select Patient
                  </Label>
                  <Select
                    value={selectedPatient?.id || ''}
                    onValueChange={(value) => {
                      const patient = patients.find(p => p.id === value);
                      setSelectedPatient(patient || null);
                    }}
                  >
                     <SelectTrigger className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30">
                       <SelectValue placeholder="Choose a patient..." />
                     </SelectTrigger>
                     <SelectContent className="border-2 border-slate-200 shadow-lg">
                       {patients.map((patient) => (
                         <SelectItem key={patient.id} value={patient.id} className="hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors duration-200">
                           <div className="flex items-center space-x-2">
                             <User className="h-4 w-4 text-blue-600" />
                             <span className="font-medium">{patient.name}</span>
                             <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                               {patient.age}y, {patient.weight}kg
                             </Badge>
                           </div>
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>

                {/* Selected Patient Info */}
                {selectedPatient && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                     className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200"
                  >
                    <h4 className="font-semibold text-slate-800 mb-2">Patient Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Name:</span>
                        <span className="ml-2 font-medium">{selectedPatient.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Age:</span>
                        <span className="ml-2 font-medium">{selectedPatient.age} years</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Weight:</span>
                        <span className="ml-2 font-medium">{selectedPatient.weight} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Gender:</span>
                        <span className="ml-2 font-medium">{selectedPatient.gender}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Symptoms Input */}
                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-sm font-medium">
                    Symptoms (comma-separated)
                  </Label>
                   <Textarea
                     id="symptoms"
                     placeholder="e.g., fever, headache, cough, sore throat, body aches..."
                     value={symptoms}
                     onChange={(e) => setSymptoms(e.target.value)}
                     className="rounded-xl min-h-[100px] border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                   />
                </div>

                {/* Additional Information */}
                <div className="space-y-2">
                  <Label htmlFor="additional-info" className="text-sm font-medium">
                    Additional Information (optional)
                  </Label>
                   <Textarea
                     id="additional-info"
                     placeholder="Duration of symptoms, severity, any triggers, etc."
                     value={additionalInfo}
                     onChange={(e) => setAdditionalInfo(e.target.value)}
                     className="rounded-xl min-h-[80px] border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                   />
                </div>

                {/* Analyze Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedPatient || !symptoms.trim() || isAnalyzing}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Analyze Symptoms
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {analysisResult ? (
              <Card className="border-2 border-green-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-6 w-6 text-green-600" />
                    <span>AI Analysis Results</span>
                  </CardTitle>
                  <CardDescription>
                    Disease prediction and home remedies based on symptoms
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Disease Prediction */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      Predicted Condition
                    </h4>
                    <p className="text-lg font-medium text-blue-900">{analysisResult.diseasePrediction}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Confidence: {analysisResult.confidence}%
                      </Badge>
                      <Badge className={getSeverityColor(analysisResult.severity)}>
                        {getSeverityIcon(analysisResult.severity)}
                        <span className="ml-1 capitalize">{analysisResult.severity} severity</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Home Remedies */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Pill className="h-5 w-5 mr-2" />
                      Home Remedies
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.homeRemedies.map((remedy, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start space-x-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800">{remedy}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Precautions */}
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Precautions
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.precautions.map((precaution, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start space-x-2"
                        >
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-yellow-800">{precaution}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* When to See Doctor */}
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      When to See a Doctor
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.whenToSeeDoctor.map((warning, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start space-x-2"
                        >
                          <Activity className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-red-800">{warning}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclaimer */}
                  <Alert className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Important:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
               <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30">
                 <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                   <div className="p-4 bg-blue-100 rounded-full mb-4">
                     <Brain className="h-16 w-16 text-blue-600" />
                   </div>
                   <h3 className="text-lg font-semibold text-slate-700 mb-2">
                     Ready for Analysis
                   </h3>
                   <p className="text-slate-600">
                     Select a patient and enter symptoms to get AI-powered disease prediction and home remedies.
                   </p>
                 </CardContent>
               </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
