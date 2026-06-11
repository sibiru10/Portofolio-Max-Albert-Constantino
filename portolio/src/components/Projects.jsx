import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import '../style/Projects.css';
import starPawsImg from '../assets/StarPaws.png';
import starProductivityImg from '../assets/Star-Productivity.png';
import musicRngImg from '../assets/MusicRNG.png';
import linkIcon from '../assets/link-svgrepo-com.svg';
import gitIcon from '../assets/github-142-svgrepo-com.svg';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const { t } = useLanguage();
  const cardsRef = useRef([]);
  cardsRef.current = [];

  const projectData = [
    {
      id: 1,
      title: 'Star Paws Adoption',
      description: t.pawsDesc,
      tech: ['React.js', 'GSAP'],
      img: starPawsImg,
      liveLink: 'https://69fd86ad5e11fb00084f8a7d--starpawsadoption.netlify.app/',
      gitLink: 'https://github.com/sibiru10/gsap-mini-project-2-Max-Albert-Constantino/'
    },
    {
      id: 2,
      title: 'Star Productivity Tracker',
      description: t.prodDesc,
      tech: ['React.js'],
      img: starProductivityImg,
      liveLink: 'https://star-productivity-tracker.netlify.app/',
      gitLink: 'https://github.com/sibiru10/midterm-project-rpl10-2-Max-Albert-Constantino'
    },
    {
      id: 3,
      title: 'Music RNG Engine',
      description: t.musicDesc,
      tech: ['React.js', 'GSAP'],
      img: musicRngImg,
      liveLink: 'https://music-rng.vercel.app/',
      gitLink: 'https://github.com/sibiru10/Music-RNG-Max'
    }
  ];

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useEffect(() => {
    const revealTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#projects',
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    });

    revealTimeline.fromTo(
      cardsRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.2 }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === '#projects') trigger.kill();
      });
    };
  }, []);

  const handleMouseEnter = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      boxShadow: '0 15px 35px rgba(13, 148, 136, 0.25)',
      borderColor: '#0D9488',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      borderColor: 'rgba(226, 232, 240, 0.1)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <section id="projects" className="projects-container">
      <h2 className="projects-section-title">{t.projectsTitle}</h2>
      
      <div className="projects-grid">
        {projectData.map((project) => (
          <div 
            key={project.id} 
            ref={addToRefs}
            className="project-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="project-image-container">
              <img 
                src={project.img} 
                alt={`${project.title} Preview`} 
                className="project-card-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="project-img-fallback-ui" style={{ display: 'none' }}>
                <span>{project.title.substring(0, 2).toUpperCase()}</span>
              </div>
            </div>

            <div className="project-card-body">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              
              <div className="project-tech-tags">
                {project.tech.map((techItem, index) => (
                  <span key={index} className="tech-tag">{techItem}</span>
                ))}
              </div>
            </div>

            <div className="project-card-footer">
              <a href={project.liveLink} target="_blank" rel="noreferrer" className="project-footer-link">
                <img src={linkIcon} alt="" className="footer-svg-icon" /> Live Site
              </a>
              <a href={project.gitLink} target="_blank" rel="noreferrer" className="project-footer-link">
                <img src={gitIcon} alt="" className="footer-svg-icon" /> GitHub
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="projects-more-cta">
        <h3 className="projects-more-title">{t.ctaTitle}</h3>
        <a 
          href="https://github.com/sibiru10?tab=repositories" 
          target="_blank" 
          rel="noreferrer" 
          className="btn-more-github"
        >
          <img src={gitIcon} alt="" className="btn-git-svg" />
          {t.ctaButton}
        </a>
      </div>
    </section>
  );
}