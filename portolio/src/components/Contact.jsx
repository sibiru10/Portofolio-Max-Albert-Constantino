import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import '../style/Contact.css';

import emailIcon from '../assets/email-icon.svg';
import phoneIcon from '../assets/phone-icon.svg';
import locationIcon from '../assets/location-icon.svg';
import myLogo from '../assets/github-142-svgrepo-com.svg';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const { t } = useLanguage();
  const contactRef = useRef(null);
  const brandRef = useRef(null);
  const detailCardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const revealTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: contactRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      });

      revealTimeline
        .fromTo(
          brandRef.current,
          { opacity: 0, x: -100 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
        )
        .fromTo(
          detailCardRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.5'
        );
    }, contactRef);

    return () => ctx.revert();
  }, []);

  const handleCardEnter = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1.03,
      borderColor: '#0D9488',
      boxShadow: '0 15px 35px rgba(13, 148, 136, 0.2)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleCardLeave = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      borderColor: 'rgba(226, 232, 240, 0.1)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <footer ref={contactRef} id="contact" className="contact-container">
      <h2 className="contact-section-title">{t.contactTitle}</h2>

      <div className="contact-layout">
        <div ref={brandRef} className="contact-brand-wrapper">
          <div className="contact-logo-header">
            <img src={myLogo} alt="Logo" className="contact-brand-logo" />
            <h3 className="contact-brand-name">
              Portofolio<span className="text-highlight">.Max</span>
            </h3>
          </div>

          <div className="contact-brand-description">
            <p>{t.brandTextLine1}</p>
            <p>{t.brandTextLine2}</p>
            <p>{t.brandTextLine3}</p>
          </div>

          <div className="contact-social-links">
            <a 
              href="https://github.com/sibiru10" 
              target="_blank" 
              rel="noreferrer" 
              className="social-icon-btn"
              aria-label="GitHub Profile"
            >
              <img src={myLogo} alt="GitHub" className="social-svg-icon" />
            </a>
          </div>
        </div>

        <div className="contact-info-column">
          <h3 className="detail-layout-title">{t.contactDetailTitle}</h3>

          <div
            ref={detailCardRef}
            className="contact-detail-card"
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
          >
            <div className="detail-item-block">
              <div className="detail-label-zone">
                <img src={emailIcon} alt="" className="detail-svg-icon" />
                <span>{t.labelEmail}</span>
              </div>
              <a href="mailto:maxalbertt2010@gmail.com" className="detail-value-link">
                maxalbertt2010@gmail.com
              </a>
            </div>

            <div className="detail-item-block">
              <div className="detail-label-zone">
                <img src={phoneIcon} alt="" className="detail-svg-icon" />
                <span>{t.labelPhone}</span>
              </div>
              <a href="tel:+6281289697733" className="detail-value-link">
                +62 812-8969-7733
              </a>
            </div>

            <div className="detail-item-block">
              <div className="detail-label-zone">
                <img src={locationIcon} alt="" className="detail-svg-icon" />
                <span>{t.labelLocation}</span>
              </div>
              <p className="detail-value-text">{t.valLocation}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Max Albert Constantino. All rights reserved.
        </p>
        <p className="footer-tech-credit">
          Built with React & GSAP
        </p>
      </div>
    </footer>
  );
}