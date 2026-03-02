export default {
  async fetch(request, env) {

    if (request.method === "POST") {
      const update = await request.json();
      const chatId = update?.message?.chat?.id;

      if (chatId) {

        if (!env.BOT_TOKEN) {
          return new Response("BOT_TOKEN missing");
        }

        await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Token works ✅"
          })
        });
      }

      return new Response("ok");
    }

    return new Response("Worker aktif");
  }
};