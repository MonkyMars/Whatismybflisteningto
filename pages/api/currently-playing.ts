import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accessToken = process.env.ACCESS_TOKEN; // You'll get this from the Spotify OAuth flow
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 204 || response.status > 400) {
      return res.status(200).json({ is_playing: false });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch currently playing song" });
  }
}
