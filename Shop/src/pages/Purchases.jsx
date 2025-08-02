import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getUser, logout, createAuthAxios } from '../utils/auth.js';

const Purchases = () => {
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState(null);
  
  // مرجع لمعلومات العميل للتمرير السلس
  const customerInfoRef = useRef(null);

  // بيانات النموذج
  const [formData, setFormData] = useState({
    customerPhone: '',
    purchaseAmount: '',

    useExistingCashback: false,
    cashbackToUse: 0,
     cashbackPercentage: ''
  });

  // بيانات العميل المحدد
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerStats, setCustomerStats] = useState(null);

  const authAxios = createAuthAxios();

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    fetchPurchases();
    fetchStats();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await authAxios.get('/purchases');
      setPurchases(response.data.purchases);
    } catch (err) {
      console.error('خطأ في جلب المشتريات:', err);
      setMessage('فشل في جلب المشتريات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authAxios.get('/purchases/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('خطأ في جلب الإحصائيات:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // دالة للتمرير السلس إلى معلومات العميل
  const scrollToCustomerInfo = () => {
    if (customerInfoRef.current) {
      customerInfoRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // البحث عن العميل برقم الهاتف
  const searchCustomer = async () => {
    if (!formData.customerPhone.trim()) {
      setMessage('يرجى إدخال رقم هاتف العميل');
      return;
    }

    setCustomerLoading(true);
    setMessage('');
    setSelectedCustomer(null);
    setCustomerStats(null);

    try {
      const response = await authAxios.get(`/customers/search?phoneNumber=${formData.customerPhone}`);
      setSelectedCustomer(response.data.customer);
      
      // جلب إحصائيات العميل
      const statsResponse = await authAxios.get(`/purchases/customer-stats?customerPhone=${formData.customerPhone}`);
      setCustomerStats(statsResponse.data.customerStats);
      
      setMessage('تم العثور على العميل بنجاح');
      
      // التمرير السلس إلى معلومات العميل بعد نجاح البحث
      setTimeout(() => {
        scrollToCustomerInfo();
      }, 100);
    } catch (err) {
      setMessage('العميل غير موجود. يرجى التحقق من رقم الهاتف');
      setSelectedCustomer(null);
      setCustomerStats(null);
    } finally {
      setCustomerLoading(false);
    }
  };

  // إضافة مشترى جديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedCustomer) {
      setMessage('يرجى البحث عن العميل أولاً');
      return;
    }

    if (!formData.purchaseAmount) {
      setMessage('يرجى إدخال قيمة المبلغ المدفوع');
      return;
    }

    const purchaseAmount = parseFloat(formData.purchaseAmount);
    const cashbackToUse = parseFloat(formData.cashbackToUse) || 0;

    if (cashbackToUse > selectedCustomer.cashbackBalance) {
      setMessage('المبلغ المراد استخدامه أكبر من رصيد الكاش باك المتوفر');
      return;
    }

    try {
      const purchaseData = {
        customerPhone: selectedCustomer.phoneNumber,
        purchaseAmount: purchaseAmount,
        cashbackType: formData.cashbackType,
        useExistingCashback: formData.useExistingCashback,
        cashbackToUse: cashbackToUse,
        cashbackPercentage: formData.cashbackPercentage,

      };

      const response = await authAxios.post('/purchases', purchaseData);
      
      if (response.data.success) {
        setMessage('تم تسجيل عملية الشراء بنجاح');
        
        // إعادة تعيين النموذج
        setFormData({
          customerPhone: '',
          purchaseAmount: '',
          cashbackType: '',
          useExistingCashback: false,
          cashbackToUse: 0,
          cashbackPercentage: ''
        });
        setSelectedCustomer(null);
        setCustomerStats(null);
        
        // تحديث البيانات
        fetchPurchases();
        fetchStats();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'حدث خطأ في تسجيل العملية';
      setMessage(errorMessage);
    }
  };

  // حساب المبلغ المتبقي بعد استخدام الكاش باك
  const calculateRemainingAmount = () => {
    const purchaseAmount = parseFloat(formData.purchaseAmount) || 0;
    const cashbackToUse = parseFloat(formData.cashbackToUse) || 0;
    return Math.max(0, purchaseAmount - cashbackToUse);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              {user?.profileImage ? (
                <img 
                  src={`http://localhost:5000/${user.profileImage}`}
                  alt={user?.fullName || 'المستخدم'}
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 p-3">
                  إدارة المشتريات
                </h1>
                <p className="text-gray-600 text-lg">مرحباً {user.fullName} - تسجيل مشتريات العملاء</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                إدارة العملاء
              </Link>
              <button
                onClick={logout}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-6 rounded-3xl mb-8 text-center backdrop-blur-sm border-2 ${
            message.includes('نجاح') 
              ? 'bg-green-100/80 text-green-700 border-green-200' 
              : 'bg-red-100/80 text-red-700 border-red-200'
          }`}>
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              {message.includes('نجاح') ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-lg font-semibold">{message}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 ">إجمالي المشتريات</h3>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent p-3">
                {stats.totalPurchases.toFixed(2)} ريال
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">إجمالي الكاش باك</h3>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent p-3">
                {stats.totalCashback.toFixed(2)} ريال
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">عدد المشتريات</h3>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent p-3">
                {stats.purchaseCount}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">متوسط المشترى</h3>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent  p-3">
                {stats.averagePurchase.toFixed(2)} ريال
              </p>
            </div>
          </div>
        )}

        {/* Purchase Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">تسجيل عملية شراء جديدة</h2>
            <p className="text-gray-600">أدخل بيانات العملية</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Search */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-6">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center space-x-2 space-x-reverse">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>1. البحث عن العميل</span>
              </h3>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="رقم هاتف العميل (إجباري)"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={searchCustomer}
                  disabled={customerLoading}
                  className={`px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold ${
                    customerLoading 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {customerLoading ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>جاري البحث...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>البحث</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Customer Info */}
            {selectedCustomer && (
              <div ref={customerInfoRef} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>2. معلومات العميل</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/50 rounded-2xl p-4">
                    <div className="text-sm text-gray-600 mb-1">الاسم</div>
                    <div className="font-semibold text-gray-800">{selectedCustomer.name || 'غير محدد'}</div>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-4">
                    <div className="text-sm text-gray-600 mb-1">رقم الهاتف</div>
                    <div className="font-semibold text-gray-800">{selectedCustomer.phoneNumber}</div>
                  </div>
                </div>
                
                {/* إحصائيات العميل */}
                {customerStats && (
                  <div className="border-t-2 border-green-200 pt-6">
                    <h4 className="font-semibold text-green-800 mb-4 flex items-center space-x-2 space-x-reverse">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>إحصائيات العميل</span>
                    </h4>
                    <div className="grid md:grid-cols-5 gap-4">
                      <div className="bg-white/70 rounded-2xl p-4 border border-green-200">
                        <div className="text-sm text-gray-600 mb-1">إجمالي المشتريات</div>
                        <div className="text-lg font-bold text-blue-600">{customerStats.totalPurchases.toFixed(2)} ريال</div>
                      </div>
                      <div className="bg-white/70 rounded-2xl p-4 border border-green-200">
                        <div className="text-sm text-gray-600 mb-1">عدد المشتريات</div>
                        <div className="text-lg font-bold text-purple-600">{customerStats.purchaseCount}</div>
                      </div>
                      <div className="bg-white/70 rounded-2xl p-4 border border-green-200">
                        <div className="text-sm text-gray-600 mb-1">متوسط المشترى</div>
                        <div className="text-lg font-bold text-orange-600">{customerStats.averagePurchase.toFixed(2)} ريال</div>
                      </div>
                      <div className="bg-white/70 rounded-2xl p-4 border border-green-200">
                        <div className="text-sm text-gray-600 mb-1">إجمالي الكاش باك</div>
                        <div className="text-lg font-bold text-green-600">{selectedCustomer.cashbackBalance.toFixed(2)} ريال</div>
                      </div>
                      <div className="bg-white/70 rounded-2xl p-4 border border-green-200">
                        <div className="text-sm text-gray-600 mb-1">متوسط نسبة الكاش باك</div>
                        <div className="text-lg font-bold text-indigo-600">
                          {customerStats.purchaseCount > 0 ? 
                            (customerStats.totalCashback / customerStats.totalPurchases * 100).toFixed(1) + '%' : 
                            '0%'
                          }
                        </div>
                      </div>
                    </div>
                    {customerStats.lastPurchaseDate && (
                      <div className="mt-4 text-sm text-gray-600 bg-white/50 rounded-xl p-3">
                        آخر مشترى: {new Date(customerStats.lastPurchaseDate).toLocaleDateString('eb-SA')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Purchase Details */}
            {selectedCustomer && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-4 flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>3. تفاصيل المشترى</span>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      قيمة المبلغ المدفوع (إجباري)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="purchaseAmount"
                        value={formData.purchaseAmount}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 border-2 border-yellow-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                     
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      نسبة الكاش باك (اختياري)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="cashbackPercentage"
                        value={formData.cashbackPercentage}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 border-2 border-yellow-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="مثال: 5"
                        min={0}
                        max={100}
                        step="0.1"
                      />
                     
                    </div>
                    <p className="text-sm text-gray-500">أدخل النسبة فقط (بدون %)</p>
                    {formData.cashbackPercentage && formData.purchaseAmount && (
                      <p className="text-sm text-blue-600 bg-blue-50 rounded-xl p-2">
                        الكاش باك المتوقع: {(parseFloat(formData.purchaseAmount) * parseFloat(formData.cashbackPercentage) / 100).toFixed(2)} ريال
                      </p>
                    )}
                  </div>
                </div>

                {/* Use Existing Cashback */}
                <div className="border-t-2 border-yellow-200 pt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      name="useExistingCashback"
                      checked={formData.useExistingCashback}
                      onChange={handleInputChange}
                      className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500 w-5 h-5"
                    />
                    <label className="mr-3 font-semibold text-gray-700">
                      استخدام الكاش باك الموجود
                    </label>
                  </div>
                  
                  {formData.useExistingCashback && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          مبلغ الكاش باك المراد استخدامه
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="cashbackToUse"
                            value={formData.cashbackToUse}
                            onChange={handleInputChange}
                            className="w-full px-6 py-4 border-2 border-yellow-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                            placeholder="0.00"
                            step="0.01"
                            max={selectedCustomer.cashbackBalance}
                          />
                         
                        </div>
                        <p className="text-sm text-gray-500 bg-yellow-50 rounded-xl p-2">
                          الحد الأقصى: {selectedCustomer.cashbackBalance.toFixed(2)} ريال
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          المبلغ المتبقي للدفع
                        </label>
                        <div className="w-full px-6 py-4 bg-white/50 border-2 border-yellow-200 rounded-2xl text-center">
                          <span className="text-2xl font-bold text-gray-800">{calculateRemainingAmount().toFixed(2)} ريال</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedCustomer && (
              <div className="text-center">
                <button
                  type="submit"
                  className="px-12 py-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-3xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-2xl text-xl font-bold"
                >
                  <div className="flex items-center justify-center space-x-3 space-x-reverse">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>تسجيل عملية الشراء</span>
                  </div>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">آخر العمليات</h2>
            <p className="text-gray-600">عرض آخر عمليات الشراء المسجلة</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد عمليات مسجلة</h3>
              <p className="text-gray-500">ابدأ بتسجيل عملية شراء جديدة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">العميل</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رقم الهاتف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">مبلغ المشترى</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">نسبة الكاش باك</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الكاش باك المضاف</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.slice(0, 10).map((purchase) => (
                    <tr key={purchase._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {(purchase.customerId?.name || 'U').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{purchase.customerId?.name || 'غير محدد'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {purchase.customerId?.phoneNumber}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                          {purchase.purchaseAmount.toFixed(2)} ريال
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-medium">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                          {purchase.cashbackPercentage ? `${purchase.cashbackPercentage}%` : '0%'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-green-600 font-medium">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                          {purchase.cashbackAmount.toFixed(2)} ريال
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchases; 