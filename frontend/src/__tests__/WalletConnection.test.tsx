import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletConnection } from '../components/WalletConnection';

describe('WalletConnection', () => {
  it('renders the connect button when not connected', () => {
    render(<WalletConnection isConnected={false} onConnect={() => {}} onDisconnect={() => {}} />);
    expect(screen.getByText('Connect Miden Wallet')).toBeInTheDocument();
  });

  it('renders the disconnect button when connected', () => {
    render(<WalletConnection isConnected={true} onConnect={() => {}} onDisconnect={() => {}} />);
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
  });

  it('calls the onConnect function when the connect button is clicked', () => {
    const onConnect = jest.fn();
    render(<WalletConnection isConnected={false} onConnect={onConnect} onDisconnect={() => {}} />);
    fireEvent.click(screen.getByText('Connect Miden Wallet'));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('calls the onDisconnect function when the disconnect button is clicked', () => {
    const onDisconnect = jest.fn();
    render(<WalletConnection isConnected={true} onConnect={() => {}} onDisconnect={onDisconnect} />);
    fireEvent.click(screen.getByText('Disconnect'));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});
