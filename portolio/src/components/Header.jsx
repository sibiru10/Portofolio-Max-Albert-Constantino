import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../style/Header.css';

const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' }
];

export default function Header({ isNavLocked }) {
  const { lang, toggleLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState('hero');

  const isClickScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
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

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      NAV_ITEMS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [isNavLocked]);

  const handleNavLinkClick = (e, id) => {
    e.preventDefault();
    if (isNavLocked) return;

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
        Portofolio<span className="logo-highlight">.Max</span>
      </a>

      <ul className="nav-links">
        {NAV_ITEMS.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={activeSection === id ? 'active' : ''}
              onClick={(e) => handleNavLinkClick(e, id)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <button onClick={toggleLanguage} className="lang-switcher-btn" aria-label="Toggle Language">
        <span className="lang-main">{lang === 'en' ? 'EN' : 'ID'}</span>
        <span className="lang-divider">|</span>
        <span className="lang-sub">{lang === 'en' ? 'US' : 'ID'}</span>
      </button>
    </nav>
  );
}