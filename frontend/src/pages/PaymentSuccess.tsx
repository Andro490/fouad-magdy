import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const managerId = searchParams.get('managerId');

  const [status, setStatus] = useState<'loading' | 'verified' | 'failed'>('loading');
  const [coachVideo, setCoachVideo] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // لو مفيش session_id في الرابط → مدفعش
    if (!sessionId) {
      setStatus('failed');
      return;
    }

    const verifyPayment = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/checkout/verify?session_id=${sessionId}`);
        const data = await res.json();
        if (data.paid) {
          setStatus('verified');
          if (managerId) {
            // Fetch coach video
            fetch(`${API_URL}/api/coach-videos`)
              .then(r => r.json())
              .then(cvData => {
                if (Array.isArray(cvData)) {
                  const mVideo = cvData.find((d: any) => String(d.managerId) === String(managerId));
                  if (mVideo) setCoachVideo(mVideo);
                }
              }).catch(() => {
                const localData = JSON.parse(localStorage.getItem('coachVideosData') || '[]');
                const mVideo = localData.find((d: any) => String(d.managerId) === String(managerId));
                if (mVideo) setCoachVideo(mVideo);
              });
          }
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [sessionId]);

  // ─── حالة التحميل ───
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center flex-col gap-4 text-white">
        <Loader2 size={56} className="animate-spin text-green-400" />
        <p className="text-xl font-bold text-gray-300">جاري التحقق من الدفع...</p>
      </div>
    );
  }

  // ─── فشل التحقق ───
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-6 text-white px-4" style={{ direction: 'rtl' }}>
        <XCircle size={72} className="text-red-400" />
        <h1 className="text-3xl font-black text-white text-center">لم يتم التحقق من الدفع</h1>
        <p className="text-gray-400 text-center max-w-md">
          لا يمكن الوصول لهذه الصفحة بدون إتمام عملية الدفع أولاً. يرجى العودة وإتمام الشراء.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-8 py-4 bg-gradient-to-l from-[#e06c88] to-[#ff477e] text-white font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(224,108,136,0.4)] hover:-translate-y-1 duration-300"
        >
          العودة للمدربين
        </button>
      </div>
    );
  }

  // ─── دفع ناجح ✅ ───
  const images = coachVideo?.images?.length ? coachVideo.images.map((src: string, idx: number) => ({
    src,
    caption: `تفاصيل التكتيك ${idx + 1}`
  })) : [
    {
      src: 'https://efimg.com/efootballhub22/images/coach_cards/17609097478250.png',
      caption: 'أسلوب الضغط العالي',
    },
    {
      src: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80',
      caption: 'التنظيم التكتيكي',
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white pb-20 pt-20" style={{ direction: 'rtl' }}>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a2a1f] to-[#0f1117] py-14 px-4 text-center mb-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-green-500 blur-[160px] opacity-10"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <CheckCircle size={64} className="text-green-400 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-black text-white">
            تم الدفع بنجاح! 🎉
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            يسعدنا انضمامك! الآن لديك وصول كامل لأسرار الخطة. شاهد الشرح التفصيلي أدناه.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">

        {/* Video Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-white mb-5 flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-gradient-to-b from-green-400 to-teal-500 inline-block"></span>
            شرح الخطة الكاملة
          </h2>
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-[#2a4a35] shadow-[0_0_40px_rgba(0,200,130,0.1)]"
            style={{ paddingTop: '56.25%' }}
          >
            {coachVideo?.libraryId && coachVideo?.videoId ? (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://iframe.mediadelivery.net/embed/${coachVideo.libraryId}/${coachVideo.videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
                loading="lazy"
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                allowFullScreen={true}
              ></iframe>
            ) : (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/CWA--IPC_JI"
                title="شرح خطة المدرب"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>

        {/* Images Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-white mb-5 flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-gradient-to-b from-[#e06c88] to-[#ff477e] inline-block"></span>
            تفاصيل التكتيك
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-[#1a1e2e] hover:border-[#e06c88]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(224,108,136,0.15)]"
              >
                <div className="overflow-hidden h-52">
                  <img
                    src={img.src}
                    alt={img.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${idx + 10}/600/400`;
                    }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-white font-bold text-base">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/products')}
            className="px-10 py-4 bg-gradient-to-l from-[#e06c88] to-[#ff477e] text-white font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(224,108,136,0.4)] hover:shadow-[0_0_35px_rgba(224,108,136,0.7)] hover:-translate-y-1 duration-300"
          >
            العودة للمدربين
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
