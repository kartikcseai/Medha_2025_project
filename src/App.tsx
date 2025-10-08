import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { DoctorPanel } from './components/DoctorPanel';
import { PatientPanel } from './components/PatientPanel';
import { EHRAnalysis } from './components/EHRAnalysis';
import { LoginPage } from './components/LoginPage';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  // Sync UI with Supabase auth state
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const hasSession = !!data.session;
      setIsAuthenticated(hasSession);
      setCurrentPage(hasSession ? (currentPage === 'login' ? 'doctor' : currentPage) : 'login');
    }
    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = !!session;
      setIsAuthenticated(hasSession);
      setCurrentPage(hasSession ? 'doctor' : 'login');
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const pageVariants = {
    initial: { 
      opacity: 0, 
      x: 50,
      scale: 0.98
    },
    in: { 
      opacity: 1, 
      x: 0,
      scale: 1
    },
    out: { 
      opacity: 0, 
      x: -50,
      scale: 0.98
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return isAuthenticated ? (
          <LandingPage onNavigate={handleNavigate} />
        ) : (
          <LoginPage onNavigate={handleNavigate} />
        );
      case 'doctor':
        return isAuthenticated ? <DoctorPanel /> : <LoginPage onNavigate={handleNavigate} />;
      case 'patient':
        return isAuthenticated ? <PatientPanel onNavigate={handleNavigate} /> : <LoginPage onNavigate={handleNavigate} />;
      case 'ehr-analysis':
        return isAuthenticated ? <EHRAnalysis onBack={() => setCurrentPage('patient')} /> : <LoginPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      default:
        return <LoginPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-solid)' }}>
      {isAuthenticated && currentPage !== 'login' && (
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}