# Dokümantasyon Yaşam Döngüsü

Bu belge, duyurulmuş bir GİB veya ürün değişikliğinin yürürlüğe girmesinden sonra
public dokümantasyona nasıl taşınacağını tanımlar. Amaç yalnız metin güncellemek
değil; entegratörün ve portal kullanıcısının ne değiştiğini, kendisinden ne
beklendiğini ve platformun hangi işi üstlendiğini tereddütsüz anlayabildiği,
kaynaklarla doğrulanmış bir sözleşme oluşturmaktır.

## Belge türlerinin görevi

| Belge | Cevapladığı soru | İçerik sınırı |
|---|---|---|
| Gelecek değişiklik | İlan edilen tarihte ne değişmesi bekleniyor ve hazırlık için ne yapılmalı? | Henüz yürürlükte olmayan doğrulanmış beklentiler |
| Güncel ürün rehberi | Bugün geçerli request, mapping, kural, hata ve platform davranışı nedir? | Kanonik ve ayrıntılı mevcut sözleşme |
| Sürüm notu | Belirli tarihte önceki duruma göre ne eklendi, değişti veya kaldırıldı; kim aksiyon almalı? | Bir olayın ürünler arası tarihsel karşılaştırması |
| Ürün changelog'u | Bu üründe hangi tarihte hangi dış sözleşme değişti ve etkisi ne oldu? | Ürüne özel kısa değişiklik geçmişi ve kanonik bağlantılar |

Sürüm notu ile changelog aynı metnin iki kopyası değildir. Sürüm notu bir geçiş
olayını ürünler arasında karşılaştırır; changelog tek ürünün kronolojik izini
tutar. Güncel davranışın ayrıntısı ise yalnız kanonik ürün rehberinde yaşar.

## 1. Yürürlük teyidi

Planlanan tarih geçmiş olsa bile değişiklik otomatik olarak yürürlükte kabul
edilmez. Aşağıdaki üç kanıt birlikte değerlendirilir:

1. GİB'in resmi paketi, kılavuzu, şematronu, XSD'si veya duyurusu.
2. Yayımlanan backend/frontend/veritabanı sürümünün gerçek kod sözleşmesi.
3. Entegratör API'si veya portal üzerinden dışarıdan gözlenebilir davranış.

Aktivasyon tarihi, incelenen kaynak sürümleri ve varsa çalıştırılamayan runtime
kontrolleri çalışma notunda kaydedilir. Teyit edilmeyen davranış yürürlükteymiş
gibi yayımlanmaz; yalnız review bulgusu olarak tutulur.

## 2. Kaynak doğrulama matrisi

Her teknik iddia, yayımlanmadan önce uygun gerçek kaynağa bağlanır.

| Dokümante edilen konu | Asgari doğrulama kaynağı |
|---|---|
| Request alanı ve veri tipi | Gerçek request modeli ve endpoint sözleşmesi |
| JSON → UBL veya UBL → model mapping | İlgili mapper/serializer ve GİB şeması |
| Enum, kod listesi ve izinli değer | Kod enum'u/parametresi ile resmi kod listesi |
| Zorunluluk ve validasyon | Tüm ilgili validation dalları ve gerekiyorsa şematron |
| Hata kodu ve mesajı | Dışarıdan dönen gerçek hata üretim dallarının tamamı |
| Portal alanı ve otomatik davranış | Güncel frontend akışı ile çağırdığı API davranışı |
| Rapor veya zarf üretimi | Rapor/zarf modeli, mapper ve resmi paket sözleşmesi |
| Önceki davranış | Önceki yayımlanmış sürüm veya sürüm öncesi doğrulanmış kod |

Genel UBL bilgisi, ürün mapper'ında bulunmayan bir mapping'i varmış gibi
göstermek için kullanılamaz. Bir kuralın öncesi bilinmiyorsa tahminle
"önceden serbestti" yazılmaz.

## 3. Gelecek sayfasından güncel rehbere geçiş

Önce eski gelecek değişiklik içeriğinin envanteri çıkarılır. Her cümle, request
alanı, mapping, enum, hata kodu, örnek ve bağlantı aşağıdaki hedeflerden birine
atanır:

