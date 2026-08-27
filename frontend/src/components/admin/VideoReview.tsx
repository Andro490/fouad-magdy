import React, { useState, useEffect } from 'react';

const VideoReview = () => {
  const [videoSubmissions, setVideoSubmissions] = useState<any[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/videos`)
      .then(r => r.json())
      .then(data => {
        let fetched = Array.isArray(data) ? data : [];
        if (fetched.length === 0) {
          fetched = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
        }
        setVideoSubmissions(fetched);
      })
      .catch(() => {
        const storedVideos = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
        setVideoSubmissions(storedVideos);
      });
  }, [API_URL]);

  const handleApproveVideo = async (id: string) => {
    let earnedCoins = 0;
    let streamerId = '';

    const updatedSubmissions = videoSubmissions.map(sub => {
      if (sub.id === id && sub.status === 'PENDING') {
        earnedCoins = sub.earnedCoins;
        streamerId = sub.streamerId;
        return { ...sub, status: 'APPROVED' };
      }
      return sub;
    });

    setVideoSubmissions(updatedSubmissions);
    
    try {
      await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSubmissions)
      });
    } catch (err) {
      localStorage.setItem('videoSubmissions', JSON.stringify(updatedSubmissions));
    }

    if (earnedCoins > 0 && streamerId) {
      try {
        const res = await fetch(`${API_URL}/api/users`);
        if (res.ok) {
          let users = await res.json();
          if (users.length === 0) {
            users = JSON.parse(localStorage.getItem('users') || '[]');
          }
          const userIndex = users.findIndex((u: any) => u.id === streamerId);
          if (userIndex !== -1) {
            users[userIndex].coins = (users[userIndex].coins || 0) + earnedCoins;
            await fetch(`${API_URL}/api/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(users)
            }).catch(() => localStorage.setItem('users', JSON.stringify(users)));
          }
        } else {
          throw new Error('Fallback to local');
        }
      } catch (err) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === streamerId);
        if (userIndex !== -1) {
          users[userIndex].coins = (users[userIndex].coins || 0) + earnedCoins;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
    }
    
    alert('تم الموافقة على التقرير وإضافة الكوينز للستريمر!');
  };

  const handleRejectVideo = async (id: string) => {
    const updatedSubmissions = videoSubmissions.map(sub => {
      if (sub.id === id && sub.status === 'PENDING') {
        return { ...sub, status: 'REJECTED' };
      }
      return sub;
    });

    setVideoSubmissions(updatedSubmissions);
    
    try {
      await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSubmissions)
      });
    } catch (err) {
      localStorage.setItem('videoSubmissions', JSON.stringify(updatedSubmissions));
    }

    alert('تم رفض التقرير!');
  };

  return (
    <div className="glass-panel p-6 rounded-2xl w-full">
      <h2 className="text-2xl font-bold mb-6 text-white">تقارير فيديوهات الستريمرز</h2>
      {videoSubmissions.length === 0 ? (
        <p className="text-gray-400">لا توجد تقارير جديدة.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="pb-3 px-2">اسم الستريمر</th>
                <th className="pb-3 px-2">رابط الفيديو</th>
                <th className="pb-3 px-2 text-center">المشاهدات</th>
                <th className="pb-3 px-2 text-center">الإعجابات</th>
                <th className="pb-3 px-2 text-center">الكوينز</th>
                <th className="pb-3 px-2 text-center">الحالة / الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {videoSubmissions.map(sub => (
                <tr key={sub.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-2 font-bold text-white">{sub.streamerName}</td>
                  <td className="py-4 px-2">
                    <a href={sub.videoLink} target="_blank" rel="noreferrer" className="text-accent hover:underline block max-w-[200px] truncate" dir="ltr">
                      {sub.videoLink}
                    </a>
                  </td>
                  <td className="py-4 px-2 text-center">{sub.views.toLocaleString()}</td>
                  <td className="py-4 px-2 text-center">{sub.likes.toLocaleString()}</td>
                  <td className="py-4 px-2 text-center text-accent font-bold">+{sub.earnedCoins}</td>
                  <td className="py-4 px-2 text-center">
                    {sub.status === 'APPROVED' ? (
                      <span className="text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded">تمت الموافقة</span>
                    ) : sub.status === 'REJECTED' ? (
                      <span className="text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded">مرفوض</span>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleApproveVideo(sub.id)}
                          className="bg-primary text-dark font-bold px-4 py-1 rounded hover:bg-primary/90 transition-colors"
                        >
                          موافقة
                        </button>
                        <button 
                          onClick={() => handleRejectVideo(sub.id)}
                          className="bg-red-500 text-white font-bold px-4 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          رفض
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VideoReview;
