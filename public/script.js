const form = document.querySelector("#form")

form.addEventListener("submit", async(e)=>{
    e.preventDefault()
    const email = document.querySelector("#email").value
    const password = document.querySelector("#password").value

    try{
        const login = await fetch("/login",
            {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({email, password})
        })
        const dados = await login.json()
        if(!login.ok){
            alert(dados.message)
            return
        }

        localStorage.setItem("token", dados.token)
        localStorage.setItem("id_user", dados.id)
        
        alert("Login Realizado com sucesso")
        window.location.href = "./home/home.html"

    }catch(error){
        console.error("Erro:", error)
    }
})