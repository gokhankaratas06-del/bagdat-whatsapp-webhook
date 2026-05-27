const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = "bagdat_verify_2026";

const GEMINI_API_KEY = "AIzaSyDCRQHYndiHjhfha6TNgyv6OvhanZ2WAmc";
const WHATSAPP_TOKEN = "EAAVB8SZByWlEBRpRvNDcC6vldqV3nnibtpmFzuCJPBiQ72XZCPzg9ZCitZAmpCALuMp0tVtoZAXSjyggFt6mlr2tvbrCU3WNa4HhxuHzdlZCzL0nLZA9cZA5XF6h5Bjspx8pj2r96IDGxpy75rlsKV3oSVbps1gaXO3j8dlpDiLn4LDifwlVZCkSPUT2omClFncU96qzZCVzF9EV9jCyc4ECC9hEpHnYxsEwk7imJyhpywOmtgOjdBMQ5pAA50b31KcXCjd6RUr584FwaiGHZBmyEgnZAjTknYbtNZB8fKVUZD";
const PHONE_NUMBER_ID = "176770162188683";

app.get("/", (req, res) => {
  res.send("Webhook aktif");
});

app.get("/webhook/whatsapp-ai", (req, res) => {
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook/whatsapp-ai", async (req, res) => {
  try {
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body || "";

    console.log("Mesaj:", text);

   const aiResponse = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    contents: [
      {
        parts: [
          {
            text: `Sen Bağdat Baharat profesyonel WhatsApp satış danışmanısın.\nKullanıcı: ${text}`
          }
        ]
      }
    ]
  }
);

    const reply =
  aiResponse.data.candidates[0].content.parts[0].text;

    await axios.post(
      `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {
          body: reply
        }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.sendStatus(200);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server çalışıyor");
});
