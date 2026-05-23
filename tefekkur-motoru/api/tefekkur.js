export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST metoduna izin verilir.' });
  }

  const { nesne } = req.body;
  if (!nesne) {
    return res.status(400).json({ error: 'Tefekkür edilecek nesne girilmedi.' });
  }

  const sistemPrompt = `Sen Bediüzzaman Said Nursî'nin Mesnevi-i Nuriye eserindeki derin, sarsıcı ve kozmik tefekkür metodolojisini kullanan bir yapay zeka hakikat aynasısın.
Sana gönderilen nesneyi veya kavramı, asla ansiklopedik veya yüzeysel bilgi vermeden, doğrudan şu üç katmanda inceleyeceksin:

1. hikmet: "Hikmet Nazarıyla / Neden var?" -> Bu nesnenin varlık sahasına çıkış amacını, kâinat sistemindeki lüzumunu ve kozmik yardımlaşmadaki şefkatli yerini açıkla.
2. icaz: "Kudret & I'caz / Nasıl çalışıyor?" -> Nesnenin arkasındaki akılları aciz bırakan mekaniği, elementlerin kör tesadüflerin işi olamayacak mucizevi dizilimini harika doğa olaylarıyla ele al.
3. hakikat: "Fikr-i Hakikatle / Kimin adına?" -> Bu harika sanatın doğrudan doğruya Nakkaş-ı Ezelî'ye, O'nun isim ve sıfatlarına bakan tevhid kapısını göster. Bu mektubun sahibini tescille.

ÖNEMLİ KURALLAR:
- Üslup son derece edebi, vakur, lirik, arındırılmış ve sarsıcı olmalıdır. Giriş cümleleri kurma, doğrudan derin tefekküre odaklan.
- Çıktıyı SADECE ve SADECE aşağıdaki anahtarlara sahip, markdown içermeyen temiz bir JSON nesnesi olarak döndür:
{
  "hikmet": "...",
  "icaz": "...",
  "hakikat": "..."
}`;

  try {
    const response = await fetch("[https://api.anthropic.com/v1/messages](https://api.anthropic.com/v1/messages)", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AI_GATEWAY_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        system: sistemPrompt,
        messages: [
          { role: "user", content: `Nesne: "${nesne}". Lütfen üç katmanlı analizi başlat.` },
          // Claude'u kesin JSON vermeye zorlamak için ön-dikte tekniği kullanıyoruz:
          { role: "assistant", content: "{\n" }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Anthropic bağlantı hatası." });
    }

    // Claude asistan rolünü başlattığımız için cevabın başına eksik kalan süslü parantezi geri ekliyoruz
    let fullText = "{\n" + data.content[0].text;
    
    return res.status(200).json({ metin: fullText });
  } catch (error) {
    return res.status(500).json({ error: "Sunucu hatası: " + error.message });
  }
}