export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageIds } = req.body;

  if (!Array.isArray(imageIds)) {
    return res.status(400).json({ error: "Invalid imageIds" });
  }

  try {
    for (const imageId of imageIds) {
      await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          },
        }
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Cloudflare delete failed" });
  }
}
