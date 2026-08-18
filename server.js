const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Octokit } = require("@octokit/rest"); // 👈 GitHub API İstemcisi

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // index.html servis adresi

// GitHub Ayarları
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const OWNER = "erdemdibek"; // 👈 GitHub Kullanıcı Adınız
const REPO = "sanofi-api";         // 👈 Reponuzun Adı
const PATH = "veri.json";

// ----------------------------------------------------
// 1. GİTHUB VERİ OKUMA VE YAZMA ENDPOINT'LERİ
// ----------------------------------------------------

// Kesintileri GitHub'dan Oku
app.get("/api/kesintiler", async (req, res) => {
  try {
    const response = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH,
    });
    const content = Buffer.from(response.data.content, "base64").toString("utf-8");
    res.json({ success: true, data: JSON.parse(content) });
  } catch (error) {
    console.error("GitHub Oku Hatası:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Yeni Kesintiyi GitHub'a Commit Et
app.post("/api/kesintiler", async (req, res) => {
  try {
    // Mevcut dosyanın SHA değerini (versiyonunu) alıyoruz
    const currentFile = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH,
    });

    // GitHub repoda dosyayı güncelliyoruz
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: "Maaş kesintileri güncellendi [Auto Sync]",
      content: Buffer.from(JSON.stringify(req.body, null, 2)).toString("base64"),
      sha: currentFile.data.sha,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("GitHub Yaz Hatası:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 2. CANLI PİYASA VERİSİ ENDPOINT'İ
// ----------------------------------------------------

app.get("/api/market", async (req, res) => {
  try {
    let sanofiPrice = null;
    let eurtryPrice = null;

    // SANOFI
    try {
      const yahooRes = await axios.get(
        "https://query1.finance.yahoo.com/v8/finance/chart/SAN.PA",
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );

      sanofiPrice = yahooRes.data.chart.result[0].meta.regularMarketPrice;
    } catch (e) {
      console.error("Sanofi error:", e.message);
    }

    // EUR TRY
    try {
      const currencyRes = await axios.get(
        "https://open.er-api.com/v6/latest/EUR"
      );

      eurtryPrice = currencyRes.data.rates.TRY;
    } catch (e) {
      console.error("EURTRY error:", e.message);
    }

    res.json({
      success: true,
      sanofi: sanofiPrice,
      eurtry: eurtryPrice,
      updated: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
