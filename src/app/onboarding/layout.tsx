'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
            if (!isLoggedIn) {
                router.replace('/login?error=Please login first to access this page');
            } else {
                setAuthorized(true);
            }
        };
        checkAuth();
    }, [router]);

    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}
