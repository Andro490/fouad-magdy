import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';

import StoreManagement from '../components/admin/StoreManagement';
import VideoReview from '../components/admin/VideoReview';
import AddCoaches from '../components/admin/AddCoaches';
import CoachVideos from '../components/admin/CoachVideos';
import SupportChatAdmin from '../components/admin/SupportChatAdmin';

const Admin = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'videos' | 'coaches' | 'support' | 'coachVideos'>('products');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-gradient mb-10 text-center">لوحة تحكم الإدارة</h1>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('products')} 
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
          >
            إدارة المتجر
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
        </div>
        
        <div className="mt-8">
          {activeTab === 'products' && <StoreManagement />}
          {activeTab === 'videos' && <VideoReview />}
          {activeTab === 'coaches' && <AddCoaches />}
          {activeTab === 'coachVideos' && <CoachVideos />}
          {activeTab === 'support' && <SupportChatAdmin />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
