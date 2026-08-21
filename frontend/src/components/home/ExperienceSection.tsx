import { motion } from 'framer-motion';
import { siteConfig } from '../../config/siteConfig';
import { SectionTitle, staggerContainer, itemUp } from './Shared';

export default function ExperienceSection() {
  return (
    <section className="relative py-24 px-4 bg-[#030510] border-t border-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <SectionTitle en="THE F9 EXPERIENCE" ar="تجربة مميزة" accent="EXPERIENCE" />
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {siteConfig.experiences.map((ex) => (
            <motion.div variants={itemUp} key={ex.num}
              className="group relative p-8 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow-sm hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-500 hover:-translate-y-2 cursor-default">
              <span className="text-5xl font-black text-gray-800/50 group-hover:text-blue-500/10 transition-colors duration-300 absolute top-4 right-4">{ex.num}</span>
              <motion.span whileHover={{ scale: 1.2, rotate: 5 }} className="text-4xl block mb-4 relative z-10 drop-shadow-md origin-center">{ex.icon}</motion.span>
              <h3 className="text-xl font-black text-white mb-3 tracking-wide relative z-10 group-hover:text-blue-300 transition-colors">{ex.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10">{ex.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
