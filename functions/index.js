// Asistan Portal — telefon bildirimleri (Firebase Cloud Messaging)
// Bu dosya GitHub Actions ile otomatik yüklenir; elle bir şey yapmaya gerek yok.
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const URL = 'https://dr-blackeagle.github.io/anestezi-portal/';
const fn = functions.region('europe-west1').runWith({ timeoutSeconds: 60, memory: '256MB' });

const AY = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const pd = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const gun = s => { if (!s) return ''; const d = pd(s); return `${d.getUTCDate()} ${AY[d.getUTCMonth()]}`; };
const ayAd = k => { const [y, m] = String(k).split('-').map(Number); return m ? `${AY[m - 1]} ${y}` : String(k); };
const hafta = mon => { const a = pd(mon), b = new Date(a.getTime() + 4 * 864e5); return a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()}–${b.getUTCDate()} ${AY[b.getUTCMonth()]}` : `${a.getUTCDate()} ${AY[a.getUTCMonth()]} – ${b.getUTCDate()} ${AY[b.getUTCMonth()]}`; };
const ilk = s => String(s || '').trim().split(/\s+/)[0] || '';
const kisa = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

async function sahipUid() { const d = await db.doc('meta/sahip').get(); return d.exists ? d.data().uid : null; }
async function onayliler() { const q = await db.collection('onay').get(); const s = new Set(q.docs.map(d => d.id)); const o = await sahipUid(); if (o) s.add(o); return [...s]; }
async function yoneticiler() { const s = new Set(); const o = await sahipUid(); if (o) s.add(o); const y = await db.doc('yetki/liste').get(); if (y.exists) (y.data().uids || []).forEach(u => s.add(u)); return [...s]; }

async function gonder(uids, title, body, hash, haric, opt = {}) {
  uids = [...new Set(uids.filter(u => u && u !== haric))];
  if (!uids.length) return;
  const docs = [];
  for (let i = 0; i < uids.length; i += 30) {
    const q = await db.collection('cihazlar').where('u', 'in', uids.slice(i, i + 30)).get();
    docs.push(...q.docs);
  }
  if (!docs.length) return;
  // Sohbet bildirimini bu cihazda kapatanlara sohbet mesajı gitmez
  const tokens = docs.filter(d => !opt.sohbet || d.data().sohbet !== false).map(d => d.id);
  if (!tokens.length) return;
  const link = URL + (hash ? '#' + hash : '');
  for (let i = 0; i < tokens.length; i += 500) {
    const part = tokens.slice(i, i + 500);
    const r = await admin.messaging().sendEachForMulticast({
      tokens: part,
      data: { title, body, link },
      webpush: {
        headers: { Urgency: 'high', TTL: '86400' },
        notification: { title, body, icon: URL + 'icon-192.png', badge: URL + 'icon-192.png', tag: hash || 'portal', renotify: true },
        fcmOptions: { link }
      }
    });
    const sil = [];
    r.responses.forEach((x, j) => { const c = x.error && x.error.code; if (c === 'messaging/registration-token-not-registered' || c === 'messaging/invalid-registration-token' || c === 'messaging/invalid-argument') sil.push(part[j]); });
    await Promise.all(sil.map(t => db.doc('cihazlar/' + t).delete().catch(() => {})));
  }
}

// 1) Yeni duyuru → herkes
exports.duyuru = fn.firestore.document('duyurular/{id}').onCreate(async snap => {
  const a = snap.data() || {};
  const t = (a.onemli ? '❗ ' : '📢 ') + kisa(a.baslik || 'Yeni duyuru', 70);
  await gonder(await onayliler(), t, kisa(a.metin || 'Yeni duyuru yayınlandı', 160), 'duyuru', a.yazan);
});

// 2) Aylık nöbet listesi yüklendi → herkes
exports.nobetListesi = fn.firestore.document('nobet/{k}').onWrite(async (ch, ctx) => {
  if (!ch.after.exists) return;
  const a = ch.after.data() || {}, b = ch.before.exists ? ch.before.data() || {} : {};
  if (!a.bildir || a.bildir === b.bildir) return;
  await gonder(await onayliler(), '🗓️ Nöbet listesi yayınlandı', `${ayAd(a.ay || ctx.params.k)} nöbet listesi portalda.`, 'nobet', a.guncelleyen);
});

// 3) Haftalık masa listesi → herkes
exports.haftalikListe = fn.firestore.document('haftalik/{id}').onWrite(async ch => {
  if (!ch.after.exists) return;
  const a = ch.after.data() || {}, b = ch.before.exists ? ch.before.data() || {} : {};
  if (!a.bildir || a.bildir === b.bildir) return;
  await gonder(await onayliler(), '🧾 Haftalık liste yayınlandı', `${a.hafta ? hafta(a.hafta) : 'Bu hafta'} ${a.tur === 'uzman' ? 'uzman ' : ''}masa listesi portalda.`, 'haftalik', a.guncelleyen);
});

// 4) Nöbet değişimi
exports.nobetDegisim = fn.firestore.document('takas/{id}').onWrite(async ch => {
  if (!ch.after.exists) return;
  const x = ch.after.data() || {}, o = ch.before.exists ? ch.before.data() || {} : {};
  if (x.durum === o.durum) return;
  const ne = `${gun(x.tarih)} · ${x.col || 'nöbet'}`;
  const krs = x.karsi ? ` (karşılığında ${gun(x.karsi.tarih)})` : '';
  if (x.durum === 'acik' && !ch.before.exists)
    return gonder(await onayliler(), '🔁 Nöbet değişim ilanı', `${x.ad}: ${ne}. Almak isteyen portala baksın.`, 'degisim', x.u);
  if (x.durum === 'teklif')
    return gonder([x.u], '🔁 Nöbetine teklif var', `${x.aad}, ${ne} nöbetini almak istiyor${krs}. Kabul ya da reddet.`, 'degisim');
  if (x.durum === 'kabul') {
    await gonder([x.au], '✅ Teklifin kabul edildi', `${ilk(x.ad)} ${ne} değişimini kabul etti; yetkili onayı bekleniyor.`, 'degisim');
    return gonder(await yoneticiler(), '🛡️ Onay bekleyen nöbet değişimi', `${x.ad} → ${x.aad} · ${ne}${krs}`, 'yonetim', null);
  }
  if (x.durum === 'red')
    return gonder([x.au], 'Teklif kabul edilmedi', `${ilk(x.ad)} ${ne} değişimini kabul etmedi.`, 'degisim');
  if (x.durum === 'onay')
    return gonder([x.u, x.au], '✅ Nöbet değişimi onaylandı', `${x.ad} → ${x.aad} · ${ne}${krs}. Liste güncellendi.`, 'nobet', x.by);
});

// 5) Yeni kayıt onay bekliyor → yöneticiler
exports.yeniKayit = fn.firestore.document('kayit/{uid}').onCreate(async (snap, ctx) => {
  const k = snap.data() || {};
  const onay = await db.doc('onay/' + ctx.params.uid).get();
  if (onay.exists) return;
  await gonder(await yoneticiler(), '🛡️ Yeni kayıt onay bekliyor', `${k.adSoyad || 'Yeni kişi'} (${k.unvan === 'uzman' ? 'uzman' : 'asistan'}) portala kaydoldu.`, 'yonetim', ctx.params.uid);
});

// 6) Sohbette yeni mesaj → yazan hariç herkes (sohbet bildirimini kapatanlar hariç)
exports.sohbet = fn.firestore.document('sohbet/{id}').onCreate(async snap => {
  const m = snap.data() || {};
  if (!m.metin) return;
  await gonder(await onayliler(), '💬 ' + kisa(m.ad || 'Sohbet', 40), kisa(m.metin, 160), 'sohbet', m.u, { sohbet: true });
});
