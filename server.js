const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // 👈 index.html buradan servis edilecek

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

      sanofiPrice =
        yahooRes.data.chart.result[0].meta.regularMarketPrice;
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