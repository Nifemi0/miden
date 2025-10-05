import { render, screen, fireEvent } from '@testing-library/react';
import { WalletConnection } from './WalletConnection';
import { useWallet } from '@demox-labs/miden-wallet-adapter-react';
import { vi } from 'vitest';

// Explicitly mock the module
vi.mock('@demox-labs/miden-wallet-adapter-react');

describe('WalletConnection', () => {
  beforeEach(() => {
    // Reset mock before each test
    (useWallet as vi.Mock).mockReset();
  });

  it('renders connect button when not connected', () => {
    (useWallet as vi.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<WalletConnection />);
    expect(screen.getByRole('button', { name: /Connect Miden Wallet/i })).toBeInTheDocument();
    expect(screen.queryByText(/Connected/i)).not.toBeInTheDocument();
  });

  it('renders connected state with public key when connected', () => {
    const mockPublicKey = { toBase58: () => '0x1234567890abcdef1234567890abcdef12345678' };
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<WalletConnection />);
    expect(screen.getByText(/Connected/i)).toBeInTheDocument();
    expect(screen.getByText(/0x1234...5678/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Disconnect/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Connect Miden Wallet/i })).not.toBeInTheDocument();
  });

  it('calls connect when connect button is clicked', () => {
    const mockConnect = vi.fn();
    (useWallet as vi.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
      connect: mockConnect,
      disconnect: vi.fn(),
    });

    render(<WalletConnection />);
    fireEvent.click(screen.getByRole('button', { name: /Connect Miden Wallet/i }));
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('calls disconnect when disconnect button is clicked', () => {
    const mockDisconnect = vi.fn();
    const mockPublicKey = { toBase58: () => '0x1234567890abcdef1234567890abcdef12345678' };
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
      connect: vi.fn(),
      disconnect: mockDisconnect,
    });

    render(<WalletConnection />);
    fireEvent.click(screen.getByRole('button', { name: /Disconnect/i }));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});