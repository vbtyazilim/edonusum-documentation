# edonusum-documentation

VBT ürünlerinin müşteri/entegratör entegrasyon rehberleri (guide).

## Şablon referansı

Görsel/işlevsel altyapı `Vbt.DocumentTemplate` (private, `oxara.github.com/Template/DocumentTemplate/Vbt.DocumentTemplate`, kendisi `Oxara.DocumentTemplate`'in markalanmış bir türevidir) reposundan **vendor edilmiş** bir kopyadır: `assets/vbt-document-template/` (2026-07-08 tarihli kopya). Bu repo CDN'e bağımlı değildir; `Vbt.DocumentTemplate` güncellendiğinde bu klasör elle yeniden kopyalanmalıdır.

## Yapı

```text
index.html                     → rehberler hub sayfası
guides/<guide-adı>/            → her ürün için ayrı bir guide (bkz. guides/e-gider-pusulasi)
  index.html                   → guide'a özel konu kartları
  docs/*.html                  → guide'ın alt sayfaları
assets/vbt-document-template/  → vendor edilmiş şablon (elle güncellenir)
```

## Yeni guide eklerken özelleştirilmesi gereken noktalar

Yeni bir ürün guide'ı eklerken aşağıdakiler **her guide için** değişir, geri kalan her şey (favicon linkleri, `vbt-brand-mark`, `author-link`, vendor edilen CSS/JS yolları) şablondan olduğu gibi kopyalanır:

- `<title>` / `<meta name="description">` — guide ve her alt sayfa için özgün
- Topbar'daki guide adı (`<span>e-Gider Pusulası</span>` benzeri) ve üst nav bağlantıları (`Rehber`, `API` gibi guide'a özel kısayollar)
- `docs-home-grid` içindeki konu kartları (index.html) ve `docs-nav-group`/`docs-nav-link` sidebar yapısı (her docs sayfası)
- `window.SEARCH_CONFIG.externalItems` — sayfa arası arama için guide'a özel sayfa listesi
- İçerik gövdesi (`docs-article` içi) — guide'ın kendi teknik/iş içeriği

**Değişmemesi gerekenler:** `<meta name="author">` (Erdem Özkara), `author-link` hedefi (`vbt.com.tr`), `vbt-brand-mark` işareti, favicon linkleri, `assets/vbt-document-template/` altındaki dosyalara giden relative path'lerin yapısı (guide derinliğine göre `../../` veya `../../../` sayısı doğru ayarlanmalı).
