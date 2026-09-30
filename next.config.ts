import type { NextConfig } from 'next';
// Sites serves the generated `out` directory, so every production build must
// refresh the static export instead of leaving an older deployment bundle.
const nextConfig: NextConfig = {outputFileTracingRoot:process.cwd(),output:'export',images:{unoptimized:true}};
export default nextConfig;
