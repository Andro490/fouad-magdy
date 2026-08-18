import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full min-h-[5rem] py-3 glass-panel fixed top-0 z-50 flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-10 gap-2 md:gap-0">
      <Link to="/" className="text-xl md:text-2xl font-bold text-gradient mx-auto md:mx-0">eFootball Store</Link>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full md:w-auto text-sm md:text-base font-semibold" style={{ direction: 'rtl' }}>
        <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <Link to="/products" className="hover:text-primary transition-colors">المنتجات</Link>
        <Link to="/login" className="hover:text-primary transition-colors">تسجيل الدخول</Link>
      </div>
    </nav>
  );
};

export default Navbar;
