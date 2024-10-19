import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const scope = 'user-read-playback-state user-read-currently-playing';
  const redirectUri = 'https://whatismybflisteningto.vercel.app/api/callback';
  const clientId = '6636e187c9d64d1fb17c606d30f527ad';

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.redirect(spotifyAuthUrl);
}

//  https://accounts.spotify.com/authorize?response_type=code&client_id=undefined&scope=user-read-playback-state%20user-read-currently-playing&redirect_uri=undefined