import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const SALT_ROUNDS = 12

export function generateApiKey(): { raw: string; prefix: string } {
  const raw = `fl-${crypto.randomBytes(24).toString('hex')}`
  const prefix = raw.substring(0, 10) // "fl-" + 7 chars
  return { raw, prefix }
}

export async function hashApiKey(raw: string): Promise<string> {
  return bcrypt.hash(raw, SALT_ROUNDS)
}

export async function verifyApiKey(raw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(raw, hash)
}

export function encryptString(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-padded-xxxx', 'utf8').slice(0, 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptString(encryptedText: string): string {
  const [ivHex, encHex] = encryptedText.split(':')
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-padded-xxxx', 'utf8').slice(0, 32)
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
