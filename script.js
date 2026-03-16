const supabaseUrl = "https://dbppspzsvyggugvmnwlx.supabase.co"
const supabaseKey = "sb_publishable_NVH1LN7LFP5ifxabEkwMlg_69Q4uoKO"

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

// ascolta i nuovi messaggi in tempo reale
// crea un canale realtime
const channel = supabaseClient
  .channel('public:messages') // nome a piacere
  .on(
    'postgres_changes',        // tipo di evento
    { event: 'INSERT', schema: 'public', table: 'messages' }, 
    (payload) => {
        const message = payload.new
        const post = document.createElement("div")
        post.className = "post"
        post.innerHTML = `<div class="post-author">${message.mood} ${message.author}</div>
                          <div class="post-text">${message.text}</div>`
        document.getElementById("feed").prepend(post)
    }
  )
  .subscribe()

document.addEventListener("DOMContentLoaded", () => {

    loadMessages()

    document.getElementById("sendButton").addEventListener("click", addMessage)

})

async function loadMessages(){
    const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .order("created_at",{ascending:false})

    console.log(data, error)  // <-- debug

    if(error){
        console.error("Errore nel fetch dei messaggi:", error)
        return
    }

    data.forEach(message => {
        const post = document.createElement("div")
        post.className = "post"
        post.innerHTML = `<div class="post-author">${message.mood} ${message.author}</div>
                          <div class="post-text">${message.text}</div>`
        document.getElementById("feed").appendChild(post)
    })
}

async function addMessage(){
    const input = document.getElementById("messageInput")
    const author = document.getElementById("author").value
    const mood = document.getElementById("mood").value
    const text = input.value
    if(!text) return

    await supabaseClient
      .from("messages")
      .insert([{author,text,mood}])
      .select() // così ottieni l'oggetto inserito

    input.value = ""
}