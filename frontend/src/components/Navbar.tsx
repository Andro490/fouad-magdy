import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="w-full min-h-[5rem] py-3 glass-panel border-b border-white/10 fixed top-0 z-50 flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-10 gap-2 md:gap-0 bg-dark/40 backdrop-blur-xl">
      <Link to="/" className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary mx-auto md:mx-0">
        Stream<span className="text-white">Hub</span>
      </Link>
      
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 w-full md:w-auto text-sm md:text-base font-semibold" style={{ direction: 'rtl' }}>
        <Link to="/" className="text-gray-300 hover:text-accent transition-colors">الرئيسية</Link>
        <Link to="/products" className="text-gray-300 hover:text-accent transition-colors">المدربين والخطط</Link>
        <Link to="/store" className="text-gray-300 hover:text-accent transition-colors">سوق الحسابات</Link>
        <Link to="/leaderboard" className="text-gray-300 hover:text-accent transition-colors">لوحة صناع المحتوى</Link>
        
        {isAuthenticated ? (
          <>
            {user?.role === 'ADMIN' ? (
              <Link to="/admin" className="text-primary hover:text-white transition-colors">لوحة الإدارة</Link>
            ) : (
              <Link to="/dashboard" className="text-primary hover:text-white transition-colors">لوحة التحكم</Link>
            )}
            <Link to="/dashboard" className="text-accent font-bold px-4 border-r border-white/20 hover:text-white transition-colors">أهلاً، {user?.name}</Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-500 transition-colors">تسجيل الخروج</button>
          </>
        ) : (
          <Link to="/login" className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            تسجيل الدخول
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
