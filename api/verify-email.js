// Vercel serverless function to forward email verification requests to backend
export default async function handler(req, res) {
  // Get the backend API URL from environment variables
  const backendUrl = process.env.VITE_API_URL || 'http://localhost:8080';

  // Construct the full backend URL
  const backendEndpoint = `${backendUrl}/verify-email`;

  try {
    // Forward the request to the backend with all query parameters
    const response = await fetch(`${backendEndpoint}?${new URLSearchParams(req.query).toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any relevant headers if needed
        ...req.headers,
      },
    });

    // Get the response data
    const data = await response.json();

    // Return the same status and data from the backend
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding to backend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
