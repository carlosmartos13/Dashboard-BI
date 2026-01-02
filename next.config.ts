import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/pt_BR/empresas/config',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(pt_BR|en)',
        destination: '/:lang/empresas/config',
        permanent: true,
        locale: false
      },
      {
        source: '/:path((?!|pt_BR|en|front-pages|images|api|favicon.ico).*)*',
        destination: '/pt_BR/:path*',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
