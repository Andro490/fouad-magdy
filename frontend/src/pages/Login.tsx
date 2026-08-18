import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Mock authentication
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if it's admin (mocked admin logic)
    if (phone === 'admin' && password === 'admin') {
      dispatch(loginSuccess({ user: { id: 'admin', name: 'المدير', phone: 'admin', role: 'ADMIN' }, token: 'mock-admin-token' }));
      navigate('/admin');
      return;
    }

    const foundUser = users.find((u: any) => u.phone === phone && u.password === password);
    
    if (foundUser) {
      dispatch(loginSuccess({ user: { id: foundUser.id, name: foundUser.name, phone: foundUser.phone, role: foundUser.role }, token: 'mock-jwt-token' }));
      navigate('/');
    } else {
      setError('رقم الهاتف أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 relative px-4">
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="glass-panel p-10 rounded-2xl w-full max-w-md z-10">
        <h2 className="text-4xl font-bold mb-6 text-center text-gradient">تسجيل الدخول</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">رقم الهاتف</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="أدخل رقم هاتفك"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary text-dark font-bold rounded-lg px-4 py-3 hover:bg-accent hover:text-white transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
          >
            دخول
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          ليس لديك حساب؟ <Link to="/register" className="text-primary hover:text-accent transition-colors">إنشاء حساب جديد</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
