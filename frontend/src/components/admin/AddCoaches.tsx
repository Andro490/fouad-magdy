import React, { useState } from 'react';

const AddCoaches = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [isSubmittingJson, setIsSubmittingJson] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

  const handleAddCoaches = async () => {
    if (!jsonInput.trim()) return alert('الرجاء إدخال البيانات بصيغة JSON');
    try {
      setIsSubmittingJson(true);
      const parsedData = JSON.parse(jsonInput);
      
      const res = await fetch(`${API_URL}/api/managers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setJsonInput('');
      } else {
        alert(data.error || 'حدث خطأ أثناء الإضافة');
      }
    } catch (err: any) {
      alert('صيغة JSON غير صحيحة! يرجى التأكد من الأقواس والعلامات.');
    } finally {
      setIsSubmittingJson(false);
    }
  };

  const handleDeleteCoach = async () => {
    const idInput = (document.getElementById('deleteCoachIdInput') as HTMLInputElement).value;
    if (!idInput) return alert('يرجى إدخال ID المدرب');
    if (window.confirm('هل أنت متأكد من حذف هذا المدرب نهائياً؟')) {
      try {
        const res = await fetch(`${API_URL}/api/managers/${idInput}`, { method: 'DELETE' });
        const result = await res.json();
        if (res.ok) {
          alert('تم حذف المدرب بنجاح!');
          (document.getElementById('deleteCoachIdInput') as HTMLInputElement).value = '';
        } else {
          alert(`فشل الحذف: ${result.error}`);
        }
      } catch (e) {
        alert('حدث خطأ في الاتصال بالسيرفر');
      }
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">إضافة مدربين عن طريق كود JSON</h2>
      <p className="text-gray-400 mb-4 text-center">
        يمكنك نسخ كود JSON الذي يحتوي على مدرب واحد أو قائمة من المدربين ولصقه هنا.
        المدربون الجدد سيظهرون تلقائياً في الصفحة الأولى (رقم 1) بالموقع.
      </p>
      <textarea 
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="انسخ كود JSON هنا..."
        className="w-full h-64 bg-dark/50 border border-gray-700 rounded-lg p-4 text-white focus:border-primary focus:outline-none mb-4"
        dir="ltr"
      />
      <button 
        onClick={handleAddCoaches}
        disabled={isSubmittingJson}
        className="w-full py-3 bg-accent text-dark font-bold rounded-lg hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 mb-8"
      >
        {isSubmittingJson ? 'جاري الإضافة...' : 'إضافة المدربين الآن'}
      </button>
      
      <hr className="border-gray-700 mb-8" />
      
      <h2 className="text-2xl font-bold mb-6 text-red-500 text-center">حذف مدرب</h2>
      <p className="text-gray-400 mb-4 text-center">أدخل الـ ID الخاص بالمدرب لحذفه نهائياً من قاعدة البيانات والموقع.</p>
      <div className="flex gap-4">
        <input 
          type="text" 
          id="deleteCoachIdInput"
          placeholder="مثال: 17608292273375"
          className="flex-1 bg-dark/50 border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none"
          dir="ltr"
        />
        <button 
          onClick={handleDeleteCoach}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
        >
          حذف المدرب
        </button>
      </div>
    </div>
  );
};

export default AddCoaches;
