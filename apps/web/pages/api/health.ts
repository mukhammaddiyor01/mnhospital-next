import type { NextApiRequest, NextApiResponse } from 'next';
export default function health(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  return res.status(200).json({ status: 'ok', service: 'mnhospital-next', release: process.env.MN_RELEASE_SHA || 'unknown' });
}
