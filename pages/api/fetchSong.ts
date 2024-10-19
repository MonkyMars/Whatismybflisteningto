import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { userID } = req.query;
    const currentSong = await kv.get<string>(`current_song:${userID}`);

    if (!currentSong) {
      res.status(404).json({ message: "No current song found" });
    } else {
      res.status(200).json({ songID: currentSong });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
