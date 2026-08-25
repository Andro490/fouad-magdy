import React, { useState, useEffect } from 'react';

const CoachVideos = () => {
  const [coachManagers, setCoachManagers] = useState<any[]>([]);
  const [cvSelectedManager, setCvSelectedManager] = useState('');
  const [cvFreeUrl, setCvFreeUrl] = useState('');
  const [cvLibraryId, setCvLibraryId] = useState('');
  const [cvTokenKey, setCvTokenKey] = useState('');
  const [cvVideoId, setCvVideoId] = useState('');
  const [cvImagesInput, setCvImagesInput] = useState('');
  const [cvIsUploading, setCvIsUploading] = useState(false);
  const [cvIsSaving, setCvIsSaving] = useState(false);
  const [cvSavedData, setCvSavedData] = useState<any[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/managers`)
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data.coaches) ? data.coaches : Array.isArray(data) ? data : [];
        setCoachManagers(arr);
      })
      .catch(() => {});
      
    fetch(`${API_URL}/api/coach-videos`)
      .then(r => r.json())
      .then(data => {
        const fetched = Array.isArray(data) ? data : [];
        setCvSavedData(fetched);
        if (fetched.length > 0) {
          localStorage.setItem('coachVideosData', JSON.stringify(fetched));
        }
      })
      .catch(() => {
        const savedCv = JSON.parse(localStorage.getItem('coachVideosData') || '[]');
        setCvSavedData(savedCv);
      });
  }, [API_URL]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ═══ Form - Right ═══ */}
      <div className="glass-panel p-6 rounded-2xl h-fit">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">إضافة / تعديل فيديو مدرب</h2>

        {/* Select Manager */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-300 mb-2">اختر المدرب</label>
          <select
            value={cvSelectedManager}
            onChange={e => {
              setCvSelectedManager(e.target.value);
              const existing = cvSavedData.find((d: any) => d.managerId === e.target.value);
              if (existing) {
                setCvFreeUrl(existing.freeUrl || '');
                setCvLibraryId(existing.libraryId || '');
                setCvTokenKey(existing.tokenKey || '');
                setCvVideoId(existing.videoId || '');
                setCvImagesInput((existing.images || []).join('\n'));
              } else {
                setCvFreeUrl(''); setCvLibraryId(''); setCvTokenKey(''); setCvVideoId(''); setCvImagesInput('');
              }
            }}
            className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
          >
            <option value="">-- اختر مدرباً --</option>
            {coachManagers.map((m: any) => (
              <option key={m.id || m.managerId} value={String(m.id || m.managerId)}>
                {m.name || m.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Free Video URL */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-300 mb-1">🎬 فيديو مجاني (YouTube / TikTok)</label>
          <p className="text-xs text-gray-500 mb-2">يظهر قبل الدفع للجميع</p>
          <input
            type="url" value={cvFreeUrl} onChange={e => setCvFreeUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
            dir="ltr"
          />
        </div>

        {/* Bunny.net Paid Video */}
        <div className="mb-4 bg-[#1a1e2e] rounded-xl p-4 border border-gray-700">
          <label className="block text-sm font-bold text-[#00c9a7] mb-3">🐰 فيديو مدفوع (Bunny.net)</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Library ID</label>
              <input
                type="text" value={cvLibraryId} onChange={e => setCvLibraryId(e.target.value)}
                placeholder="123456"
                className="w-full bg-dark/60 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00c9a7] focus:outline-none text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Token Key (API Key)</label>
              <input
                type="password" value={cvTokenKey} onChange={e => setCvTokenKey(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-dark/60 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00c9a7] focus:outline-none text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Video ID</label>
              <input
                type="text" value={cvVideoId} onChange={e => setCvVideoId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-dark/60 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00c9a7] focus:outline-none text-sm"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-300 mb-1">🖼️ صور تفاصيل التكتيك</label>
          <div className="mb-2">
            <label className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-bold ${cvIsUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-dark-lighter border border-gray-600 text-white hover:bg-white/10'}`}>
              {cvIsUploading ? 'جاري الرفع...' : 'رفع صور من الجهاز 📷'}
              <input
                type="file" multiple accept="image/*" className="hidden" disabled={cvIsUploading}
                onChange={async (e) => {
                  if (!e.target.files || !e.target.files.length) return;
                  setCvIsUploading(true);
                  const files = Array.from(e.target.files);
                  const UPLOAD_URL = window.location.hostname === 'localhost'
                    ? `${API_URL}/api/upload` : '/api/upload';
                  const uploaded: string[] = [];
                  for (const file of files) {
                    const base64 = await new Promise<string>((res, rej) => {
                      const r = new FileReader();
                      r.readAsDataURL(file);
                      r.onload = () => res((r.result as string).split(',')[1]);
                      r.onerror = rej;
                    });
                    const resp = await fetch(UPLOAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) });
                    const d = await resp.json();
                    if (d.success) uploaded.push(d.url);
                  }
                  if (uploaded.length) {
                    setCvImagesInput(prev => prev.trim() ? `${prev.trim()}\n${uploaded.join('\n')}` : uploaded.join('\n'));
                    alert(`تم رفع ${uploaded.length} صور بنجاح!`);
                  }
                  setCvIsUploading(false);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          <textarea
            value={cvImagesInput} onChange={e => setCvImagesInput(e.target.value)}
            placeholder="https://... (رابط في كل سطر)"
            className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none h-24 text-sm"
            dir="ltr"
          />
        </div>

        <button
          disabled={!cvSelectedManager || cvIsSaving}
          onClick={async () => {
            if (!cvSelectedManager) return alert('اختر مدرباً أولاً');
            setCvIsSaving(true);
            const images = cvImagesInput.split('\n').map(s => s.trim()).filter(Boolean);
            const entry = {
              managerId: cvSelectedManager,
              freeUrl: cvFreeUrl,
              libraryId: cvLibraryId,
              tokenKey: cvTokenKey,
              videoId: cvVideoId,
              images,
              updatedAt: new Date().toISOString()
            };
            const existing = cvSavedData.filter((d: any) => d.managerId !== cvSelectedManager);
            const updated = [entry, ...existing];
            localStorage.setItem('coachVideosData', JSON.stringify(updated));
            setCvSavedData(updated);
            try {
              await fetch(`${API_URL}/api/coach-videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
              });
            } catch (e) {}
            setCvIsSaving(false);
            alert('تم الحفظ بنجاح! ✅');
          }}
          className="w-full py-3 bg-accent text-dark font-black rounded-lg hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
        >
          {cvIsSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}
        </button>
      </div>

      {/* ═══ Preview - Left ═══ */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">معاينة</h2>

        {/* Selected manager info */}
        <div className="mb-5 p-4 bg-[#1a1e2e] rounded-xl border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">المدرب المختار</p>
          <p className="text-white font-bold text-lg">
            {cvSelectedManager
              ? (coachManagers.find((m: any) => String(m.id || m.managerId) === cvSelectedManager)?.name || '—')
              : 'لم يتم الاختيار بعد'}
          </p>
        </div>

        {/* Free Video Preview */}
        {cvFreeUrl && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-2 font-bold">📺 معاينة الفيديو المجاني</p>
            <div className="relative w-full rounded-xl overflow-hidden border border-gray-700" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={cvFreeUrl.includes('youtu') ? `https://www.youtube.com/embed/${cvFreeUrl.split('v=')[1]?.split('&')[0] || cvFreeUrl.split('/').pop()?.split('?')[0]}` : cvFreeUrl}
                title="Free Video Preview" frameBorder="0" allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Bunny Video Info */}
        {(cvLibraryId || cvVideoId) && (
          <div className="mb-5 p-4 bg-[#0f1f17] rounded-xl border border-[#00c9a7]/30">
            <p className="text-xs text-[#00c9a7] mb-2 font-bold">🐰 بيانات Bunny.net</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">Library ID: <span className="text-white font-mono" dir="ltr">{cvLibraryId || '—'}</span></p>
              <p className="text-gray-300">Video ID: <span className="text-white font-mono text-xs" dir="ltr">{cvVideoId || '—'}</span></p>
              {cvLibraryId && cvVideoId && (
                <p className="text-gray-300 text-xs">Embed URL: <span className="text-[#00c9a7] font-mono text-xs" dir="ltr">{`https://iframe.mediadelivery.net/embed/${cvLibraryId}/${cvVideoId}`}</span></p>
              )}
            </div>
          </div>
        )}

        {/* Images Preview */}
        {cvImagesInput.trim() && (
          <div>
            <p className="text-xs text-gray-400 mb-2 font-bold">🖼️ معاينة الصور ({cvImagesInput.split('\n').filter(Boolean).length})</p>
            <div className="grid grid-cols-2 gap-3">
              {cvImagesInput.split('\n').filter(Boolean).map((url, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-gray-700 h-28">
                  <img
                    src={url.trim()}
                    alt={`image-${i}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i}/300/200`; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved entries */}
        {cvSavedData.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-400 font-bold mb-2">📋 المحفوظات ({cvSavedData.length})</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cvSavedData.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-dark/50 rounded-lg border border-gray-800 text-sm">
                  <span className="text-white font-bold">
                    {coachManagers.find((m: any) => String(m.id || m.managerId) === d.managerId)?.name || d.managerId}
                  </span>
                  <span className="text-gray-500 text-xs">{d.images?.length || 0} صور</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachVideos;
