import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fieldError, sendContactMessage } from '../../app/utils/contact-form'

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }))
vi.mock('@emailjs/browser', () => ({ send: sendMock }))

const config = { serviceId: 'svc', templateId: 'tpl', publicKey: 'pk' }

beforeEach(() => {
  sendMock.mockReset()
  sendMock.mockResolvedValue({ status: 200, text: 'OK' })
})

describe('fieldError', () => {
  it('returns v11 copy', () => {
    expect(fieldError('name', '')).toBe('Enter your name')
    expect(fieldError('name', '   ')).toBe('Enter your name')
    expect(fieldError('email', '')).toBe('Enter your email address')
    expect(fieldError('email', 'a@b')).toBe('Enter a valid email address, like name@example.com')
    expect(fieldError('email', ' a@b.co ')).toBe('')
    expect(fieldError('subject', '')).toBe('Enter a subject')
    expect(fieldError('message', '')).toBe('Enter a message')
    expect(fieldError('message', 'Hi')).toBe('')
  })
})

describe('sendContactMessage', () => {
  it('sends exactly the four template params, trimmed', async () => {
    await sendContactMessage(
      { name: ' Ada ', email: ' ada@example.com ', subject: ' Hi ', message: ' Hello ' },
      config,
    )
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith(
      'svc',
      'tpl',
      { name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello' },
      { publicKey: 'pk' },
    )
    expect(Object.keys(sendMock.mock.calls[0]![2]).sort()).toEqual(['email', 'message', 'name', 'subject'])
  })

  it('rejects without loading the SDK when config is missing', async () => {
    const fields = { name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello' }
    for (const key of ['serviceId', 'templateId', 'publicKey'] as const) {
      await expect(sendContactMessage(fields, { ...config, [key]: '' })).rejects.toThrow('EmailJS config missing')
    }
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('passes an SDK rejection through', async () => {
    const failure = { status: 400, text: 'bad' }
    sendMock.mockRejectedValueOnce(failure)
    const fields = { name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello' }
    await expect(sendContactMessage(fields, config)).rejects.toBe(failure)
  })
})
