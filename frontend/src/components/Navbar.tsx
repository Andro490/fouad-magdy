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
    <nav className="w-full min-h-[5rem] py-3 glass-panel fixed top-0 z-50 flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-10 gap-2 md:gap-0">
      <Link to="/" className="text-xl md:text-2xl font-bold text-gradient mx-auto md:mx-0">eFootball Store</Link>
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 w-full md:w-auto text-sm md:text-base font-semibold" style={{ direction: 'rtl' }}>
        <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <Link to="/products" className="hover:text-primary transition-colors">المدربين</Link>
        <Link to="/store" className="hover:text-primary transition-colors">المتجر</Link>
        
        {isAuthenticated ? (
          <>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-accent hover:text-primary transition-colors">لوحة التحكم</Link>
            )}
            <span className="text-primary font-bold px-2 border-r border-gray-600">أهلاً، {user?.name}</span>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-500 transition-colors">تسجيل الخروج</button>
          </>
        ) : (
          <Link to="/login" className="hover:text-primary transition-colors">تسجيل الدخول</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
