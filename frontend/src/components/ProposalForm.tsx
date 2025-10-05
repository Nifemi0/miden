import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@demox-labs/miden-wallet-adapter-react'
import { createProposal } from '../api'

interface ProposalFormProps {
  onBack: () => void
}

export function ProposalForm({ onBack }: ProposalFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [votingModel, setVotingModel] = useState('')
  const [quorum, setQuorum] = useState('')
  const [deadline, setDeadline] = useState('')
  const [choices, setChoices] = useState(['', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { connected, publicKey, signMessage } = useWallet()

  const addChoice = () => {
    if (choices.length < 5) {
      setChoices([...choices, ''])
    }
  }

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index))
    }
  }

  const updateChoice = (index: number, value: string) => {
    const updatedChoices = [...choices]
    updatedChoices[index] = value
    setChoices(updatedChoices)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected) {
      toast.error('Please connect your Miden wallet to create a proposal')
      return
    }

    if (!publicKey) {
      toast.error('Wallet public key not available')
      return
    }

    if (!title || !description || !votingModel || !quorum || !deadline) {
      toast.error('Please fill in all required fields')
      return
    }

    if (choices.some(choice => !choice.trim())) {
      toast.error('Please fill in all voting choices')
      return
    }

    setIsSubmitting(true)

    try {
      const message = `Create proposal: ${title}`;
      const signature = await signMessage(new TextEncoder().encode(message));

      const proposalData = {
        title,
        description,
        voting_model: votingModel,
        quorum: parseInt(quorum),
        deadline,
        choices: choices.filter(choice => choice.trim() !== ''),
        proposer_wallet_address: publicKey.toBase58(),
        signature: signature.toString(),
      };

      await createProposal(proposalData);
      toast.success('Proposal created successfully!')
      onBack()
    } catch (error) {
      console.error('Failed to create proposal:', error)
      toast.error('Failed to create proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2>Create New Proposal</h2>
          <p className="text-muted-foreground mt-1">
            Set up a new governance proposal for your DAO
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" role="form">
        <Card>
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Proposal Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter proposal title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of your proposal"
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voting Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voting-model">Voting Model *</Label>
              <Select value={votingModel} onValueChange={setVotingModel} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select voting model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token-weighted">Token Weighted</SelectItem>
                  <SelectItem value="quadratic">Quadratic Voting</SelectItem>
                  <SelectItem value="one-person-one-vote">One Person One Vote</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {votingModel === 'token-weighted' && 'Voting power proportional to token holdings'}
                {votingModel === 'quadratic' && 'Square root of token holdings determines voting power'}
                {votingModel === 'one-person-one-vote' && 'Each address gets one vote regardless of token holdings'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quorum">Minimum Quorum *</Label>
                <Input
                  id="quorum"
                  type="number"
                  value={quorum}
                  onChange={(e) => setQuorum(e.target.value)}
                  placeholder="e.g., 1000000"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum votes required for proposal to be valid
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Voting Deadline *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voting Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Label htmlFor={`choice-${index}`}>Choice {index + 1}</Label>
                  <Input
                    id={`choice-${index}`}
                    value={choice}
                    onChange={(e) => updateChoice(index, e.target.value)}
                    placeholder={`Enter choice ${index + 1}`}
                    required
                  />
                </div>
                {choices.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeChoice(index)}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {choices.length < 5 && (
              <Button type="button" variant="outline" onClick={addChoice}>
                <Plus className="h-4 w-4 mr-2" />
                Add Choice
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Proposal'}
          </Button>
        </div>
      </form>
    </div>
  )
}