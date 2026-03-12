export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-file-name, x-file-type, x-wallet-address');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const API_KEY = process.env.SHELBY_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const fileName = req.headers['x-file-name'];
  const fileType = req.headers['x-file-type'] || 'application/octet-stream';
  const walletAddress = req.headers['x-wallet-address'];

  if (!fileName || !walletAddress) {
    return res.status(400).json({ error: 'Missing x-file-name or x-wallet-address header' });
  }

  try {
    // Read raw body (base64 string from frontend)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');

    // Decode base64 → raw binary
    const fileBuffer = Buffer.from(raw, 'base64');

    // POST https://testnet.shelby.xyz/v1/blobs (correct endpoint from Shelby mod)
    const uploadUrl = `https://testnet.shelby.xyz/v1/blobs`;

    const shelbyRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (shelbyRes.ok) {
      const data = await shelbyRes.json().catch(() => ({}));
      const publicUrl = `https://testnet.shelby.xyz/v1/blobs/${walletAddress}/${fileName}`;
      return res.status(200).json({ success: true, url: publicUrl, data });
    }

    const errText = await shelbyRes.text();
    console.error('Shelby error:', shelbyRes.status, errText);
    return res.status(shelbyRes.status).json({
      error: 'Shelby upload failed',
      status: shelbyRes.status,
      detail: errText,
    });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: { bodyParser: false },
};
