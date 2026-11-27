// Tek seferlik: rotasyon aylık listeleri (2024-02 → 2026-11). MOD=incele yalnızca raporlar, MOD=yaz yazar.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
(async () => {
  const mod = process.env.MOD || 'incele';
  const q = await db.collection('rotasyon').get();
  const ay = {}; let bir = null;
  q.docs.forEach(d => { if (d.id.startsWith('ay-')) ay[d.id.slice(3)] = d.data(); else if (d.id === 'birikim') bir = d.data(); else console.log('diğer belge:', d.id); });
  console.log('mevcut aylar:', Object.keys(ay).sort().join(', '));
  const ilk = Object.keys(ay).sort()[0]; if (ilk) console.log('örnek belge alanları:', ilk, Object.keys(ay[ilk]).join(','), JSON.stringify(ay[ilk].servisler && ay[ilk].servisler[0]).slice(0, 200));
  if (bir) { console.log('birikim kadarAy:', bir.kadarAy, '· kişi:', (bir.kisiler || []).length, '· hedefler:', (bir.hedefler || []).map(h => h.ad + '=' + h.ay).join(' | ')); console.log('esle:', JSON.stringify(bir.esle || {})); }
  Object.keys(ay).sort().forEach(m => console.log('  ', m, (ay[m].servisler || []).map(s => s.ad + '(' + (s.kisiler || []).length + ')').join(', ')));
  if (mod !== 'yaz') return;
  const data = JSON.parse(Buffer.from(process.env.EP_DATA || '', 'base64').toString('utf8'));
  const sahip = (await db.doc('meta/sahip').get()).data() || {};
  let n = 0;
  for (const m of Object.keys(data).sort()) {
    const servisler = Object.entries(data[m]).map(([ad, kisiler]) => ({ ad, kisiler }));
    const eski = ay[m] || {};
    await db.doc('rotasyon/ay-' + m).set(Object.assign({}, eski, { ay: m, servisler, kaynak: 'Rotasyon_Listesi_2024_2026_Guncel_6.xlsx', guncelleyen: sahip.uid || '', guncelleme: new Date().toISOString() }));
    n++;
  }
  console.log('yazılan ay:', n);
})().catch(e => { console.error(e); process.exit(1); });
