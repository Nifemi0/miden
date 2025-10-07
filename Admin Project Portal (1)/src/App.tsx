import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { AdminPortal } from './components/AdminPortal'
import { VoteExplorer } from './components/VoteExplorer'
import { PlatformAdminPortal } from './components/PlatformAdminPortal'
import { WalletConnection } from './components/WalletConnection'
import { Vote, Shield, Settings } from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer')
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-cyan-500 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Vote className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DAO Governance Portal</h1>
                <p className="text-purple-100 text-sm">Powered by Miden</p>
              </div>
            </div>
            <WalletConnection 
              isConnected={isWalletConnected}
              onConnect={() => setIsWalletConnected(true)}
              onDisconnect={() => setIsWalletConnected(false)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8 bg-white shadow-lg border-0">
            <TabsTrigger 
              value="explorer" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Vote className="h-4 w-4" />
              <span>Vote Explorer</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Portal</span>
            </TabsTrigger>
            <TabsTrigger 
              value="platform-admin" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4" />
              <span>Platform Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explorer">
            <VoteExplorer isWalletConnected={isWalletConnected} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPortal isWalletConnected={isWalletConnected} />
          </TabsContent>

          <TabsContent value="platform-admin">
            <PlatformAdminPortal isWalletConnected={isWalletConnected} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}