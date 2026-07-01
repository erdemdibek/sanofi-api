const express = require("express");
const yahooFinance = require("yahoo-finance2").default;
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/market", async (req, res) => {
  try {
    const sanofi = await yahooFinance.quote("SAN.PA");
    const eurtry = await yahooFinance.quote("EURTRY=X");

    res.json({
      success: true,
      sanofi: sanofi.regularMarketPrice,
      eurtry: eurtry.regularMarketPrice,
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
  console.log("Sanofi API çalışıyor.");
});
