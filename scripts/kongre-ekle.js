// Tek seferlik: nöbet ve haftalık listelerde "MERVE K" / "MERVE K." → "MERVEKA"
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const RE = /(^|[\s,;·\/(])MERVE(?:\s+K\.?|K)(?=$|[\s,;·\/)])/gi;
let say = 0;
const deg = v => {
  if (typeof v === 'string') { return v.replace(RE, (m, a) => { say++; return a + 'MERVEKA'; }); }
  if (Array.isArray(v)) return v.map(deg);
  if (v && typeof v === 'object' && !(v instanceof admin.firestore.Timestamp)) { const o = {}; for (const k in v) o[k] = deg(v[k]); return o; }
  return v;
};
(async () => {
  for (const c of ['nobet', 'haftalik']) {
    for (const d of (await db.collection(c).get()).docs) {
      const once = say; const yeni = deg(d.data());
      if (say > once) { await d.ref.set(Object.assign(yeni, { guncelleme: new Date().toISOString() })); console.log(`${c}/${d.id}: ${say - once} hücre`); }
    }
  }
  console.log('toplam değişen:', say);
  (await db.collection('kayit').get()).docs.forEach(d => { const k = d.data(); if (/merve/i.test(k.adSoyad || '')) console.log('kayıt:', k.adSoyad, '→ listede:', k.kisaAd); });
})().catch(e => { console.error(e); process.exit(1); });
