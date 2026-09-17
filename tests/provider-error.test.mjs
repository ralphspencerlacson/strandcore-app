import { test } from 'node:test'
import assert from 'node:assert/strict'
import { providerErrorMessage } from '../supabase/functions/_shared/provider-error.ts'

test('provider errors identify the rejection and remove credentials', () => {
  assert.equal(providerErrorMessage(403, { message: 'The sending domain is not verified.' }, 'secret'),
    'Resend rejected the request (HTTP 403): The sending domain is not verified.')
  const redacted = providerErrorMessage(401, { message: 'Bad key secret and re_otherKey123' }, 'secret')
  assert.ok(!redacted.includes('secret'))
  assert.ok(!redacted.includes('re_otherKey123'))
  assert.match(providerErrorMessage(500, null, 'secret'), /No error details returned/)
  assert.match(providerErrorMessage(500, { message: {} }, 'secret'), /No error details returned/)
})
