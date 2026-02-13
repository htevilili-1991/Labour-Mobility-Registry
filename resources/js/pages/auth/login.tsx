import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Shield, LogIn } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <AuthLayout title="Welcome Back" description="Sign in to access your Labour Mobility Registry account">
            <Head title="Sign In" />

            {/* Status Message */}
            {status && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                    <Shield className="h-5 w-5 shrink-0" />
                    {status}
                </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter your email address"
                        className="h-11"
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                            Password
                        </Label>
                        {canResetPassword && (
                            <TextLink
                                href={route('password.request')}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                tabIndex={6}
                            >
                                Forgot password?
                            </TextLink>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            tabIndex={2}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                            className="h-11 pr-11"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={togglePasswordVisibility}
                            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            tabIndex={3}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-3">
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', !!checked)}
                        tabIndex={4}
                    />
                    <Label htmlFor="remember" className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                        Remember me on this device
                    </Label>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="h-11 w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    tabIndex={5}
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            <LogIn className="h-5 w-5" />
                            Sign In
                        </>
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
