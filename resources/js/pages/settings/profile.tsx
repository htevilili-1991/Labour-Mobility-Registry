import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇',
    '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝',
    '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
    '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
    '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
    '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😩', '😫', '🥱', '😤',
    '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻',
    '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
    '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓',
    '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎',
    '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️',
    '🗯', '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
    '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '👊',
    '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪',
    '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '👣', '👀', '👁️', '👅', '👄',
    '💋', '🦷', '🦴', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓',
    '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷',
    '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🧑‍🏫',
    '👨‍⚖️', '👩‍⚖️', '🧑‍⚖️', '👨‍🌾', '👩‍🌾', '🧑‍🌾', '👨‍🍳', '👩‍🍳', '🧑‍🍳',
    '👨‍🔧', '👩‍🔧', '🧑‍🔧', '👨‍🏭', '👩‍🏭', '🧑‍🏭', '👨‍💼', '👩‍💼', '🧑‍💼',
    '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎤', '👩‍🎤', '🧑‍🎤',
    '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍✈️', '👩‍✈️', '🧑‍✈️', '👨‍🚀', '👩‍🚀', '🧑‍🚀',
    '👨‍🚒', '👩‍🚒', '🧑‍🚒', '👮', '👮‍♂️', '👮‍♀️', '👷', '👷‍♂️', '👷‍♀️',
    '💂', '💂‍♂️', '💂‍♀️', '🕵️', '🕵️‍♂️', '🕵️‍♀️', '👩‍🦰', '👨‍🦰', '🧑‍🦰',
    '👩‍🦱', '👨‍🦱', '🧑‍🦱', '👩‍🦳', '👨‍🦳', '🧑‍🦳', '🦱', '🦳', '👨‍🦲',
    '👩‍🦲', '🧑‍🦲', '🧔‍♂️', '🧔‍♀️', '👱‍♂️', '👱‍♀️', '👨‍🦱', '👩‍🦱', '🧑‍🦱',
    '👨‍🦰', '👩‍🦰', '🧑‍🦰', '👨‍🦳', '👩‍🦳', '🧑‍🦳', '🦲', '👱', '👨', '👩',
    '🧑', '👱‍♂️', '👱‍♀️', '👨‍🦱', '👩‍🦱', '🧑‍🦱', '👨‍🦰', '👩‍🦰', '🧑‍🦰',
    '👨‍🦳', '👩‍🦳', '🧑‍🦳', '🦲', '👱', '👨', '👩', '🧑', '👱‍♂️', '👱‍♀️',
    '👨‍🦱', '👩‍🦱', '🧑‍🦱', '👨‍🦰', '👩‍🦰', '🧑‍🦰', '👨‍🦳', '👩‍🦳', '🧑‍🦳',
    '🦲', '👱', '👨', '👩', '🧑', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨',
    '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏',
    '🙇', '🤦', '🤷', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🎓', '👩‍🎓', '🧑‍🎓',
    '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍⚖️', '👩‍⚖️', '🧑‍⚖️', '👨‍🌾', '👩‍🌾', '🧑‍🌾',
    '👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍🔧', '👩‍🔧', '🧑‍🔧', '👨‍🏭', '👩‍🏭', '🧑‍🏭',
    '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍💻', '👩‍💻', '🧑‍💻',
    '👨‍🎤', '👩‍🎤', '🧑‍🎤', '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍✈️', '👩‍✈️', '🧑‍✈️',
    '👨‍🚀', '👩‍🚀', '🧑‍🚀', '👨‍🚒', '👩‍🚒', '🧑‍🚒', '👮', '👮‍♂️', '👮‍♀️',
    '👷', '👷‍♂️', '👷‍♀️', '💂', '💂‍♂️', '💂‍♀️', '🕵️', '🕵️‍♂️', '🕵️‍♀️',
    '👩‍🦰', '👨‍🦰', '🧑‍🦰', '👩‍🦱', '👨‍🦱', '🧑‍🦱', '👩‍🦳', '👨‍🦳', '🧑‍🦳',
    '🦱', '🦳', '👨‍🦲', '👩‍🦲', '🧑‍🦲', '🧔‍♂️', '🧔‍♀️', '👱‍♂️', '👱‍♀️',
    '👨‍🦱', '👩‍🦱', '🧑‍🦱', '👨‍🦰', '👩‍🦰', '🧑‍🦰', '👨‍🦳', '👩‍🦳', '🧑‍🦳',
    '🦲', '👱', '👨', '👩', '🧑', '👱‍♂️', '👱‍♀️', '👨‍🦱', '👩‍🦱', '🧑‍🦱',
    '👨‍🦰', '👩‍🦰', '🧑‍🦰', '👨‍🦳', '👩‍🦳', '🧑‍🦳', '🦲', '👱', '👨', '👩', '🧑'
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        label: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    profile_emoji: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        name: auth.user.name,
        email: auth.user.email,
        profile_emoji: auth.user.profile_emoji || '😊',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), data, {
            preserveScroll: true,
        });
    };

    const selectEmoji = (emoji: string) => {
        setData('profile_emoji', emoji);
        setShowEmojiPicker(false);
        post(route('profile.update'), { ...data, profile_emoji: emoji }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Profile settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name, email address, and profile emoji" />
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="profile_emoji">Profile Emoji</Label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full"
                                >
                                    <span className="text-2xl">{data.profile_emoji}</span>
                                    <span className="text-sm text-gray-600">Choose emoji</span>
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute z-50 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full">
                                        <div className="grid grid-cols-8 gap-1">
                                            {emojis.map((emoji, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => selectEmoji(emoji)}
                                                    className="p-1 hover:bg-gray-100 rounded text-xl transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <InputError className="mt-2" message={errors.profile_emoji} />
                        </div>
                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
