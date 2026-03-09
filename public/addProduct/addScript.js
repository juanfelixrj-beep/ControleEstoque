const form = document.querySelector("#form")
const logoutButton = document.querySelector("#logout")

const raw = localStorage.getItem("token")
if (!raw) {
    alert("Error: 403")
    window.location.href = "../index.html"
}

logoutButton.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("token")
    window.location.href = "../index.html"
})

form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const nome = document.querySelector("#nome").value
    const codigo = document.querySelector("#codigo").value
    const unidade = document.querySelector("#unidades").value
    const preco = document.querySelector("#preco").value
    const custo = document.querySelector("#custo").value

    try{
        const add = await fetch("/addProduto",{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nome, codigo, unidade, preco, custo})
        })
        const dados = await add.json()

        if(!add.ok){
            alert(dados.message)
            return
        }

        alert("Item adicionado com sucesso")
        window.location.href = "../home/home.html"

    }catch(error){
        console.error("Error:", error)
    }
})