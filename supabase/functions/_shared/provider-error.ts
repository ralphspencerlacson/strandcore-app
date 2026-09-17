export function providerErrorMessage(status: number, payload: unknown, apiKey: string) {
  const message = payload && typeof payload === 'object' && 'message' in payload
    && typeof payload.message === 'string' ? payload.message : 'No error details returned.'
  // Provider diagnostics can include request values; never return the API credential.
  const safe = (apiKey ? message.split(apiKey).join('[redacted]') : message)
    .replace(/\bre_[A-Za-z0-9_-]+/g, '[redacted]')
    .slice(0, 600)
  return `Resend rejected the request (HTTP ${status}): ${safe}`
}
