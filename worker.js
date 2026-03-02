export default {
  async fetch(request, env) {

    if (request.method === "POST") {
      const update = await request.json();

      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || "";

        if (text.startsWith("/anime")) {
          const queryText = text.replace("/anime", "").trim();

          if (!queryText) {
            await sendMessage(env.BOT_TOKEN, chatId, "Contoh: /anime naruto");
            return new Response("ok");
          }

          const anime = await searchAnime(queryText);

          if (!anime) {
            await sendMessage(env.BOT_TOKEN, chatId, "Anime tidak ditemukan 😢");
            return new Response("ok");
          }

          const reply =
`🎬 ${anime.title.romaji}

📺 Format: ${anime.format}
📊 Status: ${anime.status}
⭐ Score: ${anime.averageScore || "N/A"}
🎞 Episode: ${anime.episodes || "?"}

${stripHtml(anime.description).slice(0, 300)}...`;

          await sendMessage(env.BOT_TOKEN, chatId, reply);
        } else {
          await sendMessage(env.BOT_TOKEN, chatId, "Gunakan: /anime <nama anime>");
        }
      }

      return new Response("ok");
    }

    return new Response("Anime Bot aktif 🚀");
  }
};

async function searchAnime(name) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        title {
          romaji
        }
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
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables: { search: name }
    })
  });

  const data = await res.json();
  return data?.data?.Media || null;
}

async function sendMessage(token, chatId, text) {
  await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
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
