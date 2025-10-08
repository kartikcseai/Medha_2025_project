import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, Calendar, Weight, Pill, Activity, TrendingUp, Eye, RefreshCw, Brain } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { PatientFormDialog } from './PatientFormDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { PatientDetailsDialog } from './PatientDetailsDialog';
import { PatientProfile } from './PatientProfile';
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
  created_at?: string;
  updated_at?: string;
}

// Mock data for fallback
const mockPatients: Patient[] = [
  {
    id: '1',
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
    notes: 'Patient responding well to treatment',
    date: '2024-01-15'
  },
  {
    id: '2',
    name: 'Oliver Smith',
    gender: 'Male',
    age: 7,
    weight: 22.3,
    drug: 'Ibuprofen',
    doseRange: '223–446 mg/day',
    frequency: '2 times daily',
    duration: '5 days',
    allergies: 'None',
    disease: 'Fever',
    status: 'completed',
    notes: 'Treatment completed successfully',
    date: '2024-01-14'
  },
  {
    id: '3',
    name: 'Sophia Davis',
    gender: 'Female',
    age: 4,
    weight: 15.2,
    drug: 'Acetaminophen',
    doseRange: '152–304 mg/day',
    frequency: '4 times daily',
    duration: '3 days',
    allergies: 'Penicillin',
    disease: 'Pain management',
    status: 'active',
    notes: 'Monitor for allergic reactions',
    date: '2024-01-13'
  }
];

interface PatientPanelProps {
  onNavigate?: (page: string) => void;
}

