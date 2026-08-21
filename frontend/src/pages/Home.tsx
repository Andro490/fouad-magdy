import HeroSection from '../components/home/HeroSection';
import ExperienceSection from '../components/home/ExperienceSection';
import StoreSection from '../components/home/StoreSection';
import AboutSection from '../components/home/AboutSection';
import CommunitySection from '../components/home/CommunitySection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030510] text-gray-100 font-sans overflow-hidden">
      <HeroSection />
      <div className="hidden md:block">
        <ExperienceSection />
      </div>
      <StoreSection />
      <div className="hidden md:block">
        <AboutSection />
        <CommunitySection />
      </div>
      <Footer />

      {/* Animations CSS for floating image since CSS keyframes are slightly smoother for continuous float than react-spring sometimes */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
