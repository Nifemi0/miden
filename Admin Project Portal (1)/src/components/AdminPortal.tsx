import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Plus, Settings, BarChart3 } from 'lucide-react'
import { ProposalForm } from './ProposalForm'
import { ProposalManagement } from './ProposalManagement'
import { GovernanceSettings } from './GovernanceSettings'

interface AdminPortalProps {
  isWalletConnected: boolean
}

export function AdminPortal({ isWalletConnected }: AdminPortalProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'create' | 'manage' | 'settings'>('overview')

  if (!isWalletConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Wallet Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please connect your Miden wallet to access the admin portal.
            </p>
            <p className="text-sm text-muted-foreground">
              Only authorized admin addresses can create and manage proposals.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeSection === 'create') {
    return <ProposalForm onBack={() => setActiveSection('overview')} />
  }

  if (activeSection === 'manage') {
    return <ProposalManagement onBack={() => setActiveSection('overview')} />
  }

  if (activeSection === 'settings') {
    return <GovernanceSettings onBack={() => setActiveSection('overview')} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>Admin Portal</h2>
        <p className="text-muted-foreground mt-1">
          Create and manage governance proposals for your DAO
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-cyan-50 hover:from-purple-100 hover:to-cyan-100" onClick={() => setActiveSection('create')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <span>Create Proposal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Create a new governance proposal with custom voting parameters and deadlines.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100" onClick={() => setActiveSection('manage')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-violet-700">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span>Manage Proposals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              View, edit, and monitor the status of all your governance proposals.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100" onClick={() => setActiveSection('settings')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-cyan-700">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span>Governance Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Configure default voting models, quorum requirements, and token settings.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Treasury Allocation Proposal</p>
                <p className="text-sm text-muted-foreground">Created 2 days ago</p>
              </div>
              <span className="text-sm text-blue-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Quadratic Voting Implementation</p>
                <p className="text-sm text-muted-foreground">Completed 1 week ago</p>
              </div>
              <span className="text-sm text-green-600">Passed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Partnership Proposal</p>
                <p className="text-sm text-muted-foreground">Completed 2 weeks ago</p>
              </div>
              <span className="text-sm text-red-600">Failed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}