import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets, 
  FileText, 
  Pill, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Stethoscope,
  Download,
  Eye,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { supabase } from '../lib/supabaseClient';

interface PatientProfileProps {
  patientId: string;
  onBack: () => void;
}

interface EHRRecord {
  id: string;
  date: string;
  type: 'consultation' | 'lab' | 'medication' | 'vital' | 'diagnosis';
  title: string;
  description: string;
  doctor: string;
  status: 'completed' | 'pending' | 'cancelled';
  attachments?: string[];
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
  };
  labResults?: {
    testName: string;
    value: string;
    normalRange: string;
    status: 'normal' | 'abnormal' | 'critical';
  }[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    status: 'active' | 'completed' | 'discontinued';
  }[];
}

export function PatientProfile({ patientId, onBack }: PatientProfileProps) {
  const [patient, setPatient] = useState<any>(null);
  const [ehrRecords, setEhrRecords] = useState<EHRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'ehr' | 'medications' | 'lab'>('overview');

  // Mock EHR data for demonstration
  const mockEHRData: EHRRecord[] = [
    {
      id: '1',
      date: '2025-01-07',
      type: 'consultation',
      title: 'Pediatric Consultation',
      description: 'Regular checkup and growth assessment. Patient shows good development progress.',
      doctor: 'Dr. Sarah Johnson',
      status: 'completed',
      vitalSigns: {
        bloodPressure: '110/70',
        heartRate: 85,
        temperature: 98.6,
        weight: 30,
        height: 120
      }
    },
    {
      id: '2',
      date: '2025-01-05',
      type: 'lab',
      title: 'Complete Blood Count',
      description: 'Routine blood work to check overall health status.',
      doctor: 'Dr. Michael Chen',
      status: 'completed',
      labResults: [
        { testName: 'Hemoglobin', value: '12.5 g/dL', normalRange: '11.5-15.5', status: 'normal' },
        { testName: 'White Blood Cells', value: '7,200/μL', normalRange: '4,500-11,000', status: 'normal' },
        { testName: 'Platelets', value: '280,000/μL', normalRange: '150,000-450,000', status: 'normal' }
      ]
    },
    {
      id: '3',
      date: '2025-01-03',
      type: 'medication',
      title: 'Medication Prescription',
      description: 'Prescribed paracetamol for fever management.',
      doctor: 'Dr. Sarah Johnson',
      status: 'completed',
      medications: [
        { name: 'Paracetamol', dosage: '300mg', frequency: 'Every 6 hours', duration: '3 days', status: 'completed' }
      ]
    },
    {
      id: '4',
      date: '2024-12-28',
      type: 'diagnosis',
      title: 'Acute Otitis Media',
      description: 'Diagnosed with middle ear infection. Treated with antibiotics.',
      doctor: 'Dr. Emily Rodriguez',
      status: 'completed',
      medications: [
        { name: 'Amoxicillin', dosage: '250mg', frequency: 'Twice daily', duration: '7 days', status: 'completed' }
      ]
    },
    {
      id: '5',
      date: '2024-12-15',
      type: 'vital',
      title: 'Vital Signs Check',
      description: 'Regular vital signs monitoring during wellness visit.',
      doctor: 'Dr. Sarah Johnson',
      status: 'completed',
      vitalSigns: {
        bloodPressure: '105/65',
        heartRate: 90,
        temperature: 98.4,
        weight: 29.5,
        height: 119
      }
    }
  ];

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Load patient data from database
      const { data: patientData, error } = await supabase
        .from('patient_records')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error loading patient:', error);
        // Use mock data if database fails
        setPatient({
          id: patientId,
          name: 'Suraj Kumar',
          gender: 'Male',
          age: 14,
          weight: 30,
          drug: 'Paracetamol',
          doseRange: '300-600 mg/day',
          status: 'Active'
        });
      } else {
        setPatient({
          id: patientData.id,
          name: patientData.child_name,
          gender: patientData.gender,
          age: patientData.age_years,
          weight: patientData.weight_kg,
          drug: patientData.drug_name,
          doseRange: patientData.dose_range,
          status: 'Active'
        });
      }

      // Set mock EHR data
      setEhrRecords(mockEHRData);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="h-4 w-4" />;
      case 'lab': return <Activity className="h-4 w-4" />;
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'vital': return <Heart className="h-4 w-4" />;
      case 'diagnosis': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getLabStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'abnormal': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <div className="max-w-7xl mx-auto p-6">
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
              <h1 className="text-3xl font-bold text-slate-800">Patient Profile</h1>
              <p className="text-slate-600">Electronic Health Records & Medical History</p>
            </div>
          </div>
        </motion.div>

        {/* Patient Overview Card */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-800">{patient?.name}</CardTitle>
                    <CardDescription className="text-lg">
                      {patient?.gender} • {patient?.age} years • {patient?.weight} kg
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                  {patient?.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-3 bg-blue-50 rounded-xl mb-2">
                    <Pill className="h-6 w-6 text-blue-600 mx-auto" />
                  </div>
                  <p className="text-sm text-slate-600">Current Medication</p>
                  <p className="font-semibold text-slate-800">{patient?.drug}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-green-50 rounded-xl mb-2">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto" />
                  </div>
                  <p className="text-sm text-slate-600">Dose Range</p>
                  <p className="font-semibold text-slate-800">{patient?.doseRange}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-purple-50 rounded-xl mb-2">
                    <Calendar className="h-6 w-6 text-purple-600 mx-auto" />
                  </div>
                  <p className="text-sm text-slate-600">Last Updated</p>
                  <p className="font-semibold text-slate-800">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'overview', label: 'Overview', icon: <User className="h-4 w-4" /> },
              { id: 'ehr', label: 'EHR Records', icon: <FileText className="h-4 w-4" /> },
              { id: 'medications', label: 'Medications', icon: <Pill className="h-4 w-4" /> },
              { id: 'lab', label: 'Lab Results', icon: <Activity className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ehrRecords.slice(0, 3).map((record) => (
                      <div key={record.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(record.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{record.title}</p>
                          <p className="text-sm text-slate-600">{record.date}</p>
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Health Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span>Health Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Overall Health</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={85} className="w-20" />
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Medication Adherence</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={92} className="w-20" />
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Follow-up Compliance</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={78} className="w-20" />
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedTab === 'ehr' && (
            <motion.div
              key="ehr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Electronic Health Records</span>
                  </CardTitle>
                  <CardDescription>
                    Complete medical history and clinical records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ehrRecords.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getTypeIcon(record.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">{record.title}</h3>
                              <p className="text-sm text-slate-600">Dr. {record.doctor}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">{record.date}</p>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-slate-700 mb-4">{record.description}</p>
                        
                        {record.vitalSigns && (
                          <div className="bg-slate-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-slate-800 mb-3">Vital Signs</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <Heart className="h-4 w-4 text-red-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-600">Heart Rate</p>
                                <p className="font-semibold">{record.vitalSigns.heartRate} bpm</p>
                              </div>
                              <div className="text-center">
                                <Thermometer className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-600">Temperature</p>
                                <p className="font-semibold">{record.vitalSigns.temperature}°F</p>
                              </div>
                              <div className="text-center">
                                <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-600">Blood Pressure</p>
                                <p className="font-semibold">{record.vitalSigns.bloodPressure}</p>
                              </div>
                              <div className="text-center">
                                <Activity className="h-4 w-4 text-green-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-600">Weight</p>
                                <p className="font-semibold">{record.vitalSigns.weight} kg</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {record.attachments && (
                          <div className="flex items-center space-x-2">
                            <Download className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              {record.attachments.length} attachment(s)
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedTab === 'medications' && (
            <motion.div
              key="medications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    <span>Medication History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ehrRecords
                      .filter(record => record.medications)
                      .flatMap(record => record.medications!)
                      .map((medication, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border border-slate-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Pill className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">{medication.name}</h4>
                                <p className="text-sm text-slate-600">
                                  {medication.dosage} • {medication.frequency}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={
                                medication.status === 'active' ? 'bg-green-100 text-green-800' :
                                medication.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {medication.status}
                              </Badge>
                              <p className="text-sm text-slate-600 mt-1">{medication.duration}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedTab === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Laboratory Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ehrRecords
                      .filter(record => record.labResults)
                      .map((record, recordIndex) => (
                        <motion.div
                          key={recordIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: recordIndex * 0.1 }}
                          className="border border-slate-200 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800">{record.title}</h3>
                            <p className="text-sm text-slate-600">{record.date}</p>
                          </div>
                          <div className="space-y-3">
                            {record.labResults!.map((result, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-slate-800">{result.testName}</p>
                                  <p className="text-sm text-slate-600">Normal: {result.normalRange}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-semibold ${getLabStatusColor(result.status)}`}>
                                    {result.value}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    {result.status === 'normal' ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : result.status === 'abnormal' ? (
                                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className={`text-sm ${getLabStatusColor(result.status)}`}>
                                      {result.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
