const toggleBtn = document.getElementById("chat-toggle");
const chatbot = document.getElementById("chatbot");
const closeBtn = document.getElementById("close-chat");
const themeToggle = document.getElementById("theme-toggle");
const input = document.getElementById("user-input");
const chatBody = document.getElementById("chat-body");
const loader = document.getElementById("loader");
const suggestionsDiv = document.getElementById("suggestions");

let isLoading = false;
let darkMode = false;

const SUGGESTIONS = [
  "How long does delivery take?",
  "What is your returns policy?",
  "How are your products sustainable?",
  "Where can I find sizing information?",
  "How can I contact customer support?"
];

/* Open / Close */
toggleBtn.onclick = () => {
  chatbot.style.display = "flex";
  showSuggestions();
};

closeBtn.onclick = () => {
  chatbot.style.display = "none";
};

/* Dark mode toggle */
themeToggle.onclick = () => {
  darkMode = !darkMode;
  chatbot.className = darkMode ? "dark" : "light";
  themeToggle.textContent = darkMode ? "☀️" : "🌙";
};

/* Suggestions */
function showSuggestions() {
  suggestionsDiv.innerHTML = "";
  SUGGESTIONS.forEach(text => {
    const btn = document.createElement("div");
    btn.className = "suggestion";
    btn.textContent = text;
    btn.onclick = () => sendMessage(text);
    suggestionsDiv.appendChild(btn);
  });
}

/* Input */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && input.value.trim() && !isLoading) {
    sendMessage(input.value.trim());
    input.value = "";
  }
});

/* Send message */
async function sendMessage(text) {
  chatBody.innerHTML = "";
  suggestionsDiv.innerHTML = "";

  addMessage("You", escapeHTML(text), "user");

  isLoading = true;
  input.disabled = true;
  loader.classList.remove("hidden");

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    addMessage("Assistant", formatLinks(data.reply), "assistant");

  } catch {
    addMessage(
      "Assistant",
      "I want to make sure you get accurate information. Please check the Help & Support section.",
      "assistant"
    );
  }

  loader.classList.add("hidden");
  input.disabled = false;
  isLoading = false;
}

/* Helpers */
function addMessage(sender, text, cls) {
  const div = document.createElement("div");
  div.className = `message ${cls}`;
  div.innerHTML = `<strong>${sender}:</strong><br>${text}`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function formatLinks(text) {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  );
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])
  );
}
