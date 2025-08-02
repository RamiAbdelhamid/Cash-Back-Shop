import { Link, NavLink } from "react-router-dom";
import { isAuthenticated, logout, getUser } from "../utils/auth.js";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);
      if (authStatus) {
        const userData = getUser();
        setUser(userData);
      }
    };

    checkAuth();
    // التحقق من حالة تسجيل الدخول عند تغيير الصفحة
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <nav className="bg-white shadow-lg py-4 px-6" dir="rtl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          كاش باك
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 space-x-reverse">
          {/* Public Links */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "text-blue-600 font-medium bg-blue-50" 
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`
            }
          >
            الرئيسية
          </NavLink>

          {/* Conditional Links based on Auth Status */}
          {isLoggedIn ? (
            <>
              {/* Customer Management */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "text-blue-600 font-medium bg-blue-50" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`
                }
              >
                إدارة العملاء
              </NavLink>

              {/* Purchase Management */}
              <NavLink
                to="/purchases"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "text-blue-600 font-medium bg-blue-50" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`
                }
              >
                إدارة المشتريات
              </NavLink>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                  {user?.profileImage ? (
                    <img 
                      src={`http://localhost:5000/${user.profileImage}`}
                      alt={user?.fullName || 'المستخدم'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span 
                    className={`w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium ${
                      user?.profileImage ? 'hidden' : ''
                    }`}
                  >
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                  <span className="hidden md:block">{user?.fullName || 'المستخدم'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100 flex items-center space-x-2 space-x-reverse">
                      {user?.profileImage ? (
                        <img 
                          src={`http://localhost:5000/${user.profileImage}`}
                          alt={user?.fullName || 'المستخدم'}
                          className="w-6 h-6 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium">
                          {user?.fullName?.charAt(0) || 'U'}
                        </span>
                      )}
                      <span>مرحباً، {user?.fullName}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Register Link */}
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "text-blue-600 font-medium bg-blue-50" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`
                }
              >
                إنشاء حساب
              </NavLink>
              
              {/* Login Link */}
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "text-blue-600 font-medium bg-blue-50" 
                      : "text-white bg-blue-600 hover:bg-blue-700"
                  }`
                }
              >
                تسجيل الدخول
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
