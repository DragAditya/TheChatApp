import {
  formatMessageTime,
  formatFileSize,
  isValidEmail,
  generateAvatarColor,
  encryptMessage,
  decryptMessage,
  generateKeyPair,
} from '@/utils';

describe('Utility Functions', () => {
  describe('formatMessageTime', () => {
    it('should format time correctly for today', () => {
      const today = new Date().toISOString();
      const result = formatMessageTime(today);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = formatMessageTime(yesterday.toISOString());
      expect(result).toBe('Yesterday');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('generateAvatarColor', () => {
    it('should generate consistent colors for the same input', () => {
      const userId = 'test-user-id';
      const color1 = generateAvatarColor(userId);
      const color2 = generateAvatarColor(userId);
      expect(color1).toBe(color2);
    });

    it('should generate different colors for different inputs', () => {
      const color1 = generateAvatarColor('user1');
      const color2 = generateAvatarColor('user2');
      expect(color1).not.toBe(color2);
    });
  });

  describe('Crypto Functions', () => {
    beforeEach(() => {
      // Mock crypto.subtle methods
      global.crypto.subtle.generateKey = jest.fn().mockResolvedValue({
        publicKey: 'mock-public-key',
        privateKey: 'mock-private-key',
      });
      
      global.crypto.subtle.encrypt = jest.fn().mockResolvedValue(
        new ArrayBuffer(8)
      );
      
      global.crypto.subtle.decrypt = jest.fn().mockResolvedValue(
        new TextEncoder().encode('decrypted message')
      );
    });

    it('should generate key pair', async () => {
      const keyPair = await generateKeyPair();
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
    });

    it('should encrypt and decrypt messages', async () => {
      const message = 'test message';
      const keyPair = await generateKeyPair();
      
      const encrypted = await encryptMessage(message, keyPair.publicKey as CryptoKey);
      expect(typeof encrypted).toBe('string');
      
      const decrypted = await decryptMessage(encrypted, keyPair.privateKey as CryptoKey);
      expect(decrypted).toBe('decrypted message');
    });
  });
});