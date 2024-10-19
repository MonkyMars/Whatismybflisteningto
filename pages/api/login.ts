import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const scope = 'user-read-playback-state user-read-currently-playing';
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI; // Add this to .env.local
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.redirect(spotifyAuthUrl);
}
