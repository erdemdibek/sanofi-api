const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/market", async (req, res) => {
  try {
    // 1. Sanofi (SAN.PA) Verisini Yahoo'nun Ham Web API'sinden çekiyoruz (Kütüphane gerekmez)
    let sanofiPrice = null;
    try {
      const yahooRes = await axios.get("https://query1.finance.yahoo.com/v8/finance/chart/SAN.PA", {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      sanofiPrice = yahooRes.data.chart.result[0].meta.regularMarketPrice;
    } catch (e) {
      console.error("Sanofi çekilemedi:", e.message);
    }

    // 2. EUR/TRY Verisini Açık ve Ücretsiz Döviz API'sinden çekiyoruz
    let eurtryPrice = null;
    try {
      const currencyRes = await axios.get("https://open.er-api.com/v6/latest/EUR");
      eurtryPrice = currencyRes.data.rates.TRY;
    } catch (e) {
      console.error("Euro/TL çekilemedi:", e.message);
    }

    // Frontend'e verileri dönüyoruz
    res.json({
      success: true,
      sanofi: sanofiPrice,
      eurtry: eurtryPrice,
      updated: new Date().toISOString()
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda sorunsuz çalışıyor.`);
});
