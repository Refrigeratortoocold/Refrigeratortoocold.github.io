const API_KEY = "sk-f9818181c0bb44d58704bb285450bbe4"; // ⚠️ 只适合demo

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value;
  if (!message) return;

  // 显示用户消息
  const chatLog = document.getElementById("chat-log");
  chatLog.innerHTML += `<p><b>You:</b> ${message}</p>`;
  input.value = "";

  // 调用 DeepSeek API
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Error: No response";
    chatLog.innerHTML += `<p><b>AI:</b> ${reply}</p>`;
    chatLog.scrollTop = chatLog.scrollHeight;
  } catch (error) {
    chatLog.innerHTML += `<p><b>AI:</b> Error occurred.</p>`;
  }
}
