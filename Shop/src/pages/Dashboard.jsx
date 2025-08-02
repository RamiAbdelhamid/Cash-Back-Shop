import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getUser, logout, createAuthAxios } from '../utils/auth.js';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // مرجع لقائمة العملاء للتمرير السلس
  const customersListRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: ''
  });

  const authAxios = createAuthAxios();

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await authAxios.get('/customers');
      setCustomers(response.data.customers);
    } catch (err) {
      console.error('خطأ في جلب العملاء:', err);
      setMessage('فشل في جلب العملاء');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!editingCustomer && !formData.phoneNumber.trim()) {
      setMessage('رقم الهاتف مطلوب');
      return;
    }

    try {
      if (editingCustomer) {
        // تحديث العميل (فقط الاسم)
        await authAxios.put(`/customers/${editingCustomer._id}`, {
          name: formData.name
        });
        setMessage('تم تحديث بيانات العميل بنجاح');
      } else {
        // إضافة عميل جديد
        await authAxios.post('/customers', formData);
        setMessage('تم إضافة العميل بنجاح');
      }

      setFormData({ name: '', phoneNumber: '' });
      setEditingCustomer(null);
      setShowAddForm(false);
      fetchCustomers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'حدث خطأ';
      setMessage(errorMessage);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      phoneNumber: customer.phoneNumber // سيتم عرضه فقط، لا يمكن تعديله
    });
    setShowAddForm(true);
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      return;
    }

    try {
      await authAxios.delete(`/customers/${customerId}`);
      setMessage('تم حذف العميل بنجاح');
      fetchCustomers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'فشل في حذف العميل';
      setMessage(errorMessage);
    }
  };

  // دالة للتمرير السلس إلى قائمة العملاء
  const scrollToCustomersList = () => {
    if (customersListRef.current) {
      customersListRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      fetchCustomers();
      return;
    }

    try {
      const response = await authAxios.get(`/customers/search?phoneNumber=${searchPhone}`);
      setCustomers([response.data.customer]);
      
      // التمرير السلس إلى قائمة العملاء بعد البحث
      setTimeout(() => {
        scrollToCustomersList();
      }, 100);
    } catch (err) {
      setMessage('لم يتم العثور على العميل');
      setCustomers([]);
    }
  };

  const cancelEdit = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phoneNumber: '' });
    setShowAddForm(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              {user?.profileImage ? (
                <img 
                  src={`https://cash-back-shop.onrender.com/${user.profileImage}`}
                  alt={user?.fullName || 'المستخدم'}
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 p-3">
                  إدارة العملاء
                </h1>
                <p className="text-gray-600 text-lg">مرحباً {user.fullName} - إدارة عملاء متجرك</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                to="/purchases"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                إدارة المشتريات
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

        {/* Search and Add */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="البحث برقم الهاتف..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                 
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                بحث
              </button>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>إضافة عميل جديد</span>
              </div>
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </h2>
              <p className="text-gray-600">أدخل بيانات العميل</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    اسم العميل (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="أدخل اسم العميل"
                    />
               
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    رقم الهاتف {editingCustomer ? '(ثابت)' : '(إجباري)'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                        editingCustomer ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="05xxxxxxxx"
                      required={!editingCustomer}
                      disabled={editingCustomer}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                >
                  {editingCustomer ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Customers List */}
        <div ref={customersListRef} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">قائمة العملاء</h2>
            <p className="text-gray-600">إدارة عملاء متجرك</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا يوجد عملاء مسجلين</h3>
              <p className="text-gray-500">ابدأ بإضافة عميل جديد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الاسم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رقم الهاتف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رصيد الكاش باك</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ التسجيل</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {(customer.name || 'U').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{customer.name || 'غير محدد'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {customer.phoneNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                          {customer.cashbackBalance.toFixed(2)} ريال
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 text-sm font-semibold"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 text-sm font-semibold"
                          >
                            حذف
                          </button>
                        </div>
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

export default Dashboard; 