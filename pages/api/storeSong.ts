import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { songID, userID } = req.body;
    await kv.set(`current_song:${userID}`, songID);
    res.status(200).json({ message: 'Current song updated successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
