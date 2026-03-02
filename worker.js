export default {
  async fetch(request, env) {

    if (request.method === "POST") {
      const update = await request.json();

      if (!update.message) return new Response("ok");

      const chatId = update.message.chat.id;
      const text = update.message.text || "";

      // ===== START MENU =====
      if (text === "/start") {
        await sendMenu(env.BOT_TOKEN, chatId);
        return new Response("ok");
      }

      // ===== MENU BUTTONS =====
      if (text === "🔥 Trending") {
        const anime = await getTrending();
        await sendAnime(env.BOT_TOKEN, chatId, anime);
      }

      if (text === "⭐ Top Score") {
        const anime = await getTopScore();
        await sendAnime(env.BOT_TOKEN, chatId, anime);
      }

      if (text === "🎬 Random Anime") {
        const anime = await getRandom();
        await sendAnime(env.BOT_TOKEN, chatId, anime);
      }

      if (text === "🔍 Cari Anime") {
        await sendMessage(env.BOT_TOKEN, chatId, "Gunakan: /anime <nama anime>");
      }

      if (text === "ℹ️ Bantuan") {
        await sendMessage(env.BOT_TOKEN, chatId, "Gunakan tombol menu atau /anime <nama>");
      }

      // ===== SEARCH COMMAND =====
      if (text.startsWith("/anime")) {
        const queryText = text.replace("/anime", "").trim();

        if (!queryText) {
          await sendMessage(env.BOT_TOKEN, chatId, "Contoh: /anime naruto");
          return new Response("ok");
        }

        const anime = await searchAnime(queryText);
        await sendAnime(env.BOT_TOKEN, chatId, anime);
      }

      return new Response("ok");
    }

    return new Response("Anime Bot aktif 🚀");
  }
};



// ================= MENU =================
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



// ================= SEARCH =================
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



// ================= TRENDING =================
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



// ================= TOP SCORE =================
async function getTopScore() {
  const query = `
    query {
      Media(sort: SCORE_DESC, type: ANIME) {
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



// ================= RANDOM =================
async function getRandom() {
  const id = Math.floor(Math.random() * 20000);

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
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
    body: JSON.stringify({ query, variables: { id } })
  });

  const data = await res.json();
  return data?.data?.Media || null;
}



// ================= SEND ANIME =================
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

${stripHtml(anime.description).slice(0, 400)}...`;

  await sendMessage(token, chatId, reply);
}



// ================= SEND TEXT =================
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