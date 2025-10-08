import { ArrowRight, Shield, Calculator, Users, Mail, Phone, MapPin, Sparkles, Heart, Star } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
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
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      {/* Hero Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-8" variants={itemVariants}>
              <div className="space-y-6">
                <motion.div
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 text-blue-800 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI-Powered Healthcare Technology
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight">
                  <span className="block text-slate-900">AI-Powered</span>
                  <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Pediatric Medication
                  </span>
                  <span className="block text-slate-900">Safety System</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                  Ensure accurate, weight-based drug dosing and safe pediatric care with our intelligent dosage calculator powered by advanced AI technology.
                </p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="rounded-2xl px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => onNavigate('doctor')}
                  >
                    Go to Doctor Panel
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-2xl px-8 py-6 text-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                    onClick={() => onNavigate('patient')}
                  >
                    View Patient Records
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={itemVariants}
            >
              <motion.div 
                className="relative"
                variants={floatingVariants}
                animate="animate"
              >
                <div className="bg-gradient-to-br from-blue-100/50 via-white to-cyan-100/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm border border-white/50">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1576765608622-067973a79f53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZGFzaGJvYXJkJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTk4MzI3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Doctor using medical technology"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                </div>
                
                {/* Floating elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3 shadow-lg"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Heart className="h-6 w-6 text-white" />
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-3 shadow-lg"
                  animate={{ 
                    y: [-5, 5, -5],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Shield className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl text-slate-900">Why Choose PediaDose AI?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Advanced AI technology meets pediatric care expertise
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safety First",
                description: "AI-powered validation reduces medication errors and ensures safe dosing protocols.",
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100/50"
              },
              {
                icon: Calculator,
                title: "Precise Calculations",
                description: "Weight-based dosing calculations with real-time recommendations for pediatric patients.",
                gradient: "from-cyan-500 to-cyan-600",
                bgGradient: "from-cyan-50 to-cyan-100/50"
              },
              {
                icon: Users,
                title: "Patient Management",
                description: "Comprehensive patient records and medication history at your fingertips.",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50/50"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br ${feature.bgGradient} border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div 
                  className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-xl text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 space-y-4">
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-3 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-semibold text-white">PediaDose AI</span>
              </motion.div>
              <p className="text-slate-300 max-w-md leading-relaxed">
                Revolutionizing pediatric medication safety through AI-powered dosage calculations and patient management.
              </p>
            </div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold">Contact Information</h4>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center space-x-3 hover:text-blue-400 transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>support@pediadose.ai</span>
                </div>
                <div className="flex items-center space-x-3 hover:text-blue-400 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>1-800-PEDIA-AI</span>
                </div>
                <div className="flex items-center space-x-3 hover:text-blue-400 transition-colors">
                  <MapPin className="h-4 w-4" />
                  <span>Medical Innovation Center</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold">Quick Links</h4>
              <div className="space-y-3">
                {[
                  { id: 'doctor', label: 'Doctor Panel' },
                  { id: 'patient', label: 'Patient Records' },
                  { id: 'login', label: 'Login' }
                ].map((link) => (
                  <motion.button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className="block text-slate-300 hover:text-blue-400 transition-colors"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2024 PediaDose AI. All rights reserved. Medical technology for safer pediatric care.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}