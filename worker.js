export default {
  async fetch(request, env) {

    if (request.method === "POST") {
      const update = await request.json();

      // ==== HANDLE TEXT MESSAGE ====
      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || "";

        if (text === "/start") {
          await sendMenu(env.BOT_TOKEN, chatId);
        }

        if (text.startsWith("/anime")) {
          const queryText = text.replace("/anime", "").trim();

          if (!queryText) {
            await sendMessage(env.BOT_TOKEN, chatId, "Contoh: /anime naruto");
            return new Response("ok");
          }

          const anime = await searchAnime(queryText);
          await sendAnime(env.BOT_TOKEN, chatId, anime);
        }
      }

      // ==== HANDLE BUTTON CLICK ====
      if (update.callback_query) {
        const chatId = update.callback_query.message.chat.id;
        const data = update.callback_query.data;

        if (data === "trending") {
          const anime = await getTrending();
          await sendAnime(env.BOT_TOKEN, chatId, anime);
        }

        if (data === "search") {
          await sendMessage(env.BOT_TOKEN, chatId, "Gunakan: /anime <nama anime>");
        }
      }

      return new Response("ok");
    }

    return new Response("Anime Bot aktif 🚀");
  }
};

// ===== MENU =====
async function sendMenu(token, chatId) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "📺 Anime Bot Menu",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔍 Cari Anime", callback_data: "search" }],
          [{ text: "🔥 Trending", callback_data: "trending" }]
        ]
      }
    })
  });
}

// ===== SEARCH ANIME =====
async function searchAnime(name) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        title { romaji }
        format
        status
        episodes
        averageScore
        description
      }
    }
  `;

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { search: name } })
  });

  const data = await res.json();
  return data?.data?.Media || null;
}

// ===== TRENDING =====
async function getTrending() {
  const query = `
    query {
      Media(sort: TRENDING_DESC, type: ANIME) {
        title { romaji }
        format
        status
        episodes
        averageScore
        description
      }
    }
  `;

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  return data?.data?.Media || null;
}

// ===== SEND ANIME =====
async function sendAnime(token, chatId, anime) {
  if (!anime) {
    await sendMessage(token, chatId, "Anime tidak ditemukan 😢");
    return;
  }

  const reply =
`🎬 ${anime.title.romaji}

📺 Format: ${anime.format}
📊 Status: ${anime.status}
⭐ Score: ${anime.averageScore || "N/A"}
🎞 Episode: ${anime.episodes || "?"}

${stripHtml(anime.description).slice(0, 300)}...`;

  await sendMessage(token, chatId, reply);
}

// ===== SEND TEXT =====
async function sendMessage(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>?/gm, "") : "";
}
