import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { usePage } from '@inertiajs/react';
import { type User, type SharedData } from '@/types';
import { useEffect } from 'react';

export function UserInfo({ user, showEmail = false, showName = true }: { user: User; showEmail?: boolean; showName?: boolean }) {
    const getInitials = useInitials();
    const { auth } = usePage<SharedData>().props;

    // Force re-render when user data changes
    useEffect(() => {
        console.log('UserInfo useEffect - user changed:', {
            name: user.name,
            profile_emoji: user.profile_emoji,
            hasAvatar: !!user.avatar,
            showName,
            cacheBust: (auth as any)?.cache_bust
        });
    }, [user.profile_emoji, user.name, (auth as any)?.cache_bust]);

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {user.profile_emoji ? (
                    <div className="flex items-center justify-center h-full w-full text-2xl bg-gray-100 dark:bg-gray-800">
                        <span className="select-none">{user.profile_emoji}</span>
                    </div>
                ) : (
                    <>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </>
                )}
            </Avatar>
            {showName && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
                </div>
            )}
        </>
    );
}
