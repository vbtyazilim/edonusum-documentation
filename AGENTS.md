# Dokümantasyon Repo Talimatları

Bu repo üzerinde çalışan agent, içerik üretmeden veya güncellemeden önce
`DOCUMENTATION-LIFECYCLE.md` dosyasını ve aktif Oxara.DevKit
`standards/guide-vbt.md` standardını okumalıdır.

## Zorunlu çalışma kuralları

1. GİB tarafından duyurulan bir gelecek değişikliği, yalnız tarihi geçti diye
   yürürlükte kabul edilmez. Resmi kaynak, kod tabanı ve yayımlanan platform
   davranışı birlikte doğrulanır.
2. Yürürlüğe giren kural, ayrı bir "güncel GİB kuralları" adasında bırakılmaz;
   normal ürün rehberindeki kanonik konuya eklenir. Gelecek zaman dili kaldırılır.
3. Eski gelecek değişiklik sayfasındaki her iddia, alan, hata, örnek ve bağlantı
   envantere alınmadan sayfa kaldırılmaz. Her öğenin güncel rehber, sürüm notu,
   changelog veya ayrı gelecek kapsamındaki hedefi açıkça belirlenir.
4. Sürüm notu tarih/olay odaklı karşılaştırma kaydıdır. Ürün changelog'u ürün
   odaklı kısa geçmiş kaydıdır. İki belge birbirinin kopyası yapılmaz.
5. Her değişiklik için entegratör, portal kullanıcısı ve gerekiyorsa doğrudan GİB
   zarfı üreten tarafın aksiyonu ayrı ve açık yazılır. "Rapor tarafı",
   "alıcı ayrımı", "çeşitli validasyonlar" veya yalnız "Detay" gibi belirsiz
   ifadeler yayımlanmaz.
6. Yayımlanmamış, devre dışı veya ilgili sürümün parçası olmayan özellikler o
   yürürlük olayının sürüm notuna ve changelog satırına "kapsam dışı"
   açıklamasıyla dahi eklenmez. Ayrı bir gelecek değişiklik kaydı varsa kendi
   bağlamında korunur.
7. Request, mapping, enum, hata kodu, validasyon ve portal davranışı gerçek
   model/mapper/validation/UI akışından doğrulanmadan olmuş gibi yazılmaz.
8. Ortak navigasyon ve manifest blokları HTML içinde elle düzenlenmez.
   `guide.manifest.json` ve `sync-guide` akışı kullanılır.
9. Makine kontrolleri kaynak doğrulamasının ve görsel incelemenin yerine geçmez.
   Yerel HTTP önizlemesinde masaüstü ve dar ekran kontrolü yapılmadan iş bitmiş
   sayılmaz.
10. Commit, push, pull request, merge veya yayın işlemi ayrıca açıkça istenmeden
    yapılmaz.

## Tamamlama kapısı

Bir yürürlük geçişi ancak `DOCUMENTATION-LIFECYCLE.md` içindeki kaynak matrisi,
hedef sayfa matrisi ve yayın öncesi kontrol listesi tamamlandığında hazır kabul
edilir. Son raporda hangi kontrollerin çalıştırıldığı ve hangi runtime
doğrulamalarının yapılmadığı açıkça belirtilir.
