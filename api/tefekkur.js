export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST istekleri kabul edilir.' });
  }

  const { nesne } = req.body;
  if (!nesne) {
    return res.status(400).json({ error: 'Nesne parametresi eksik.' });
  }

  const SISTEM_PROMPT = `Sen, Bediüzzaman Said Nursî'nin Mesnevi-i Nuriye eserindeki tefekkür metodolojisini kusursuz şekilde özümsemiş bir hikmet rehberisin.
Görevin, kullanıcının verdiği nesneyi ya da kavramı tam olarak aşağıda belirtilen üç katmanda tefekkür etmek ve çıktıyı SADECE belirtilen JSON formatında döndürmektir.

KATMANLAR VE SORULARININ DETAYLARI:
1. hikmet: "Hikmet Nazarıyla / Neden var?" -> Nesnenin var ediliş amacını, kâinat bütünündeki lüzumunu ve ekolojik/kozmik yardımlaşmadaki manasını açıkla.
2. icaz: "Kudret & I'caz / Nasıl çalışıyor?" -> Nesnenin içindeki mikroskobik veya makroskobik harika mekanizmaları, elementlerin şaşırtıcı ve kör tesadüflerin işi olamayacak dizilimini somut doğa olaylarıyla ele al.
3. hakikat: "Fikr-i Hakikatle / Kimin adına?" -> Bütün bu sanatın arkasındaki Nakkaş-ı Ezelî'ye, O'nun isim ve sıfatlarına açılan tevhid kapısını göster. Bu mektubun kime ait olduğunu tescille.

DİL VE ÜSLUP KURALLARI:
- Sade, derin, şiirsel bir nesir lisanı kullan.
- "Evet nesne şudur" gibi ansiklopedik veya giriş niteliğinde kalıplar asla kullanma, doğrudan tefekküre odaklan.
- Her katman derin, yoğun ve düşündürücü tam birer paragraf olmalıdır.

ÇIKTI FORMATI:
Sadece ve sadece aşağıdaki anahtarlara sahip saf bir JSON nesnesi döndür. Başka hiçbir açıklama, markdown işareti veya ek metin ekleme:
{
  "hikmet": "Hikmet katmanına ait tefekkür metni...",
  "icaz": "İ'caz katmanına ait tefekkür metni...",
  "hakikat": "Hakikat katmanına ait tefekkür metni..."
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AI_GATEWAY_API_KEY, // Vercel üzerindeki güvenli anahtarınız
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1200,
        system: SISTEM_PROMPT,
        // Claude modellerinde JSON modunu desteklemesi için sistem mesajını yönlendiriyoruz
        messages: [{ role: "user", content: `Nesne: "${nesne}". Lütfen cevabı JSON formatında döndür.` }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Anthropic hatası" });
    }

    return res.status(200).json({ metin: data.content[0].text });
  } catch (error) {
    return res.status(500).json({ error: "Sunucu içi bir hata oluştu." });
  }
}