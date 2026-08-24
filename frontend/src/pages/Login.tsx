import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';

declare global {
  interface Window {
    google: any;
  }
}

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleResponse = (response: any) => {
    const data = decodeJwt(response.credential);
    if (data && data.email) {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      let user = users.find((u: any) => u.email === data.email);
      
      if (!user) {
        user = {
          id: 'google_' + Date.now(),
          name: data.name,
          email: data.email,
          phone: '', // Google users might not have a phone number initially
          role: 'USER',
          coins: 0,
          picture: data.picture
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      dispatch(loginSuccess({ user }));
      navigate('/');
    } else {
      setError('فشل تسجيل الدخول عبر جوجل');
    }
  };

  useEffect(() => {
    const renderGoogleBtn = () => {
      if (window.google && document.getElementById("googleSignInDiv")) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mock.apps.googleusercontent.com',
          callback: handleGoogleResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large", text: "continue_with", width: 368, shape: "rectangular" }
        );
      } else {
        setTimeout(renderGoogleBtn, 100);
      }
    };
    renderGoogleBtn();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if it's admin (mocked admin logic, but now gets a real token from backend)
    if (phone === 'admin' && password === 'admin') {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const res = await fetch(`${API_URL}/api/auth/admin-login`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          dispatch(loginSuccess({ user: data.user, token: data.token }));
          navigate('/admin');
          return;
        }
      } catch (err) {
        console.error('Admin login error', err);
      }
      // Fallback if backend is down
      dispatch(loginSuccess({ user: { id: 'admin', name: 'المدير', phone: 'admin', role: 'ADMIN' }, token: 'mock-admin-token' }));
      navigate('/admin');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let users = [];
    try {
      const res = await fetch(`${API_URL}/api/users`, { credentials: 'include' });
      if (res.ok) {
        users = await res.json();
        if (users.length === 0) {
          users = JSON.parse(localStorage.getItem('users') || '[]');
        }
      } else {
        users = JSON.parse(localStorage.getItem('users') || '[]');
      }
    } catch (err) {
      users = JSON.parse(localStorage.getItem('users') || '[]');
    }

    const foundUser = users.find((u: Record<string, any>) => u.phone === phone && u.password === password);
    
    if (foundUser) {
      dispatch(loginSuccess({ user: { id: foundUser.id, name: foundUser.name, phone: foundUser.phone, email: foundUser.email, role: foundUser.role, coins: foundUser.coins || 0 } }));
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
        
        <form onSubmit={handleSubmit} className="space-y-6 mb-6">
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

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative px-4 bg-[#141414] text-sm text-gray-400">أو عبر</div>
        </div>

        <div className="flex justify-center w-full mb-6">
          <div id="googleSignInDiv" className="w-full flex justify-center"></div>
        </div>

        <p className="mt-6 text-center text-gray-400">
          ليس لديك حساب؟ <Link to="/register" className="text-primary hover:text-accent transition-colors">إنشاء حساب جديد</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