- güncel ürün rehberindeki kanonik konu;
- tarihsel sürüm notu;
- ürün changelog'u;
- henüz yürürlükte olmayan ayrı gelecek değişiklik kapsamı;
- yanlış veya geçersiz olduğu kanıtlanan ve yayımlanmaması gereken içerik.

Yürürlüğe giren bilgiler normal anlatımın içine yerleştirilir. Ayrı bir
"güncel GİB kuralları" sayfası açılarak mevcut rehberle paralel ikinci sözleşme
oluşturulmaz. `yapılacak`, `geçecek`, `beklenecek` gibi gelecek zaman ifadeleri
güncel davranışı anlatan dile çevrilir.

Eski URL daha önce public olmuşsa silinmez. `noindex,follow` kullanan kısa bir
köprü sayfası, okuyucuyu merkezi sürüm notundaki ilgili ürün satırına yönlendirir.
Köprü sayfası teknik sözleşmeyi tekrar etmez.

## 4. Okuyucu ve aksiyon sözleşmesi

Her değişiklik açıklaması şu soruların tamamına cevap verir:

1. Tam olarak ne eklendi, değişti veya kaldırıldı?
2. Hangi koşulda zorunlu, geçerli veya geçersiz?
3. Entegratör hangi alanı, yolu, biçimi veya hata eşlemesini değiştirmeli?
4. Portal kullanıcısı ek bilgi girmeli mi?
5. Platform hangi teknik işi otomatik olarak yapıyor?
6. Mevcut kullanım aynen geçerliyse neden ek işlem gerekmiyor?
7. Ayrıntılı güncel sözleşme hangi kanonik sayfada?

Entegratör, portal kullanıcısı ve doğrudan GİB zarfı/XML'i üreten taraf aynı
aktör değildir. Sorumluluklar karışıyorsa ayrı cümle veya satır kullanılır.
"Aksiyon yok" tek başına yeterli değildir; kimin için ve platformun hangi
davranışı nedeniyle işlem gerekmediği belirtilir.

Belirsiz iç ifadeler dış sözleşme diline çevrilir. Örneğin "VKN/TCKN alıcı tipine
göre GİB rapor tarafı" yerine, hangi kimlikte hangi XML dalının üretildiği ve
entegratörün rapor alanı gönderip göndermediği açıkça yazılır.

## 5. Sürüm notu yapısı

Sürüm notunun başlığı tarih ve olay kapsamını açıklar. Giriş bölümü belgenin
tarihsel bir karşılaştırma kaydı olduğunu ve güncel ayrıntıların ürün
rehberlerinde tutulduğunu söyler.

Ana içerik karşılaştırma tablosudur:

| Ürün / konu | Değişiklikten önce | Değişiklikten sonra | Entegratör ve portal aksiyonu | Güncel rehber |
|---|---|---|---|---|

- Bağımsız değişiklikler ayrı satırlarda gösterilir.
- Çok sayıdaki konu, belge doğrulama, rapor/kimlik ve kullanıcı hesabı gibi
  anlamlı tablolara ayrılır.
- Aynı hücrede uzun bir `Eklendi`/`Değişti`/`Kaldırıldı` zinciri kurulmaz.
- Aksiyon durumu `Aksiyon gerekli`, `Koşullu`, `Ek teknik işlem yok` veya
  `Mevcut kullanım geçerli` gibi doğrudan etiketlenebilir.
- `Ayrıntı` veya `Detay` gibi bağlamsız link metni kullanılmaz; link hedefindeki
  sözleşmenin adı yazılır.
- Her ürün için kalıcı anchor bulunur; eski URL köprüleri bu anchor'a gider.
- Sürüm notu kendi sidebar'ında yalnız sürüm notu arşivini gösterir. Güncel
  rehber bağlantıları ilgili satırda yer alır.
- Yayımlanmamış veya bu sürümde aktif olmayan özellik, "kapsam dışı" notuyla
  dahi bu yürürlük olayının sürüm notuna eklenmez. Ayrı gelecek değişiklik kaydı
  kendi bağlamında korunabilir.

