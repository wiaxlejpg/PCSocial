// ----- SUPABASE -----
const supabaseUrl = "https://dbppspzsvyggugvmnwlx.supabase.co"
const supabaseKey = "sb_publishable_NVH1LN7LFP5ifxabEkwMlg_69Q4uoKO"
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

// ----- UTILI -----
const feed = document.getElementById("feed")
const sendButton = document.getElementById("sendButton")

// palette colori per mood
const colors = { "❤️":"#ff4d4d", "😎":"#4dffb8", "😢":"#4db8ff", "🔥":"#ffb84d" }

// ----- LOAD MESSAGES -----
async function loadMessages(){
    const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .order("created_at",{ascending:true}) // dal più vecchio al nuovo

    if(error){
        console.error("Errore fetch messaggi:", error)
        return
    }

    data.forEach(message => addPostToFeed(message))
    feed.scrollTop = feed.scrollHeight
}

// ----- ADD MESSAGE -----
async function addMessage(){
    const author = document.getElementById("author").value || "Anon"
    const mood = document.getElementById("mood").value || ""
    const text = document.getElementById("messageInput").value
    const song = document.getElementById("songInput").value || null;

    if(!text && !song) return // no blanks

    const { data, error } = await supabaseClient
        .from("messages")
        .insert([{author,text,mood, song}])
        .select() // serve per ricevere l'oggetto appena inserito

    if(error){
        console.error(error)
        return
    }

    document.getElementById("messageInput").value = ""
    document.getElementById("songInput").value = "";
}

// ----- ADD POST TO FEED -----
function addPostToFeed(message) {
    const post = document.createElement("div");
    post.className = "post";
    post.dataset.mood = message.mood;
  
    let inner = `<div class="post-author">${message.mood} ${message.author}</div>`;
    if(message.text) inner += `<div class="post-text">${message.text}</div>`;
    if(message.song) {
      inner += `<div class="song-bubble">
                  <a href="${message.song}" target="_blank">🎵 Ascolta sta merda</a>
                </div>`;
    }
  
    post.innerHTML = inner;
  
    // glow automatico per mood
    const colors = { "❤️":"#ff4d4d", "😎":"#4dffb8", "🔥":"#ffb84d", "😢":"#4db8ff", "💜":"#bba8ff" };
    post.style.boxShadow = `0 0 15px ${colors[message.mood] || "#8a7dff"}55`;
  
    feed.appendChild(post);
    feed.scrollTop = feed.scrollHeight;
  }

// ----- REALTIME -----
supabaseClient
  .channel('public:messages')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
        addPostToFeed(payload.new)
    }
  )
  .subscribe()

// ----- INIT -----
document.addEventListener("DOMContentLoaded", () => {
    loadMessages()
    sendButton.addEventListener("click", addMessage)
})