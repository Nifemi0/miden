import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface GovernanceSettingsProps {
  onBack: () => void
}

export function GovernanceSettings({ onBack }: GovernanceSettingsProps) {
  const [settings, setSettings] = useState({
    defaultVotingModel: 'token-weighted',
    defaultQuorum: '1000000',
    defaultVotingPeriod: '7',
    tokenAddress: '0x1234567890abcdef',
    tokenSymbol: 'GOV',
    tokenDecimals: '18',
    enableQuadratic: true,
    enableWeighted: true,
    enableOnePersonOneVote: true,
    minimumProposalBond: '10000',
    executionDelay: '2'
  })

  const handleSave = () => {
    // Simulate saving settings
    toast.success('Governance settings saved successfully!')
  }

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2>Governance Settings</h2>
          <p className="text-muted-foreground mt-1">
            Configure default parameters for your DAO governance
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Default Voting Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-voting-model">Default Voting Model</Label>
                <Select 
                  value={settings.defaultVotingModel} 
                  onValueChange={(value) => updateSetting('defaultVotingModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="token-weighted">Token Weighted</SelectItem>
                    <SelectItem value="quadratic">Quadratic Voting</SelectItem>
                    <SelectItem value="one-person-one-vote">One Person One Vote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-quorum">Default Minimum Quorum</Label>
                <Input
                  id="default-quorum"
                  type="number"
                  value={settings.defaultQuorum}
                  onChange={(e) => updateSetting('defaultQuorum', e.target.value)}
                  placeholder="1000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voting-period">Default Voting Period (days)</Label>
                <Input
                  id="voting-period"
                  type="number"
                  value={settings.defaultVotingPeriod}
                  onChange={(e) => updateSetting('defaultVotingPeriod', e.target.value)}
                  placeholder="7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="execution-delay">Execution Delay (days)</Label>
                <Input
                  id="execution-delay"
                  type="number"
                  value={settings.executionDelay}
                  onChange={(e) => updateSetting('executionDelay', e.target.value)}
                  placeholder="2"
                />
                <p className="text-xs text-muted-foreground">
                  Time delay before approved proposals can be executed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governance Token Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="token-address">Token Contract Address</Label>
                <Input
                  id="token-address"
                  value={settings.tokenAddress}
                  onChange={(e) => updateSetting('tokenAddress', e.target.value)}
                  placeholder="0x..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-symbol">Token Symbol</Label>
                <Input
                  id="token-symbol"
                  value={settings.tokenSymbol}
                  onChange={(e) => updateSetting('tokenSymbol', e.target.value)}
                  placeholder="GOV"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-decimals">Token Decimals</Label>
                <Input
                  id="token-decimals"
                  type="number"
                  value={settings.tokenDecimals}
                  onChange={(e) => updateSetting('tokenDecimals', e.target.value)}
                  placeholder="18"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposal-bond">Minimum Proposal Bond</Label>
                <Input
                  id="proposal-bond"
                  type="number"
                  value={settings.minimumProposalBond}
                  onChange={(e) => updateSetting('minimumProposalBond', e.target.value)}
                  placeholder="10000"
                />
                <p className="text-xs text-muted-foreground">
                  Tokens required to stake when creating a proposal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enabled Voting Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-weighted">Token Weighted Voting</Label>
                  <p className="text-sm text-muted-foreground">
                    Voting power proportional to token holdings
                  </p>
                </div>
                <Switch
                  id="enable-weighted"
                  checked={settings.enableWeighted}
                  onCheckedChange={(checked) => updateSetting('enableWeighted', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-quadratic">Quadratic Voting</Label>
                  <p className="text-sm text-muted-foreground">
                    Square root of token holdings determines voting power
                  </p>
                </div>
                <Switch
                  id="enable-quadratic"
                  checked={settings.enableQuadratic}
                  onCheckedChange={(checked) => updateSetting('enableQuadratic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-one-vote">One Person One Vote</Label>
                  <p className="text-sm text-muted-foreground">
                    Each address gets one vote regardless of token holdings
                  </p>
                </div>
                <Switch
                  id="enable-one-vote"
                  checked={settings.enableOnePersonOneVote}
                  onCheckedChange={(checked) => updateSetting('enableOnePersonOneVote', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Zero-Knowledge Proof Integration</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Individual votes are private and verified using Miden VM's zero-knowledge proofs.
                  Only aggregated results are publicly visible.
                </p>
                <Badge variant="secondary">Enabled by default</Badge>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Vote Privacy</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Individual voting choices are never exposed publicly. Only final tallied results
                  are shown after the voting period ends.
                </p>
                <Badge variant="secondary">Always Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}