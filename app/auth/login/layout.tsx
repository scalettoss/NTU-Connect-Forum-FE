import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
    title: 'NTU Connect',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <link rel="stylesheet" href="/css/auth-style-1.css" />
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
            />
            {children}
            <Script src="/js/auth-script.js" />
        </div>
    )
}
