import type { NextConfig } from 'next';
const nextConfig: NextConfig = { outputFileTracingRoot: process.cwd(), ...(process.env.SITES_EXPORT==='1'?{output:'export' as const,images:{unoptimized:true}}:{}) };
export default nextConfig;
