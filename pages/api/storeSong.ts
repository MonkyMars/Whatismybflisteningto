import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    console.log("POST method hit");
    const { songID, userID } = req.body;

    if (!songID || !userID) {
      res.status(400).json({ message: 'Missing songID or userID' });
      return;
    }

    console.log(`Received songID: ${songID}, userID: ${userID}`);

    try {
      await kv.set(`current_song:${userID}`, songID);
      res.status(200).json({ message: 'Current song updated successfully' });
    } catch (error) {
      console.error("KV Store Error: ", error);
      res.status(500).json({ message: 'Error updating song' });
    }
  } else {
    console.log("Method not allowed");
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// curl -X POST https://whatismybflisteningto.vercel.app/api/storeSong -H "Content-Type: application/json" -d "{\"songID\": \"fakeSongId123\", \"userID\": \"gf\"}" -v
// post response with no message, only 405 error. other methods receive 405 as well along with a message