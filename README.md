# Controle de Estoque

Um sistema web simples para controle de estoque, desenvolvido com Node.js, Express e SQLite. Permite gerenciar usuários, produtos e movimentações de entrada e saída de itens.

## Funcionalidades

- **Registro e Login de Usuários**: Cadastro de usuários com autenticação JWT.
- **Gerenciamento de Produtos**: Adicionar, listar e remover produtos com informações como nome, código, unidade, preço e custo.
- **Movimentações**: Registrar entradas e saídas de produtos, com controle de saldo para evitar estoque negativo.
- **Listagem de Movimentações**: Visualizar histórico de movimentações por produto.
- **Interface Web**: Páginas HTML simples para interação com o sistema.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite
- **Autenticação**: JWT (JSON Web Tokens), bcrypt para hash de senhas
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Outros**: CORS para requisições cross-origin

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/juanfelixrj-beep/ControleEstoque.git
   cd ControleEstoque
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Execute o servidor:
   ```
   node server.js
   ```

4. Abra o navegador e acesse `http://localhost:3000`.

## Uso

- **Página Inicial**: Acesse a home page para navegar pelas funcionalidades.
- **Registrar**: Crie uma conta de usuário.
- **Login**: Faça login para acessar as funcionalidades protegidas.
- **Adicionar Produto**: Cadastre novos produtos no estoque.
- **Adicionar Movimentação**: Registre entradas ou saídas de produtos.
- **Listar Movimentações**: Veja o histórico de movimentações de um produto.

## Estrutura do Projeto

- `server.js`: Arquivo principal do servidor Express.
- `public/`: Diretório com arquivos estáticos (HTML, CSS, JS).
  - `index.html`: Página inicial.
  - `home/`: Página home.
  - `register/`: Página de registro.
  - `addProduct/`: Página para adicionar produtos.
  - `addMov/`: Página para adicionar movimentações.
  - `Movs/`: Página para listar movimentações.
- `estoque.db`: Banco de dados SQLite (criado automaticamente).

## API Endpoints

- `POST /register`: Registrar novo usuário.
- `POST /login`: Login de usuário.
- `GET /listarprodutos`: Listar todos os produtos.
- `POST /addProduto`: Adicionar produto.
- `DELETE /removeProduto/:id`: Remover produto.
- `POST /addMov`: Adicionar movimentação.
- `DELETE /removeMov/:id`: Remover movimentação.
- `POST /listMovs`: Listar movimentações de um produto.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está licenciado sob a ISC License.