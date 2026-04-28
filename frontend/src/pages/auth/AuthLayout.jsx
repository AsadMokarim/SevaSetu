import React from 'react';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img src="/sevasetu logo-bg-removed.svg" alt="SevaSetu Logo" className="w-20 h-20 object-contain drop-shadow-md" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">SevaSetu</h1>
                    <p className="text-sm text-gray-500 mt-1">AI-Powered Volunteer Coordination</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
                    {(title || subtitle) && (
                        <div className="mb-6">
                            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
                            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
