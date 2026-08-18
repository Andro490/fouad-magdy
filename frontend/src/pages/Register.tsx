import { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register submitted', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 relative px-4">
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="glass-panel p-10 rounded-2xl w-full max-w-md z-10">
        <h2 className="text-4xl font-bold mb-6 text-center text-gradient">إنشاء حساب</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="أدخل بريدك الإلكتروني"
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
