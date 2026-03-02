async function sendMenu(token, chatId) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "📺 Anime Bot Menu",
      reply_markup: {
        keyboard: [
          ["🔍 Cari Anime", "🔥 Trending"],
          ["⭐ Top Score", "📺 Ongoing"],
          ["🎬 Random Anime", "ℹ️ Bantuan"]
        ],
        resize_keyboard: true,
        is_persistent: true
      }
    })
  });
}
