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
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
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
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    
    // Fetch settings to check if Google Auth is enabled
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        const clientId = data.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        // Only render Google button if a client ID exists and isn't the mock one
        if (clientId && !clientId.includes('mock.apps')) {
          setHasGoogleAuth(true);
          const renderGoogleBtn = () => {
            if (window.google && document.getElementById("googleSignInDiv")) {
              window.google.accounts.id.initialize({
                client_id: clientId,
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
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Try login via backend first for security (so password isn't exposed and hashes are compared properly)
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(loginSuccess({ user: data.user, token: data.token }));
        if (data.user.role === 'ADMIN' || data.user.role === 'SELLER') {
          navigate('/admin');
        } else {
          navigate('/');
        }
        return;
      } else if (res.status === 401) {
        setError('رقم الهاتف أو كلمة المرور غير صحيحة');
        return;
      }
    } catch (err) {
      console.error('Backend login error, falling back to local storage', err);
    }

    // Fallback if backend is down
    if (phone === 'Foadmagdy0152020' && password === 'Foadmagdy0152020') {
      dispatch(loginSuccess({ user: { id: 'admin', name: 'المدير', role: 'ADMIN', email: 'mock@local.user', coins: 0 } }));
      navigate('/admin');
      return;
    }

    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('users') || '[]');
    } catch (err) {
      users = [];
    }

    const foundUser = users.find((u: Record<string, any>) => (u.phone === phone || u.email === phone) && u.password === password);
    
    if (foundUser) {
      dispatch(loginSuccess({ user: { id: foundUser.id, name: foundUser.name, phone: foundUser.phone, email: foundUser.email, role: foundUser.role, coins: foundUser.coins || 0 } }));
      if (foundUser.role === 'ADMIN' || foundUser.role === 'SELLER') {
        navigate('/admin');
      } else {
        navigate('/');
      }
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
            <label className="block text-sm font-medium text-gray-300 mb-2">رقم الهاتف أو اسم المستخدم</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="أدخل رقم الهاتف أو اسم المستخدم"
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

        <div className="relative flex items-center justify-center mb-6 mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative px-4 bg-[#141414] text-sm text-gray-400">أو عبر</div>
        </div>

        {hasGoogleAuth ? (
          <div className="flex justify-center w-full mb-6">
            <div id="googleSignInDiv" className="w-full flex justify-center"></div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setError('تسجيل الدخول عبر جوجل غير مفعّل حالياً. يرجى تسجيل الدخول برقم الهاتف.')}
            className="w-full flex items-center justify-center gap-3 mb-6 py-3 px-4 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 hover:border-gray-500 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-gray-300 font-medium">المتابعة عبر Google</span>
          </button>
        )}

        <p className="mt-6 text-center text-gray-400">
          ليس لديك حساب؟ <Link to="/register" className="text-primary hover:text-accent transition-colors">إنشاء حساب جديد</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
