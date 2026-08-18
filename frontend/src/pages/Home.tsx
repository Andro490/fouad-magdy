import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <main ref={heroRef} className="flex-1 flex items-center justify-center pt-20 relative min-h-screen">
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2"></div>
      
      <div className="z-10 text-center space-y-6">
        <h1 ref={textRef} className="text-6xl md:text-8xl font-black">
          اشحن <span className="text-gradient">حسابك</span> الآن
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          أسرع وأأمن منصة لشحن كوينز لعبة eFootball بأفضل الأسعار. احصل على لاعبيك المفضلين وابنِ فريق أحلامك!
        </p>
        <Link to="/products" className="inline-block px-8 py-4 bg-primary text-dark font-bold rounded-lg hover:bg-accent hover:text-white transition-all shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transform hover:-translate-y-1">
          تصفح العروض
        </Link>
      </div>
    </main>
  );
};

export default Home;
