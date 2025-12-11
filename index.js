import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const host = "0.0.0.0";
const porta = 3000;

let equipes = [];
let jogadores = [];

const app = express();

app.use(session({
    secret: "sessaoLoL",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());

function autenticar(req, res, next) {
    if (req.session.usuario?.logado) {
        next();
    } else {
        res.redirect("/login");
    }
}

app.get("/", autenticar, (req, res) => {
    let ultimoAcesso = req.cookies?.ultimoAcesso;
    let agora = new Date().toLocaleString();
    res.cookie("ultimoAcesso", agora);

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Menu</title>
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-light bg-light p-3">
            <a class="navbar-brand">MENU</a>
            <div class="navbar-nav">
                <a class="nav-link" href="/cadastroEquipe">Cadastrar Equipe</a>
                <a class="nav-link" href="/listaEquipes">Listar Equipes</a>
                <a class="nav-link" href="/cadastroJogador">Cadastrar Jogador</a>
                <a class="nav-link" href="/listaJogadores">Listar Jogadores</a>
                <a class="nav-link" href="/logout">Sair</a>
            </div>
        </nav>
        <div class="container mt-3">
            <p><strong>Último acesso:</strong> ${ultimoAcesso || "Primeiro acesso"}</p>
        </div>
    </body>
    </html>
    `);
});

app.get("/cadastroEquipe", autenticar, (req, res) => {
    res.send(`
    <html>
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Cadastrar Equipe</title>
    </head>
    <body>
        <div class="container mt-4">
            <h2 class="mb-3">Cadastro de Equipe</h2>
            <form method="POST" action="/salvarEquipe" class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Nome da equipe</label>
                    <input type="text" class="form-control" name="nome">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Capitão</label>
                    <input type="text" class="form-control" name="capitao">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Contato (WhatsApp)</label>
                    <input type="text" class="form-control" name="contato">
                </div>
                <div class="col-12 mt-3">
                    <button class="btn btn-primary">Cadastrar</button>
                    <a class="btn btn-secondary" href="/">Menu</a>
                </div>
            </form>
        </div>
    </body>
    </html>
    `);
});

app.post("/salvarEquipe", autenticar, (req, res) => {
    const { nome, capitao, contato } = req.body;

    let erros = [];

    if (!nome) erros.push("Nome da equipe é obrigatório.");
    if (!capitao) erros.push("Nome do capitão é obrigatório.");
    if (!contato) erros.push("Contato é obrigatório.");

    if (contato && !/^[0-9]+$/.test(contato)) {
        erros.push("O contato deve conter apenas números.");
    }

    if (contato && contato.length < 9) {
        erros.push("O contato deve ter ao menos 9 dígitos.");
    }

    if (erros.length > 0) {
        return res.send(`
        <html><body>
            <div class="container mt-4">
                <h2>Erros encontrados</h2>
                <ul class="text-danger">
                    ${erros.map(e => `<li>${e}</li>`).join("")}
                </ul>
                <a class="btn btn-secondary mt-3" href="/cadastroEquipe">Voltar</a>
            </div>
        </body></html>
        `);
    }

    equipes.push({ nome, capitao, contato });
    res.redirect("/listaEquipes");
});

app.get("/listaEquipes", autenticar, (req, res) => {
    let html = `
    <html><head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Equipes</title>
    </head><body>
    <div class="container mt-4">
        <h2 class="mb-3">Equipes cadastradas</h2>
        <table class="table table-striped">
            <thead><tr>
                <th>Equipe</th><th>Capitão</th><th>Contato</th>
            </tr></thead><tbody>
    `;

    for (let e of equipes) {
        html += `
        <tr>
            <td>${e.nome}</td>
            <td>${e.capitao}</td>
            <td>${e.contato}</td>
        </tr>`;
    }

    html += `
        </tbody></table>
        <a class="btn btn-secondary" href="/cadastroEquipe">Cadastrar outra</a>
        <a class="btn btn-primary" href="/">Menu</a>
    </div>
    </body></html>
    `;

    res.send(html);
});

app.get("/cadastroJogador", autenticar, (req, res) => {
    let opcoes = equipes.map(e => `<option value="${e.nome}">${e.nome}</option>`).join("");

    res.send(`
    <html><head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Cadastrar Jogador</title>
    </head><body>
    <div class="container mt-4">
        <h2>Cadastro de Jogador</h2>
        <form method="POST" action="/salvarJogador" class="row g-3">
            <div class="col-md-4">
                <label class="form-label">Nome</label>
                <input type="text" class="form-control" name="nome">
            </div>
            <div class="col-md-4">
                <label class="form-label">Nickname</label>
                <input type="text" class="form-control" name="nick">
            </div>
            <div class="col-md-4">
                <label class="form-label">Função</label>
                <select class="form-select" name="funcao">
                    <option>top</option>
                    <option>jungle</option>
                    <option>mid</option>
                    <option>atirador</option>
                    <option>suporte</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Elo</label>
                <select class="form-select" name="elo">
                    <option>Ferro</option>
                    <option>Bronze</option>
                    <option>Prata</option>
                    <option>Ouro</option>
                    <option>Platina</option>
                    <option>Diamante</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Gênero</label>
                <select class="form-select" name="genero">
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Equipe</label>
                <select class="form-select" name="equipe">
                    ${opcoes}
                </select>
            </div>
            <div class="col-12 mt-3">
                <button class="btn btn-primary">Cadastrar</button>
                <a class="btn btn-secondary" href="/">Menu</a>
            </div>
        </form>
    </div>
    </body></html>
    `);
});

app.post("/salvarJogador", autenticar, (req, res) => {
    const { nome, nick, funcao, elo, genero, equipe } = req.body;

    if (!nome || !nick || !funcao || !elo || !genero || !equipe) {
        return res.send(`
        <html><body>
        <div class="container mt-4">
            <h2 class="text-danger">Todos os campos são obrigatórios.</h2>
            <a class="btn btn-secondary mt-3" href="/cadastroJogador">Voltar</a>
        </div>
        </body></html>
        `);
    }

    jogadores.push({ nome, nick, funcao, elo, genero, equipe });
    res.redirect("/listaJogadores");
});

app.get("/listaJogadores", autenticar, (req, res) => {
    let conteudo = `
    <html><head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Jogadores</title>
    </head><body>
    <div class="container mt-4">
        <h2>Jogadores por equipe</h2>
    `;

    equipes.forEach(eq => {
        conteudo += `
        <h4 class="mt-4">${eq.nome}</h4>
        <table class="table table-bordered">
            <thead><tr>
                <th>Nome</th><th>Nick</th><th>Função</th><th>Elo</th><th>Gênero</th>
            </tr></thead><tbody>
        `;

        jogadores.filter(j => j.equipe === eq.nome).forEach(j => {
            conteudo += `
            <tr>
                <td>${j.nome}</td>
                <td>${j.nick}</td>
                <td>${j.funcao}</td>
                <td>${j.elo}</td>
                <td>${j.genero}</td>
            </tr>
            `;
        });

        conteudo += `</tbody></table>`;
    });

    conteudo += `
        <a class="btn btn-secondary" href="/cadastroJogador">Cadastrar outro</a>
        <a class="btn btn-primary" href="/">Menu</a>
    </div>
    </body></html>
    `;

    res.send(conteudo);
});

app.get("/login", (req, res) => {
    res.send(`
    <html><head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Login</title></head>
    <body>
        <div class="container w-25 mt-5">
            <form action="/login" method="POST" class="border p-4">
                <h3>Login</h3>
                <label>Usuário</label>
                <input type="text" class="form-control" name="user">
                <label class="mt-2">Senha</label>
                <input type="password" class="form-control" name="pass">
                <button class="btn btn-primary mt-3">Entrar</button>
            </form>
        </div>
    </body></html>
    `);
});

app.post("/login", (req, res) => {
    const { user, pass } = req.body;

    if (user === "admin" && pass === "admin") {
        req.session.usuario = { logado: true };
        return res.redirect("/");
    }

    res.send(`
    <html><body>
    <div class="container w-25 mt-5">
        <p class="text-danger">Usuário ou senha inválidos</p>
        <a href="/login" class="btn btn-secondary mt-3">Voltar</a>
    </div>
    </body></html>
    `);
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando https://${host}:${porta}`);
});
