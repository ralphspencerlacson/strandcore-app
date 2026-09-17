import { test } from 'node:test'
import assert from 'node:assert/strict'
import { conversationReference, conversationSubject } from '../supabase/functions/_shared/conversation.ts'

test('enquiries with identical subjects get separate stable email subjects', () => {
  const first = 'b348e51b-6773-49fc-8418-ed744b863a23'
  const second = '238686e9-15a2-4059-a5e1-f2e0f3e5e0f9'
  const subject = conversationSubject('Project enquiry: web', first)
  assert.equal(subject, 'Re: Project enquiry: web [SC-B348E51B6773]')
  assert.notEqual(subject, conversationSubject('Project enquiry: web', second))
  assert.equal(conversationSubject(subject, first), subject)
  assert.equal(conversationSubject('Re: Re: Project enquiry: web', first), subject)
  assert.equal(conversationSubject(subject, second), 'Re: Project enquiry: web [SC-238686E915A2]')
  assert.ok(subject.includes(conversationReference(first)))
})