export function PatientPanel({ onNavigate }: PatientPanelProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewedPatient, setViewedPatient] = useState<Patient | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePatientId, setProfilePatientId] = useState<string | null>(null);

  // Load patients from database
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
        // Fallback to mock data
        setPatients(mockPatients);
      } else {
        // Transform database data to match our interface
        const transformedPatients = data?.map(record => {
          // Parse additional info from analysis_notes
          const analysisNotes = record.analysis_notes || '';
          
          // Parse the new format from Doctor Panel
          const allergiesMatch = analysisNotes.match(/Allergies: (.+?)(?:\n|$)/);
          const diseaseMatch = analysisNotes.match(/Disease: (.+?)(?:\n|$)/);
          const drugReactionsMatch = analysisNotes.match(/Drug Reactions: (.+?)(?:\n|$)/);
          const otherMedsMatch = analysisNotes.match(/Other Medications: (.+?)(?:\n|$)/);
          const diseaseDurationMatch = analysisNotes.match(/Disease Duration: (.+?)(?:\n|$)/);
          
          return {
            id: record.id,
            name: record.child_name || '',
            gender: record.gender || '',
            age: record.age_years || 0,
            weight: record.weight_kg || 0,
            drug: record.drug_name || '',
            doseRange: record.dose_range || '',
            frequency: record.frequency || record.recommendation || '',
            duration: record.duration || '',
            allergies: allergiesMatch ? allergiesMatch[1] : (otherMedsMatch ? otherMedsMatch[1] : ''),
            disease: diseaseMatch ? diseaseMatch[1] : '',
            status: 'active' as 'active' | 'completed' | 'pending',
            notes: analysisNotes,
            date: record.created_at ? new Date(record.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            created_at: record.created_at,
            updated_at: record.updated_at
          };
        }) || [];
        
        setPatients(transformedPatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients(mockPatients);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.drug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD Operations
  const handleAddPatient = () => {
    setSelectedPatient(null);
    setFormMode('add');
    setIsFormOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteOpen(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setViewedPatient(patient);
    setIsDetailsOpen(true);
  };

  const handleViewProfile = (patient: Patient) => {
    setProfilePatientId(patient.id);
    setIsProfileOpen(true);
  };

  const handleSavePatient = async (patientData: Patient) => {
    try {
      if (formMode === 'add') {
        // Add new patient - using only the columns that exist in the original schema
        const { data, error } = await supabase
          .from('patient_records')
          .insert({
            child_name: patientData.name,
            gender: patientData.gender,
            age_years: patientData.age,
            weight_kg: patientData.weight,
            drug_name: patientData.drug,
            dose_range: patientData.doseRange,
            recommendation: patientData.frequency, // Map frequency to recommendation
            frequency: patientData.frequency,
            duration: patientData.duration,
            analysis_notes: [
              `Additional Information:`,
              `Allergies: ${patientData.allergies || 'None'}`,
              `Disease: ${patientData.disease || 'Not specified'}`,
              `Status: ${patientData.status}`,
              `Notes: ${patientData.notes || 'None'}`,
              `--- End Additional Info ---`
            ].join('\n')
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Add to local state
        const newPatient = {
          ...patientData,
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setPatients(prev => [newPatient, ...prev]);
      } else {
        // Update existing patient
        const { error } = await supabase
          .from('patient_records')
          .update({
            child_name: patientData.name,
            gender: patientData.gender,
            age_years: patientData.age,
            weight_kg: patientData.weight,
            drug_name: patientData.drug,
            dose_range: patientData.doseRange,
            recommendation: patientData.frequency,
            frequency: patientData.frequency,
            duration: patientData.duration,
            analysis_notes: [
              `Additional Information:`,
              `Allergies: ${patientData.allergies || 'None'}`,
              `Disease: ${patientData.disease || 'Not specified'}`,
              `Status: ${patientData.status}`,
              `Notes: ${patientData.notes || 'None'}`,
              `--- End Additional Info ---`
            ].join('\n')
          })
          .eq('id', patientData.id);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Update local state
        setPatients(prev => 
          prev.map(p => p.id === patientData.id ? { ...patientData, updated_at: new Date().toISOString() } : p)
        );
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPatient) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('patient_records')
        .delete()
        .eq('id', selectedPatient.id);

      if (error) throw error;

      // Remove from local state
      setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
      setIsDeleteOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    loadPatients();
  };

  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    completed: patients.filter(p => p.status === 'completed').length,
    pending: patients.filter(p => p.status === 'pending').length
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <motion.div 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Patient Panel
                </h1>
              </div>
              <p className="text-slate-600 text-lg">
                Manage patient records and medication history
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleRefresh}
                  variant="outline"
                  className="rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                <Button 
                  onClick={handleAddPatient}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                >
                <Plus className="h-4 w-4 mr-2" />
                Add New Patient
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                <Button 
                  onClick={() => onNavigate?.('ehr-analysis')}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                >
                <Brain className="h-4 w-4 mr-2" />
                EHR Analysis
              </Button>
            </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
          {[
            { 
              title: 'Total Patients', 
              value: stats.total, 
              icon: Users, 
              color: 'blue',
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100'
            },
            { 
              title: 'Active', 
              value: stats.active, 
              icon: Activity, 
              color: 'green',
              gradient: 'from-green-500 to-green-600',
              bgGradient: 'from-green-50 to-green-100'
            },
            { 
              title: 'Completed', 
              value: stats.completed, 
              icon: Calendar, 
              color: 'blue',
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100'
            },
            { 
              title: 'Pending', 
              value: stats.pending, 
              icon: Weight, 
              color: 'yellow',
              gradient: 'from-yellow-500 to-orange-500',
              bgGradient: 'from-yellow-50 to-orange-50'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    </div>
                    <motion.div 
                      className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-3 shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Table */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Patient Records</span>
                  </CardTitle>
                  <CardDescription>
                    View and manage pediatric patient medication records
                  </CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or drug..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50/50">
                      <TableHead className="font-semibold text-slate-700">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Gender</TableHead>
                      <TableHead className="font-semibold text-slate-700">Weight</TableHead>
                      <TableHead className="font-semibold text-slate-700">Drug</TableHead>
                      <TableHead className="font-semibold text-slate-700">Dose Range</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        className="border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <TableCell className="font-semibold text-slate-800 py-4">{patient.name}</TableCell>
                        <TableCell className="text-slate-600">{patient.gender}</TableCell>
                        <TableCell className="text-slate-600 font-medium">{patient.weight} kg</TableCell>
                        <TableCell className="text-slate-800 font-medium">{patient.drug}</TableCell>
                        <TableCell className="text-slate-600">{patient.doseRange}</TableCell>
                        <TableCell className="text-slate-600">{new Date(patient.date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 p-0 rounded-xl hover:bg-green-50 transition-colors" 
                                onClick={() => handleViewProfile(patient)}
                                title="View profile"
                              >
                                <Eye className="h-4 w-4 text-green-600" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 transition-colors" 
                                onClick={() => handleEditPatient(patient)}
                                title="Edit patient"
                              >
                                <Edit className="h-4 w-4 text-slate-600" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 transition-colors" 
                                onClick={() => handleDeletePatient(patient)}
                                title="Delete patient"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </motion.div>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {filteredPatients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                            <p className="text-sm text-slate-600">{patient.gender} • {patient.weight} kg</p>
                          </div>
                          {getStatusBadge(patient.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 font-medium">Drug</p>
                            <p className="font-semibold text-slate-800">{patient.drug}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Dose Range</p>
                            <p className="font-semibold text-slate-800">{patient.doseRange}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-500">
                            {new Date(patient.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 p-0 rounded-xl hover:bg-green-50" 
                                onClick={() => handleViewPatient(patient)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4 text-green-600" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50" 
                                onClick={() => handleEditPatient(patient)}
                                title="Edit patient"
                              >
                                <Edit className="h-4 w-4 text-slate-600" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 p-0 rounded-xl hover:bg-red-50" 
                                onClick={() => handleDeletePatient(patient)}
                                title="Delete patient"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {loading ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-700">Loading patients...</h3>
                  <p className="text-slate-500">Please wait while we fetch patient records</p>
                </motion.div>
              ) : filteredPatients.length === 0 ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-700">No patients found</h3>
                  <p className="text-slate-500">
                    {searchTerm ? 'Try adjusting your search terms' : 'No patient records available'}
                  </p>
                </motion.div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialogs */}
        <PatientFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSavePatient}
          patient={selectedPatient}
          mode={formMode}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          patientName={selectedPatient?.name || ''}
          isDeleting={isDeleting}
        />

        <PatientDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          patient={viewedPatient}
        />

        {isProfileOpen && profilePatientId && (
          <PatientProfile
            patientId={profilePatientId}
            onBack={() => {
              setIsProfileOpen(false);
              setProfilePatientId(null);
            }}
          />
        )}
      </motion.div>
    </div>
  );
}