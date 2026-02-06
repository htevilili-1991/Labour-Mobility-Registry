import { configureEcho } from '@laravel/echo-react';

configureEcho({
    broadcaster: 'reverb',
});
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        // Normalize case for matching
        const pagePath = Object.keys(pages).find(
            key => key.toLowerCase() === `./pages/${name.toLowerCase()}.tsx`
        );
        if (!pagePath) {
            throw new Error(`Page not found: ${name}`);
        }
        return resolvePageComponent(pagePath, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
