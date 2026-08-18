import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';

const Register = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to local storage for mocked auth
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newUser = { id: Date.now().toString(), name, phone, password, role: 'USER' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login
    dispatch(loginSuccess({ user: { id: newUser.id, name: newUser.name, phone: newUser.phone, role: newUser.role }, token: 'mock-jwt-token' }));
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 relative px-4">
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="glass-panel p-10 rounded-2xl w-full max-w-md z-10">
        <h2 className="text-4xl font-bold mb-6 text-center text-gradient">إنشاء حساب</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الاسم</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="أدخل اسمك"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">رقم الهاتف</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
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
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-accent text-dark font-bold rounded-lg px-4 py-3 hover:bg-primary transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]"
          >
            إنشاء الحساب
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          لديك حساب بالفعل؟ <Link to="/login" className="text-accent hover:text-primary transition-colors">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
