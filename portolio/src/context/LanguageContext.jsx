import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    hello: "Hello!",
    nameIs: "My name is ",
    rolePrefix: "I'm a ",
    developer: "Web Developer.",
    desc1: "A developer passionate about making his own web.",
    desc2: "With an unlimited imagination and creativity,",
    desc3: "I strive to create a unique and professional website.",
    quote: '"all roads lead to Rome"',
    knowMe: "Get to Know Me Better",
    aboutTitle: "About Me",
    aboutBio: "I am a student at SMK Tri Ratna majoring in Software Engineering (RPL) with a focus on Web Development. Proficient in HTML, CSS, JavaScript, and React foundations. Highly motivated to apply technical skills, contribute to real projects, and absorb knowledge directly from the industry.",
    skillsTitle: "My Skills",
    focusExperience: "Focus & Experience",
    lastEducation: "Last Education",
    schoolDuration: "SMK Tri Ratna - Software Engineering (RPL) | 2025 - Present",
    supportingTitle: "Supporting Skills & Tools",
    projectsTitle: "Projects",
    pawsDesc: "An interactive, high-end landing page utilizing advanced scroll sequences and transitions for pet adoption.",
    prodDesc: "A robust task management application featuring dashboard metrics, custom workflows, and active productivity tracking tools.",
    musicDesc: "A dynamic random generator application engineered to pull custom recommendations, advice layouts, and randomized media hooks.",
    ctaTitle: "Want to see more of my projects?",
    ctaButton: "View All Repositories", 
    contactTitle: "Get In Touch",
    contactDetailTitle: "Contact Details",
    labelEmail: "Email",
    labelPhone: "Phone",
    labelLocation: "Location",
    valLocation: "Jakarta, Indonesia",
   brandTextLine1: "A developer passionate about making his own web.",
    brandTextLine2: "With an unlimited imagination and creativity,",
    brandTextLine3: "I strive to create a unique and professional website."
  },
  id: {
    hello: "Halo!",
    nameIs: "Nama saya ",
    rolePrefix: "Saya adalah ",
    developer: "Web Developer.",
    desc1: "Seorang developer yang bersemangat membuat webnya sendiri.",
    desc2: "Dengan imajinasi dan kreativitas tanpa batas,",
    desc3: "Saya berusaha membuat website yang unik dan profesional.",
    quote: '"Banyak jalan menuju Roma"',
    knowMe: "Kenali saya lebih dalam",
    aboutTitle: "Tentang Saya",
    aboutBio: "Saya adalah siswa SMK Tri Ratna jurusan Rekayasa Perangkat Lunak (RPL) yang berfokus pada Web Development. Menguasai fondasi HTML, CSS, JavaScript, dan React. Memiliki motivasi tinggi untuk mengaplikasikan keterampilan teknis, berkontribusi dalam proyek nyata, serta menyerap ilmu langsung dari industri",
    skillsTitle: "Keahlian Saya",
    focusExperience: "Fokus & Pengalaman",
    lastEducation: "Pendidikan Terakhir",
    schoolDuration: "SMK Tri Ratna - Rekayasa Perangkat Lunak (RPL) | 2025 - sekarang",
    supportingTitle: "Skills Pendukung & Tools",
    projectsTitle: "Proyek",
    pawsDesc: "Sebuah landing page interaktif dan mewah yang memanfaatkan urutan scroll tingkat lanjut serta transisi untuk adopsi hewan peliharaan.",
    prodDesc: "Aplikasi manajemen tugas yang andal, menampilkan metrik dasbor, alur kerja kustom, dan alat pelacak produktivitas aktif.",
    musicDesc: "Aplikasi generator acak dinamis yang dirancang untuk menarik rekomendasi kustom, tata letak saran, dan kait media acak.",
    ctaTitle: "Ingin melihat lebih banyak proyek saya?",
    ctaButton: "Lihat Semua Repositori",
    contactTitle: "Hubungi Saya",
    contactDetailTitle: "Detail Kontak",
    labelEmail: "Email",
    labelPhone: "Telepon",
    labelLocation: "Lokasi",
    valLocation: "Jakarta, Indonesia",
   brandTextLine1: "Seorang pengembang yang penuh gairah dalam membangun webnya sendiri.",
    brandTextLine2: "Dengan imajinasi dan kreativitas tanpa batas,",
    brandTextLine3: "Saya berusaha menciptakan situs web yang unik dan profesional."
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = translations[lang];

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'id' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}