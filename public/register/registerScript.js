const form = document.querySelector("#form")

form.addEventListener("submit", async(e)=>{
    e.preventDefault()
    const nome = document.querySelector("#name").value
    const email = document.querySelector("#email").value
    const password = document.querySelector("#password").value

    try{
        const register = await fetch("/register",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({nome, email, password})
        })
        const dados = await register.json()

        if(!register.ok){
            alert(dados.message)
            return
        }

        alert("Cadastro realizado com sucesso")
        window.location.href = "../home/home.html"

    }catch(error){
        console.log("Error:", error)
    }
})