import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function CashBack() {
  const [formData, setFormData] = useState({
    storeId: '',
    phoneNumber: ''
  });
  const [stores, setStores] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // مرجع لمربع النتائج للتمرير السلس
  const resultRef = useRef(null);

  // جلب المتاجر من قاعدة البيانات
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/stores`);

      setStores(response.data.stores);
    } catch (err) {
      console.error('خطأ في جلب المتاجر:', err);
      setMessage('فشل في جلب قائمة المتاجر');
    } finally {
      setStoresLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // دالة للتمرير السلس إلى النتائج
  const scrollToResult = () => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setResult(null);

    if (!formData.storeId || !formData.phoneNumber) {
      setMessage('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من صحة رقم الهاتف - يقبل أي رقم هاتف
    const phoneRegex = /^\d{8,15}$/;
    let cleanPhoneNumber = formData.phoneNumber;
    
    // تنظيف الرقم من أي رموز إضافية
    cleanPhoneNumber = cleanPhoneNumber.replace(/[^\d]/g, '');
    
    if (!phoneRegex.test(cleanPhoneNumber)) {
      setMessage('يرجى إدخال رقم هاتف صحيح (8-15 رقم)');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cashback/inquiry`, {
  params: {
    storeId: formData.storeId,
    phoneNumber: cleanPhoneNumber
  }
});
      setResult({
        storeName: stores.find(store => store.id === formData.storeId)?.name || 'متجر غير معروف',
        phoneNumber: cleanPhoneNumber,
        balance: response.data.data.balance,
        customerName: response.data.data.customerName
      });
      
      // رسالة نجاح
      setMessage('تم العثور على رصيد الكاش باك بنجاح');
      
      // التمرير السلس إلى النتائج بعد نجاح الاستعلام
      setTimeout(() => {
        scrollToResult();
      }, 100);
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage('لم يتم العثور على رصيد كاش باك لهذا العميل في المتجر المحدد');
      } else {
        setMessage('حدث خطأ أثناء البحث عن الرصيد');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" dir="rtl">
      <div className="max-w-4xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 p-3">
            صفحة استعلام الكاش باك
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            تتيح للعملاء معرفة رصيد الكاش باك المرتبط برقم هاتفهم لدى متجر محدد
          </p>
        </div>

        {/* Query Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">استعلام الرصيد</h2>
            <p className="text-gray-600">أدخل بياناتك للاستعلام عن رصيد الكاش باك</p>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl mb-6 text-center backdrop-blur-sm ${
              message.includes('نجح') || message.includes('تم العثور')
                ? 'bg-green-100/80 text-green-700 border border-green-200'
                : 'bg-red-100/80 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  اختيار اسم المتجر من قائمة (إجباري)
                </label>
                <div className="relative">
                  <select
                    name="storeId"
                    value={formData.storeId}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    required
                    disabled={storesLoading}
                  >
                    <option value="">
                      {storesLoading ? 'جاري تحميل المتاجر...' : 'اختر اسم المتجر'}
                    </option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                 
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  رقم الهاتف الخاص بالعميل (إجباري)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="أي رقم هاتف (8-15 رقم)"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={loading || storesLoading}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                  loading || storesLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جاري الاستعلام...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>استعلام الرصيد</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div ref={resultRef} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">نتيجة الاستعلام</h3>
              <p className="text-gray-600">تم العثور على رصيد الكاش باك بنجاح</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 font-medium">المتجر</div>
                  <div className="text-lg font-bold text-gray-800 bg-white/50 rounded-xl p-3">{result.storeName}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 font-medium">رقم الهاتف</div>
                  <div className="text-lg font-bold text-gray-800 bg-white/50 rounded-xl p-3">{result.phoneNumber}</div>
                </div>
                {result.customerName && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-medium">اسم العميل</div>
                    <div className="text-lg font-bold text-gray-800 bg-white/50 rounded-xl p-3">{result.customerName}</div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 text-center">
                <div className="text-sm text-gray-600 mb-2">الرصيد المتوفر للعميل بالريال السعودي</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent  p-8">
                  {result.balance.toFixed(2)} ريال
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setFormData({ storeId: '', phoneNumber: '' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                استعلام جديد
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">كاش باك فوري</h3>
            <p className="text-gray-600">احصل على كاش باك فوري على مشترياتك من المتاجر المسجلة</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">متاجر متعددة</h3>
            <p className="text-gray-600">استفد من كاش باك في العديد من المتاجر المسجلة في النظام</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">استعلام سريع</h3>
            <p className="text-gray-600">استعلم عن رصيدك بسهولة وسرعة من خلال رقم هاتفك</p>
          </div>
        </div>
      </div>
    </div>
  );
}
