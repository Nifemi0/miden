import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { UserManagement } from './UserManagement'
import { ProjectManagement } from './ProjectManagement'
import { ProposalManagement } from './ProposalManagement'
import { Wallet, Users, FolderOpen, FileText, Shield, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '../api'
import { useWallet } from '@demox-labs/miden-wallet-adapter-react'

// Mock authentication state
interface AuthState {
  isAuthenticated: boolean
  userRole: string | null
  walletAddress: string | null
}

export function PlatformAdminPortal() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    walletAddress: null
  })
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [activeSection, setActiveSection] = useState('users')
  const { connected, publicKey, signMessage } = useWallet()

  const authenticatePlatformOwner = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first')
      return
    }
    if (!publicKey) {
      toast.error('Wallet public key not available')
      return
    }

    setIsAuthenticating(true)
    
    try {
      const message = 'Authenticate as Platform Owner';
      const signature = await signMessage(new TextEncoder().encode(message));
      
      const authResponse = await login(publicKey.toBase58(), signature.toString())
      
      if (authResponse.success && authResponse.role === 'platform_owner') {
        setAuthState({
          isAuthenticated: true,
          userRole: authResponse.role,
          walletAddress: publicKey.toBase58()
        })
        toast.success('Successfully authenticated as Platform Owner')
      } else {
        toast.error('Unauthorized: You are not a platform owner')
      }
    } catch (error) {
      toast.error('Authentication failed')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      walletAddress: null
    })
    toast.info('Logged out successfully')
  }

  const formatAddress = (address: string | null) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // If not connected to wallet, show connection prompt
  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-orange-700">Wallet Connection Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Please connect your Miden wallet to access the Platform Admin portal.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Only platform owners with authenticated wallets can access this area.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If not authenticated, show authentication interface
  if (!authState.isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-cyan-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-purple-700">Platform Owner Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              Sign a message with your wallet to verify your platform owner role.
            </p>
            
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-700">
                <strong>Connected Wallet:</strong> {formatAddress(publicKey?.toBase58() || null)}
              </p>
            </div>

            <Button 
              onClick={authenticatePlatformOwner}
              disabled={isAuthenticating}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-8"
            >
              {isAuthenticating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign & Authenticate
                </>
              )}
            </Button>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will prompt you to sign a message with your wallet to prove ownership.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If authenticated but not platform owner
  if (authState.isAuthenticated && authState.userRole !== 'platform_owner') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-red-700">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You are not authorized to access the Platform Admin portal.
            </p>
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
              Current Role: {authState.userRole}
            </Badge>
            <Button variant="outline" onClick={logout}>
              Switch Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main platform admin dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Platform Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, projects, and proposals across the entire platform
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className="bg-emerald-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Platform Owner
          </Badge>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-white shadow-lg border-0">
          <TabsTrigger 
            value="users" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
          >
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger 
            value="projects" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Project Management</span>
          </TabsTrigger>
          <TabsTrigger 
            value="proposals" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" />
            <span>Proposal Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectManagement />
        </TabsContent>

        <TabsContent value="proposals" className="mt-6">
          <ProposalManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
