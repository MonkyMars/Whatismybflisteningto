import Vibrant from 'node-vibrant';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const {imageUrl} = req.query; // Correctly access the URL from query parameters

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      const palette = await Vibrant.from(imageUrl).getPalette();
      const dominantColor = palette.Vibrant.hex;
      res.status(200).json({ dominantColor }); // Return the color in a JSON object
    } catch (error) {
      console.error('Error fetching album cover color:', error);
      res.status(500).json({ error: 'Error fetching album cover color' }); // Send error response
    }
  } else {
    // Handle unsupported methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
