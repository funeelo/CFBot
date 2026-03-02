export default {
  async fetch(request, env) {

    if (request.method === "POST") {
      const update = await request.json();

      console.log("UPDATE:", JSON.stringify(update));

      const chatId = update?.message?.chat?.id;

      if (!chatId) {
        console.log("CHAT ID NOT FOUND");
        return new Response("no chat id");
      }

      const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "DEBUG RESPONSE 🔥"
        })
      });

      const result = await tg.text();
      console.log("TELEGRAM RESPONSE:", result);

      return new Response("ok");
    }

    return new Response("ok");
  }
};