import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full min-h-[5rem] py-3 bg-[#030510]/80 backdrop-blur-md border-b border-gray-900 fixed top-0 z-50 flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-10 gap-4 md:gap-0 shadow-sm"
    >
      <Link to="/" className="text-2xl md:text-3xl font-black text-white mx-auto md:mx-0">
        FOUAD<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">F9</span>
      </Link>
      
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 w-full md:w-auto text-sm md:text-base font-bold text-gray-400" style={{ direction: 'rtl' }}>
        <Link to="/" className="hover:text-blue-400 transition-colors">الرئيسية</Link>
        <Link to="/products" className="hover:text-blue-400 transition-colors">المدربين والخطط</Link>
        <Link to="/store" className="hover:text-blue-400 transition-colors">سوق الحسابات</Link>
        <Link to="/leaderboard" className="hover:text-blue-400 transition-colors">لوحة صناع المحتوى</Link>
        
        {isAuthenticated ? (
          <>
            {user?.role === 'ADMIN' ? (
              <Link to="/admin" className="text-green-400 hover:text-green-300 transition-colors">لوحة الإدارة</Link>
            ) : (
              <Link to="/dashboard" className="text-green-400 hover:text-green-300 transition-colors">لوحة التحكم</Link>
            )}
            <Link to="/dashboard" className="text-white px-4 border-r border-gray-700 hover:text-green-400 transition-colors">أهلاً، {user?.name}</Link>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors">تسجيل الخروج</button>
          </>
        ) : (
          <Link to="/login" className="px-6 py-2 bg-white hover:bg-gray-200 rounded-lg text-gray-900 transition-all shadow-sm hover:shadow-md">
            تسجيل الدخول
          </Link>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
