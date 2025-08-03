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
  
  // مرجع لقائمة المتاجر
  const storesDropdownRef = useRef(null);
  const [showStoresDropdown, setShowStoresDropdown] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(new Set());

  // جلب المتاجر من قاعدة البيانات
  useEffect(() => {
    fetchStores();
  }, []);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (storesDropdownRef.current && !storesDropdownRef.current.contains(event.target)) {
        setShowStoresDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get(`https://cash-back-shop.onrender.com/api/stores`);
      console.log('بيانات المتاجر:', response.data.stores); // للتأكد من البيانات
      console.log('مثال على بيانات متجر:', response.data.stores[0]); // لعرض هيكل البيانات
      
      // طباعة profileImage لكل متجر
      response.data.stores.forEach((store, index) => {
        console.log(`المتجر ${index + 1}:`, {
          name: store.name,
          id: store.id,
          image: store.image,
          profileImage: store.profileImage
        });
      });
      
      setStores(response.data.stores);
      
      // بدء تحميل الصور - يمكن استخدام image أو profileImage
      const storesWithImages = response.data.stores.filter(store => 
        (store.image && store.image.trim() !== '') || 
        (store.profileImage && store.profileImage.trim() !== '')
      );
      const imageUrls = storesWithImages.map(store => store.image || store.profileImage);
      setLoadingImages(new Set(imageUrls));
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

  // دالة لاختيار المتجر من القائمة المنسدلة
  const handleStoreSelect = (store) => {
    setFormData(prev => ({
      ...prev,
      storeId: store.id
    }));
    setShowStoresDropdown(false);
    
    // إضافة صورة المتجر المختار إلى قائمة التحميل إذا لم تكن موجودة
    const storeImage = getStoreImage(store);
    if (storeImage && storeImage.trim() !== '' && !imageErrors.has(storeImage)) {
      setLoadingImages(prev => new Set([...prev, storeImage]));
    }
  };

  // دالة لمعالجة أخطاء تحميل الصور
  const handleImageError = (imageName) => {
    setImageErrors(prev => new Set([...prev, imageName]));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageName);
      return newSet;
    });
  };

  // دالة لمعالجة نجاح تحميل الصور
  const handleImageLoad = (imageName) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageName);
      return newSet;
    });
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
      const response = await axios.get(`https://cash-back-shop.onrender.com/api/cashback/inquiry`, {
  params: {
    storeId: formData.storeId,
    phoneNumber: cleanPhoneNumber
  }
});
      const selectedStore = stores.find(store => store.id === formData.storeId);
      setResult({
        storeName: selectedStore?.name || 'متجر غير معروف',
        storeImage: getStoreImage(selectedStore),
        phoneNumber: cleanPhoneNumber,
        balance: response.data.data.balance,
        customerName: response.data.data.customerName
      });
      
      // إضافة صورة المتجر إلى قائمة التحميل إذا لم تكن موجودة
      const storeImage = getStoreImage(selectedStore);
      if (storeImage && storeImage.trim() !== '' && !imageErrors.has(storeImage)) {
        setLoadingImages(prev => new Set([...prev, storeImage]));
      }
      
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

  // دالة لتنظيف سلسلة الصورة (إزالة المسافات الزائدة أو الرموز)
  const cleanImagePath = (path) => {
    if (!path) return '';
    return path.trim().replace(/\s+/g, ' ').replace(/[^\w.-]/g, '');
  };

  // دالة لبناء URL الصورة
  const getImageUrl = (imagePath) => {
    const cleanedPath = cleanImagePath(imagePath);
    if (!cleanedPath) return '';
    return `https://cash-back-shop.onrender.com/uploads/${cleanedPath}`;
  };

  // دالة للحصول على صورة المتجر (تدعم كلا الحقلين)
  const getStoreImage = (store) => {
    return store?.image || store?.profileImage || '';
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
                <div className="relative" ref={storesDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowStoresDropdown(!showStoresDropdown)}
                    disabled={storesLoading}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm text-right flex items-center justify-between"
                  >
                    <span className="flex items-center space-x-3 space-x-reverse">
                      {formData.storeId ? (
                        <>
                          {(() => {
                            const selectedStore = stores.find(store => store.id === formData.storeId);
                            const storeImage = getStoreImage(selectedStore);
                            return storeImage && storeImage.trim() !== '' && !imageErrors.has(storeImage) ? (
                              <div className="relative">
                                {loadingImages.has(storeImage) && (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                  </div>
                                )}
                                <img 
                                  src={getImageUrl(storeImage)}
                                  alt="صورة المتجر"
                                  className={`w-8 h-8 rounded-full object-cover border-2 border-gray-200 ${loadingImages.has(storeImage) ? 'hidden' : ''}`}
                                  onError={() => handleImageError(storeImage)}
                                  onLoad={() => handleImageLoad(storeImage)}
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            );
                          })()}
                          <span>{stores.find(store => store.id === formData.storeId)?.name || 'متجر غير معروف'}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">
                          {storesLoading ? 'جاري تحميل المتاجر...' : 'اختر اسم المتجر'}
                        </span>
                      )}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* قائمة المتاجر المنسدلة */}
                  {showStoresDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                      {storesLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          جاري تحميل المتاجر...
                        </div>
                      ) : stores.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          لا توجد متاجر متاحة
                        </div>
                      ) : (
                        stores.map((store) => (
                          <button
                            key={store.id}
                            type="button"
                            onClick={() => handleStoreSelect(store)}
                            className="w-full p-4 text-right hover:bg-blue-50/80 transition-colors duration-200 flex items-center space-x-3 space-x-reverse border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center space-x-3 space-x-reverse flex-1">
                              {(() => {
                                const storeImage = getStoreImage(store);
                                return storeImage && storeImage.trim() !== '' && !imageErrors.has(storeImage) ? (
                                  <div className="relative">
                                    {loadingImages.has(storeImage) && (
                                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                      </div>
                                    )}
                                    <img 
                                      src={getImageUrl(storeImage)}
                                      alt={`صورة ${store.name}`}
                                      className={`w-10 h-10 rounded-full object-cover border-2 border-gray-200 ${loadingImages.has(storeImage) ? 'hidden' : ''}`}
                                      onError={() => handleImageError(storeImage)}
                                      onLoad={() => handleImageLoad(storeImage)}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                  </div>
                                );
                              })()}
                              <span className="font-medium text-gray-800">{store.name}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
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
              {/* معلومات المتجر مع الصورة */}
              <div className="mb-6 p-4 bg-white/70 rounded-2xl">
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                  {result.storeImage && result.storeImage.trim() !== '' && !imageErrors.has(result.storeImage) ? (
                    <>
                      {loadingImages.has(result.storeImage) && (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                      <img 
                        src={`https://cash-back-shop.onrender.com/uploads/${result.storeImage}`}
                        alt="صورة المتجر"
                        className={`w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg ${loadingImages.has(result.storeImage) ? 'hidden' : ''}`}
                        onError={() => handleImageError(result.storeImage)}
                        onLoad={() => handleImageLoad(result.storeImage)}
                      />
                    </>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm text-gray-600 font-medium">المتجر</div>
                    <div className="text-xl font-bold text-gray-800">{result.storeName}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 text-center">
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
