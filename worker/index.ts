type AssetBinding = { fetch: (request: Request) => Promise<Response> }

export default {
  async fetch(request: Request & { cf?: { country?: string } }, env: { ASSETS: AssetBinding }) {
    if (new URL(request.url).pathname === '/api/location') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 })
      const country = request.cf?.country || null
      return Response.json({ country, market: country === 'PH' ? 'ph' : 'international' }, {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }
    return env.ASSETS.fetch(request)
  },
}
