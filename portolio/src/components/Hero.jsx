import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import { useLanguage } from '../context/LanguageContext';
import '../style/Hero.css';
import profileImg from '../assets/Max.png';

gsap.registerPlugin(TextPlugin, ScrollTrigger);

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
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
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

export default function Hero({ onAnimationEnd, hasChosenLang, setHasChosenLang }) {
  const { t, lang, toggleLanguage, changeLanguage } = useLanguage(); 

  const heroSectionRef = useRef(null);
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

      enterTl.to(modalRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' })
             .to(modalCardRef.current, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'power4.out' }, '-=0.2');
    }
  }, [hasChosenLang]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.height = '100%';

    if (!hasChosenLang) return;

    const ctx = gsap.context(() => {
      gsap.to(cursor1.current, { opacity: 0, repeat: -1, yoyo: true, duration: 0.4, ease: 'power1.inOut' });
      gsap.to(cursor2.current, { opacity: 0, repeat: -1, yoyo: true, duration: 0.4, ease: 'power1.inOut' });

      const line1Tl = gsap.timeline({ paused: true })
        .to(staticLine1.current, { duration: 0.6, text: t.nameIs, ease: 'none' })
        .to(dynamicLine1.current, { duration: 1.4, text: 'Max Albert Constantino.', ease: 'none' });

      const line2Tl = gsap.timeline({ paused: true })
        .to(staticLine2.current, { duration: 0.5, text: t.rolePrefix, ease: 'none' }) 
        .to(dynamicLine2.current, { duration: 1.0, text: t.developer, ease: 'none' }); 

      const tl = gsap.timeline({
        onComplete: () => {
          html.style.overflow = '';
          html.style.height = '';
          body.style.overflow = '';
          body.style.height = '';
          
          setTimeout(() => {
            ScrollTrigger.refresh(); 
            if (onAnimationEndRef.current) {
              onAnimationEndRef.current();
            }
          }, 100);
        }
      });

      tl.set([staticLine1.current, dynamicLine1.current, staticLine2.current, dynamicLine2.current], { text: '' })
        .set(cursor1.current, { display: 'inline-block' })
        .set(cursor2.current, { display: 'none' })
        .set([helloRef.current, descRef.current, quoteRef.current, buttonRef.current], { opacity: 0 })
        .set(profileRef.current, { opacity: 0, scale: 0.9 })
        .set(buttonRef.current, { x: -50 });

      tl.to(helloRef.current, { opacity: 1, duration: 0.8 })
        .to(profileRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, '<')
        .to(line1Tl, { progress: 1, duration: 2.0, ease: 'none' })
        .set(cursor1.current, { display: 'none' })
        .set(cursor2.current, { display: 'inline-block' })
        .to(line2Tl, { progress: 1, duration: 1.5, ease: 'none' })
        .to(descRef.current, { opacity: 1, duration: 0.8 })
        .to(quoteRef.current, { opacity: 1, duration: 0.6 }, '+=0.6')
        .to(buttonRef.current, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' });
    }, heroSectionRef);

    return () => {
      ctx.revert();
      html.style.overflow = '';
      html.style.height = '';
      body.style.overflow = '';
      body.style.height = '';
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

    exitTl.to(modalCardRef.current, { scale: 0.95, opacity: 0, duration: 0.3, ease: 'power2.in' })
          .to(modalRef.current, { opacity: 0, duration: 0.3, ease: 'power2.inOut' }, '-=0.15');
  };

  const handleScrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = 'about';
    }
  };

  return (
    <div ref={heroSectionRef}>
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

          <div ref={buttonRef} className="hero-btn-wrapper">
            <SpecularButton
              size="lg"
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
              onClick={handleScrollToAbout}
            >
              {t.knowMe}
            </SpecularButton>
          </div>
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
    </div>
  );
}