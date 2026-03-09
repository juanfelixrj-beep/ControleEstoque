const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const cors = require("cors")

const SECRET = "secret"

const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(cors())

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})

const db = new sqlite3.Database("./estoque.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco: ", err.message)
    } else {
        console.log("Conectado com sucesso SQLITE")
    }
})

db.run("PRAGMA foreign_keys = ON")

db.serialize(() => {
    db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `)
    db.run(`
            CREATE TABLE IF NOT EXISTS produtos(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                codigo TEXT NOT NULL,
                unidade TEXT NOT NULL,
                preco REAL NOT NULL,
                custo REAL NOT NULL
            )
        `)
    db.run(`
            CREATE TABLE IF NOT EXISTS operacoes(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT NOT NULL,
                quantidade INTEGER NOT NULL,
                dataregistro TEXT DEFAULT CURRENT_TIMESTAMP,
                data TEXT NOT NULL,
                produto_id INTEGER NOT NULL,
                usuario_id INTEGER NOT NULL,
                FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `)

    console.log("Tabelas criadas com sucesso")
})

app.post("/register", async (req, res) => {
    const { nome, email, password } = req.body
    try {
        const hash = await bcrypt.hash(password, 10) //Gera Hash da senha

        db.run("INSERT INTO usuarios (nome, email, password) VALUES (?, ?, ?)", //Insere dentro da tabela usuarios,
            [nome, email, hash],
            function (err) {
                if (err) {
                    return res.status(400).json({ message: "Email já cadastrado" })
                }
                const token = jwt.sign(
                    { id: this.lastID },
                    SECRET,
                    { expiresIn: "1h" }
                )
                res.json({ message: "Usuario criado com sucesso", token, id: this.lastID })
            }
        )
    } catch (error) {
        return res.status(500).json({ message: "Erro ao cadastrar usuario" })
    }

})

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    db.get("SELECT * FROM usuarios WHERE email = ?",
        [email],
        async (err, user) => {
            if (err) { return res.status(500).json({ message: "Erro interno" }) }
            if (!user) { return res.status(404).json({ message: "Usuario não encontrado" }) }

            const senhaSys = await bcrypt.compare(password, user.password)

            if (!senhaSys) {
                return res.status(400).json({ message: "Senha incorreta" })
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                SECRET,
                { expiresIn: "1h" }
            )

            res.json({ message: "Login concluido", token, id: user.id })

        }
    )
})

app.get("/listarprodutos", (req, res) => {
    db.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.json(rows)
    })
})

app.post("/addProduto", (req, res) => {
    const { nome, codigo, unidade, preco, custo } = req.body
    try {
        db.run("INSERT INTO produtos (nome, codigo, unidade, preco, custo) VALUES (?, ?, ?, ?, ?)",
            [nome, codigo, unidade, preco, custo],
            function (err) {
                if (err) {
                    return res.status(500).json({ message: err.message })
                }
                res.json({ message: "Produto adicionado com sucesso", id: this.lastID })
            })
    } catch (error) {
        return res.status(500).json({ message: "Erro ao adicionar produto" })
    }
})
app.delete("/removeProduto/:id", (req, res) => {
    const { id } = req.params
    if (!id) { return res.status(404).json({ message: "Id Inválido" }) }
    db.run("DELETE FROM operacoes WHERE produto_id = ?", [id]);
    db.run("DELETE FROM produtos WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({ message: err.message })
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Produto não encontrado" })
            }

            res.json({ message: "Produto removido com sucesso" })
        }
    )
})
app.post("/addMov", (req, res) => {

    const { tipo, quantidade, data, itemId, userId } = req.body

    const produtoId = Number(itemId)
    const usuarioId = Number(userId)
    const qtd = Number(quantidade)

    if (!tipo || !Number.isInteger(qtd) || qtd <= 0 || !data || !produtoId || !usuarioId) {
        return res.status(400).json({ message: "Dados inválidos" })
    }

    const query = `
        SELECT 
        COALESCE(SUM(
            CASE 
                WHEN tipo='in' THEN quantidade 
                ELSE -quantidade 
            END
        ),0) AS saldo
        FROM operacoes
        WHERE produto_id = ?
    `

    db.get(query, [produtoId], (err, row) => {

        if (err) return res.status(500).json({ message: err.message })

        const saldoAtual = row.saldo

        if (tipo === "out" && saldoAtual < qtd) {
            return res.status(400).json({ message: "Estoque insuficiente" })
        }

        db.run(
            "INSERT INTO operacoes (tipo, quantidade, data, produto_id, usuario_id) VALUES (?, ?, ?, ?, ?)",
            [tipo, qtd, data, produtoId, usuarioId],
            function (err) {

                if (err) return res.status(500).json({ message: err.message })

                res.json({
                    message: "Movimentação adicionada com sucesso",
                    id: this.lastID
                })
            }
        )

    })

})

app.delete("/removeMov/:id", (req, res) => {
    const { id } = req.params
    if (!id) { return res.status(404).json({ message: "Id Inválido" }) }
    db.run("DELETE FROM operacoes WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ message: err.message })
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Movimentação não encontrada" })
        }
        res.json({ message: "Movimentação removida com sucesso" })
    })
})

app.post("/listMovs", (req, res) => {
    const { id } = req.body

    db.all("SELECT * FROM operacoes WHERE produto_id = ?", [id], (err, rows) => {
        if (err) {
            return res.status(404).json({ error: err.message })
        }
        res.json(rows)
    })
})