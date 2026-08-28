import { useLottie } from 'lottie-react';
import verifiedAnimation from '../assets/verified.json';

interface AnimatedVerifiedProps {
  className?: string;
}

export default function AnimatedVerified({ className = "w-5 h-5" }: AnimatedVerifiedProps) {
  const options = {
    animationData: verifiedAnimation,
    loop: true,
    autoplay: true,
    style: { width: '100%', height: '100%' }
  };
  // @ts-ignore
  const { View } = useLottie(options) as any;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {View}
    </div>
  );
}
