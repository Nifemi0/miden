import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { ArrowLeft, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { toast } from 'sonner@2.0.3'

interface ProposalManagementProps {
  onBack: () => void
}

const mockManagedProposals = [
  {
    id: '1',
    title: 'Treasury Allocation for Development Fund',
    status: 'active',
    totalVotes: 750000,
    deadline: '2024-01-15T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Implement Quadratic Voting for Future Proposals',
    status: 'passed',
    totalVotes: 1250,
    deadline: '2023-12-31T23:59:59Z',
    createdAt: '2023-12-15T00:00:00Z'
  },
  {
    id: '3',
    title: 'Partnership with External DeFi Protocol',
    status: 'failed',
    totalVotes: 180,
    deadline: '2023-12-20T23:59:59Z',
    createdAt: '2023-12-10T00:00:00Z'
  },
  {
    id: '4',
    title: 'Update Governance Token Utility',
    status: 'draft',
    totalVotes: 0,
    deadline: '2024-02-01T23:59:59Z',
    createdAt: '2024-01-05T00:00:00Z'
  }
]

export function ProposalManagement({ onBack }: ProposalManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [proposals, setProposals] = useState(mockManagedProposals)

  const filteredProposals = proposals.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Passed</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEdit = (proposalId: string) => {
    toast.info(`Edit proposal ${proposalId} (functionality coming soon)`)
  }

  const handleDelete = (proposalId: string) => {
    setProposals(proposals.filter(p => p.id !== proposalId))
    toast.success('Proposal deleted successfully')
  }

  const handlePublish = (proposalId: string) => {
    setProposals(proposals.map(p => 
      p.id === proposalId ? { ...p, status: 'active' } : p
    ))
    toast.success('Proposal published successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2>Manage Proposals</h2>
          <p className="text-muted-foreground mt-1">
            View and manage all your governance proposals
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Proposals</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{proposal.title}</h3>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Created: {formatDate(proposal.createdAt)}</span>
                    <span>Deadline: {formatDate(proposal.deadline)}</span>
                    <span>Votes: {proposal.totalVotes.toLocaleString()}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {proposal.status === 'draft' && (
                      <DropdownMenuItem onClick={() => handlePublish(proposal.id)}>
                        Publish Proposal
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleEdit(proposal.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {(proposal.status === 'draft' || proposal.status === 'failed') && (
                      <DropdownMenuItem 
                        onClick={() => handleDelete(proposal.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {filteredProposals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No proposals found matching your search.' : 'No proposals created yet.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {proposals.filter(p => p.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Currently accepting votes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passed Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {proposals.filter(p => p.status === 'passed').length}
            </div>
            <p className="text-sm text-muted-foreground">Successfully approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draft Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {proposals.filter(p => p.status === 'draft').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending publication</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}