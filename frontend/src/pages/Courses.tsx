import React from 'react';

const Courses = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4 relative min-h-screen bg-dark text-white" dir="rtl">
      <div className="z-10 w-full max-w-6xl space-y-8 glass-panel p-8 rounded-3xl">
        <h1 className="text-4xl font-bold text-center text-gradient mb-8">الكورسات المتاحة</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Example Course Card */}
          <div className="bg-dark-lighter border border-white/10 rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(255,45,155,0.2)] transition-all">
             <div className="h-40 bg-dark rounded-xl mb-4 flex items-center justify-center">
                <span className="text-gray-500">Course Image</span>
             </div>
             <h3 className="text-2xl font-bold mb-2">React 101</h3>
             <p className="text-gray-400 mb-4">كورس متكامل لتعلم أساسيات مكتبة React...</p>
             <button className="w-full py-3 bg-gradient-to-r from-primary to-purple text-white rounded-lg font-bold">اشترك الآن</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
