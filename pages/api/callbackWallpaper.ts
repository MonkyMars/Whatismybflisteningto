import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;

  const clientId = '6636e187c9d64d1fb17c606d30f527ad';
  const clientSecret = '1776b201728840219764e789eac1fd92';
  const redirectUri = 'https://whatismybflisteningto.vercel.app/api/callbackWallpaper';

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    res.redirect(
      `/wallpaper/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`
    );
  } catch (error) {
    console.error("Error getting Spotify tokens:", error);
    res.status(500).send("Authentication failed");
  }
}

