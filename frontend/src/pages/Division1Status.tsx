import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const Division1Status = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

  const calcDaysRemaining = (startDate: string | null, deliveryDays: number) => {
    if (!startDate || !deliveryDays) return null;
    const start = new Date(startDate);
    const deadline = new Date(start.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/division1/status?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (err) {
      setOrders([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold"><CheckCircle size={12} /> تمت الموافقة</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold"><XCircle size={12} /> مرفوض</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold"><Clock size={12} /> قيد المراجعة</span>;
    }
  };

  return (
    <div className="min-h-screen pt-28 px-4 pb-20" style={{ direction: 'rtl' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gradient mb-3 text-center">متابعة طلب دفجن 1</h1>
        <p className="text-gray-400 text-center mb-10">أدخل رقم هاتفك لمتابعة حالة طلبك</p>

        <form onSubmit={handleSearch} className="glass-panel p-6 rounded-2xl mb-8 flex gap-3">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="أدخل رقم الهاتف..."
            className="flex-1 bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
            dir="ltr"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-dark font-bold rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            بحث
          </button>
        </form>

        {searched && orders.length === 0 && (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد طلبات مسجلة بهذا الرقم</p>
            <Link to="/division1-checkout" className="mt-4 inline-block text-primary hover:text-accent transition-colors text-sm">
              تقديم طلب جديد →
            </Link>
          </div>
        )}

        {orders.map(order => {
          const daysRemaining = calcDaysRemaining(order.startDate, order.deliveryDays);
          const remaining = order.totalPrice - order.paidAmount;

          return (
            <div key={order.id} className="glass-panel p-6 rounded-2xl mb-6 border border-gray-700">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-white text-lg">{order.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Progress Bar */}
              {order.totalPrice > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">المدفوع</span>
                    <span className="text-gray-400">الإجمالي</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((order.paidAmount / order.totalPrice) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-green-400 font-bold">{order.paidAmount} ج.م</span>
                    <span className="text-white font-bold">{order.totalPrice} ج.م</span>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark/50 rounded-xl p-4 text-center border border-gray-800">
                  <p className="text-gray-500 text-xs mb-2">تم دفعه</p>
                  <p className="text-green-400 font-black text-xl">{order.paidAmount}</p>
                  <p className="text-gray-600 text-xs">ج.م</p>
                </div>
                <div className="bg-dark/50 rounded-xl p-4 text-center border border-gray-800">
                  <p className="text-gray-500 text-xs mb-2">متبقي</p>
                  <p className="text-red-400 font-black text-xl">{remaining > 0 ? remaining : 0}</p>
                  <p className="text-gray-600 text-xs">ج.م</p>
                </div>
                <div className={`rounded-xl p-4 text-center border ${
                  daysRemaining === null ? 'bg-dark/50 border-gray-800' :
                  daysRemaining <= 0 ? 'bg-green-500/10 border-green-500/30' :
                  daysRemaining <= 2 ? 'bg-red-500/10 border-red-500/30' :
                  'bg-primary/10 border-primary/30'
                }`}>
                  <p className="text-gray-500 text-xs mb-2">فاضل</p>
                  {daysRemaining === null ? (
                    <p className="text-gray-500 font-black text-xl">-</p>
                  ) : daysRemaining <= 0 ? (
                    <p className="text-green-400 font-black text-sm">وقت التسليم</p>
                  ) : (
                    <p className={`font-black text-xl ${daysRemaining <= 2 ? 'text-red-400' : 'text-primary'}`}>
                      {daysRemaining}
                    </p>
                  )}
                  <p className="text-gray-600 text-xs">يوم</p>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 pt-4 border-t border-gray-800 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">الريت الحالي:</span>
                  <span className="text-white">{order.currentRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">مدة التسليم المطلوبة:</span>
                  <span className="text-white">{order.deliveryTime}</span>
                </div>
                {order.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">تاريخ البدء:</span>
                    <span className="text-green-400">{new Date(order.startDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
              </div>

              {order.status === 'PENDING' && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                  <p className="text-yellow-400 text-sm">طلبك قيد المراجعة. سيتم التواصل معك قريباً.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Division1Status;
