import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center">
                    <div className="mb-4">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            نظام إدارة الكاش باك
                        </h3>
                        <p className="text-gray-300 text-lg">
                            نظام متكامل لإدارة العملاء والمشتريات والكاش باك
                        </p>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-4 md:mb-0">
                                <p className="text-gray-400 text-sm">
                                    جميع الحقوق محفوظة © 2025
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 md:space-x-reverse">
                                <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4 md:space-x-reverse">


                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <span className="text-green-400 font-medium"> 07ASN.M@gmail.com</span>
                                        <span></span>
                                        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                                    </div>

                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <span className="text-blue-400 font-medium">ramighassan10@gmail.com  </span>
                                        <span></span>
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>

                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="text-gray-300 font-semibold">  : المبرمجين</span>
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>


                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </footer>
    );
};

export default Footer; 