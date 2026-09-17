import { test } from 'node:test'
import assert from 'node:assert/strict'
import worker from '../worker/index.ts'
import { budgetOptions, budgetLabel } from '../src/data/budgets.ts'

test('country selects PHP only in the Philippines, with uncached responses', async () => {
  for (const [country, market] of [['PH', 'ph'], ['US', 'international'], ['AU', 'international'], [undefined, 'international']]) {
    const request = new Request('https://strandcore.example/api/location')
    Object.defineProperty(request, 'cf', { value: { country } })
    const response = await worker.fetch(request, {})
    assert.equal((await response.json()).market, market)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
  }
})

test('location route rejects mutations and preserves asset routing', async () => {
  assert.equal((await worker.fetch(new Request('https://example.com/api/location', { method: 'POST' }), {})).status, 405)
  const response = await worker.fetch(new Request('https://example.com/contact'), { ASSETS: { fetch: async () => new Response('app') } })
  assert.equal(await response.text(), 'app')
})

test('both markets retain the requested ranges and distinct currency identifiers', () => {
  assert.deepEqual(budgetOptions.ph.map(option => option.label), ['Under ₱50k', '₱50k – ₱100k', '₱100k – ₱400k', 'Over ₱400k', 'Not sure yet — help me scope it'])
  assert.deepEqual(budgetOptions.international.map(option => option.label), ['Under $2,500', '$2,500 – $6,000', '$6,000 – $15,000', 'Over $15,000', 'Not sure yet — help me scope it'])
  assert.match(budgetLabel('ph-50k-100k'), /^PHP/)
  assert.match(budgetLabel('intl-2500-6000'), /^USD/)
})
