import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../style/Header.css';

export default function Header({ isNavLocked }) {
  const { lang, toggleLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState('hero');

  const isClickScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    const sections = ['hero', 'about', 'projects', 'contact'];

    const observerOptions = {
      root: null,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      if (isNavLocked || isClickScrolling.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [isNavLocked]);

  const handleNavLinkClick = (e, id) => {
    if (isNavLocked) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    setActiveSection(id);
    isClickScrolling.current = true;

    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  };

  return (
    <nav className={`navbar ${isNavLocked ? 'navbar-locked' : ''}`}>
      <a href="#hero" className="nav-logo" onClick={(e) => handleNavLinkClick(e, 'hero')}>
        Portofolio<span>.Max</span>
      </a>

      <ul className="nav-links">
        <li>
          <a href="#hero" className={activeSection === 'hero' ? 'active' : ''} onClick={(e) => handleNavLinkClick(e, 'hero')}>Home</a>
        </li>
        <li>
          <a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={(e) => handleNavLinkClick(e, 'about')}>About</a>
        </li>
        <li>
          <a href="#projects" className={activeSection === 'projects' ? 'active' : ''} onClick={(e) => handleNavLinkClick(e, 'projects')}>Projects</a>
        </li>
        <li>
          <a href="#contact" className={activeSection === 'contact' ? 'active' : ''} onClick={(e) => handleNavLinkClick(e, 'contact')}>Contact</a>
        </li>
      </ul>

      <button onClick={toggleLanguage} className="lang-toggle">
        {lang === 'en' ? 'EN \uD83C\uDDFA\uD83C\uDDF8' : 'ID \uD83C\uDDEE\uD83C\uDDE9'}
      </button>
    </nav>
  );
}