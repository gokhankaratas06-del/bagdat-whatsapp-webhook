const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = "bagdat_verify_2026";

const OPENAI_API_KEY = "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";
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
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Sen Bağdat Baharat profesyonel WhatsApp satış asistanısın."
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      aiResponse.data.choices[0].message.content;

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
