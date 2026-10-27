param(
    [Parameter(Mandatory = $true)][ValidateSet('Create','Update','Preview','Receipt')][string]$Operation,
    [Parameter(Mandatory = $true)][string]$UblPath,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [string]$DespatchAdviceExternalId,
    [string]$ReceiverIdentifier,
    [string]$FirmBranchCode,
    [switch]$IsSigned,
    [switch]$IsZipped
)

$ErrorActionPreference = 'Stop'
if ($IsSigned -and $Operation -ne 'Create') {
    throw 'İmzalı dosya örneği yalnız Create içindir. Update/Preview/Receipt akışları oluşturmayla aynı imza sözleşmesini sağlamaz.'
}
$sourcePath = (Resolve-Path -LiteralPath $UblPath).Path
$bytes = [IO.File]::ReadAllBytes($sourcePath)
$xmlBytes = $bytes
if ($IsZipped) {
    Add-Type -AssemblyName System.IO.Compression
    $stream = [IO.MemoryStream]::new($bytes, $false)
    $archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Read)
    try {
        $entries = @($archive.Entries | Where-Object { $_.Name -and $_.Name.EndsWith('.xml', [StringComparison]::OrdinalIgnoreCase) })
        if ($entries.Count -ne 1) { throw 'ZIP tam bir UBL XML dosyası içermelidir.' }
        $entryStream = $entries[0].Open()
        $content = [IO.MemoryStream]::new()
        try { $entryStream.CopyTo($content); $xmlBytes = $content.ToArray() } finally { $entryStream.Dispose(); $content.Dispose() }
    } finally { $archive.Dispose(); $stream.Dispose() }
}
$readerSettings = [Xml.XmlReaderSettings]::new()
$readerSettings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$readerSettings.XmlResolver = $null
$xmlStream = [IO.MemoryStream]::new($xmlBytes, $false)
$reader = [Xml.XmlReader]::Create($xmlStream, $readerSettings)
$doc = [Xml.XmlDocument]::new()
$doc.XmlResolver = $null
try { $doc.Load($reader) } finally { $reader.Dispose(); $xmlStream.Dispose() }
$expectedRoot = if ($Operation -eq 'Receipt') { 'ReceiptAdvice' } else { 'DespatchAdvice' }
if ($doc.DocumentElement.LocalName -ne $expectedRoot -or $doc.DocumentElement.NamespaceURI -ne ('urn:oasis:names:specification:ubl:schema:xsd:' + $expectedRoot + '-2')) {
    throw "Bu işlem için UBL $expectedRoot kökü gereklidir. Platform request XML'i kullanılamaz."
}
$profile = $doc.GetElementsByTagName('ProfileID', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2')
if ($expectedRoot -eq 'DespatchAdvice' -and $profile.Count -and $profile[0].InnerText -eq 'IDISIRSALIYE') {
    $ns = [Xml.XmlNamespaceManager]::new($doc.NameTable)
    $ns.AddNamespace('d', 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2')
    $ns.AddNamespace('cac', 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2')
    $ns.AddNamespace('cbc', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2')
    $shipmentIds = $doc.SelectNodes('/d:DespatchAdvice/cac:DespatchSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID="SEVKIYATNO"]', $ns)
    if ($shipmentIds.Count -ne 1 -or $shipmentIds[0].InnerText -notmatch '^(SE|ES)-[0-9]{7}$') {
        throw 'İDİS UBL supplier alanında gerçek SE-/ES- sevkiyat numarasını taşıyan tek bir SEVKIYATNO kimliği bulunmalıdır.'
    }
}
if ($IsSigned -and -not $doc.GetElementsByTagName('Signature', 'http://www.w3.org/2000/09/xmldsig#').Count) {
    throw 'IsSigned için ds:Signature gereklidir; cac:Signature üstverisi tek başına elektronik imza değildir.'
}
if ($Operation -eq 'Receipt') {
    $endpoint = 'AddOutgoingReceiptAdviceByUbl'
    $request = [ordered]@{ FileBytes=[Convert]::ToBase64String($bytes); IsZipped=[bool]$IsZipped; IsSigned=$false }
} else {
    if ([string]::IsNullOrWhiteSpace($DespatchAdviceExternalId) -or [string]::IsNullOrWhiteSpace($ReceiverIdentifier)) {
        throw 'DespatchAdviceExternalId ve ReceiverIdentifier verilmelidir.'
    }
    $endpoint = @{ Create='AddOutgoingDespatchAdviceByUbl'; Update='UpdateOutgoingDespatchAdviceByUbl'; Preview='OutgoingDespatchAdviceUblPreview' }[$Operation]
    $request = [ordered]@{ DespatchAdviceExternalId=$DespatchAdviceExternalId; ReceiverIdentifier=$ReceiverIdentifier; FileBytes=[Convert]::ToBase64String($bytes); IsZipped=[bool]$IsZipped; IsSigned=[bool]$IsSigned }
    if ($FirmBranchCode) { $request['FirmBranchCode'] = $FirmBranchCode }
}
# Preserve the original file/ZIP bytes. XML parsing above is inspection only;
# no reserialization, signing, network call or cryptographic verification occurs.
[IO.File]::WriteAllText([IO.Path]::GetFullPath($OutputPath), ($request | ConvertTo-Json -Depth 10), [Text.UTF8Encoding]::new($false))
Write-Output "POST /api/VbtApi/$endpoint"
Write-Output "Request hazır: $OutputPath (gönderilmedi; kriptografik imza doğrulanmadı)."
