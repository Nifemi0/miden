import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { ArrowLeft, Clock, Users, Vote, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@demox-labs/miden-wallet-adapter-react'
import { castVote } from '../api'

interface ProposalDetailProps {
  proposal: Proposal
  onBack: () => void
}

export function ProposalDetail({ proposal, onBack }: ProposalDetailProps) {
  const [selectedChoice, setSelectedChoice] = useState('')
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  const { connected, publicKey, signMessage } = useWallet()

  const getStatusBadge = (status: Proposal['status'], isRevoked: boolean) => {
    if (isRevoked) {
      return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">Revoked</Badge>
    }
    switch (status) {
      case 'Voting':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Voting</Badge>
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getVotingModelBadge = (model: string) => {
    switch (model) {
      case 'token-weighted':
        return <Badge variant="outline">Token Weighted</Badge>
      case 'quadratic':
        return <Badge variant="outline">Quadratic</Badge>
      case 'one-person-one-vote':
        return <Badge variant="outline">1P1V</Badge>
      default:
        return <Badge variant="outline">{model}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getQuorumProgress = () => {
    const totalVotes = proposal.vote_count_yes + proposal.vote_count_no;
    if (proposal.quorum_percentage === 0) return 0; // Avoid division by zero
    return Math.min((totalVotes / proposal.quorum_percentage) * 100, 100);
  }

  const handleVote = async () => {
    if (!selectedChoice) {
      toast.error('Please select a voting choice')
      return
    }

    if (!connected) {
      toast.error('Please connect your wallet to vote')
      return
    }

    if (!publicKey) {
      toast.error('Wallet public key not available')
      return
    }

    setIsVoting(true)
    try {
      const message = `Vote for proposal ${proposal.id} with choice ${selectedChoice}`;
      const signature = await signMessage(new TextEncoder().encode(message));

      await castVote(proposal.id, publicKey.toBase58(), selectedChoice, signature.toString());
      setHasVoted(true)
      toast.success(`Vote cast for "${selectedChoice}"`)
    } catch (error) {
      console.error('Failed to cast vote:', error)
      toast.error('Failed to cast vote')
    } finally {
      setIsVoting(false)
    }
  }

  const isDeadlinePassed = new Date(proposal.deadline) < new Date()
  const canVote = proposal.status === 'Voting' && !isDeadlinePassed && !hasVoted && connected && !isVoting

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(proposal.status, proposal.is_revoked)}
                  {getVotingModelBadge(proposal.voting_model)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-sm text-muted-foreground">{formatDate(proposal.deadline)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Votes</p>
                  <p className="text-sm text-muted-foreground">{(proposal.vote_count_yes + proposal.vote_count_no).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Quorum Progress</p>
                  <p className="text-sm text-muted-foreground">{getQuorumProgress().toFixed(1)}%</p>
                </div>
                <Progress value={getQuorumProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {proposal.quorum_percentage}% quorum required
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {proposal.description}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Proposer</h3>
            <p className="text-sm text-muted-foreground">
              {proposal.proposer_id} on {formatDate(proposal.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Vote className="h-5 w-5" />
              <span>Cast Your Vote</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasVoted ? (
              <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800">You have successfully voted!</span>
              </div>
            ) : canVote ? (
              <>
                <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice}>
                  {/* Assuming choices are dynamically loaded or derived from proposal */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="option-yes" />
                    <Label htmlFor="option-yes" className="flex-1 cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="option-no" />
                    <Label htmlFor="option-no" className="flex-1 cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                <Button onClick={handleVote} className="w-full" disabled={isVoting}>
                  {isVoting ? 'Casting Vote...' : 'Cast Vote'}
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                {!connected && (
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to participate in voting.
                  </p>
                )}
                {isDeadlinePassed && (
                  <p className="text-sm text-muted-foreground">
                    Voting period has ended.
                  </p>
                )}
                {proposal.status !== 'Voting' && (
                  <p className="text-sm text-muted-foreground">
                    This proposal is no longer active.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Current Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Yes</span>
                <div className="text-right">
                  <p className="font-medium">{((proposal.vote_count_yes / (proposal.vote_count_yes + proposal.vote_count_no || 1)) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">
                    {proposal.vote_count_yes.toLocaleString()} votes
                  </p>
                </div>
              </div>
              <Progress value={((proposal.vote_count_yes / (proposal.vote_count_yes + proposal.vote_count_no || 1)) * 100)} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">No</span>
                <div className="text-right">
                  <p className="font-medium">{((proposal.vote_count_no / (proposal.vote_count_yes + proposal.vote_count_no || 1)) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">
                    {proposal.vote_count_no.toLocaleString()} votes
                  </p>
                </div>
              </div>
              <Progress value={((proposal.vote_count_no / (proposal.vote_count_yes + proposal.vote_count_no || 1)) * 100)} className="h-3" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Total Participation:</span>
                <span>{(proposal.vote_count_yes + proposal.vote_count_no).toLocaleString()} votes</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Quorum Status:</span>
                <span>
                  {getQuorumProgress() >= 100 ? 'Met' : 'Not Met'} 
                  ({getQuorumProgress().toFixed(1)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}