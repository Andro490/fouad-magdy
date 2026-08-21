import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/siteConfig';

export default function Footer() {
  return (
    <footer className="relative bg-[#030510] border-t border-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="text-center md:text-right">
            <div className="text-2xl font-black text-white">{siteConfig.name.split(' ')[0]} <span className="text-blue-500">{siteConfig.shortName}</span></div>
            <p className="text-gray-500 text-xs mt-1 font-medium">Gaming • Football • Community</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400">
            {siteConfig.footerLinks.map(({ label, path }) => (
              <Link key={label} to={path} className="hover:text-blue-400 transition-colors">{label}</Link>
            ))}
          </div>
          <div className="flex gap-3">
            {siteConfig.socials.map(s => (
              <motion.a 
                whileHover={{ y: -5 }}
                key={s.label} href={s.url} target="_blank" rel="noreferrer"
                className={`w-10 h-10 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center justify-center text-gray-500 shadow-sm ${s.color} hover:border-gray-600 hover:shadow-md transition-all duration-300`}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-900 pt-8 text-center">
          <p className="text-gray-600 text-xs font-medium">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
