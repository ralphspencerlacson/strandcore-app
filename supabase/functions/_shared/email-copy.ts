export const conversationCc = (recipient: string) =>
  recipient.toLowerCase() === 'inquire@strandcore.tech' ? [] : ['inquire@strandcore.tech']

export function submissionConfirmation(name: string, brief: string) {
  return `Hi ${name},\n\nThanks for reaching out to Strandcore. We have received your project brief and will reply within one business day.\n\nYour brief:\n${brief}\n\nYou can reply to this email with any additional details. Use Reply all to keep inquire@strandcore.tech included.\n\nBest,\nStrandcore`
}
