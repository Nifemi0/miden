import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { VoteExplorer, Proposal } from '../components/VoteExplorer';
import * as api from '../lib/api';

// Mock the API call
jest.mock('../lib/api', () => ({
  getProposals: jest.fn(),
}));

const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Test Proposal Active',
    description: 'Description for active proposal',
    status: 'active',
    votingModel: 'token-weighted',
    deadline: '2024-12-31T23:59:59Z',
    quorum: 1000,
    totalVotes: 500,
    choices: [{ option: 'Yes', votes: 500, percentage: 100 }],
    creator: '0x123',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Proposal Passed',
    description: 'Description for passed proposal',
    status: 'passed',
    votingModel: 'quadratic',
    deadline: '2024-11-30T23:59:59Z',
    quorum: 200,
    totalVotes: 200,
    choices: [{ option: 'Approve', votes: 150, percentage: 75 }],
    creator: '0x456',
    createdAt: '2023-12-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Test Proposal Failed',
    description: 'Description for failed proposal',
    status: 'failed',
    votingModel: 'one-person-one-vote',
    deadline: '2024-10-31T23:59:59Z',
    quorum: 300,
    totalVotes: 100,
    choices: [{ option: 'No', votes: 100, percentage: 100 }],
    creator: '0x789',
    createdAt: '2023-11-01T00:00:00Z',
  },
];

describe('VoteExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for successful fetch
    (api.getProposals as jest.Mock).mockResolvedValue(mockProposals);
  });

  it('renders loading state initially', () => {
    (api.getProposals as jest.Mock).mockReturnValueOnce(new Promise(() => {})); // Never resolve
    render(<VoteExplorer isWalletConnected={false} />);
    expect(screen.getByText('Loading proposals...')).toBeInTheDocument();
  });

  it('renders error state if fetching proposals fails', async () => {
    (api.getProposals as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<VoteExplorer isWalletConnected={false} />);
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  it('renders proposals after successful fetch', async () => {
    render(<VoteExplorer isWalletConnected={false} />);
    await waitFor(() => {
      expect(screen.getByText('Test Proposal Active')).toBeInTheDocument();
      expect(screen.getByText('Test Proposal Passed')).toBeInTheDocument();
      expect(screen.getByText('Test Proposal Failed')).toBeInTheDocument();
    });
  });

  it('filters proposals by status when tabs are clicked', async () => {
    render(<VoteExplorer isWalletConnected={false} />);

    // Check initial state (all proposals)
    await waitFor(() => {
      expect(screen.getByText('Test Proposal Active')).toBeInTheDocument();
      expect(screen.getByText('Test Proposal Passed')).toBeInTheDocument();
      expect(screen.getByText('Test Proposal Failed')).toBeInTheDocument();
    });

    // Filter by Active
    fireEvent.click(screen.getByRole('tab', { name: /Active/i }));
    await waitFor(() => {
      expect(screen.getByText('Test Proposal Active')).toBeInTheDocument();
      expect(screen.queryByText('Test Proposal Passed')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Proposal Failed')).not.toBeInTheDocument();
    });

    // Filter by Passed
    fireEvent.click(screen.getByRole('tab', { name: /Passed/i }));
    await waitFor(() => {
      expect(screen.queryByText('Test Proposal Active')).not.toBeInTheDocument();
      expect(screen.getByText('Test Proposal Passed')).toBeInTheDocument();
      expect(screen.queryByText('Test Proposal Failed')).not.toBeInTheDocument();
    });

    // Filter by Failed
    fireEvent.click(screen.getByRole('tab', { name: /Failed/i }));
    await waitFor(() => {
      expect(screen.queryByText('Test Proposal Active')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Proposal Passed')).not.toBeInTheDocument();
      expect(screen.getByText('Test Proposal Failed')).toBeInTheDocument();
    });

    // Filter by All again
    fireEvent.click(screen.getByRole('tab', { name: /All Proposals/i }));
    await waitFor(() => {
      expect(screen.getByText('Test Proposal Active')).toBeInTheDocument();
      expect(screen.getByText('Test Proposal Passed')).toBeInTheDocument();
      expect(screen.getByText('Test Proposal Failed')).toBeInTheDocument();
    });
  });

  it('renders "No proposals found." when no proposals are returned', async () => {
    (api.getProposals as jest.Mock).mockResolvedValueOnce([]);
    render(<VoteExplorer isWalletConnected={false} />);
    await waitFor(() => {
      expect(screen.getByText('No proposals found.')).toBeInTheDocument();
    });
  });
});
