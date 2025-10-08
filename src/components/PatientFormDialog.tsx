import React, { useState, useEffect } from 'react';
import { X, Save, User, Weight, Pill, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';

interface Patient {
  id?: string;
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

interface PatientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  patient?: Patient | null;
  mode: 'add' | 'edit';
}

export function PatientFormDialog({ isOpen, onClose, onSave, patient, mode }: PatientFormDialogProps) {
  const [formData, setFormData] = useState<Patient>({
    name: '',
    gender: '',
    age: 0,
    weight: 0,
    drug: '',
    doseRange: '',
    frequency: '',
    duration: '',
    allergies: '',
    disease: '',
    status: 'active',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (patient && mode === 'edit') {
      setFormData(patient);
    } else {
      setFormData({
        name: '',
        gender: '',
        age: 0,
        weight: 0,
        drug: '',
        doseRange: '',
        frequency: '',
        duration: '',
        allergies: '',
        disease: '',
        status: 'active',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [patient, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (formData.age <= 0) newErrors.age = 'Age must be greater than 0';
    if (formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
    if (!formData.drug.trim()) newErrors.drug = 'Drug name is required';
    if (!formData.doseRange.trim()) newErrors.doseRange = 'Dose range is required';
    if (!formData.frequency.trim()) newErrors.frequency = 'Frequency is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const patientData = {
        ...formData,
        id: mode === 'edit' ? patient?.id : undefined
      };
      
      await onSave(patientData);
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      setSubmitError('Failed to save patient. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Patient, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <User className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {mode === 'add' ? 'Add New Patient' : 'Edit Patient'}
                  </h2>
                  <p className="text-slate-600">
                    {mode === 'add' ? 'Enter patient information' : 'Update patient details'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Basic Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Patient Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`rounded-xl border-2 transition-all duration-300 ${
                      errors.name ? 'border-red-400 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    placeholder="Enter patient name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className={`rounded-xl border-2 transition-all duration-300 ${
                      errors.gender ? 'border-red-400 focus:border-red-400' : 'focus:border-blue-400'
                    }`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male" className="hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors duration-200">Male</SelectItem>
                      <SelectItem value="female" className="hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors duration-200">Female</SelectItem>
                      <SelectItem value="other" className="hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors duration-200">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.gender}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age (years) *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseFloat(e.target.value) || 0)}
                    className={`rounded-xl border-2 transition-all duration-300 ${
                      errors.age ? 'border-red-400 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                  {errors.age && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.age}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                    className={`rounded-xl border-2 transition-all duration-300 ${
                      errors.weight ? 'border-red-400 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.weight}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Medication Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Pill className="h-5 w-5 text-blue-600" />
                <span>Medication Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="drug">Drug Name *</Label>
                  <Input
                    id="drug"
                    value={formData.drug}
                    onChange={(e) => handleInputChange('drug', e.target.value)}
                    className={`rounded-xl border-2 transition-all duration-300 ${
                      errors.drug ? 'border-red-400 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    placeholder="Enter drug name"
                  />
                  {errors.drug && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.drug}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doseRange">Dose Range *</Label>
                  <Input
                    id="doseRange"
                    value={formData.doseRange}
                    onChange={(e) => handleInputChange('doseRange', e.target.value)}
                    className={`rounded-xl border-2 transition-all duration-300 ${
                      errors.doseRange ? 'border-red-400 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    placeholder="e.g., 185-370 mg/day"
                  />
                  {errors.doseRange && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.doseRange}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className={`rounded-xl border-2 transition-all duration-300 ${
                      errors.frequency ? 'border-red-400 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    placeholder="e.g., 3 times daily"
                  />
                  {errors.frequency && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.frequency}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className={`rounded-xl border-2 transition-all duration-300 ${
                      errors.duration ? 'border-red-400 focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    placeholder="e.g., 5-7 days"
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.duration}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Additional Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                    placeholder="e.g., penicillin, nuts"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disease">Disease/Condition</Label>
                  <Input
                    id="disease"
                    value={formData.disease}
                    onChange={(e) => handleInputChange('disease', e.target.value)}
                    className="rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                    placeholder="e.g., Acute otitis media"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="rounded-xl border-2 focus:border-blue-400 transition-all duration-300">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                  placeholder="Additional notes about the patient..."
                  rows={3}
                />
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl px-6"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  className="rounded-xl px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        className="rounded-full h-4 w-4 border-b-2 border-white mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {mode === 'add' ? 'Add Patient' : 'Update Patient'}
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
