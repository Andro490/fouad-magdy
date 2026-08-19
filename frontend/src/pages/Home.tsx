import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current && ctaRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(textRef.current, 
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" }
      )
      .fromTo(ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    }
  }, []);

  return (
    <main ref={heroRef} className="flex-1 flex items-center justify-center pt-20 relative min-h-screen bg-dark text-white overflow-hidden" dir="rtl">
      
      {/* 3D Background */}
      <ThreeBackground />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2"></div>
      
      {/* Content */}
      <div className="z-10 text-center space-y-8 px-4 relative backdrop-blur-sm bg-dark/30 p-12 rounded-3xl border border-white/10 shadow-2xl">
        <h1 ref={textRef} className="text-5xl md:text-8xl font-black tracking-tight drop-shadow-lg">
          منصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">صناع المحتوى</span> الأولى
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
          بث مباشر، مسابقات حصرية، وإدارة متكاملة لأرباحك ومتابعيك.
          ابنِ مجتمعك الآن بأحدث التقنيات السينمائية.
        </p>
        
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
          <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-purple text-white font-bold rounded-xl hover:shadow-[0_0_40px_rgba(255,45,155,0.6)] transform hover:-translate-y-1 transition-all duration-300 text-lg">
            ابدأ الآن كستريمر
          </Link>
          <Link to="/store" className="w-full sm:w-auto px-10 py-4 bg-dark-card border border-accent/50 text-accent font-bold rounded-xl hover:bg-accent/10 hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transform hover:-translate-y-1 transition-all duration-300 text-lg">
            اكتشف المسابقات
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
