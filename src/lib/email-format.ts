// Display-only: retain the original body, including signatures and quoted text.
export function splitEmailBody(body: string) {
  const normalized = body.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')
  const quoteStart = lines.findIndex((line, index) => {
    if (/^\s*>/.test(line)) return true
    if (/^On\s/i.test(line)) {
      // Gmail often wraps the sender/date header onto multiple lines.
      for (let end = index; end < Math.min(index + 5, lines.length); end++) {
        if (/wrote:\s*$/i.test(lines[end])) {
          return lines.slice(end + 1).find(value => value.trim())?.trimStart().startsWith('>') === true
        }
        if (!lines[end].trim()) break
      }
    }
    return /^\s*-{3,}\s*Original Message\s*-{3,}\s*$/i.test(line)
      && /^From:/im.test(lines.slice(index + 1, index + 5).join('\n'))
  })
  // Do not collapse the entire message if it contains only a quotation.
  if (quoteStart < 1 || !lines.slice(0, quoteStart).join('\n').trim()) return { content: normalized, quoted: '' }
  return { content: lines.slice(0, quoteStart).join('\n').trimEnd(), quoted: lines.slice(quoteStart).join('\n') }
}
