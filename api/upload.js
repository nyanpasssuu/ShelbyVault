export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-file-name, x-file-type, x-wallet-address');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_KEY = process.env.SHELBY_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const fileName = req.headers['x-file-name'];
  const fileType = req.headers['x-file-type'] || 'application/octet-stream';
  const walletAddress = req.headers['x-wallet-address'] || "0x1";

  if (!fileName) {
    return res.status(400).json({ error: 'Missing file name' });
  }

  try {

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const fileData = Buffer.concat(chunks);

    // UPLOAD ENDPOINT (yang benar)
    const uploadUrl = `https://api.shelbynet.shelby.xyz/shelby/v1/blob/${walletAddress}/${fileName}`;

    const shelbyRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": fileType,
        "Content-Length": String(fileData.length)
      },
      body: fileData
    });

    if (shelbyRes.ok) {

      const publicUrl = `https://api.shelbynet.shelby.xyz/shelby/v1/blob/${walletAddress}/${fileName}`;

      return res.status(200).json({
        success: true,
        url: publicUrl
      });

    } else {

      const errText = await shelbyRes.text();

      return res.status(400).json({
        error: "Shelby upload failed",
        detail: errText
      });

    }

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
