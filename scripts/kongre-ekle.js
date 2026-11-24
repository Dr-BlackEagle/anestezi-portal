// Tek seferlik: Faydalı İçerikler'e LAST protokolünü ekle (aynı başlık varsa dokunmaz)
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const BASLIK = 'LAST – Lokal Anestezik Sistemik Toksisitesi Tedavisi';
const METIN = `# Hemen
- Lokal anestezik enjeksiyonunu/infüzyonunu **durdur**
- **Yardım çağır**, LAST setini ve **%20 lipid emülsiyonunu** getirt
- Kardiyovasküler instabilite varsa KPB/ECMO ekibini erkenden haberdar et

# Havayolu ve nöbet
- **%100 O2** ile ventile et; hipoksi ve asidozdan kaçın (gerekirse entübasyon)
- Nöbet: **benzodiazepin** tercih edilir
- Kardiyovasküler instabilite bulgusu varsa **propofolden kaçın**

# %20 Lipid emülsiyonu (erken başla)
**70 kg üzeri:**
- Bolus **100 mL**, 2–3 dk içinde
- Ardından **200–250 mL**, 15–20 dk içinde infüzyon

**70 kg ve altı:**
- Bolus **1,5 mL/kg** (yağsız vücut ağırlığı), 2–3 dk içinde
- Ardından **0,25 mL/kg/dk** infüzyon

**Yanıt yoksa / instabilite sürüyorsa:**
- Bolusu 1–2 kez tekrarla
- İnfüzyonu **0,5 mL/kg/dk**'ya çıkar
- Hemodinami stabil olduktan sonra en az **10 dk** infüzyona devam et
- Üst sınır: ilk 30 dk'da yaklaşık **12 mL/kg**
- Propofol lipid tedavisinin yerine geçmez

# Kardiyak arrest varsa (ACLS'den farklar)
- Adrenalin dozunu **≤1 mcg/kg** olarak küçük tut
- **Vazopressin, kalsiyum kanal blokeri, beta bloker ve lokal anestezik (lidokain dahil) VERME**
- Aritmide amiodaron tercih edilebilir
- Lipid tedavisine yanıt yoksa **KPB/ECMO**

# İzlem
- Kardiyovasküler olay sonrası en az **4–6 saat**
- Yalnızca SSS bulgusu olduysa en az **2 saat**

Kaynak: ASRA 2020 LAST kontrol listesi. Bölüm protokolüyle birlikte kullanınız.`;
(async () => {
  const q = await db.collection('icerik').where('baslik', '==', BASLIK).get();
  if (!q.empty) { console.log('zaten var'); return; }
  const sahip = (await db.doc('meta/sahip').get()).data() || {};
  await db.collection('icerik').add({ baslik: BASLIK, kat: 'Protokoller', metin: METIN, link: 'https://rapm.bmj.com/content/46/1/81', linkAd: 'ASRA 2020 makalesi', sabit: true, ts: Date.now(), guncel: Date.now(), u: sahip.uid || '', guncelleyen: sahip.uid || '' });
  console.log('eklendi');
})().catch(e => { console.error(e); process.exit(1); });
