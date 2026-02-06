import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false, showName = true }: { user: User; showEmail?: boolean; showName?: boolean }) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {user.profile_emoji ? (
                    <div className="flex items-center justify-center h-full w-full text-2xl bg-gray-100">
                        {user.profile_emoji}
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
