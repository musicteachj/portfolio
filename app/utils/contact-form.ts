export type ContactFieldKey = 'name' | 'email' | 'subject' | 'message'
export type ContactFields = Record<ContactFieldKey, string>

export interface EmailJsConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

// Also the order used to focus the first invalid field.
export const CONTACT_FIELD_KEYS: readonly ContactFieldKey[] = ['name', 'email', 'subject', 'message']

const REQUIRED_COPY: Record<ContactFieldKey, string> = {
  name: 'Enter your name',
  email: 'Enter your email address',
  subject: 'Enter a subject',
  message: 'Enter a message',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns the error copy for a field, or an empty string when the value is valid. */
export function fieldError(key: ContactFieldKey, value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return REQUIRED_COPY[key]
  if (key === 'email' && !EMAIL_PATTERN.test(trimmed)) {
    return 'Enter a valid email address, like name@example.com'
  }
  return ''
}

/**
 * Sends the message through EmailJS. The SDK is loaded on demand so it stays out of the
 * initial bundle. Rejects with whatever the SDK rejects with.
 */
export async function sendContactMessage(fields: ContactFields, config: EmailJsConfig): Promise<void> {
  if (!config.serviceId || !config.templateId || !config.publicKey) {
    throw new Error('EmailJS config missing')
  }
  const { send } = await import('@emailjs/browser')
  await send(
    config.serviceId,
    config.templateId,
    {
      name: fields.name.trim(),
      email: fields.email.trim(),
      subject: fields.subject.trim(),
      message: fields.message.trim(),
    },
    { publicKey: config.publicKey },
  )
}
