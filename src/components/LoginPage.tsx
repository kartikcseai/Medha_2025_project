import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Stethoscope, Sparkles, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../lib/supabaseClient';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage('Passwords do not match');
          setLoading(false);
          return;
        }

        const { data: signUpData, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        // Do not force navigate on sign-up unless session is active.
        // Some projects require email confirmation before session exists.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          onNavigate('doctor');
        } else {
          // If confirmation is required, surface a helpful message.
          setInfoMessage('Check your email to confirm your account, then return to sign in.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          // Common case: email not confirmed yet
          if (typeof error.message === 'string' && /confirm/i.test(error.message)) {
            setInfoMessage('Email not confirmed. You can resend the confirmation email below.');
          }
          throw error;
        }
        if (data.session) onNavigate('doctor');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: formData.email });
      if (error) throw error;
      setInfoMessage('Confirmation email resent. Please check your inbox.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not resend confirmation email';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-6xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Illustration */}
          <motion.div 
            className="hidden lg:block"
            variants={itemVariants}
          >
            <div className="relative">
              <motion.div 
                className="relative"
                variants={floatingVariants}
                animate="animate"
              >
                <div className="bg-gradient-to-br from-blue-100/50 via-white to-cyan-100/50 rounded-3xl p-8 backdrop-blur-sm border border-white/50 shadow-2xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1747224317356-6dd1a4a078fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZGFzaGJvYXJkJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTk4MzI3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Medical dashboard and technology"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl"></div>
                </div>
                
                {/* Floating icons */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3 shadow-lg"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-3 shadow-lg"
                  animate={{ 
                    y: [-5, 5, -5],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Shield className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="mt-8 text-center"
                variants={itemVariants}
              >
                <h2 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Welcome to PediaDose AI
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Advanced pediatric medication safety through intelligent dosage calculations
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div 
            className="w-full max-w-md mx-auto lg:mx-0"
            variants={itemVariants}
          >
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="space-y-4 text-center bg-gradient-to-r from-blue-50 to-cyan-50">
                <motion.div 
                  className="flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-3 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Stethoscope className="h-8 w-8 text-white" />
                  </motion.div>
                  <span className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    PediaDose AI
                  </span>
                </motion.div>
                <div>
                  <CardTitle className="text-2xl text-slate-800">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription className="mt-2 text-slate-600">
                    {isSignUp 
                      ? 'Sign up to access the pediatric dosage calculator'
                      : 'Sign in to your account to continue'
                    }
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="text-red-500 text-sm" role="alert">{errorMessage}</div>
                  )}
                  {infoMessage && (
                    <div className="text-blue-600 text-sm" role="status">{infoMessage}</div>
                  )}
                  {isSignUp && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Dr. John Smith"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                        required={isSignUp}
                      />
                    </motion.div>
                  )}

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="doctor@hospital.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10 rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                        required
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  {isSignUp && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pl-10 rounded-xl border-2 focus:border-blue-400 transition-all duration-300"
                          required={isSignUp}
                        />
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full rounded-xl py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>
                  </motion.div>
                </form>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </motion.div>
                </div>

                {!isSignUp && (
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <button type="button" onClick={handleResendConfirmation} disabled={loading || !formData.email} className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors disabled:opacity-50">
                      Forgot your password?
                    </button>
                  </motion.div>
                )}

                {/* Demo Access */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-slate-500 font-medium">Demo Access</p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-300"
                        onClick={() => onNavigate('doctor')}
                      >
                        Continue as Demo User
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Logo for smaller screens */}
            <motion.div 
              className="lg:hidden text-center mt-8"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                PediaDose AI
              </h2>
              <p className="text-slate-600">
                Intelligent pediatric medication safety
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}