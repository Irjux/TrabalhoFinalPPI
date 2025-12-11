import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const host = "0.0.0.0";
const porta = 3000;

var listaEquipes = [];
var listaJogadores = [];

const app = express();

app.use(
    session({
        secret: "LoLCh4mpS3cr3t",
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 30
        }
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", verificarLogin, (req, res) => {
    let ultimoAcesso = req.cookies?.ultimoAcesso;

    res.cookie("ultimoAcesso", new Date().toLocaleString());
    res.setHeader("Content-Type", "text/html");
    res.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Menu do Campeonato LoL</title>
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#">MENU</a>
                        <div class="collapse navbar-collapse">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">Home</a>
                                </li>
                                <li class="nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                                        Cadastros
                                    </a>
                                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <li><a class="dropdown-item" href="/cadastroEquipe">Equipes</a></li>
                                        <li><a class="dropdown-item" href="/cadastroJogador">Jogadores</a></li>
                                    </ul>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">Sair</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="container-fluid">
                        <div class="d-flex">
                            <div class="p-2">
                                <p>Último acesso: ${ultimoAcesso || "Primeiro acesso"}</p>
                            </div>
                        </div>
                    </div>
                </nav>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);
    res.end();
});

app.get("/cadastroEquipe", verificarLogin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Cadastro de Equipes</title>
            </head>
            <body>
                <div class="container">
                    <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Equipes</h1>
                    <form method="POST" action="/adicionarEquipe" class="row g-3 m-3 p-3 bg-light">
                        <div class="col-md-4">
                            <label for="nomeEquipe" class="form-label">Nome da Equipe</label>
                            <input type="text" class="form-control" id="nomeEquipe" name="nomeEquipe">
                        </div>
                        <div class="col-md-4">
                            <label for="capitao" class="form-label">Nome do Capitão</label>
                            <input type="text" class="form-control" id="capitao" name="capitao">
                        </div>
                        <div class="col-md-4">
                            <label for="contato" class="form-label">Contato (WhatsApp)</label>
                            <input type="text" class="form-control" id="contato" name="contato">
                        </div>
                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Cadastrar</button>
                            <a class="btn btn-secondary" href="/">Voltar</a>
                        </div>
                    </form>
                </div>
            </body>
        </html>
    `);
});

app.post("/adicionarEquipe", verificarLogin, (req, res) => {
    const { nomeEquipe, capitao, contato } = req.body;

    if (nomeEquipe && capitao && contato) {
        listaEquipes.push({ nomeEquipe, capitao, contato });
        res.redirect("/listarEquipes");
    } else {
        res.send("Preencha todos os campos!");
    }
});

app.get("/listarEquipes", verificarLogin, (req, res) => {
    let conteudo = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Equipes Cadastradas</title>
            </head>
            <body>
                <div class="container">
                    <h1 class="text-center border m-3 p-3 bg-light">Lista de Equipes</h1>
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Nome da Equipe</th>
                                <th>Capitão</th>
                                <th>Contato</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    for (let i = 0; i < listaEquipes.length; i++) {
        conteudo += `
            <tr>
                <td>${listaEquipes[i].nomeEquipe}</td>
                <td>${listaEquipes[i].capitao}</td>
                <td>${listaEquipes[i].contato}</td>
            </tr>
        `;
    }
    conteudo += `
                        </tbody>
                    </table>
                    <a class="btn btn-secondary" href="/cadastroEquipe">Voltar</a>
                </div>
            </body>
        </html>
    `;
    res.send(conteudo);
});

app.get("/cadastroJogador", verificarLogin, (req, res) => {
    let options = listaEquipes.map(eq => `<option value="${eq.nomeEquipe}">${eq.nomeEquipe}</option>`).join("");
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Cadastro de Jogadores</title>
            </head>
            <body>
                <div class="container">
                    <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Jogadores</h1>
                    <form method="POST" action="/adicionarJogador" class="row g-3 m-3 p-3 bg-light">
                        <div class="col-md-4">
                            <label for="nomeJogador" class="form-label">Nome do Jogador</label>
                            <input type="text" class="form-control" id="nomeJogador" name="nomeJogador">
                        </div>
                        <div class="col-md-4">
                            <label for="nickname" class="form-label">Nickname</label>
                            <input type="text" class="form-control" id="nickname" name="nickname">
                        </div>
                        <div class="col-md-4">
                            <label for="funcao" class="form-label">Função</label>
                            <select class="form-select" id="funcao" name="funcao">
                                <option value="" disabled selected>Escolha a função...</option>
                                <option value="Top">Top</option>
                                <option value="Jungle">Jungle</option>
                                <option value="Mid">Mid</option>
                                <option value="Atirador">Atirador</option>
                                <option value="Suporte">Suporte</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="elo" class="form-label">Elo</label>
                            <input type="text" class="form-control" id="elo" name="elo">
                        </div>
                        <div class="col-md-4">
                            <label for="genero" class="form-label">Gênero</label>
                            <input type="text" class="form-control" id="genero" name="genero">
                        </div>
                        <div class="col-md-4">
                            <label for="equipe" class="form-label">Equipe</label>
                            <select class="form-select" id="equipe" name="equipe">
                                <option value="" disabled selected>Escolha a equipe...</option>
                                ${options}
                            </select>
                        </div>
                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Cadastrar</button>
                            <a class="btn btn-secondary" href="/">Voltar</a>
                        </div>
                    </form>
                </div>
            </body>
        </html>
    `);
});

