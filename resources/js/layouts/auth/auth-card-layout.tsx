import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex items-center gap-2 self-center font-medium text-gray-800">
                    <div className="flex h-9 w-9 items-center justify-center">
                        <AppLogoIcon className="size-9 fill-current text-blue-600" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl shadow-lg border-gray-200 bg-white">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl text-gray-800">{title}</CardTitle>
                            <CardDescription className="text-gray-600">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
