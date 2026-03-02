export default {
  async fetch(request, env) {

await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId,
    text: "Halo dari Cloudflare 🚀"
  })
});