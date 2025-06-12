import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Skip checking for the login page, unauthorized page, and APIs
    if (
        request.nextUrl.pathname === '/admin/login' ||
        request.nextUrl.pathname === '/admin/unauthorized' ||
        request.nextUrl.pathname.startsWith('/api/')
    ) {
        return NextResponse.next();
    }

    // Check if the request is for an admin page
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Get the token from the cookie
        const token = request.cookies.get('adminAccessToken')?.value;

        // If no token, redirect to login
        if (!token) {
            console.log('No admin token found, redirecting to login');
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            // Decode the token
            const decodedToken = jwtDecode<{
                UserId?: number;
                userId?: number;
                Email?: string;
                email?: string;
                RoleName?: string;
                roleName?: string;
                exp: number;
            }>(token);

            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp <= currentTime) {
                console.log('Admin token expired, redirecting to login');
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }

            // Get the role from the token
            const role = decodedToken.RoleName || decodedToken.roleName;

            // Check if user has admin or moderator role
            if (role !== 'admin' && role !== 'moderator') {
                console.log('User does not have admin/moderator role, redirecting to unauthorized');
                return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
            }

            // If all checks pass, allow the request to proceed
            return NextResponse.next();
        } catch (error) {
            console.error('Error decoding admin token:', error);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // For non-admin routes, allow the request to proceed
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        // Match all admin routes
        '/admin/:path*',
        // Skip API routes and static files
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 