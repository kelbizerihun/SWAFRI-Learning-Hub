/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

module.exports = {
  reactStrictMode: true,
  // The browser calls /api/*, and Next.js proxies it to the Express API: one origin, no CORS setup.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }];
  },
};
