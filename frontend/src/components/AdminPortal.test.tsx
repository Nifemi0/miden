import { render, screen, fireEvent } from '@testing-library/react';
import { AdminPortal } from './AdminPortal';
import { useWallet } from '@demox-labs/miden-wallet-adapter-react';
import { vi } from 'vitest';

// Explicitly mock the module
vi.mock('@demox-labs/miden-wallet-adapter-react');

// Mock child components to isolate AdminPortal
vi.mock('./ProposalForm', () => ({
  ProposalForm: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="proposal-form">
      Proposal Form
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));
vi.mock('./ProposalManagement', () => ({
  ProposalManagement: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="proposal-management">
      Proposal Management
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));
vi.mock('./GovernanceSettings', () => ({
  GovernanceSettings: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="governance-settings">
      Governance Settings
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

describe('AdminPortal', () => {
  beforeEach(() => {
    // Reset mock before each test
    (useWallet as vi.Mock).mockReset();
  });

  it('renders connect wallet message when not connected', () => {
    (useWallet as vi.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      sendTransaction: vi.fn(),
    });

    render(<AdminPortal />);
    expect(screen.getByRole('heading', { name: /Connect Wallet Required/i })).toBeInTheDocument();
  });

  it('renders admin portal overview when connected', () => {
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: { toBase58: () => '0xCONNECTED_WALLET' },
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      sendTransaction: vi.fn(),
    });

    render(<AdminPortal />);
    expect(screen.getByRole('heading', { name: /Admin Portal/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Create Proposal/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Manage Proposals/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Governance Settings/i })).toBeInTheDocument();
  });

  it('navigates to Create Proposal section', async () => {
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: { toBase58: () => '0xCONNECTED_WALLET' },
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      sendTransaction: vi.fn(),
    });

    render(<AdminPortal />);
    fireEvent.click(screen.getByRole('heading', { name: /Create Proposal/i }));
    expect(screen.getByTestId('proposal-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByRole('heading', { name: /Admin Portal/i })).toBeInTheDocument();
  });

  it('navigates to Manage Proposals section', async () => {
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: { toBase58: () => '0xCONNECTED_WALLET' },
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      sendTransaction: vi.fn(),
    });

    render(<AdminPortal />);
    fireEvent.click(screen.getByRole('heading', { name: /Manage Proposals/i }));
    expect(screen.getByTestId('proposal-management')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByRole('heading', { name: /Admin Portal/i })).toBeInTheDocument();
  });

  it('navigates to Governance Settings section', async () => {
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: { toBase58: () => '0xCONNECTED_WALLET' },
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      sendTransaction: vi.fn(),
    });

    render(<AdminPortal />);
    fireEvent.click(screen.getByRole('heading', { name: /Governance Settings/i }));
    expect(screen.getByTestId('governance-settings')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByRole('heading', { name: /Admin Portal/i })).toBeInTheDocument();
  });
});