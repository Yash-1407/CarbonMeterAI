require('dotenv').config({ path: '.env.local' });

async function run() {
  const payload = {
    messages: [
      { role: "user", content: "Hello" }
    ]
  };

  const res = await fetch("http://localhost:3000/api/chat-claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  
  let isDone = false;
  while (!isDone) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    console.log("CHUNK:", chunk);
  }
}

run().catch(console.error);
