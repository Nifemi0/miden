import { vi } from 'vitest';

export const useWallet = vi.fn(() => ({
  connected: false,
  publicKey: null,
  connect: vi.fn(),
  disconnect: vi.fn(),
  signMessage: vi.fn(),
  sendTransaction: vi.fn(),
}));