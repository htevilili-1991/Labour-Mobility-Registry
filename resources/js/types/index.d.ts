import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    label: string;
    href: string | null;
}

export interface NavGroup {
    title: string;
    icon?: LucideIcon | null;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profile_emoji?: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface Registry {
    id: number;
    surname: string;
    given_name: string;
    nationality: string;
    country_of_residence: string;
    national_id_number: number;
    document_type: string;
    document_no: string;
    dob: string;
    age: number;
    sex: string;
    travel_date: string;
    direction: string;
    accommodation_address: string;
    note: string | null;
    travel_reason: string;
    border_post: string;
    destination_coming_from: string;
    created_at: string;
    updated_at: string;
}

export interface PageProps {
    [key: string]: unknown;
    auth?: {
        user: {
            id: number;
            name: string;
            email: string;
            avatar?: string;
        } | null;
    };
    errors?: {
        [key: string]: string;
    };
    success?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    }
}

export interface RegistryAuditValues {
    surname?: string;
    given_name?: string;
    nationality?: string;
    country_of_residence?: string;
    national_id_number: number;
    document_type?: string;
    document_no?: string;
    dob?: string;
    age?: number;
    sex?: string;
    travel_date?: string;
    direction?: string;
    accommodation_address?: string;
    note?: string | null;
    travel_reason?: string;
    border_post?: string;
    destination_coming_from?: string;
}
