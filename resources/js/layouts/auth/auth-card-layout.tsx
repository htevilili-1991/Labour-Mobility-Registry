interface AuthCardLayoutProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export default function AuthCardLayout({ title, description, children }: AuthCardLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    {/* Logo Section */}
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl font-bold">LMR</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                            {description && (
                                <p className="text-gray-600">{description}</p>
                            )}
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
