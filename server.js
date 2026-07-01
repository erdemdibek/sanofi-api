const express = require("express"); // 'Const' -> 'const' olarak düzeltildi
const yahooFinance = require("yahoo-finance2").default;
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/market", async (req, res) => {
  try {
    // İstekleri paralel atarak hem hızlandırıyoruz hem de hata izolasyonu sağlıyoruz
    const [sanofiResult, eurtryResult] = await Promise.allSettled([
      yahooFinance.quote("SAN.PA"),
      yahooFinance.quote("EURTRY=X")
    ]);

    // Sanofi verisini kontrol et (Hata aldıysa veya veri yoksa null dön)
    const sanofiPrice = sanofiResult.status === "fulfilled" && sanofiResult.value 
      ? sanofiResult.value.regularMarketPrice 
      : null;

    // Euro/TL verisini kontrol et
    const eurtryPrice = eurtryResult.status === "fulfilled" && eurtryResult.value 
      ? eurtryResult.value.regularMarketPrice 
      : null;

    res.json({
      success: true,
      sanofi: sanofiPrice,
      eurtry: eurtryPrice,
      updated: new Date().toISOString()
    });

  } catch (err) {
    // Burası genel bir sunucu hatası olursa devreye girer, sunucu yine de çökmez
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Port tanımı ve sunucu başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sanofi API ${PORT} portunda çalışıyor.`);
});