## 6. Changelog yapısı

Her etkilenen ürünün changelog'unda aynı tarih için tek satır bulunur. Standart
sütunlar `Tarih`, `Değişiklik`, `Etki` ve `Referans`tır.

- `Değişiklik`, dış sözleşmede neyin değiştiğini somut olarak söyler.
- `Etki`, gözlenebilir sonucu ve gerekli aksiyonu kısa biçimde söyler.
- `Referans`, güncel kanonik sayfalara ve merkezi sürüm notundaki ürün anchor'ına
  gider.
- Satır, sürüm notundaki uzun karşılaştırmayı tekrar etmez.
- Yürürlük sonrası satırda planlanan/gelecek zaman dili kullanılmaz.
- İlgili sürümde yayımlanmamış özellikler o yürürlük olayının changelog satırına
  eklenmez; ayrı bir planlanan değişiklik satırıyla karıştırılmaz.

## 7. Güncellenen sayfaların teyidi

Geçiş çalışması için bir hedef sayfa matrisi tutulur:

| Değişiklik | Güncel rehber | Request örneği | Mapping | Teknik referans/hata | Sürüm notu | Changelog | Eski URL |
|---|---|---|---|---|---|---|---|

Her hücre `güncellendi`, `etkilenmiyor` veya `doğrulanamadı` olarak kapatılır.
Boş hücre tamamlanmış kabul edilmez. Silinen içerik matrise geri bakılarak
karşılaştırılır; aktarılmayan iddia veya örnek kalmadığı teyit edilir.

## 8. Yayın öncesi kalite kapısı

Repo kökünde arama indeksi yeniden üretilir:

```powershell
node tools\build-site-search-index.js
```

Oxara.DevKit içinden aşağıdaki kontroller çalıştırılır:

```powershell
node tools\guide-vbt\src\cli.js sync-guide all --check
node tools\guide-vbt\src\cli.js audit all
node tools\guide-vbt\src\cli.js quality all
node tools\guide-vbt\test\guide-renderer.test.js
```

Bunlara ek olarak:

- `git diff --check` temiz olmalıdır.
- Değişen tüm local linkler ve anchor'lar doğrulanmalıdır.
- Sürüm notu, changelog, eski URL köprüleri, sitemap ve arama indeksi birlikte
  kontrol edilmelidir.
- Yerel HTTP sunucusunda masaüstü ve dar ekran görsel incelemesi yapılmalıdır.
- Tabloların hücre yoğunluğu, yatay kayma davranışı ve okunabilirliği
  doğrulanmalıdır.
- Yayımlanan cümleler kaynak doğrulama matrisiyle ikinci kez karşılaştırılmalıdır.

Makine kontrollerinin geçmesi teknik iddiaların doğru olduğu anlamına gelmez.
Kaynak incelemesi ve render edilmiş sayfa kontrolü ayrı zorunlu kapılardır.

## 9. Tamamlanma ölçütü

Çalışma yalnız aşağıdaki koşulların tümü sağlandığında yayına hazırdır:

- yürürlük üçlü kanıtla teyit edilmiştir;
- güncel rehberlerde tek kanonik sözleşme vardır;
- request, mapping, enum, hata ve portal davranışı gerçek kaynaklardan
  doğrulanmıştır;
- entegratör ve portal aksiyonu ayrı ve kesin yazılmıştır;
- sürüm notu önce/sonra mukayesesi ve açık aksiyon içerir;
- her etkilenen ürün changelog'u günceldir;
- eski public URL'ler çalışan köprü olarak korunmuştur;
- yayımlanmamış özellikler aktif kayıtlara karışmamıştır;
- arama, sitemap, link, anchor, responsive görünüm ve DevKit kontrolleri
  geçmiştir;
- çalıştırılmayan runtime kontrolleri sonuç raporunda açıkça belirtilmiştir.

Commit, push, pull request, merge ve production yayını bu kalite kapısından ayrı
işlemlerdir; kullanıcı tarafından ayrıca istenir.
