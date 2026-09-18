import { test } from 'node:test'
import assert from 'node:assert/strict'
import { conversationCc, submissionConfirmation } from '../supabase/functions/_shared/email-copy.ts'

test('submission and reply CC includes the team without duplicating a primary recipient', () => {
  assert.deepEqual(conversationCc('client@example.com'), ['inquire@strandcore.tech'])
  assert.deepEqual(conversationCc('INQUIRE@strandcore.tech'), [])
  const text = submissionConfirmation('James', 'Build a portal.\nInclude reporting.')
  assert.ok(text.startsWith('Hi James,'))
  assert.ok(text.includes('Build a portal.\nInclude reporting.'))
  assert.ok(text.includes('Reply all'))
})
