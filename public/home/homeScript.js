const tableElement = document.querySelector("#tablecontent")
const logoutButton = document.querySelector("#logout")
const contentElement = document.querySelector(".content")
const searchInput = document.querySelector("#search")

const params = new URLSearchParams(window.location.search);


const table = document.querySelector(".table");

function restartAnimation() {
    table.classList.remove("table_animate");
    void table.offsetWidth; // força reflow
    table.classList.add("table_animate");
}

searchInput.addEventListener("input", () => {
    restartAnimation();
    renderProdutos(searchInput.value);
});

renderProdutos("")

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

async function renderProdutos(search = "") {
    restartAnimation()
    let saldo = 0
    let lucro = 0

    try {
        const response = await fetch("/listarprodutos")
        const dados = await response.json()
        tableElement.innerHTML = ""

        if (dados.length === 0) {
            const h1 = document.createElement("h2")
            h1.textContent = "Você ainda não possui nenhum produto :("
            h1.style.color = "white"
            contentElement.appendChild(h1)
        }

        const q = search.trim().toLocaleLowerCase();
        const visibledados = q ? dados.filter((produto) => produto.nome.toLocaleLowerCase().includes(q))
            : dados;

        visibledados.forEach(element => {
            const id = document.createElement("td")
            id.textContent = element.id

            const nome = document.createElement("td")
            nome.textContent = element.nome

            const codigo = document.createElement("td")
            codigo.textContent = element.codigo

            const unidade = document.createElement("td")
            if (element.unidade === "m") {
                unidade.textContent = "M"
            } else if (element.unidade === "m2") {
                unidade.textContent = "M²"
            } else if (element.unidade === "l") {
                unidade.textContent = "L"
            } else if (element.unidade === "u") {
                unidade.textContent = "Unidades"
            } else if (element.unidade === "g") {
                unidade.textContent = "Gramas"
            } else if (element.unidade === "kg") {
                unidade.textContent = "KiloGramas"
            }

            const preco = document.createElement("td")
            preco.textContent = `R$${element.preco.toFixed(2).replace(".", ",")}`

            const custo = document.createElement("td")
            custo.textContent = `R$${element.custo.toFixed(2).replace(".", ",")}`

            const tdDelete = document.createElement("td")
            const deleteButton = document.createElement("button")
            deleteButton.innerHTML = '<i class="bi bi-trash-fill"></i>'
            tdDelete.appendChild(deleteButton)
            deleteButton.addEventListener("click", async () => {
                try {
                    if (confirm("Realmente deseja excluir esse produto?")) {

                        const remove = await fetch(`/removeProduto/${element.id}`, {method: "DELETE",})

                        const dados = await remove.json()
                        if (!remove.ok) {
                            alert(dados.message)
                            return
                        }
                        renderProdutos()
                    }
                } catch (error) {
                    console.error(error)
                }
            })

            const tdAdd = document.createElement("td")
            const addButton = document.createElement("button")
            addButton.innerHTML = '<i class="bi bi-plus-circle"></i>'
            tdAdd.appendChild(addButton)
            addButton.addEventListener("click", () => {
                const raw = localStorage.getItem("id_user")
                const id_user = raw ? raw : ""
                const name_product = element.nome
                window.location.href = `../addMov/mov.html?id_user=${id_user}&name_product=${name_product}&id_product=${element.id}`
            })

            const tdMovs = document.createElement("td")
            const seeMovsButton = document.createElement("button")
            seeMovsButton.innerHTML = '<i class="bi bi-search"></i>'
            tdMovs.appendChild(seeMovsButton)
            seeMovsButton.addEventListener("click", () => {
                window.location.href = `../Movs/movs.html?id_product=${element.id}`
            })

            const tdSaldo = document.createElement("td")
            async function carregarSaldo() {

                try {
                    const response = await fetch("/listMovs", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: element.id })
                    })
                    const dados = await response.json()
                    if (!response.ok) {
                        alert(dados.message)
                    }

                    dados.forEach(element => {
                        if (element.tipo == "in") {
                            saldo += element.quantidade
                        } else {
                            saldo -= element.quantidade
                        }

                        if (saldo <= 0) {
                            saldo = 0
                        }
                        tdSaldo.textContent = saldo
                    })
                }
                catch (err) {
                    console.error("Error:", err)
                }
            }
            tdSaldo.textContent = saldo
            carregarSaldo()

            const tdLucro = document.createElement("td")
            async function carregarLucro() {
                let lucro = 0
                try {
                    const response = await fetch("/listMovs", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: element.id })
                    })
                    const dados = await response.json()
                    if (!response.ok) {
                        alert(dados.message)
                    }
                    dados.forEach(mov => {
                        if (mov.tipo === "out") {
                            lucro += (element.preco - element.custo) * mov.quantidade;
                        }
                        tdLucro.textContent = `R$${lucro.toFixed(2)}`
                    })
                } catch (err) {
                    console.error("Error:", err)
                }
            }
            tdLucro.textContent = `R$${lucro.toFixed(2)}`
            carregarLucro()

            const tr = document.createElement("tr")
            tr.appendChild(id)
            tr.appendChild(nome)
            tr.appendChild(codigo)
            tr.appendChild(unidade)
            tr.appendChild(preco)
            tr.appendChild(custo)
            tr.appendChild(tdDelete)
            tr.appendChild(tdAdd)
            tr.appendChild(tdMovs)
            tr.appendChild(tdSaldo)
            tr.appendChild(tdLucro)

            tableElement.appendChild(tr)
        })
    } catch (err) {
        console.error("Error: ", err.message)
    }
}