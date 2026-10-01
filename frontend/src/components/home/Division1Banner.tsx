import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Division1Banner() {
  return (
    <section className="relative pt-12 pb-6 px-4 bg-black overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <Link to="/division1-checkout">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="relative rounded-3xl overflow-hidden cursor-pointer group bg-[#0a0a0a] border border-[#e06c88]/20 hover:border-[#e06c88]/60 transition-all duration-300 shadow-[0_0_30px_rgba(224,108,136,0.05)] hover:shadow-[0_0_40px_rgba(224,108,136,0.15)]"
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1a050a] to-transparent opacity-80" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e06c88]/10 via-transparent to-transparent opacity-60" />
            
            <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right" dir="rtl">
              <div className="flex-1">
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#e06c88]/10 border border-[#e06c88]/30 text-[#e06c88] text-xs font-bold tracking-wider mb-4">
                  خدمة جديدة حصرية
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                  اوصل <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#e06c88] to-[#ff477e]">دفجن 1</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto md:mx-0 leading-relaxed">
                  احجز خدمتك الآن. قم برفع صورة تشكيلتك وحدد الريت الذي ترغب في الوصول إليه في أسرع وقت.
                </p>
              </div>
              
              <div className="shrink-0 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#e06c88] to-[#ff477e] rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#111] to-[#222] border-2 border-[#e06c88] flex items-center justify-center shadow-2xl">
                  <span className="text-[#e06c88] font-black text-2xl md:text-3xl rotate-12 drop-shadow-[0_0_15px_rgba(224,108,136,0.8)]">
                    DIV 1
                  </span>
                </div>
              </div>
            </div>
            
            {/* Bottom accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e06c88] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
