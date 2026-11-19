export type ContactFieldKey = 'name' | 'email' | 'subject' | 'message'
export type ContactFields = Record<ContactFieldKey, string>

interface EmailJsConfig {
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

// Generous for a person, and far below what EmailJS accepts for one send, so a long
// message gets a clear error here instead of a failed send that blames the connection.
// 254 is the longest valid email address.
export const CONTACT_MAX_LENGTH: Readonly<Record<ContactFieldKey, number>> = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
}

const FIELD_NOUN: Record<ContactFieldKey, string> = {
  name: 'your name',
  email: 'your email address',
  subject: 'the subject',
  message: 'your message',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const count = (n: number) => n.toLocaleString('en-US')

/** Returns the error copy for a field, or an empty string when the value is valid. */
export function fieldError(key: ContactFieldKey, value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return REQUIRED_COPY[key]
  const max = CONTACT_MAX_LENGTH[key]
  if (trimmed.length > max) {
    const copy = `Shorten ${FIELD_NOUN[key]} to ${count(max)} characters or fewer`
    // The message is the one field long enough that the reader needs the current count.
    return key === 'message' ? `${copy}. It has ${count(trimmed.length)}.` : copy
  }
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
