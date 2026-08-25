import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';

import StoreManagement from '../components/admin/StoreManagement';
import VideoReview from '../components/admin/VideoReview';
import AddCoaches from '../components/admin/AddCoaches';
import CoachVideos from '../components/admin/CoachVideos';
import SupportChatAdmin from '../components/admin/SupportChatAdmin';
import SubAdminsManagement from '../components/admin/SubAdminsManagement';
import SiteSettings from '../components/admin/SiteSettings';
import SellerProfileSettings from '../components/admin/SellerProfileSettings';

const Admin = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'videos' | 'coaches' | 'support' | 'coachVideos' | 'subadmins' | 'settings' | 'sellerProfile'>('products');

  useEffect(() => {
    // Both ADMIN and SELLER can access this page
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SELLER')) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SELLER')) return null;

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-gradient mb-10 text-center">
          {user?.role === 'SELLER' ? 'لوحة تحكم البائع' : 'لوحة تحكم الإدارة'}
        </h1>
        
        {user?.role === 'SELLER' && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={() => setActiveTab('products')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              إدارة منتجاتي
            </button>
            <button 
              onClick={() => setActiveTab('sellerProfile')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'sellerProfile' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              إعدادات حسابي (صور الثقة)
            </button>
          </div>
        )}
        
        {user?.role === 'ADMIN' && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={() => setActiveTab('products')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              إدارة المتجر
            </button>
            <button 
              onClick={() => setActiveTab('subadmins')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'subadmins' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              إدارة الأدمنين (البائعين)
            </button>
            <button 
              onClick={() => setActiveTab('videos')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'videos' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              مراجعة الفيديوهات
            </button>
            <button 
              onClick={() => setActiveTab('coaches')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'coaches' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              إضافة مدربين (JSON)
            </button>
            <button 
              onClick={() => setActiveTab('coachVideos')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'coachVideos' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              فيديوهات المدربين
            </button>
            <button 
              onClick={() => setActiveTab('support')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'support' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              الدعم الفني
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              ⚙️ إعدادات الموقع
            </button>
            <button 
              onClick={() => setActiveTab('sellerProfile')} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'sellerProfile' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
            >
              إعدادات حسابي (صور الثقة)
            </button>
          </div>
        )}
        
        <div className="mt-8">
          {activeTab === 'products' && <StoreManagement />}
          {activeTab === 'sellerProfile' && <SellerProfileSettings />}
          {user?.role === 'ADMIN' && (
            <>
              {activeTab === 'videos' && <VideoReview />}
              {activeTab === 'coaches' && <AddCoaches />}
              {activeTab === 'coachVideos' && <CoachVideos />}
              {activeTab === 'support' && <SupportChatAdmin />}
              {activeTab === 'subadmins' && <SubAdminsManagement />}
              {activeTab === 'settings' && <SiteSettings />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
