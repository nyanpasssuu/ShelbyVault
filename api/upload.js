module.exports = async function handler(req, res) {

  try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "x-file-name, x-file-type, x-wallet-address"
    );
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const API_KEY = process.env.SHELBY_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing Shelby API key" });
    }

    const fileName = req.headers["x-file-name"];
    const fileType = req.headers["x-file-type"] || "application/octet-stream";
    const walletAddress = req.headers["x-wallet-address"] || "0x1";

    if (!fileName) {
      return res.status(400).json({ error: "Missing file name" });
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const fileData = Buffer.concat(chunks);

    const uploadUrl =
      `https://ace-worker-0-646682240579.europe-west1.run.app/shelby/v1/blobs/${walletAddress}/${fileName}`;

    const shelbyRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": fileType
      },
      body: fileData
    });

    const text = await shelbyRes.text();

    if (!shelbyRes.ok) {
      return res.status(400).json({
        error: "Shelby upload failed",
        detail: text
      });
    }

    const publicUrl =
      `https://ace-worker-0-646682240579.europe-west1.run.app/shelby/v1/blobs/${walletAddress}/${fileName}`;

    return res.status(200).json({
      success: true,
      url: publicUrl
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Server crash",
      detail: err.message
    });

  }

};        error: "Shelby upload failed",
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
};        detail: errText
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
