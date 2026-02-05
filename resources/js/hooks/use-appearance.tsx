import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    // Always use light theme
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    // Always use light theme
    applyTheme('light');

    // Add the event listener for system theme changes (but always apply light)
    mediaQuery()?.addEventListener('change', () => applyTheme('light'));
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        // Force light mode - ignore dark/system preferences
        const lightMode: Appearance = 'light';
        setAppearance(lightMode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', lightMode);

        // Store in cookie for SSR...
        setCookie('appearance', lightMode);

        applyTheme(lightMode);
    }, []);

    useEffect(() => {
        // Always use light mode
        updateAppearance('light');

        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
