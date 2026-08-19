import React from 'react';

const Dashboard = () => {
  return (
    <div className="flex-1 flex flex-col items-center pt-24 pb-12 px-4 relative min-h-screen bg-dark text-white" dir="rtl">
      <div className="z-10 w-full max-w-6xl space-y-8 glass-panel p-8 rounded-3xl">
        <h1 className="text-4xl font-bold text-gradient mb-8">لوحة التحكم</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-lighter border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center">
             <h4 className="text-xl text-gray-400 mb-2">الكورسات المسجلة</h4>
             <span className="text-4xl font-bold text-accent">3</span>
          </div>
          <div className="bg-dark-lighter border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center">
             <h4 className="text-xl text-gray-400 mb-2">الكورسات المكتملة</h4>
             <span className="text-4xl font-bold text-primary">1</span>
          </div>
          <div className="bg-dark-lighter border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center">
             <h4 className="text-xl text-gray-400 mb-2">معدل التقدم</h4>
             <span className="text-4xl font-bold text-purple">75%</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">نشاطاتك الأخيرة</h2>
          <div className="bg-dark-lighter p-6 rounded-2xl border border-white/10">
            <p className="text-gray-300">لقد أكملت مشاهدة الدرس "Hooks" في كورس React 101.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
