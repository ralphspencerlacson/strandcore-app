import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitEmailBody } from '../src/lib/email-format.ts'

test('collapses Gmail history without losing it', () => {
  const body = 'Hello,\r\n\r\nHere are the details.\r\n\r\nOn Thu, Sep 17, Strandcore wrote:\r\n> Previous reply'
  assert.deepEqual(splitEmailBody(body), { content: 'Hello,\n\nHere are the details.', quoted: 'On Thu, Sep 17, Strandcore wrote:\n> Previous reply' })
})
test('preserves ordinary text, signatures and quote-only messages', () => {
  for (const body of ['Thanks\n\nRegards,\nAlex', '> Only quoted content', 'On Thursday I wrote:\nNew text', '<script>alert(1)</script>']) {
    assert.deepEqual(splitEmailBody(body), { content: body, quoted: '' })
  }
})
test('recognizes Outlook history and inline quotation', () => {
  assert.equal(splitEmailBody('Hello\n\n-----Original Message-----\nFrom: Alex\nOld text').content, 'Hello')
  assert.equal(splitEmailBody('Answer\n> Question\nMore context').quoted, '> Question\nMore context')
})

test('collapses wrapped Gmail attribution with nested history', () => {
  const body = 'thank you\n\nOn Thu, Sep 17, 2026 at 8:48 PM Ralph <ralph@example.com>\nwrote:\n\n> hello\n>\n> On Thu, Strandcore wrote:\n>> test'
  const result = splitEmailBody(body)
  assert.equal(result.content, 'thank you')
  assert.ok(result.quoted.startsWith('On Thu,'))
  assert.ok(result.quoted.endsWith('>> test'))
})
