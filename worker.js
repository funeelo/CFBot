export default {
  async fetch(request, env) {

    if (request.method === "POST") {
      const update = await request.json();
      const chatId = update?.message?.chat?.id;

      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Bot hidup 🔥"
        })
      });

      return new Response("ok");
    }

    return new Response("ok");
  }
};