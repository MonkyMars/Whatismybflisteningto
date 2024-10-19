import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

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

    // Store the tokens securely (you can store in cookies or session)
    res.redirect(
      `/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`
    );
  } catch (error) {
    console.error("Error getting Spotify tokens:", error);
    res.status(500).send("Authentication failed");
  }
}
