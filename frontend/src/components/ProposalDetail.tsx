import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { ArrowLeft, Clock, Users, Vote, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

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

interface ProposalDetailProps {
  proposal: Proposal
  onBack: () => void
  isWalletConnected: boolean
}

export function ProposalDetail({ proposal, onBack, isWalletConnected }: ProposalDetailProps) {
  const [selectedChoice, setSelectedChoice] = useState('')
  const [hasVoted, setHasVoted] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Passed</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
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
    return Math.min((proposal.totalVotes / proposal.quorum) * 100, 100)
  }

  const handleVote = () => {
    if (!selectedChoice) {
      toast.error('Please select a voting choice')
      return
    }

    if (!isWalletConnected) {
      toast.error('Please connect your wallet to vote')
      return
    }

    // Simulate voting
    setHasVoted(true)
    toast.success(`Vote cast for "${selectedChoice}"`)
  }

  const isDeadlinePassed = new Date(proposal.deadline) < new Date()
  const canVote = proposal.status === 'active' && !isDeadlinePassed && !hasVoted && isWalletConnected

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
                  {getStatusBadge(proposal.status)}
                  {getVotingModelBadge(proposal.votingModel)}
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
                  <p className="text-sm text-muted-foreground">{proposal.totalVotes.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Quorum Progress</p>
                  <p className="text-sm text-muted-foreground">{getQuorumProgress().toFixed(1)}%</p>
                </div>
                <Progress value={getQuorumProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {proposal.quorum.toLocaleString()} votes required
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
            <h3 className="font-medium mb-2">Created by</h3>
            <p className="text-sm text-muted-foreground">
              {proposal.creator} on {formatDate(proposal.createdAt)}
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
                  {proposal.choices.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice.option} id={`choice-${index}`} />
                      <Label htmlFor={`choice-${index}`} className="flex-1 cursor-pointer">
                        {choice.option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button onClick={handleVote} className="w-full">
                  Cast Vote
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                {!isWalletConnected && (
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to participate in voting.
                  </p>
                )}
                {isDeadlinePassed && (
                  <p className="text-sm text-muted-foreground">
                    Voting period has ended.
                  </p>
                )}
                {proposal.status !== 'active' && (
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
            {proposal.choices.map((choice, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{choice.option}</span>
                  <div className="text-right">
                    <p className="font-medium">{choice.percentage}%</p>
                    <p className="text-sm text-muted-foreground">
                      {choice.votes.toLocaleString()} votes
                    </p>
                  </div>
                </div>
                <Progress value={choice.percentage} className="h-3" />
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Total Participation:</span>
                <span>{proposal.totalVotes.toLocaleString()} votes</span>
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