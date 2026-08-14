import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import { useLanguage } from '../context/LanguageContext';
import '../style/Projects.css';
import starPawsImg from '../assets/StarPaws.png';
import starProductivityImg from '../assets/Star-Productivity.png';
import musicRngImg from '../assets/MusicRNG.png';
import linkIcon from '../assets/link-svgrepo-com.svg';
import gitIcon from '../assets/github-142-svgrepo-com.svg';

gsap.registerPlugin(ScrollTrigger);

const PAD = 20;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

function SpecularButton({
  children,
  size = 'md',
  radius = 10,
  tint = '#0D9488',
  tintOpacity = 0.25,
  blur = 6,
  textColor = '#ffffff',
  lineColor = '#2DD4BF',
  baseColor = '#0D9488',
  intensity = 1.2,
  shineSize = 15,
  shineFade = 35,
  thickness = 1.5,
  speed = 0.35,
  followMouse = true,
  proximity = 220,
  autoAnimate = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button'
}) {
  const btnRef = useRef(null);
  const fxRef = useRef(null);
  const propsRef = useRef({});

  propsRef.current = { radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, speed, followMouse, proximity, autoAnimate };

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return;

    const dpr = window.devicePixelRatio || 1;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 1 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: dpr }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    fx.appendChild(gl.canvas);

    const sizeRef = { w: 1, h: 1 };
    const resize = () => {
      const rect = btn.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      sizeRef.w = w;
      sizeRef.h = h;
      renderer.setSize(w + PAD * 2, h + PAD * 2);
      program.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr];
      program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(btn);
    resize();

    let pointerAngle = null;
    let proximityT = 0;
    const onPointerMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2);
        const ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    };
    window.addEventListener('pointermove', onPointerMove);

    let angle = 2.4;
    let idleAngle = 2.4;
    let bright = 0;
    let last = performance.now();
    let raf = 0;

    const lineC = new Color();
    const baseC = new Color();

    const update = (now) => {
      raf = requestAnimationFrame(update);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = propsRef.current;

      idleAngle += p.speed * dt;
      const steer = p.followMouse && pointerAngle != null && (!p.autoAnimate || proximityT > 0);
      const target = steer ? pointerAngle : idleAngle;
      const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += diff * (1 - Math.exp(-dt * 7));

      const brightTarget = p.autoAnimate ? 1 : proximityT;
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

      lineC.set(p.lineColor);
      baseC.set(p.baseColor);
      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      program.uniforms.uIntensity.value = p.intensity * bright;
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = p.thickness * dpr;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`specular-button specular-button--${size}${className ? ` ${className}` : ''}`}
      style={{
        '--sb-radius': `${radius}px`,
        '--sb-tint': tint,
        '--sb-tint-opacity': tintOpacity,
        '--sb-blur': `${blur}px`,
        '--sb-text-color': textColor
      }}
    >
      <span ref={fxRef} className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </button>
  );
}

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
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: '#projects',
            start: 'top 75%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (e) => {
    gsap.to(e.currentTarget, {
      y: -8,
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(13, 148, 136, 0.25)',
      borderColor: 'rgba(13, 148, 136, 0.5)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = (e) => {
    gsap.to(e.currentTarget, {
      y: 0,
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
        <SpecularButton
          size="md"
          radius={10}
          tint="#0D9488"
          tintOpacity={0.25}
          blur={6}
          textColor="#ffffff"
          lineColor="#2DD4BF"
          baseColor="#0D9488"
          intensity={1.2}
          shineSize={15}
          shineFade={35}
          thickness={1.5}
          followMouse={true}
          proximity={220}
          onClick={() => window.open('https://github.com/sibiru10?tab=repositories', '_blank', 'noopener,noreferrer')}
        >
          <span className="btn-specular-content">
            <img src={gitIcon} alt="" className="btn-git-svg" />
            {t.ctaButton}
          </span>
        </SpecularButton>
      </div>
    </section>
  );
}