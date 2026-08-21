import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionTitle, staggerContainer, itemUp } from './Shared';
import type { StoreProduct } from '../../pages/Store';

export default function StoreSection() {
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    setProducts(stored.filter((p: StoreProduct) => !p.isSoldOut).slice(0, 4));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="relative py-24 px-4 bg-gray-950/50 border-t border-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <SectionTitle en="PREMIUM STORE" ar="STORE" accent="STORE" />
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 text-sm -mt-8 mb-12 max-w-xl mx-auto"
        >
          Discover our store products and services and enjoy a different eFootball experience.
        </motion.p>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map(p => (
            <motion.div variants={itemUp} key={p.id}
              className="group relative rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800 shadow-sm hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all duration-400 hover:-translate-y-2">
              <div className="relative h-48 overflow-hidden bg-gray-950">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                ) : p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">⚽</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-base mb-2 truncate group-hover:text-green-300 transition-colors">{p.name}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 font-black text-lg">{p.price} EGP</span>
                  <Link to="/store" className="text-xs font-bold px-4 py-2 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors">View</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link to="/store" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-gray-200 text-[#030510] font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:-translate-y-1 transition-all duration-300">
            View all products →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
