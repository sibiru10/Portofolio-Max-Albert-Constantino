import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { LanguageProvider } from './context/LanguageContext.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Project from './components/Projects.jsx';
import Contact from './components/Contact.jsx';

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