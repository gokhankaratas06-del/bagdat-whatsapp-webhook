const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "bagdat_verify_2026";

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

app.post("/webhook/whatsapp-ai", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server çalışıyor");
});
