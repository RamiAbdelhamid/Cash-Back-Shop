import { useState, useEffect } from 'react';
import axios from 'axios';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreed: false,
        profileImage: null,
    });

    const [errors, setErrors] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0],
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    useEffect(() => {
        if (formData.profileImage) {
            const objectUrl = URL.createObjectURL(formData.profileImage);
            setPreviewUrl(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [formData.profileImage]);
    
    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'الاسم مطلوب';
        if (!formData.email.includes('@')) newErrors.email = 'البريد الإلكتروني غير صحيح';
        if (formData.password.length < 6) newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
        if (!formData.agreed) newErrors.agreed = 'يجب الموافقة على الشروط';
        return newErrors;
    };

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        const val = validate();
        if (Object.keys(val).length) {
            setErrors(val);
            return;
        }

        setIsLoading(true);
        try {
            const formToSend = new FormData();
            formToSend.append('fullName', formData.fullName);
            formToSend.append('email', formData.email);
            formToSend.append('password', formData.password);
            if (formData.profileImage) {
                formToSend.append('profileImage', formData.profileImage);
            }

            const response = await axios.post('http://localhost:5000/api/register', formToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Store JWT token in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                setMessage('تم التسجيل بنجاح! جاري التوجيه...');
                
                // Redirect to dashboard or home page after successful registration
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            }
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || 'فشل في التسجيل. يرجى المحاولة مرة أخرى.';
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-4" dir="rtl">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl p-8 rounded-xl w-full max-w-md space-y-4"
            >
                <h2 className="text-2xl font-bold text-center text-blue-600">إنشاء حساب جديد</h2>

                {message && (
                    <div className={`p-3 rounded-lg text-center ${
                        message.includes('نجاح') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}

                <div>
                    <label className="block mb-1 font-medium">الاسم الكامل</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded"
                        placeholder="أدخل اسمك الكامل"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                </div>
                
                <div>
                    <label className="block mb-1 font-medium">صورة الملف الشخصي</label>
                    <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded"
                    />
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="معاينة"
                            className="mt-2 h-20 w-20 object-cover rounded-full"
                        />
                    )}
                </div>

                <div>
                    <label className="block mb-1 font-medium">البريد الإلكتروني</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded"
                        placeholder="example@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div>
                    <label className="block mb-1 font-medium">كلمة المرور</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded"
                        placeholder="أدخل كلمة المرور"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>

                <div>
                    <label className="block mb-1 font-medium">تأكيد كلمة المرور</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded"
                        placeholder="أعد إدخال كلمة المرور"
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                    )}
                </div>

                <div className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        name="agreed"
                        checked={formData.agreed}
                        onChange={handleChange}
                        className="mt-1"
                    />
                    <label className="text-sm">
                        أوافق على <a href="#" className="text-blue-600 underline">الشروط والأحكام</a>
                    </label>
                </div>
                {errors.agreed && <p className="text-red-500 text-sm">{errors.agreed}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full p-2 rounded transition ${
                        isLoading 
                            ? 'bg-gray-400 cursor-not-allowed text-white' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب والحصول على كاش باك'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    لديك حساب بالفعل؟ <a href="/login" className="text-blue-600 underline">تسجيل الدخول</a>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;
