import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProposalForm } from '../components/ProposalForm';
import { toast } from 'sonner';

describe('ProposalForm', () => {
  const mockOnBack = jest.fn();
  let toastErrorSpy: jest.SpyInstance;
  let toastSuccessSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    toastErrorSpy = jest.spyOn(toast, 'error');
    toastSuccessSpy = jest.spyOn(toast, 'success');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    toastErrorSpy.mockRestore();
    toastSuccessSpy.mockRestore();
  });

  it('renders the form fields correctly', () => {
    render(<ProposalForm onBack={mockOnBack} />);

    expect(screen.getByLabelText(/Proposal Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText('Select voting model')).toBeInTheDocument();
    expect(screen.getByLabelText(/Minimum Quorum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Voting Deadline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Choice 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Choice 2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Proposal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('calls onBack when the Back button is clicked', () => {
    render(<ProposalForm onBack={mockOnBack} />);
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when the Cancel button is clicked', () => {
    render(<ProposalForm onBack={mockOnBack} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it.skip('shows error toast if required fields are not filled on submit', async () => {
    render(<ProposalForm onBack={mockOnBack} />);
    fireEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));
    jest.runAllTimers();

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Please fill in all required fields');
    });
    expect(mockOnBack).not.toHaveBeenCalled();
  });

  it('allows adding and removing choices', () => {
    render(<ProposalForm onBack={mockOnBack} />);
    const addChoiceButton = screen.getByRole('button', { name: /Add Choice/i });

    // Add a choice
    fireEvent.click(addChoiceButton);
    expect(screen.getByLabelText(/Choice 3/i)).toBeInTheDocument();

    // Remove a choice
    const removeButtons = screen.getAllByRole('button', { name: /Remove choice/i });
    fireEvent.click(removeButtons[0]); // Click the first remove button
    expect(screen.queryByLabelText(/Choice 3/i)).not.toBeInTheDocument();
  });

  it.skip('submits the form successfully when all fields are filled', async () => {
    render(<ProposalForm onBack={mockOnBack} />);

    fireEvent.change(screen.getByLabelText(/Proposal Title/i), { target: { value: 'Test Proposal' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'This is a test description.' } });
    
    // Select voting model
    fireEvent.click(screen.getByText('Select voting model'));
    fireEvent.click(screen.getByRole('option', { name: 'Token Weighted' }));

    fireEvent.change(screen.getByLabelText(/Minimum Quorum/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Voting Deadline/i), { target: { value: '2024-12-31T23:59' } });
    fireEvent.change(screen.getByLabelText(/Choice 1/i), { target: { value: 'Option A' } });
    fireEvent.change(screen.getByLabelText(/Choice 2/i), { target: { value: 'Option B' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));
    jest.runAllTimers();

    await waitFor(() => {
      expect(toastSuccessSpy).toHaveBeenCalledWith('Proposal created successfully!');
    });
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
