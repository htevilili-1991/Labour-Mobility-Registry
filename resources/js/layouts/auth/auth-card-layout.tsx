interface AuthCardLayoutProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export default function AuthCardLayout({ title, description, children }: AuthCardLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
            <div className="w-full max-w-md">
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    {/* Logo Section */}
                    <div className="mb-8 flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-600">
                            <span className="text-lg font-bold text-white">LMR</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {description}
                                </p>
                            )}
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
