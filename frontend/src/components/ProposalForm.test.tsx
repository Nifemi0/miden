import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ProposalForm } from './ProposalForm';
import { useWallet } from '@demox-labs/miden-wallet-adapter-react';
import { createProposal } from '../api';
import { toast } from 'sonner';
import { vi } from 'vitest';

// Explicitly mock modules
vi.mock('@demox-labs/miden-wallet-adapter-react');
vi.mock('../api');
vi.mock('sonner');

const mockOnBack = vi.fn();
let mockSignMessage: ReturnType<typeof vi.fn>;
let mockCreateProposal: ReturnType<typeof vi.fn>;
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

describe('ProposalForm', () => {
  let mockPublicKey: { toBase58: () => string };

  beforeEach(() => {
    // Reset mocks before each test
    (useWallet as vi.Mock).mockReset();
    (createProposal as vi.Mock).mockReset();
    mockOnBack.mockReset();
    mockToastError.mockReset();
    mockToastSuccess.mockReset();

    mockSignMessage = vi.fn();
    mockCreateProposal = vi.fn();
    mockPublicKey = { toBase58: () => '0xCONNECTED_WALLET' };

    // Default mock for useWallet (disconnected)
    (useWallet as vi.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
      signMessage: mockSignMessage,
    });

    // Default mock for API calls
    (createProposal as vi.Mock).mockResolvedValue({});

    // Mock toast functions
    (toast.error as vi.Mock) = mockToastError;
    (toast.success as vi.Mock) = mockToastSuccess;
  });

  it('renders the form correctly', () => {
    render(<ProposalForm onBack={mockOnBack} />);
    expect(screen.getByLabelText(/Proposal Title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Proposal/i })).toBeInTheDocument();
  });

  it('shows error toast if wallet is not connected on submit', async () => {
    render(<ProposalForm onBack={mockOnBack} />);

    fireEvent.change(screen.getByLabelText(/Proposal Title \*/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Voting Model \*/i }), { target: { value: 'token-weighted' } });
    fireEvent.change(screen.getByLabelText(/Minimum Quorum \*/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Voting Deadline \*/i), { target: { value: '2025-12-31T23:59' } });
    fireEvent.change(screen.getByLabelText(/Choice 1/i), { target: { value: 'Yes' } });
    fireEvent.change(screen.getByLabelText(/Choice 2/i), { target: { value: 'No' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Please connect your Miden wallet to create a proposal');
    }, { timeout: 2000 });
    expect(mockCreateProposal).not.toHaveBeenCalled();
  });

  it('shows error toast if required fields are missing on submit', async () => {
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: { toBase58: () => '0xCONNECTED_WALLET' },
      signMessage: mockSignMessage,
    });

    render(<ProposalForm onBack={mockOnBack} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Please fill in all required fields');
    });
    expect(mockCreateProposal).not.toHaveBeenCalled();
  });

  it('successfully creates a proposal when all conditions are met', async () => {
    mockSignMessage.mockResolvedValue(new Uint8Array([1, 2, 3]));
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
      signMessage: mockSignMessage,
    });

    render(<ProposalForm onBack={mockOnBack} />);

    fireEvent.change(screen.getByLabelText(/Proposal Title \*/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Voting Model \*/i }), { target: { value: 'token-weighted' } });
    fireEvent.change(screen.getByLabelText(/Minimum Quorum \*/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Voting Deadline \*/i), { target: { value: '2025-12-31T23:59' } });
    fireEvent.change(screen.getByLabelText(/Choice 1/i), { target: { value: 'Yes' } });
    fireEvent.change(screen.getByLabelText(/Choice 2/i), { target: { value: 'No' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

    await waitFor(() => {
      expect(mockSignMessage).toHaveBeenCalledWith(new TextEncoder().encode('Create proposal: Test Title'));
      expect(mockCreateProposal).toHaveBeenCalledWith({
        title: 'Test Title',
        description: 'Test Description',
        voting_model: 'token-weighted',
        quorum: 100,
        deadline: '2025-12-31T23:59',
        choices: ['Yes', 'No'],
        proposer_wallet_address: '0xCONNECTED_WALLET',
        signature: expect.any(String),
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('Proposal created successfully!');
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast if proposal creation fails', async () => {
    mockSignMessage.mockResolvedValue(new Uint8Array([1, 2, 3]));
    (useWallet as vi.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
      signMessage: mockSignMessage,
    });
    (createProposal as vi.Mock).mockRejectedValue(new Error('API Error'));

    render(<ProposalForm onBack={mockOnBack} />);

    fireEvent.change(screen.getByLabelText(/Proposal Title \*/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Voting Model \*/i }), { target: { value: 'token-weighted' } });
    fireEvent.change(screen.getByLabelText(/Minimum Quorum \*/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Voting Deadline \*/i), { target: { value: '2025-12-31T23:59' } });
    fireEvent.change(screen.getByLabelText(/Choice 1/i), { target: { value: 'Yes' } });
    fireEvent.change(screen.getByLabelText(/Choice 2/i), { target: { value: 'No' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to create proposal');
    });
    expect(mockOnBack).not.toHaveBeenCalled();
  });
});