
import { Proposal } from '../components/VoteExplorer';

export const getProposals = async (): Promise<Proposal[]> => {
  const response = await fetch(`http://localhost:8000/projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const projects = await response.json();
  // The backend returns projects, but the frontend expects proposals.
  // We'll map the project data to the proposal format.
  return projects.map((project: any) => ({
    id: project.id,
    title: project.owner, // Using owner as title for now
    description: `Token Address: ${project.token_address}`,
    status: 'active', // Placeholder
    votingModel: 'token-weighted', // Placeholder
    deadline: '2024-01-15T23:59:59Z', // Placeholder
    quorum: 1000000, // Placeholder
    totalVotes: 750000, // Placeholder
    choices: [
      { option: 'Approve', votes: 450000, percentage: 60 },
      { option: 'Reject', votes: 300000, percentage: 40 }
    ],
    creator: project.owner,
    createdAt: project.created_at,
  }));
};

export const getRecentActivity = (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 500);
  });
};
