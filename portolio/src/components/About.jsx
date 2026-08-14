import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import '../style/About.css';

import cssLogo from '../assets/css-3-svgrepo-com.svg';
import htmlLogo from '../assets/html-5-svgrepo-com.svg';
import jsLogo from '../assets/javascript-svgrepo-com.svg';
import reactLogo from '../assets/reactjs-svgrepo-com.svg';
import gsapLogo from '../assets/gsap.png';
import skillIcon from '../assets/work-alt-svgrepo-com.svg';
import educationIcon from '../assets/profile-round-1342-svgrepo-com.svg';

gsap.registerPlugin(ScrollTrigger);

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2
};

const coreSkills = [
  { name: 'JavaScript', desc: 'Core Programming Language', icon: jsLogo },
  { name: 'React', desc: 'Frontend Library', icon: reactLogo },
  { name: 'GSAP', desc: 'Animation Framework', icon: gsapLogo },
  { name: 'CSS', desc: 'Styling & Layout', icon: cssLogo },
  { name: 'HTML', desc: 'Markup Language', icon: htmlLogo }
];

const supportingSkills = ['Microsoft Word', 'Python', 'Canva', 'Figma'];

function TiltedCard({
  captionText = '',
  containerHeight = '100%',
  containerWidth = '100%',
  scaleOnHover = 1.02,
  rotateAmplitude = 5,
  showTooltip = false,
  children
}) {
  const ref = useRef(null);
  const lastY = useRef(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1
  });

  function handleMouse(e) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY.current;
    rotateFigcaption.set(-velocityY * 0.6);
    lastY.current = offsetY;
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className="tilted-card-figure"
      style={{
        height: containerHeight,
        width: containerWidth,
        perspective: 1000
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="tilted-card-inner"
        style={{
          width: '100%',
          height: '100%',
          rotateX,
          rotateY,
          scale
        }}
      >
        {children}
      </motion.div>

      {showTooltip && captionText && (
        <motion.figcaption
          className="tilted-card-caption"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}

export default function About() {
  const { t } = useLanguage();

  const sectionRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([leftCardRef.current, rightCardRef.current], { opacity: 0, y: 50 });
      gsap.set('.core-skill-row', { opacity: 0, x: 30 });
      gsap.set('.supporting-badge', { opacity: 0, scale: 0.8 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      tl.to([leftCardRef.current, rightCardRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      })
      .to('.core-skill-row', {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.4')
      .to('.supporting-badge', {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'back.out(1.7)'
      }, '-=0.3');
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="about-section">
      <div style={{ textAlign: 'center' }}>
        <span className="section-badge">{t.knowMe}</span>
      </div>

      <div className="about-grid">
        <div ref={leftCardRef} className="about-card-wrapper">
          <TiltedCard
            rotateAmplitude={5}
            scaleOnHover={1.02}
            showTooltip={false}
          >
            <div className="about-card profile-card">
              <div className="card-header">
                <img src={educationIcon} alt="Profile Icon" className="header-icon-img" />
                <h2>{t.aboutTitle}</h2>
              </div>

              <div className="card-body">
                <h3 className="profile-subtitle" style={{ color: '#0D9488' }}>
                  Max Albert Constantino - Web Developer
                </h3>
                <p className="profile-bio">{t.aboutBio}</p>

                <div className="divider-container">
                  <span className="divider-text">{t.focusExperience}</span>
                </div>

                <div className="extra-info">
                  <div>
                    <h4 style={{ color: '#0D9488' }}>{t.lastEducation}</h4>
                    <p>{t.schoolDuration}</p>
                  </div>
                </div>
              </div>
            </div>
          </TiltedCard>
        </div>

        <div ref={rightCardRef} className="about-card skills-card">
          <div className="card-header">
            <img src={skillIcon} alt="Skills Icon" className="header-icon-img" />
            <h2>{t.skillsTitle}</h2>
          </div>

          <div className="core-skills-list">
            {coreSkills.map((skill, index) => (
              <div key={skill.name || index} className="core-skill-row">
                <span className="skill-icon">
                  <img
                    src={skill.icon}
                    alt={`${skill.name} Logo`}
                    className="skill-logo-img"
                  />
                </span>
                <div className="skill-meta">
                  <h4>{skill.name}</h4>
                  <p>{skill.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="supporting-section">
            <h3 className="supporting-title">{t.supportingTitle}</h3>
            <div className="supporting-container">
              {supportingSkills.map((skill, index) => (
                <span key={skill || index} className="supporting-badge">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}