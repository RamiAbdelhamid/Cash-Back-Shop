import { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!formData.email.includes('@')) {
            newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
        }
        if (!formData.password) {
            newErrors.password = 'كلمة المرور مطلوبة';
        } else if (formData.password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
         const response = await axios.post(`https://cash-back-shop.onrender.com/api/login`, formData);

            
            if (response.data.success) {
                // Store JWT token in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                setMessage('تم تسجيل الدخول بنجاح! جاري التوجيه...');
                
                // Redirect to dashboard or home page after successful login
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.';
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-4" dir="rtl">
            <div className="bg-white shadow-xl p-8 rounded-xl w-full max-w-md space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-blue-600">مرحباً بك</h2>
                    <p className="text-gray-600 mt-2">سجل دخولك إلى حسابك</p>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-center ${
                        message.includes('نجاح') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="أدخل بريدك الإلكتروني"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            كلمة المرور
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="أدخل كلمة المرور"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">تذكرني</span>
                        </label>
                        <a href="#" className="text-sm text-blue-600 hover:underline">
                            نسيت كلمة المرور؟
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                            isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-gray-600">
                        ليس لديك حساب؟{' '}
                        <a href="/register" className="text-blue-600 hover:underline font-medium">
                            إنشاء حساب
                        </a>
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
