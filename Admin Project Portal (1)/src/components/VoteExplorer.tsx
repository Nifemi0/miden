import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Clock, Users, CheckCircle, XCircle, Eye } from 'lucide-react'
import { ProposalDetail } from './ProposalDetail'

interface Proposal {
  id: string
  title: string
  description: string
  status: 'active' | 'passed' | 'failed' | 'pending'
  votingModel: 'token-weighted' | 'quadratic' | 'one-person-one-vote'
  deadline: string
  quorum: number
  totalVotes: number
  choices: Array<{
    option: string
    votes: number
    percentage: number
  }>
  creator: string
  createdAt: string
}

const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Treasury Allocation for Development Fund',
    description: 'Proposal to allocate 500,000 tokens from the treasury to establish a development fund for ecosystem growth initiatives.',
    status: 'active',
    votingModel: 'token-weighted',
    deadline: '2024-01-15T23:59:59Z',
    quorum: 1000000,
    totalVotes: 750000,
    choices: [
      { option: 'Approve', votes: 450000, percentage: 60 },
      { option: 'Reject', votes: 300000, percentage: 40 }
    ],
    creator: '0xabcd...efgh',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Implement Quadratic Voting for Future Proposals',
    description: 'Switch from token-weighted voting to quadratic voting to reduce whale influence and increase democratic participation.',
    status: 'passed',
    votingModel: 'one-person-one-vote',
    deadline: '2023-12-31T23:59:59Z',
    quorum: 500,
    totalVotes: 1250,
    choices: [
      { option: 'Yes', votes: 850, percentage: 68 },
      { option: 'No', votes: 400, percentage: 32 }
    ],
    creator: '0x1234...5678',
    createdAt: '2023-12-15T00:00:00Z'
  },
  {
    id: '3',
    title: 'Partnership with External DeFi Protocol',
    description: 'Establish a strategic partnership with UniswapV3 to provide liquidity incentives and expand trading opportunities.',
    status: 'failed',
    votingModel: 'quadratic',
    deadline: '2023-12-20T23:59:59Z',
    quorum: 200,
    totalVotes: 180,
    choices: [
      { option: 'Approve Partnership', votes: 80, percentage: 44.4 },
      { option: 'Reject Partnership', votes: 100, percentage: 55.6 }
    ],
    creator: '0x9876...1234',
    createdAt: '2023-12-10T00:00:00Z'
  }
]

interface VoteExplorerProps {
  isWalletConnected: boolean
}

export function VoteExplorer({ isWalletConnected }: VoteExplorerProps) {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'failed'>('all')

  const filteredProposals = mockProposals.filter(proposal => 
    filter === 'all' || proposal.status === filter
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-sm">Active</Badge>
      case 'passed':
        return <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-sm">Passed</Badge>
      case 'failed':
        return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-sm">Failed</Badge>
      default:
        return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-sm">Pending</Badge>
    }
  }

  const getVotingModelBadge = (model: string) => {
    switch (model) {
      case 'token-weighted':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Token Weighted</Badge>
      case 'quadratic':
        return <Badge className="bg-violet-100 text-violet-700 border-violet-200">Quadratic</Badge>
      case 'one-person-one-vote':
        return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">1P1V</Badge>
      default:
        return <Badge variant="outline">{model}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getQuorumProgress = (proposal: Proposal) => {
    return Math.min((proposal.totalVotes / proposal.quorum) * 100, 100)
  }

  if (selectedProposal) {
    return (
      <ProposalDetail 
        proposal={selectedProposal} 
        onBack={() => setSelectedProposal(null)}
        isWalletConnected={isWalletConnected}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Governance Proposals</h2>
          <p className="text-muted-foreground mt-1">
            View and participate in DAO governance decisions
          </p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Proposals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{proposal.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(proposal.status)}
                        {getVotingModelBadge(proposal.votingModel)}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-2">
                    {proposal.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Deadline</p>
                        <p className="text-sm">{formatDate(proposal.deadline)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Total Votes</p>
                        <p className="text-sm">{proposal.totalVotes.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Quorum Progress</p>
                        <p className="text-sm">{getQuorumProgress(proposal).toFixed(1)}%</p>
                      </div>
                      <Progress value={getQuorumProgress(proposal)} className="h-2" />
                    </div>
                  </div>

                  {proposal.status !== 'pending' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Current Results:</p>
                      <div className="space-y-2">
                        {proposal.choices.map((choice, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{choice.option}</span>
                              <span className="text-sm">{choice.percentage}%</span>
                            </div>
                            <Progress value={choice.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}