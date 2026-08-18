import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full h-20 glass-panel fixed top-0 z-50 flex items-center justify-between px-10">
      <Link to="/" className="text-2xl font-bold text-gradient">eFootball Store</Link>
      <div className="flex gap-6">
        <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <Link to="/products" className="hover:text-primary transition-colors">المنتجات</Link>
        <Link to="/login" className="hover:text-primary transition-colors">تسجيل الدخول</Link>
      </div>
    </nav>
  );
};

export default Navbar;
