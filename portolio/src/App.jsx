import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Project from './components/Projects';
import Contact from './components/Contact';

export default function App() {
  const [isNavLocked, setIsNavLocked] = useState(true);
  // New state to check if the language modal has been completed
  const [hasChosenLang, setHasChosenLang] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <LanguageProvider>
      {/* Only render Header after they choose a language to ensure clean visuals */}
      {hasChosenLang && <Header isNavLocked={isNavLocked} />}
      
      <main>
        <Hero 
          onAnimationEnd={() => setIsNavLocked(false)} 
          hasChosenLang={hasChosenLang}
          setHasChosenLang={setHasChosenLang}
        />
        <About />
        <Project />
        <Contact />
      </main>
    </LanguageProvider>
  );
}