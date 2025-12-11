import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const host = "0.0.0.0";
const porta = 3000;

const app = express();

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.use(session({
    secret: "segredo123",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 30 * 60 * 1000
    }
}));

let times = [];
let jogadores = [];

function proteger(req, res, next) {
    if (req.session.logado) {
        next();
    } else {
        res.redirect("/");
    }
}

app.get("/", (req, res) => {
    let html = `
    <h2>Login</h2>
    <form method="POST" action="/login">
        Usuário:<br>
        <input name="usuario"><br><br>
        Senha:<br>
        <input type="password" name="senha"><br><br>
        <button type="submit">Entrar</button>
    </form>`;
    res.send(html);
});

app.post("/login", (req, res) => {
    let u = req.body.usuario;
    let s = req.body.senha;

    if (u === "admin" && s === "admin") {
        req.session.logado = true;

        let dataAgora = new Date().toLocaleString("pt-BR");
        res.cookie("ultimoAcesso", dataAgora, {
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.redirect("/menu");
    } else {
        res.send("<h3>Usuário ou senha inválidos</h3><a href='/'>Voltar</a>");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.get("/menu", proteger, (req, res) => {
    let ultimo = req.cookies.ultimoAcesso || "Primeiro acesso";

    let html = `
    <h2>Menu do Sistema</h2>
    Último acesso: <b>${ultimo}</b><br><br>

    <a href="/cadastro-time">Cadastrar Equipe</a><br>
    <a href="/cadastro-jogador">Cadastrar Jogador</a><br>
    <a href="/listar-times">Listar Equipes</a><br>
    <a href="/listar-jogadores">Listar Jogadores</a><br><br>
    <a href="/logout">Sair</a>
    `;

    res.send(html);
});


app.get("/cadastro-time", proteger, (req, res) => {
    let html = `
    <h2>Cadastro de Equipes</h2>
    <form method="POST" action="/cadastro-time">
        Nome da equipe:<br>
        <input name="nome"><br><br>

        Capitão:<br>
        <input name="capitao"><br><br>

        Contato (WhatsApp):<br>
        <input name="contato"><br><br>

        <button type="submit">Cadastrar</button>
    </form><br>

    <a href="/menu">Voltar ao menu</a>
    `;
    res.send(html);
});


app.post("/cadastro-time", proteger, (req, res) => {
    let nome = req.body.nome.trim();
    let capitao = req.body.capitao.trim();
    let contato = req.body.contato.trim();

    if (!nome || !capitao || !contato) {
        return res.send("<h3>Todos os campos são obrigatórios.</h3><a href='/cadastro-time'>Voltar</a>");
    }

    if (!/^[0-9]+$/.test(contato)) {
        return res.send("<h3>O contato deve conter apenas números.</h3><a href='/cadastro-time'>Voltar</a>");
    }

    times.push({
        nome,
        capitao,
        contato
    });

    res.redirect("/listar-times");
});


app.get("/listar-times", proteger, (req, res) => {
    let html = `<h2>Equipes Cadastradas</h2><ul>`;

    times.forEach(t => {
        html += `<li><b>${t.nome}</b> — Capitão: ${t.capitao}, Contato: ${t.contato}</li>`;
    });

    html += `</ul><br><a href="/cadastro-time">Cadastrar nova equipe</a><br><a href="/menu">Menu</a>`;
    res.send(html);
});


app.get("/cadastro-jogador", proteger, (req, res) => {
    if (times.length === 0) {
        return res.send("<h3>Cadastre uma equipe antes de cadastrar jogadores.</h3><a href='/menu'>Voltar</a>");
    }

    let opcoes = "";
    times.forEach(t => {
        opcoes += `<option>${t.nome}</option>`;
    });

    let html = `
    <h2>Cadastro de Jogador</h2>
    <form method="POST" action="/cadastro-jogador">
        Nome do jogador:<br>
        <input name="jogador"><br><br>

        Nickname:<br>
        <input name="nick"><br><br>

        Função:<br>
        <select name="funcao">
            <option>top</option>
            <option>jungle</option>
            <option>mid</option>
            <option>atirador</option>
            <option>suporte</option>
        </select><br><br>

        Elo:<br>
        <input name="elo"><br><br>

        Gênero:<br>
        <input name="genero"><br><br>

        Equipe:<br>
        <select name="equipe">${opcoes}</select><br><br>

        <button type="submit">Cadastrar</button>
    </form><br>

    <a href="/menu">Voltar ao menu</a>
    `;
    res.send(html);
});


app.post("/cadastro-jogador", proteger, (req, res) => {
    let jogador = req.body.jogador.trim();
    let nick = req.body.nick.trim();
    let funcao = req.body.funcao.trim();
    let elo = req.body.elo.trim();
    let genero = req.body.genero.trim();
    let equipe = req.body.equipe.trim();

    if (!jogador || !nick || !funcao || !elo || !genero || !equipe) {
        return res.send("<h3>Todos os campos são obrigatórios.</h3><a href='/cadastro-jogador'>Voltar</a>");
    }

    let qtd = jogadores.filter(j => j.equipe === equipe).length;
    if (qtd >= 5) {
        return res.send("<h3>Esta equipe já possui 5 jogadores cadastrados.</h3><a href='/cadastro-jogador'>Voltar</a>");
    }

    jogadores.push({
        jogador,
        nick,
        funcao,
        elo,
        genero,
        equipe
    });

    res.redirect("/listar-jogadores");
});


app.get("/listar-jogadores", proteger, (req, res) => {
    let html = `<h2>Jogadores Cadastrados</h2>`;

    times.forEach(t => {
        html += `<h3>Equipe: ${t.nome}</h3><ul>`;
        jogadores.filter(j => j.equipe === t.nome).forEach(j => {
            html += `<li>${j.jogador} (${j.nick}) — ${j.funcao}, Elo: ${j.elo}, Gênero: ${j.genero}</li>`;
        });
        html += `</ul>`;
    });

    html += `<br><a href="/cadastro-jogador">Cadastrar novo jogador</a><br><a href="/menu">Menu</a>`;
    res.send(html);
});


app.listen(porta, host, () => {
    console.log("Servidor rodando");
});
