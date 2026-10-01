import React, { useState, useEffect } from 'react';
import { Loader2, Search, Trash2 } from 'lucide-react';

const Division1Admin = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [deliveryDays, setDeliveryDays] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  const calcDaysRemaining = (startDate: string | null, days: number) => {
    if (!startDate || !days) return null;
    const start = new Date(startDate);
    const deadline = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/division1/requests`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openModal = (req: any) => {
    setSelectedRequest(req);
    setTotalPrice(req.totalPrice);
    setPaidAmount(req.paidAmount);
    setDeliveryDays(req.deliveryDays || 0);
  };

  const handleSave = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/division1/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ totalPrice, paidAmount, deliveryDays })
      });
      if (res.ok) {
        alert('تم الحفظ بنجاح');
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert('فشل الحفظ');
      }
    } catch (e) {
      alert('حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening the modal
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/division1/requests/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== id));
      } else {
        alert('فشل الحذف');
      }
    } catch (err) {
      alert('حدث خطأ أثناء الاتصال بالسيرفر');
    }
  };


  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  const filteredRequests = requests.filter(req => 
    req.phone.includes(searchQuery) || req.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-panel p-6 rounded-2xl w-full text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white text-gradient">إدارة طلبات وصول دفجن 1</h2>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none pr-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="text-gray-400">لا توجد طلبات تطابق البحث.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(req => {

            const remaining = req.totalPrice - req.paidAmount;
            return (
              <div 
                key={req.id} 
                className="bg-dark/50 border border-gray-700 rounded-xl p-5 hover:border-primary cursor-pointer transition-all hover:bg-dark/80"
                onClick={() => openModal(req)}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-white text-lg">{req.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, req.id)}
                      className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      req.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 
                      req.status === 'APPROVED' ? 'bg-blue-500/20 text-blue-400' :
                      req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {req.status === 'COMPLETED' ? 'مكتمل' : 
                       req.status === 'APPROVED' ? 'تمت الموافقة' :
                       req.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-1"><span className="text-gray-500">الهاتف:</span> <span dir="ltr">{req.phone}</span></p>
                <p className="text-gray-300 text-sm mb-1"><span className="text-gray-500">الريت الحالي:</span> {req.currentRate}</p>
                <p className="text-gray-300 text-sm mb-4"><span className="text-gray-500">مدة التسليم:</span> {req.deliveryTime}</p>
                
                <div className="flex justify-between items-center bg-black/30 rounded-lg p-3 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500 mb-1">تم دفع</p>
                    <p className="text-green-400 font-bold">{req.paidAmount} ج</p>
                  </div>
                  <div className="w-px h-8 bg-gray-700"></div>
                  <div className="text-center">
                    <p className="text-gray-500 mb-1">متبقي</p>
                    <p className="text-red-400 font-bold">{remaining > 0 ? remaining : 0} ج</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}>
          <div className="bg-dark border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">تفاصيل الطلب: {selectedRequest.name}</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-gray-400 mb-2">صورة الإيصال (عربون)</p>
                <a href={selectedRequest.receiptImage} target="_blank" rel="noreferrer">
                  <img src={selectedRequest.receiptImage} alt="Receipt" className="w-full h-40 object-cover rounded-lg border border-gray-700 hover:border-primary transition-colors" />
                </a>
              </div>
              <div>
                <p className="text-gray-400 mb-2">صورة التشكيلة</p>
                <a href={selectedRequest.squadImage} target="_blank" rel="noreferrer">
                  <img src={selectedRequest.squadImage} alt="Squad" className="w-full h-40 object-cover rounded-lg border border-gray-700 hover:border-primary transition-colors" />
                </a>
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="bg-dark/50 border border-primary/30 px-6 py-3 rounded-xl inline-flex flex-col items-center gap-1">
                <p className="text-gray-400 text-sm">رقم هاتف العميل للتواصل</p>
                <p className="text-white font-bold text-xl select-all" dir="ltr">{selectedRequest.phone}</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-5 mb-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">السعر الإجمالي المطلوب (جنية)</label>
                <input 
                  type="number" 
                  value={totalPrice} 
                  onChange={e => setTotalPrice(Number(e.target.value))}
                  className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">ما تم دفعه حتى الآن (جنية)</label>
                <input 
                  type="number" 
                  value={paidAmount} 
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">عدد أيام التسليم (يبدأ من الموافقة)</label>
                <input 
                  type="number" 
                  value={deliveryDays} 
                  onChange={e => setDeliveryDays(Number(e.target.value))}
                  className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                  placeholder="مثال: 3"
                />
                {deliveryDays > 0 && <p className="text-xs text-gray-500 mt-1">بعد الحفظ سيبدأ العد التنازلي ويُعلَم العميل بفاضل {deliveryDays} أيام</p>}
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-center">
                <span className="text-gray-300">المبلغ المتبقي: </span>
                <span className="text-primary font-bold text-xl">{totalPrice - paidAmount > 0 ? totalPrice - paidAmount : 0} ج.م</span>
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full py-4 bg-primary text-dark font-bold rounded-xl hover:bg-accent transition-colors flex justify-center items-center"
            >
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Division1Admin;
