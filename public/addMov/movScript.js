const logoutButton = document.querySelector("#logout")
const form = document.querySelector("form")

const params = new URLSearchParams(window.location.search);

const itemName = document.querySelector("#id_product")
const userId = document.querySelector("#id_user")
const dateRegister = document.querySelector("#dateregister")


const actualDate = new Date().toISOString().slice(0, -14)
dateRegister.value = actualDate

userId.value = params.get("id_user")
itemName.value = params.get("name_product")
const itemId = params.get("id_product")

logoutButton.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("token")
    window.location.href = "../index.html"
})

const raw = localStorage.getItem("token")
if (!raw) {
    alert("Error: 403")
    window.location.href = "../index.html"
}

form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const quantidade = document.querySelector("#qnt").value
    const data = document.querySelector("#datemov").value
    const tipo = document.querySelector("#tipo").value

    try {
        const mov = await fetch("/addMov", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, quantidade: parseInt(quantidade, 10), data, itemId: parseInt(itemId, 10), userId: parseInt(userId.value, 10) })
        })
        const dados = await mov.json()

        if (!mov.ok) {
            alert(dados.message)
            return
        }

        alert(dados.message)
        window.location.href = "../home/home.html"

    } catch (err) {
        console.error("Error:", err)
    }
})