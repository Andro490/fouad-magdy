import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Phone, MessageCircle, ShoppingCart } from 'lucide-react';
import type { StoreProduct } from './Store';

interface SellerProfileData {
  id: string;
  name: string;
  phone?: string;
  location?: string;
  screenshots?: string[];
  products: StoreProduct[];
}

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<SellerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/users/${id}/profile`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'حدث خطأ في جلب بيانات البائع');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-xl text-gray-400">جاري تحميل الملف الشخصي للبائع...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-28 px-4 flex flex-col items-center">
        <div className="text-center p-10 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-2xl font-bold text-red-500 mb-4">{error || 'لم يتم العثور على البائع'}</p>
          <Link to="/store" className="text-primary hover:underline">العودة للمتجر</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative" dir="rtl">
      {/* Background elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] translate-x-1/2"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Profile Header */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-dark flex items-center justify-center border-4 border-primary/30 shadow-[0_0_30px_rgba(255,215,0,0.2)] shrink-0 overflow-hidden">
            <span className="text-5xl">👤</span>
          </div>
          
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-4xl font-bold text-white mb-2">{profile.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 mt-4">
              {profile.location && (
                <div className="flex items-center gap-2 bg-dark/40 px-4 py-2 rounded-lg">
                  <MapPin size={18} className="text-primary" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 bg-dark/40 px-4 py-2 rounded-lg">
                  <Phone size={18} className="text-accent" />
                  <span dir="ltr">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {profile.phone && (
            <a 
              href={`https://t.me/${profile.phone.replace(/[^\d+]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <MessageCircle size={20} />
              تواصل تيليجرام
            </a>
          )}
        </div>

        {/* Screenshots Gallery */}
        {profile.screenshots && profile.screenshots.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">صور الثقة وشهادات العملاء</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.screenshots.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block relative group rounded-xl overflow-hidden border border-gray-700 h-48 md:h-64 shadow-lg">
                  <img src={url} alt={`Screenshot ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold bg-primary/80 px-4 py-2 rounded-lg backdrop-blur-sm">عرض الصورة</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Seller's Products */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">منتجات البائع</h2>
          {profile.products.length === 0 ? (
            <div className="text-center py-10 bg-dark/40 rounded-2xl text-gray-400">
              لا توجد منتجات متاحة حالياً لهذا البائع.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profile.products.map(product => (
                <div key={product.id} className="glass-panel rounded-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-dark-lighter to-dark relative border-b border-gray-800">
                    <img src={product.image || product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col relative">
                    <h3 className={`text-xl font-bold mb-2 ${product.isSoldOut ? 'text-gray-500 line-through' : 'text-white'}`}>{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">{product.description}</p>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-300">السعر:</span>
                      {product.isSoldOut ? (
                        <span className="text-gray-500 font-bold text-xl"><del>{product.price} EGP</del></span>
                      ) : (
                        <span className="text-accent font-bold text-xl">{product.price} EGP</span>
                      )}
                    </div>
                    {product.isSoldOut ? (
                      <button disabled className="w-full py-3 bg-red-500/20 text-red-500 font-bold rounded-lg border border-red-500/30 cursor-not-allowed">
                        تم البيع
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate('/checkout', { state: { product } })}
                        className="w-full py-3 bg-primary text-dark font-bold rounded-lg hover:bg-accent hover:text-white transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} /> شراء الآن
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
