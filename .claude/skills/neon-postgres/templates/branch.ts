import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export async function createBranch(branchName: string) {
  // POST /branches - Create a new database branch
  const response = await fetch(
    `${process.env.NEON_API_URL}/projects/${process.env.NEON_PROJECT_ID}/branches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch_name: branchName,
        primary_branch_name: '{{primaryBranch}}',
      }),
    }
  );
  return response.json();
}

export async function connectToBranch(branchName: string) {
  const branch = await getBranchByName(branchName);
  const connectionString = branch.connection_qualified;

  const sql = neon(connectionString);
  return drizzle(sql);
}
