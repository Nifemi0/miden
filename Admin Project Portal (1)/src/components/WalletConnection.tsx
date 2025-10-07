import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Wallet, LogOut } from 'lucide-react'

interface WalletConnectionProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function WalletConnection({ isConnected, onConnect, onDisconnect }: WalletConnectionProps) {
  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <Badge className="bg-emerald-500 text-white border-emerald-600 shadow-sm">
          <Wallet className="h-3 w-3 mr-1" />
          Connected
        </Badge>
        <span className="text-sm text-white/80">0x1234...5678</span>
        <Button variant="outline" size="sm" onClick={onDisconnect} className="border-white/20 text-white hover:bg-white/10">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={onConnect} className="bg-white text-purple-700 hover:bg-white/90 font-medium shadow-lg">
      <Wallet className="h-4 w-4 mr-2" />
      <span>Connect Miden Wallet</span>
    </Button>
  )
}