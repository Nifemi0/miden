import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Wallet, LogOut } from 'lucide-react'
import { useWallet } from '@demox-labs/miden-wallet-adapter-react'
import { toast } from 'sonner'
import { login } from '../api'

interface WalletConnectionProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
  onLoginSuccess: (role: string) => void
  onLogout: () => void
}

export function WalletConnection({ isConnected, onConnect, onDisconnect, onLoginSuccess, onLogout }: WalletConnectionProps) {
  const { connected, publicKey, signMessage } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const formatAddress = (address: string | null) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleConnectAndLogin = async () => {
    if (!connected) {
      onConnect(); // Trigger wallet connection
      return;
    }

    if (!publicKey) {
      toast.error('Wallet public key not available');
      return;
    }

    setIsLoading(true);
    try {
      const message = 'Authenticate with Miden DAO Portal';
      const signature = await signMessage(new TextEncoder().encode(message));

      const authResponse = await login(publicKey.toBase58(), signature.toString());
      if (authResponse.token) {
        localStorage.setItem('jwt_token', authResponse.token);
        // Assuming the login response also contains the user's role
        // For now, we'll hardcode a 'user' role or derive it from the token if possible
        // In a real app, the backend would return the role.
        onLoginSuccess('user'); // Replace 'user' with actual role from authResponse
        toast.success('Successfully logged in!');
      } else {
        toast.error('Login failed: No token received.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Failed to log in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectAndLogout = () => {
    onDisconnect();
    onLogout();
    localStorage.removeItem('jwt_token');
    toast.info('Logged out.');
  };

  if (connected) {
    return (
      <div className="flex items-center space-x-3">
        <Badge className="bg-emerald-500 text-white border-emerald-600 shadow-sm">
          <Wallet className="h-3 w-3 mr-1" />
          Connected
        </Badge>
        <span className="text-sm text-white/80">{formatAddress(publicKey?.toBase58() || null)}</span>
        <Button variant="outline" size="sm" onClick={handleDisconnectAndLogout} className="border-white/20 text-white hover:bg-white/10">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnectAndLogin} className="bg-white text-purple-700 hover:bg-white/90 font-medium shadow-lg" disabled={isLoading}>
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4 mr-2" />
          <span>Connect Miden Wallet</span>
        </>
      )}
    </Button>
  )
}