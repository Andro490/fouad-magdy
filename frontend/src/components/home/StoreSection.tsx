import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionTitle, staggerContainer, itemUp } from './Shared';
import type { StoreProduct } from '../../pages/Store';

export default function StoreSection() {
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setProducts(list.filter((p: StoreProduct) => !p.isSoldOut).slice(0, 4));
      })
      .catch(() => {
        const stored = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        setProducts(stored.filter((p: StoreProduct) => !p.isSoldOut).slice(0, 4));
      });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24 px-4 bg-black md:bg-gray-950/50 border-t border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <SectionTitle en="PREMIUM STORE" ar="STORE" accent="STORE" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 text-sm -mt-8 mb-10 max-w-xl mx-auto"
        >
          Discover our store products and services and enjoy a different eFootball experience.
        </motion.p>

        {/* Grid — 2 cols on mobile, 4 on desktop */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
        >
          {products.map(p => {
            const imgSrc = p.images?.[0] || p.image || '';
            // Sanitize name — if it looks like a URL, fall back to a default
            const productName =
              p.name && !p.name.startsWith('http') ? p.name : 'eFootball Account';
            const productDesc =
              p.description && !p.description.startsWith('http')
                ? p.description
                : 'Premium eFootball account';

            return (
              <motion.div
                variants={itemUp}
                key={p.id}
                className="group relative rounded-2xl overflow-hidden bg-[#111] border border-white/8 hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(83,252,24,0.12)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative overflow-hidden bg-gray-950" style={{ aspectRatio: '4/3' }}>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">⚽</div>
                  )}
                  {/* Gradient overlay on image */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#111] to-transparent" />
                </div>

                {/* Info */}
                <div className="p-3 md:p-5">
                  <h3 className="font-bold text-white text-xs md:text-base mb-1 truncate group-hover:text-green-300 transition-colors">
                    {productName}
                  </h3>
                  <p className="text-gray-500 text-[10px] md:text-xs mb-3 line-clamp-2 hidden md:block">
                    {productDesc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#53fc18] font-black text-sm md:text-lg">
                      {p.price} <span className="text-[10px] text-gray-400 font-normal">EGP</span>
                    </span>
                    <Link
                      to="/store"
                      className="text-[10px] md:text-xs font-bold px-2 md:px-4 py-1.5 md:py-2 rounded-lg bg-[#53fc18]/10 text-[#53fc18] hover:bg-[#53fc18] hover:text-black transition-all duration-200"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 md:mt-12"
        >
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-gray-200 text-gray-900 font-bold shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all duration-300"
          >
            → View all products
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
