# Vizit Listesi özelliği — değişen dosyalar

Bu üç dosyayı depodaki aynı yollara koyup `main` dalına gönder (commit + push):

- `index.html` — yeni "Vizit Listesi" sayfası (ana sayfada kutucuk): eklentiden gelen listenin tamamını önizleme, "Bölümle paylaş", telefonda hasta başına kart, "Yazdır / PDF" ile eklentideki A4 yatay tablonun aynısı, "Sil".
- `firestore.rules` — yeni `vizit` koleksiyonu: onaylılar okur ve kendi adına paylaşır, paylaşan ya da yetkili siler, değiştirilemez, en fazla 4 günlük süre.
- `functions/index.js` — `vizitListesi` (paylaşınca onaylı herkese bildirim) ve `vizitTemizle` (her gece 03:15'te süresi dolan listeleri siler).

`firestore.rules` ve `functions/` değiştiği için GitHub Actions'taki "Firebase (bildirimler ve kurallar)" iş akışı kuralları ve fonksiyonları kendiliğinden yükler. `index.html` GitHub Pages'te birkaç dakika içinde yayına girer.

Notlar
- Yedekleme listesine (`BK_COL`) `vizit` eklenmedi: hasta bilgisi yedeklere girmesin.
- Liste 72 saat sonra silinir (`index.html` içinde `VZ_SAAT`).
