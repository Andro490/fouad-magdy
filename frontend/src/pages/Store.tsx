import { useState, useEffect } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isSoldOut?: boolean;
}

const Store = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products from local storage for now
    const storedProducts = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    setProducts(storedProducts);
    setLoading(false);
  }, []);

  const handleBuy = (product: StoreProduct) => {
    if (!isAuthenticated) {
      alert('يرجى تسجيل الدخول أولاً لإتمام عملية الشراء');
      navigate('/login');
      return;
    }
    navigate('/checkout', { state: { product } });
  };

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">المتجر</h1>
          <p className="text-gray-400 text-lg">أفضل العروض والمنتجات الحصرية بانتظارك.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-primary mb-6" size={64} />
            <p className="text-2xl text-gray-400 font-bold">جاري تحميل المنتجات...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 glass-panel rounded-2xl flex flex-col items-center justify-center">
            <ShoppingCart size={48} className="text-gray-600 mb-4" />
            <p className="text-2xl font-bold">لا توجد منتجات حالياً في المتجر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ direction: 'rtl' }}>
            {products.map((product) => (
              <div key={product.id} className="glass-panel rounded-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <div className="h-48 bg-gradient-to-br from-dark-lighter to-dark relative flex items-center justify-center p-4 border-b border-gray-800">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-gray-500">لا توجد صورة</div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col relative">
                  <h3 className={`text-xl font-bold mb-2 ${product.isSoldOut ? 'text-gray-500 line-through' : 'text-white'}`}>{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3 break-words">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-300">السعر:</span>
                    {product.isSoldOut ? (
                      <span className="text-gray-500 font-bold text-xl"><del>{product.price} EGP</del></span>
                    ) : (
                      <span className="text-accent font-bold text-xl">{product.price} EGP</span>
                    )}
                  </div>
                  
                  {product.isSoldOut ? (
                    <button 
                      disabled
                      className="w-full mt-auto py-3 bg-red-500/20 text-red-500 font-bold rounded-lg border border-red-500/30 flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                    >
                      تم البيع
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBuy(product)}
                      className="w-full mt-auto py-3 bg-primary text-dark font-bold rounded-lg hover:bg-accent hover:text-white transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      شراء الآن
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;
