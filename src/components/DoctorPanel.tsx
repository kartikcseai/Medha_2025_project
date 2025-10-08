import React, { useState } from 'react';
import { Calculator, AlertTriangle, Save, Stethoscope, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../lib/supabaseClient';

interface DoseResult {
  doseRange: string;
  recommendation: string;
  frequency: string;
  duration: string;
}

export function DoctorPanel() {
  const [formData, setFormData] = useState({
    childName: '',
    gender: '',
    age: '',
    weight: '',
    drugName: '',
    allergies: '',
    drugReactions: '',
    takingOtherMeds: 'no',
    otherMeds: '',
    diseaseName: '',
    diseaseDurationMonths: ''
  });
  
  const [doseResult, setDoseResult] = useState<DoseResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [ehrFile, setEhrFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysisNotes, setAnalysisNotes] = useState<string | null>(null);
  const [analysisPrecautions, setAnalysisPrecautions] = useState<string | null>(null);
  const [analysisKeepInMind, setAnalysisKeepInMind] = useState<string | null>(null);
  const [labFile, setLabFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear prior results so new inputs don't show stale calculations
    if (doseResult) setDoseResult(null);
    if (analysisNotes) setAnalysisNotes(null);
  };

  const calculateDose = async () => {
    if (!formData.childName || !formData.gender || !formData.weight || !formData.drugName) {
      return;
    }

    setIsCalculating(true);
    
    // Simulate AI calculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock dose calculation based on weight
    const weight = parseFloat(formData.weight);
    const baseRange = Math.round(weight * 10);
    const upperRange = Math.round(weight * 20);
    const mlDose = Math.round(weight * 0.5);
    
    setDoseResult({
      doseRange: `${baseRange}–${upperRange} mg/day`,
      recommendation: `${mlDose}ml every 8 hours`,
      frequency: '3 times daily',
      duration: '5-7 days'
    });
    
    setIsCalculating(false);
  };

  const resetForm = () => {
    setFormData({
      childName: '',
      gender: '',
      age: '',
      weight: '',
      drugName: '',
      allergies: '',
      drugReactions: '',
      takingOtherMeds: 'no',
      otherMeds: '',
      diseaseName: '',
      diseaseDurationMonths: ''
    });
    setDoseResult(null);
    setEhrFile(null);
    setAnalysisNotes(null);
    setAnalysisPrecautions(null);
    setAnalysisKeepInMind(null);
    setLabFile(null);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== 'application/pdf') return;
    setEhrFile(file);
  };

  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLabFile(file);
  };

  const handleSaveRecord = async () => {
    if (!doseResult || !formData.childName || !formData.gender || !formData.weight || !formData.drugName) {
      alert('Please complete the analysis first before saving the record.');
      return;
    }

    setIsSaving(true);
    try {
      // Combine all analysis data into a comprehensive notes field
      const combinedNotes = [
        '=== AI ANALYSIS RESULTS ===',
        '',
        'DOSAGE RECOMMENDATION:',
        `Dose Range: ${doseResult.doseRange}`,
        `Recommendation: ${doseResult.recommendation}`,
        `Frequency: ${doseResult.frequency}`,
        `Duration: ${doseResult.duration}`,
        '',
        'CLINICAL GUIDANCE:',
        analysisPrecautions ? `Precautions: ${analysisPrecautions}` : '',
        analysisKeepInMind ? `Things to Keep in Mind: ${analysisKeepInMind}` : '',
        analysisNotes ? `Additional Notes: ${analysisNotes}` : '',
        '',
        'PATIENT CONTEXT:',
        `Allergies: ${formData.allergies || 'None reported'}`,
        `Drug Reactions: ${formData.drugReactions || 'None reported'}`,
        `Other Medications: ${formData.takingOtherMeds === 'yes' ? (formData.otherMeds || 'Unspecified') : 'None'}`,
        `Disease: ${formData.diseaseName || 'Not specified'}`,
        `Disease Duration: ${formData.diseaseDurationMonths || 'Unknown'} months`,
        '',
        '=== END ANALYSIS ==='
      ].filter(line => line.trim() !== '').join('\n');

      const patientData = {
        child_name: formData.childName,
        gender: formData.gender,
        age_years: parseFloat(formData.age) || 0,
        weight_kg: parseFloat(formData.weight),
        drug_name: formData.drugName,
        dose_range: doseResult.doseRange,
        recommendation: doseResult.recommendation,
        frequency: doseResult.frequency,
        duration: doseResult.duration,
        analysis_notes: combinedNotes
      };

      console.log('Attempting to save patient data:', patientData);
      
      const { data, error } = await supabase
        .from('patient_records')
        .insert([patientData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully saved patient record:', data);
      alert('Patient record saved successfully!');
      
      // Optionally reset the form after successful save
      // resetForm();
      
    } catch (error: any) {
      console.error('Error saving patient record:', error);
      alert(`Failed to save patient record: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const analyzeCase = async () => {
    setUploading(true);
    setAnalysisNotes(null);
    setAnalysisPrecautions(null);
    setAnalysisKeepInMind(null);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const userId = user?.id ?? 'anonymous';
      let publicUrl: string | null = null;
      let labUrl: string | null = null;

      // Upload if a PDF is provided (optional)
      if (ehrFile) {
        const filePath = `${userId}/${Date.now()}-${ehrFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('ehr-reports')
          .upload(filePath, ehrFile, { contentType: 'application/pdf', upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('ehr-reports').getPublicUrl(filePath);
        publicUrl = publicData?.publicUrl ?? null;
      }

      // Upload optional lab file (any type)
      if (labFile) {
        const labPath = `${userId}/${Date.now()}-${labFile.name}`;
        const { error: labErr } = await supabase.storage
          .from('lab-files')
          .upload(labPath, labFile, { contentType: labFile.type || 'application/octet-stream', upsert: false });
        if (labErr) throw labErr;
        const { data: labPub } = supabase.storage.from('lab-files').getPublicUrl(labPath);
        labUrl = labPub?.publicUrl ?? null;
      }

      // Call Edge Function 'analyze-ehr' passing file URL (optional) and form context
      const { data: fnData, error: fnError } = await supabase.functions.invoke('analyze-ehr', {
        body: {
          fileUrl: publicUrl,
          patient: {
            ...formData,
            takingOtherMeds: formData.takingOtherMeds === 'yes',
          },
          labUrl,
        },
      });
      if (fnError) throw fnError;

      // Expecting structure: { doseResult, precautions, keepInMind, notes }
      const nextDose: DoseResult | undefined = fnData?.doseResult;
      const notes: string | undefined = fnData?.notes;
      const precautions: string | undefined = fnData?.precautions;
      const keepInMind: string | undefined = fnData?.keepInMind;
      if (nextDose) setDoseResult(nextDose);
      if (notes) setAnalysisNotes(notes);
      if (precautions) setAnalysisPrecautions(precautions);
      if (keepInMind) setAnalysisKeepInMind(keepInMind);

      // 4) Persist patient + analysis to DB table 'patient_records'
      // Persist core fields; append extras into analysis_notes for now
      await supabase.from('patient_records').insert({
        user_id: userId,
        child_name: formData.childName,
        gender: formData.gender,
        age_years: formData.age ? parseFloat(formData.age || '0') : null,
        weight_kg: parseFloat(formData.weight || '0'),
        drug_name: formData.drugName,
        ehr_url: publicUrl,
        lab_url: labUrl,
        dose_range: nextDose?.doseRange ?? null,
        recommendation: nextDose?.recommendation ?? null,
        frequency: nextDose?.frequency ?? null,
        duration: nextDose?.duration ?? null,
        analysis_notes: [
          notes ?? '',
          '',
          '--- Additional clinical context ---',
          `Allergies: ${formData.allergies || 'N/A'}`,
          `Drug reactions: ${formData.drugReactions || 'N/A'}`,
          `Other meds: ${formData.takingOtherMeds === 'yes' ? (formData.otherMeds || 'unspecified') : 'none'}`,
          `Disease: ${formData.diseaseName || 'N/A'}`,
          `Disease duration (months): ${formData.diseaseDurationMonths || 'N/A'}`,
        ].join('\n'),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
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
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Stethoscope className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Doctor Panel
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            AI-powered pediatric medication dosage calculator
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dose Calculator Form */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="space-y-2 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <span>Dose Calculator</span>
                </CardTitle>
                <CardDescription>
                  Enter patient information to calculate safe medication dosage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="childName">Child's Name</Label>
                  <Input
                    id="childName"
                    placeholder="Enter patient name"
                    value={formData.childName}
                    onChange={(e) => handleInputChange('childName', e.target.value)}
                    className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-slate-200 shadow-lg">
                      <SelectItem value="male" className="hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors duration-200">Male</SelectItem>
                      <SelectItem value="female" className="hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors duration-200">Female</SelectItem>
                      <SelectItem value="other" className="hover:bg-black hover:text-white focus:bg-black focus:text-white transition-colors duration-200">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="0.0"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="rounded-xl pr-12 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                      min="0"
                      step="0.1"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-slate-500">kg</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="age">Age (years)</Label>
                  <div className="relative">
                    <Input
                      id="age"
                      type="number"
                      placeholder="0"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="rounded-xl pr-12 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                      min="0"
                      step="0.1"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-slate-500">yrs</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="drugName">Drug Name</Label>
                  <Input
                    id="drugName"
                    placeholder="Enter drug name"
                    value={formData.drugName}
                    onChange={(e) => handleInputChange('drugName', e.target.value)}
                    className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                  />
                </motion.div>

                {/* Clinical context */}
                <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    placeholder="e.g., penicillin"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                  />
                </motion.div>

                <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                  <Label htmlFor="drugReactions">Drug reactions</Label>
                  <Textarea
                    id="drugReactions"
                    placeholder="Any prior adverse reactions"
                    value={formData.drugReactions}
                    onChange={(e) => handleInputChange('drugReactions', e.target.value)}
                    className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                  />
                </motion.div>

                <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                  <Label>Taking other medicines?</Label>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant={formData.takingOtherMeds === 'no' ? 'default' : 'outline'} 
                      onClick={() => handleInputChange('takingOtherMeds', 'no')} 
                      className={`rounded-xl transition-all duration-200 ${
                        formData.takingOtherMeds === 'no' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                          : 'border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      No
                    </Button>
                    <Button 
                      type="button" 
                      variant={formData.takingOtherMeds === 'yes' ? 'default' : 'outline'} 
                      onClick={() => handleInputChange('takingOtherMeds', 'yes')} 
                      className={`rounded-xl transition-all duration-200 ${
                        formData.takingOtherMeds === 'yes' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                          : 'border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      Yes
                    </Button>
                  </div>
                  {formData.takingOtherMeds === 'yes' && (
                    <>
                      <Input
                        placeholder="List medicines"
                        value={formData.otherMeds}
                        onChange={(e) => handleInputChange('otherMeds', e.target.value)}
                        className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                      />
                      
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label htmlFor="diseaseName">Disease name</Label>
                        <Input
                          id="diseaseName"
                          placeholder="e.g., Acute otitis media"
                          value={formData.diseaseName}
                          onChange={(e) => handleInputChange('diseaseName', e.target.value)}
                          className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                        />
                      </motion.div>

                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label htmlFor="diseaseDurationMonths">Disease duration (months)</Label>
                        <Input
                          id="diseaseDurationMonths"
                          type="number"
                          placeholder="0"
                          value={formData.diseaseDurationMonths}
                          onChange={(e) => handleInputChange('diseaseDurationMonths', e.target.value)}
                          className="rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 bg-white hover:bg-blue-50/30"
                          min="0"
                          step="0.1"
                        />
                      </motion.div>
                    </>
                  )}
                </motion.div>


                {/* Lab test file (any type) */}
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="labfile">Upload lab test (image/pdf/other)</Label>
                  <Input
                    id="labfile"
                    type="file"
                    onChange={handleLabFileChange}
                    className="rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                  />
                </motion.div>

                <div className="flex space-x-3 pt-4">
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={calculateDose}
                      disabled={!formData.childName || !formData.gender || !formData.weight || !formData.drugName || isCalculating}
                      className="w-full rounded-xl py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isCalculating ? (
                        <>
                          <motion.div 
                            className="rounded-full h-4 w-4 border-b-2 border-white mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate Dose
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={analyzeCase}
                      disabled={!formData.childName || !formData.gender || !formData.weight || !formData.drugName || !formData.age || uploading}
                      className="w-full rounded-xl py-6 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {uploading ? 'Analyzing...' : 'Analyze Case'}
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                      className="rounded-xl px-6 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                    >
                      Clear
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {doseResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-green-700">Dosage Recommendation</CardTitle>
                      </div>
                      <CardDescription>
                        AI-calculated dosage for {formData.childName} ({formData.weight}kg)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div 
                          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <h4 className="text-sm text-blue-600 mb-1 font-medium">Dose Range</h4>
                          <p className="text-lg font-semibold text-blue-800">{doseResult.doseRange}</p>
                        </motion.div>
                        <motion.div 
                          className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-4 border border-cyan-200"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <h4 className="text-sm text-cyan-600 mb-1 font-medium">Recommendation</h4>
                          <p className="text-lg font-semibold text-cyan-800">{doseResult.recommendation}</p>
                        </motion.div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div 
                          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <h4 className="text-sm text-slate-600 mb-1 font-medium">Frequency</h4>
                          <p className="font-semibold text-slate-800">{doseResult.frequency}</p>
                        </motion.div>
                        <motion.div 
                          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <h4 className="text-sm text-slate-600 mb-1 font-medium">Duration</h4>
                          <p className="font-semibold text-slate-800">{doseResult.duration}</p>
                        </motion.div>
                      </div>

                      <Alert className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          ⚠️ Double-check all calculations before prescribing. This is an AI recommendation and should be verified with clinical guidelines.
                        </AlertDescription>
                      </Alert>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                          onClick={handleSaveRecord}
                          disabled={isSaving || !doseResult}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Record
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!doseResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-8 mb-6 shadow-lg"
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
                        <Calculator className="h-12 w-12 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2 text-slate-800">Ready to Calculate</h3>
                      <p className="text-slate-600 max-w-sm">
                        Fill in the patient information to get AI-powered dosage recommendations
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {analysisNotes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-slate-700">AI Clinical Guidance</CardTitle>
                      </div>
                      <CardDescription>
                        Automated review based on patient data and any uploaded reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      {analysisPrecautions && (
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-200">
                          <h4 className="text-sm text-amber-700 mb-1 font-medium">Precautions</h4>
                          <pre className="whitespace-pre-wrap text-amber-900 text-sm">{analysisPrecautions}</pre>
                        </div>
                      )}
                      {analysisKeepInMind && (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200">
                          <h4 className="text-sm text-indigo-700 mb-1 font-medium">Things to Keep in Mind</h4>
                          <pre className="whitespace-pre-wrap text-indigo-900 text-sm">{analysisKeepInMind}</pre>
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap text-slate-800 text-sm">{analysisNotes}</pre>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}