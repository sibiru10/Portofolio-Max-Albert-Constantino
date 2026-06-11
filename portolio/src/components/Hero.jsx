import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import '../style/Hero.css';
import profileImg from '../assets/Max.png';

gsap.registerPlugin(TextPlugin, ScrollTrigger);

export default function Hero({ onAnimationEnd, hasChosenLang, setHasChosenLang }) {
  const { t, lang, toggleLanguage, changeLanguage } = useLanguage(); 

  const modalRef = useRef(null);
  const modalCardRef = useRef(null);

  const staticLine1 = useRef(null);
  const dynamicLine1 = useRef(null);
  const staticLine2 = useRef(null);
  const dynamicLine2 = useRef(null);
  
  const cursor1 = useRef(null);
  const cursor2 = useRef(null);

  const helloRef = useRef(null);
  const profileRef = useRef(null);
  const descRef = useRef(null);
  const quoteRef = useRef(null);
  const buttonRef = useRef(null);

  const onAnimationEndRef = useRef(onAnimationEnd);
  
  useEffect(() => {
    onAnimationEndRef.current = onAnimationEnd;
  }, [onAnimationEnd]);

  useEffect(() => {
    if (!hasChosenLang && modalRef.current && modalCardRef.current) {
      const enterTl = gsap.timeline();
      
      enterTl.set(modalRef.current, { opacity: 0 })
             .set(modalCardRef.current, { y: 40, scale: 0.92, opacity: 0 });

      enterTl.to(modalRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" })
             .to(modalCardRef.current, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "power4.out" }, "-=0.2");
    }
  }, [hasChosenLang]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";

    if (!hasChosenLang) return;

    const blink1 = gsap.to(cursor1.current, { opacity: 0, repeat: -1, yoyo: true, duration: 0.4, ease: "power1.inOut" });
    const blink2 = gsap.to(cursor2.current, { opacity: 0, repeat: -1, yoyo: true, duration: 0.4, ease: "power1.inOut" });

    const line1Tl = gsap.timeline({ paused: true })
      .to(staticLine1.current, { duration: 0.6, text: t.nameIs, ease: "none" })
      .to(dynamicLine1.current, { duration: 1.4, text: "Max Albert Constantino.", ease: "none" });

    const line2Tl = gsap.timeline({ paused: true })
      .to(staticLine2.current, { duration: 0.5, text: t.rolePrefix, ease: "none" }) 
      .to(dynamicLine2.current, { duration: 1.0, text: t.developer, ease: "none" }); 

    const tl = gsap.timeline({
      onComplete: () => {
        html.style.overflow = "";
        html.style.height = "";
        body.style.overflow = "";
        body.style.height = "";
        
        setTimeout(() => {
          ScrollTrigger.refresh(); 
          if (onAnimationEndRef.current) {
            onAnimationEndRef.current();
          }
        }, 100);
      }
    });

    tl.set([staticLine1.current, dynamicLine1.current, staticLine2.current, dynamicLine2.current], { text: "" })
      .set(cursor1.current, { display: "inline-block" })
      .set(cursor2.current, { display: "none" })
      .set([helloRef.current, descRef.current, quoteRef.current, buttonRef.current], { opacity: 0 })
      .set(profileRef.current, { opacity: 0, scale: 0.9 })
      .set(buttonRef.current, { x: -50 });

    tl.to(helloRef.current, { opacity: 1, duration: 0.8 })
      .to(profileRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, "<")
      .to(line1Tl, { progress: 1, duration: 2.0, ease: "none" })
      .set(cursor1.current, { display: "none" })
      .set(cursor2.current, { display: "inline-block" })
      .to(line2Tl, { progress: 1, duration: 1.5, ease: "none" })
      .to(descRef.current, { opacity: 1, duration: 0.8 })
      .to(quoteRef.current, { opacity: 1, duration: 0.6 }, "+=0.6")
      .to(buttonRef.current, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" });

    return () => {
      tl.kill();
      line1Tl.kill();
      line2Tl.kill();
      blink1.kill();
      blink2.kill();
      html.style.overflow = "";
      html.style.height = "";
      body.style.overflow = "";
      body.style.height = "";
    };
  }, [lang, t, hasChosenLang]);

  const handleLanguageSelect = (selectedLang) => {
    if (changeLanguage) {
      changeLanguage(selectedLang);
    } else if (toggleLanguage && lang !== selectedLang) {
      toggleLanguage();
    }

    const exitTl = gsap.timeline({
      onComplete: () => {
        setHasChosenLang(true); 
      }
    });

    exitTl.to(modalCardRef.current, { scale: 0.95, opacity: 0, duration: 0.3, ease: "power2.in" })
          .to(modalRef.current, { opacity: 0, duration: 0.3, ease: "power2.inOut" }, "-=0.15");
  };

  return (
    <>
      {!hasChosenLang && (
        <div ref={modalRef} className="lang-modal-overlay">
          <div ref={modalCardRef} className="lang-modal-card">
            <h2 className="lang-modal-title">Choose Language / Pilih Bahasa</h2>
            <div className="lang-modal-buttons">
              <button className="lang-modal-btn" onClick={() => handleLanguageSelect('en')}>
                English 🇺🇸
              </button>
              <button className="lang-modal-btn" onClick={() => handleLanguageSelect('id')}>
                Bahasa Indonesia 🇮🇩
              </button>
            </div>
          </div>
        </div>
      )}

      <section id="hero" className={`hero-container ${!hasChosenLang ? 'hero-hidden-state' : ''}`}>
        <div className="hero-left">
          <h3 ref={helloRef} className="hero-hello">{t.hello}</h3>
          <h1 className="hero-title">
            <div className="title-line">
              <span ref={staticLine1} className="text-secondary"></span>
              <span ref={dynamicLine1} className="text-accent"></span>
              <span ref={cursor1} className="cursor">|</span>
            </div>
            <div className="title-line">
              <span ref={staticLine2} className="text-secondary"></span>
              <span ref={dynamicLine2} className="text-accent"></span>
              <span ref={cursor2} className="cursor">|</span>
            </div>
          </h1>
          <div ref={descRef} className="hero-description">
            <p>{t.desc1}</p>
            <p>{t.desc2}</p>
            <p>{t.desc3}</p>
            <span ref={quoteRef} className="hero-quote">{t.quote}</span>
          </div>
          <a ref={buttonRef} href="#about" className="btn-primary">{t.knowMe}</a>
        </div>
        <div className="hero-right">
          <div ref={profileRef} className="profile-circle-wrapper">
            <img 
              src={profileImg} 
              alt="Max Albert Constantino Portrait" 
              className="profile-img" 
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>
        </div>
      </section>
    </>
  );
}