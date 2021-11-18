import { NextApiRequest, NextApiResponse } from 'next'

function webHooks(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received event')

  res.status(200).json({ ok: true })
}

export default webHooks
