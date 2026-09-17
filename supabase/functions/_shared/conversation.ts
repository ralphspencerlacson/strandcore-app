export function conversationReference(id: string) {
  return `SC-${id.replace(/-/g, '').slice(0, 12).toUpperCase()}`
}

export function conversationSubject(subject: string, id: string) {
  const reference = `[${conversationReference(id)}]`
  const base = subject.replace(/^(?:\s*re:\s*)+/i, '').replace(/\s*\[SC-[A-F0-9]{12}\]/gi, '').trim()
  return `Re: ${base} ${reference}`
}
