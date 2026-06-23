// This service simulates what Rust will do
// It helps us test the flow before actual Rust backend

export interface EncryptedData {
  ciphertext: string
  iv: string
  tag?: string // Authentication tag for AES-GCM
}

class EncryptionService {
  // Simulate AES-256-GCM encryption (what Rust will do)
  async encrypt(text: string): Promise<EncryptedData> {
    // This simulates Rust encryption
    // In production, this happens in Rust backend
    return {
      ciphertext: btoa(text), // Base64 encode (simplified)
      iv: this.generateIv(),
      tag: this.generateAuthTag(),
    }
  }

  // Simulate decryption (what Rust will do when sending back)
  async decrypt(encrypted: EncryptedData): Promise<string> {
    // This simulates Rust decryption
    // In production, Rust sends back decrypted text
    return atob(encrypted.ciphertext)
  }

  // Generate random IV (same as Rust)
  private generateIv(): string {
    const iv = new Uint8Array(12) // 96 bits for AES-GCM
    crypto.getRandomValues(iv)
    return Array.from(iv)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Generate auth tag (simulated)
  private generateAuthTag(): string {
    const tag = new Uint8Array(16) // 128 bits for authentication
    crypto.getRandomValues(tag)
    return Array.from(tag)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Hash note ID for lookup (what Rust might do)
  hashNoteId(id: string): string {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

export const encryptionService = new EncryptionService()