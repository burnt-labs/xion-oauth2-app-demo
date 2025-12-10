import type { NextApiRequest, NextApiResponse } from 'next'

// This endpoint is no longer needed as logout is handled client-side
// Keeping it for backward compatibility, but it does nothing
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.status(200).json({ success: true })
}
