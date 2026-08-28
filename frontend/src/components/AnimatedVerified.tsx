import Lottie from 'lottie-react';
import verifiedAnimation from '../assets/verified.json';

interface AnimatedVerifiedProps {
  className?: string;
}

export default function AnimatedVerified({ className = "w-5 h-5" }: AnimatedVerifiedProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Lottie 
        animationData={verifiedAnimation} 
        loop={true} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
