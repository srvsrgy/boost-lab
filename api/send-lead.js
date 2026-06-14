export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { name, contact, product, marketplace } = req.body || {};

    if (!name || !contact || !product || !marketplace) {
      return res.status(400).json({
        ok: false,
        message: "Заполните все поля",
      });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({
        ok: false,
        message: "Telegram is not configured",
      });
    }

    const marketplaceText = {
      wildberries: "Wildberries",
      ozon: "Ozon",
      both: "Wildberries и Ozon",
    }[marketplace] || marketplace;

    const text = [
      "🔥 Новая заявка с сайта BOOST LAB",
      "",
      `👤 Имя: ${name}`,
      `📲 Контакт: ${contact}`,
      product ? `📦 Товар: ${product}` : null,
      `🛒 Маркетплейс: ${marketplaceText}`,
    ].filter(Boolean).join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      return res.status(500).json({
        ok: false,
        message: telegramData.description || "Telegram request failed",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Заявка отправлена",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
}
