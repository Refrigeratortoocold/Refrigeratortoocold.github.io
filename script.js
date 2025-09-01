const API_KEY = "sk-f9818181c0bb44d58704bb285450bbe4"; // ⚠️ demo only

// Show sections with fade-in on scroll
const sections = document.querySelectorAll('.fade-in');
window.addEventListener('scroll', () => {
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      sec.classList.add('visible');
    }
  });
});

// Toggle chatbox
document.getElementById("chat-button").addEventListener("click", () => {
  document.getElementById("chatbox").classList.toggle("hidden");
});

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value;
  if (!message) return;

  const chatLog = document.getElementById("chat-log");
  chatLog.innerHTML += `<p><b>You:</b> ${message}</p>`;
  input.value = "";

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
