import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import type { StoreProduct } from './Store';

const Admin = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/');
    }
    const storedProducts = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    setProducts(storedProducts);
  }, [isAuthenticated, user, navigate]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: StoreProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: Number(price),
      image
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('storeProducts', JSON.stringify(updatedProducts));
    
    setName('');
    setDescription('');
    setPrice('');
    setImage('');
    alert('تم إضافة المنتج بنجاح');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('storeProducts', JSON.stringify(updatedProducts));
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-gradient mb-10 text-center">لوحة تحكم الإدارة</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* إضافة منتج */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 h-fit">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">إضافة منتج جديد</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">اسم المنتج</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الوصف</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none h-24" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">السعر</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} required
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">رابط الصورة (URL)</label>
                <input type="url" value={image} onChange={e => setImage(e.target.value)} required
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none text-left" dir="ltr" />
              </div>
              <button type="submit" className="w-full py-3 bg-accent text-dark font-bold rounded-lg hover:bg-primary transition-colors mt-4 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                إضافة للمتجر
              </button>
            </form>
          </div>

          {/* قائمة المنتجات */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-white">المنتجات الحالية</h2>
            {products.length === 0 ? (
              <p className="text-gray-400">لا توجد منتجات مضافة.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="pb-3 px-2">الصورة</th>
                      <th className="pb-3 px-2">الاسم</th>
                      <th className="pb-3 px-2">السعر</th>
                      <th className="pb-3 px-2 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border border-gray-600" />
                        </td>
                        <td className="py-3 px-2 font-semibold text-white">{product.name}</td>
                        <td className="py-3 px-2 text-accent font-bold">{product.price} EGP</td>
                        <td className="py-3 px-2 text-center">
                          <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-400 font-semibold px-3 py-1 bg-red-500/10 rounded transition-colors">
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
