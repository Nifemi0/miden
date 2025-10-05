import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { FileText, Search, Eye, Ban, CheckCircle, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { getProposals, revokeProposal, finalizeTally } from '../api'

interface Proposal {
  id: string
  project_id: string
  title: string
  description: string
  status: 'active' | 'passed' | 'failed' | 'pending'
  voting_model: 'token-weighted' | 'quadratic' | 'one-person-one-vote'
  deadline: string
  revoked: boolean
  finalized: boolean
  created_at: string
  yes_votes: number
  no_votes: number
  total_votes: number
}

const ITEMS_PER_PAGE = 10

export function ProposalManagement() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Load proposals on component mount
  useEffect(() => {
    loadProposals()
  }, [])

  // Filter proposals based on search term and status
  useEffect(() => {
    let filtered = proposals

    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter(proposal => 
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.project_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter)
    }

    setFilteredProposals(filtered)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, proposals])

  const loadProposals = async () => {
    setIsLoading(true)
    try {
      const proposals = await getProposals()
      setProposals(proposals)
    } catch (error) {
      toast.error('Failed to load proposals')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeProposal = async (proposalId: string) => {
    try {
      await revokeProposal(proposalId)
      
      setProposals(prev => prev.map(proposal => 
        proposal.id === proposalId ? { ...proposal, revoked: true, status: 'failed' } : proposal
      ))
      
      toast.success('Proposal revoked successfully')
    } catch (error) {
      toast.error('Failed to revoke proposal')
    }
  }

  const handleFinalizeTally = async (proposalId: string) => {
    try {
      await finalizeTally(proposalId)
      
      setProposals(prev => prev.map(proposal => 
        proposal.id === proposalId ? { 
          ...proposal, 
          finalized: true,
          status: proposal.yes_votes > proposal.no_votes ? 'passed' : 'failed'
        } : proposal
      ))
      
      toast.success('Proposal tally finalized successfully')
    } catch (error) {
      toast.error('Failed to finalize tally')
    }
  }

  const handleViewDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsDetailsDialogOpen(true)
  }

  const getStatusBadge = (proposal: Proposal) => {
    if (proposal.revoked) {
      return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">Revoked</Badge>
    }
    
    switch (proposal.status) {
      case 'active':
        return <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Active</Badge>
      case 'passed':
        return <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">Passed</Badge>
      case 'failed':
        return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">Failed</Badge>
      case 'pending':
        return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">Pending</Badge>
      default:
        return <Badge variant="outline">{proposal.status}</Badge>
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

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const canRevoke = (proposal: Proposal) => {
    return !proposal.revoked && proposal.status === 'active'
  }

  const canFinalize = (proposal: Proposal) => {
    return !proposal.finalized && proposal.status === 'active' && isDeadlinePassed(proposal.deadline)
  }

  // Pagination
  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProposals = filteredProposals.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-indigo-700">Proposal Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monitor, revoke, and finalize proposals across all projects
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, proposal ID, or project ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold text-blue-600">
                  {filteredProposals.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-xl font-bold text-green-600">
                  {filteredProposals.filter(p => p.status === 'passed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Ban className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-xl font-bold text-red-600">
                  {filteredProposals.filter(p => p.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-purple-600">
                  {filteredProposals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading proposals...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Voting Model</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{proposal.title}</p>
                          <p className="text-sm text-muted-foreground font-mono">{proposal.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {proposal.project_id}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(proposal)}
                      </TableCell>
                      <TableCell>
                        {getVotingModelBadge(proposal.voting_model)}
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${isDeadlinePassed(proposal.deadline) ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {formatDate(proposal.deadline)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-green-600">Yes: {proposal.yes_votes}</div>
                          <div className="text-red-600">No: {proposal.no_votes}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(proposal)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {canRevoke(proposal) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeProposal(proposal.id)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {canFinalize(proposal) && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleFinalizeTally(proposal.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredProposals.length)} of {filteredProposals.length} proposals
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Proposal Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              View comprehensive details about this proposal including voting results, timeline, and management actions.
            </DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Proposal ID</Label>
                  <p className="font-mono text-sm">{selectedProposal.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Project ID</Label>
                  <p className="font-mono text-sm">{selectedProposal.project_id}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedProposal.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedProposal.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedProposal)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Voting Model</Label>
                  <div className="mt-1">{getVotingModelBadge(selectedProposal.voting_model)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Finalized</Label>
                  <Badge className={selectedProposal.finalized ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {selectedProposal.finalized ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{formatDate(selectedProposal.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Deadline</Label>
                  <p className={`text-sm ${isDeadlinePassed(selectedProposal.deadline) ? 'text-red-600' : ''}`}>
                    {formatDate(selectedProposal.deadline)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Yes Votes</Label>
                  <p className="text-lg font-bold text-green-600">{selectedProposal.yes_votes}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">No Votes</Label>
                  <p className="text-lg font-bold text-red-600">{selectedProposal.no_votes}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Votes</Label>
                  <p className="text-lg font-bold">{selectedProposal.total_votes}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                {canRevoke(selectedProposal) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRevokeProposal(selectedProposal.id)
                      setIsDetailsDialogOpen(false)
                    }}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Revoke Proposal
                  </Button>
                )}
                
                {canFinalize(selectedProposal) && (
                  <Button
                    onClick={() => {
                      handleFinalizeTally(selectedProposal.id)
                      setIsDetailsDialogOpen(false)
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalize Tally
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