app.post("/adicionarJogador", verificarLogin, (req, res) => {
    const { nomeJogador, nickname, funcao, elo, genero, equipe } = req.body;

    if (nomeJogador && nickname && funcao && elo && genero && equipe) {
        listaJogadores.push({ nomeJogador, nickname, funcao, elo, genero, equipe });
        res.redirect("/listarJogadores");
    } else {
        res.send("Preencha todos os campos!");
    }
});

app.get("/listarJogadores", verificarLogin, (req, res) => {
    let conteudo = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Jogadores Cadastrados</title>
            </head>
            <body>
                <div class="container">
                    <h1 class="text-center border m-3 p-3 bg-light">Lista de Jogadores</h1>
    `;
    let equipesAgrupadas = {};
    listaJogadores.forEach(j => {
        if (!equipesAgrupadas[j.equipe]) equipesAgrupadas[j.equipe] = [];
        equipesAgrupadas[j.equipe].push(j);
    });

    for (let equipe in equipesAgrupadas) {
        conteudo += `<h3>${equipe}</h3><ul>`;
        equipesAgrupadas[equipe].forEach(j => {
            conteudo += `<li>${j.nomeJogador} (${j.nickname}) - ${j.funcao} - ${j.elo} - ${j.genero}</li>`;
        });
        conteudo += "</ul>";
    }

    conteudo += `<a class="btn btn-secondary" href="/cadastroJogador">Voltar</a></div></body></html>`;
    res.send(conteudo);
});

app.get("/login", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container w-25">
                    <form action='/login' method='POST' class="row g-3 needs-validation" novalidate>
                        <fieldset class="border p-2">
                            <legend class="mb-3">Autenticação</legend>
                            <div class="col-md-4">
                                <label for="usuario" class="form-label">Usuário</label>
                                <input type="text" class="form-control" id="usuario" name="usuario" required>
                            </div>
                            <div class="col-md-4">
                                <label for="senha" class="form-label">Senha</label>
                                <input type="password" class="form-control" id="senha" name="senha" required>
                            </div>
                            <div class="col-12 mt-2">
                                <button class="btn btn-primary" type="submit">Login</button>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </body>
        </html>
    `);
});

app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;
    if (usuario === "admin" && senha === "admin") {
        req.session.login = { nome: "Administrador", logado: true };
        res.redirect("/");
    } else {
        res.send("Usuário ou senha inválidos!");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

function verificarLogin(req, res, next) {
    if (req.session.login?.logado) {
        next();
    } else {
        res.redirect("/login");
    }
}

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
