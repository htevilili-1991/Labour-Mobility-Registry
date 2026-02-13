import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        href: string;
        label: string;
    };
}

export function EmptyState({ icon: Icon = FileQuestion, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 px-6 dark:border-gray-700 dark:bg-gray-900/20">
            <Icon className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}
            {action && (
                <Link
                    href={action.href}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
