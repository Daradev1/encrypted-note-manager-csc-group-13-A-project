// src/encryption.rs
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use rand::RngCore;

// Let's use an array literal with exact bytes - this is GUARANTEED to be 32 bytes
const ENCRYPTION_KEY: [u8; 32] = [
    b'm', b'y', b'-', b'3', b'2', b'-', b'b', b'y', b't', b'e', b'-',
    b'k', b'e', b'y', b'-', b'f', b'o', b'r', b'-', b'a', b'e', b's',
    b'-', b'2', b'5', b'6', b'!', b'!', b'1', b'2', b'3', b'4'
];

pub struct Encryption;

impl Encryption {
    // Encrypt a string and return (ciphertext_base64, iv_base64)
    pub fn encrypt(plaintext: &str) -> Result<(String, String), String> {
        // Create cipher instance using the array
        let cipher = Aes256Gcm::new_from_slice(&ENCRYPTION_KEY)
            .map_err(|e| format!("Failed to create cipher: {}", e))?;
        
        // Generate random IV (12 bytes for AES-GCM)
        let mut iv = [0u8; 12];
        OsRng.fill_bytes(&mut iv);
        let nonce = Nonce::from_slice(&iv);
        
        // Encrypt
        let ciphertext = cipher
            .encrypt(nonce, plaintext.as_bytes())
            .map_err(|e| format!("Encryption failed: {}", e))?;
        
        // Encode to Base64
        let ciphertext_b64 = BASE64.encode(&ciphertext);
        let iv_b64 = BASE64.encode(iv);
        
        Ok((ciphertext_b64, iv_b64))
    }
    
    // Decrypt a string using ciphertext and iv (both base64)
    pub fn decrypt(ciphertext_b64: &str, iv_b64: &str) -> Result<String, String> {
        // Create cipher instance using the array
        let cipher = Aes256Gcm::new_from_slice(&ENCRYPTION_KEY)
            .map_err(|e| format!("Failed to create cipher: {}", e))?;
        
        // Decode from Base64
        let ciphertext = BASE64.decode(ciphertext_b64)
            .map_err(|e| format!("Failed to decode ciphertext: {}", e))?;
        let iv = BASE64.decode(iv_b64)
            .map_err(|e| format!("Failed to decode iv: {}", e))?;
        
        let nonce = Nonce::from_slice(&iv);
        
        // Decrypt
        let plaintext = cipher
            .decrypt(nonce, ciphertext.as_ref())
            .map_err(|e| format!("Decryption failed: {}", e))?;
        
        String::from_utf8(plaintext)
            .map_err(|e| format!("Failed to convert to string: {}", e))
    }
}