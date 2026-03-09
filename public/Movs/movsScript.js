const tableElement = document.querySelector("#tablecontent")
const logoutButton = document.querySelector("#logout")
const contentElement = document.querySelector(".content")

const params = new URLSearchParams(window.location.search);

renderMovs()

logoutButton.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("token")
    window.location.href = "../index.html"
})

const rawL = localStorage.getItem("token")
if (!rawL) {
    alert("Error: 403")
    window.location.href = "../index.html"
}

async function renderMovs() {
    try {
        const raw = params.get("id_product")

        const response = await fetch("/listMovs", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: raw })
        })
        const dados = await response.json()
        if (!response.ok) {
            alert(dados.message)
        }

        tableElement.innerHTML = ""

        if (dados.length === 0) {
            const h1 = document.createElement("h2")
            h1.textContent = "Este produto não possui nenhuma movimentação :("
            h1.style.color = "white"
            contentElement.appendChild(h1)
        }

        dados.forEach(element => {
            const id = document.createElement("td")
            id.textContent = element.id

            const tipo = document.createElement("td")
            if (element.tipo == "in") {
                tipo.textContent = "Entrada"
            } else {
                tipo.textContent = "Saida"
            }


            const quantidade = document.createElement("td")
            quantidade.textContent = element.quantidade

            const dataregistro = document.createElement("td")
            dataregistro.textContent = element.dataregistro

            const data = document.createElement("td")
            data.textContent = element.data

            const produto_id = document.createElement("td")
            produto_id.textContent = element.produto_id

            const user_id = document.createElement("td")
            user_id.textContent = element.usuario_id

            const tdRemove = document.createElement("td")
            const removeBTN = document.createElement("button")
            removeBTN.innerHTML = '<i class="bi bi-trash-fill"></i>'
            tdRemove.appendChild(removeBTN)
            removeBTN.addEventListener("click", async () => {
                try {
                    if (confirm("Realmente deseja remover a movimentação?")) {
                        const remove = await fetch(`/removeMov/${element.id}`,{method: "DELETE",})

                        const dados = await remove.json()
                        if (!remove.ok) {
                            alert(dados.message)
                            return
                        }
                        renderMovs()
                    }
                } catch (err) {
                    console.error("Error: ", err)
                }
            })
            const tr = document.createElement("tr")
            tr.appendChild(id)
            tr.appendChild(tipo)
            tr.appendChild(quantidade)
            tr.appendChild(dataregistro)
            tr.appendChild(data)
            tr.appendChild(produto_id)
            tr.appendChild(user_id)
            tr.appendChild(tdRemove)

            tableElement.appendChild(tr)
        });

    } catch (err) {
        console.error("Error:", err)
    }
}