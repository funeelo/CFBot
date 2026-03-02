export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const update = await request.json();
      console.log("UPDATE:", JSON.stringify(update));

      const chatId = update.message?.chat?.id;
      const text = update.message?.text;

      if (text === "/start") {
        const res = await
console.log("TOKEN VALUE:", env.BOT_TOKEN); fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Bot aktif 🚀"
          })
        });

        const result = await res.text();
        console.log("TELEGRAM RESPONSE:", result);
      }

      return new Response("OK");
    }

    return new Response("Bot aktif");
  }
};