import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { AdminPortal } from './components/AdminPortal'
import { VoteExplorer } from './components/VoteExplorer'
import { PlatformAdminPortal } from './components/PlatformAdminPortal'
import { WalletConnection } from './components/WalletConnection'
import { Vote, Shield, Settings } from 'lucide-react'
import { useWallet } from '@demox-labs/miden-wallet-adapter-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer')
  const { connected, connect, disconnect } = useWallet()
  const [userRole, setUserRole] = useState<string | null>(null) // 'user', 'project_admin', 'platform_owner'

  // Placeholder for handling successful login and setting user role
  const handleLoginSuccess = (role: string) => {
    setUserRole(role);
    // Optionally, switch to an admin tab if the user is an admin
    if (role === 'platform_owner' || role === 'project_admin') {
      setActiveTab('admin');
    }
  };

  // Placeholder for handling logout
  const handleLogout = () => {
    setUserRole(null);
    setActiveTab('explorer'); // Redirect to explorer on logout
  };

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
              isConnected={connected}
              onConnect={connect}
              onDisconnect={disconnect}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
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
            {(userRole === 'project_admin' || userRole === 'platform_owner') && (
              <TabsTrigger 
                value="admin" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Portal</span>
              </TabsTrigger>
            )}
            {userRole === 'platform_owner' && (
              <TabsTrigger 
                value="platform-admin" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4" />
                <span>Platform Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="explorer">
            <VoteExplorer />
          </TabsContent>

          {(userRole === 'project_admin' || userRole === 'platform_owner') && (
            <TabsContent value="admin">
              <AdminPortal />
            </TabsContent>
          )}

          {userRole === 'platform_owner' && (
            <TabsContent value="platform-admin">
              <PlatformAdminPortal />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}