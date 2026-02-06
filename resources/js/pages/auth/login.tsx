import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Shield, Mail, Lock, LogIn } from 'lucide-react';
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
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                    <div className="flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        {status}
                    </div>
                </div>
            )}

            <form className="flex flex-col gap-8" onSubmit={submit}>
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium">
                        <Mail className="w-4 h-4 text-primary" />
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
                        className="h-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200"
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 font-medium">
                            <Lock className="w-4 h-4 text-primary" />
                            Password
                        </Label>
                        {canResetPassword && (
                            <TextLink href={route('password.request')} className="text-sm text-primary hover:text-primary/80 transition-colors" tabIndex={6}>
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
                            className="h-12 pr-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 text-gray-500 hover:text-primary transition-colors"
                            tabIndex={3}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onClick={() => setData('remember', !data.remember)}
                        tabIndex={4}
                        className="border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <Label htmlFor="remember" className="text-gray-700 cursor-pointer">
                        Remember me on this device
                    </Label>
                </div>

                {/* Submit Button */}
                <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" 
                    tabIndex={5} 
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign In
                        </>
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
