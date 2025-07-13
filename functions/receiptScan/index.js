const functions = require('firebase-functions');
const fetch = require('node-fetch');

// HTTP function to proxy requests to TagGun API for receipt scanning
exports.scanReceipt = functions.https.onRequest(async (req, res) => {
  const image = req.body.image;
  if (!image) {
    res.status(400).json({ error: 'Missing image data' });
    return;
  }

  try {
    const response = await fetch('https://api.taggun.io/api/receipt/v1/verbose/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': functions.config().taggun.key
      },
      body: JSON.stringify({
        file: image,
        filename: 'receipt.jpg',
        incognito: true
      })
    });

    if (!response.ok) {
      throw new Error(`TagGun error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to scan receipt' });
  }
});
