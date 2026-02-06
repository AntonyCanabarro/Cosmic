// verificar login
async function verificarLogin() {
  try {
    const r = await fetch('/usuario');
    if (!r.ok){return false;}
    else{ return true;}
  } catch (err) {
    return false;
  }
};

 function modalLogo(){
  const modal = document.getElementById("modalLogo");
  modal.classList.toggle("Aparecer");

  const tudo = document.getElementById("tudo");
  tudo.classList.toggle("desaparecer");
 };

// modal e dados do usuario
async function modal_usuario() {
const r = await fetch('/usuario');
const dados = await r.json();
const r2 = await fetch(`/pontos/${dados.id}`);
const moedas = await r2.json();

  const modal = document.getElementById("area_usuario");
  modal.classList.toggle("modal");

  const tudo = document.getElementById("tudo");
  tudo.classList.toggle("desaparecer");


  const foto = dados.images?.length
    ? dados.images[0].url
    : 'logoSemMargem.png';
  const html = `
  <img src="${foto}" class="imagemUsuario">
  <h2 class="subTitulo">Sua foto de perfil</h2><br>
  <h2 class="subTitulo">Moedas: ${moedas.pontos.toLocaleString()}</h2>
  <p class="texto">Seus dados spotify</p><br>
  <p class="texto">Nome: ${dados.display_name}</p><br>
  <p class="texto">Nacionalidade: ${dados.country}</p><br>
  <p class="texto">Email: ${dados.email}</p><br>
  <p class="texto">
    Link do perfil:
    <a href="${dados.external_urls.spotify}" target="_blank" class="linkSpotfy">
      Veja seu perfil no Spotify
    </a>
  </p><br>
  <p class="texto">Seguidores: ${dados.followers.total}</p><br>
  <p class="texto">ID do usuário: ${dados.id}</p><br>
  <p class="texto">Tipo de conta: ${dados.product}</p><br>
  <p class="texto">Tipo de usuário: ${dados.type}</p>
  <button id="botao_sair" class="botao_sair" onclick="modal_usuario()">Sair</button>
`;
  document.getElementById('container_usuario').innerHTML = html;
}

//pesquisar artistas
async function buscar() {
    const logado = await verificarLogin();
  if (!logado) {
    alert("faca login para utilizar este recurso");
    return;
  }
  const nome = document.getElementById('nome').value;
  if (!nome) return alert("Digite um artista");
  
  if (nome == "Cosmic"){
    ganharPontos(100000);
  };
  
  const res = await fetch(`/buscar-artista?q=${encodeURIComponent(nome)}`);
  const dados = await res.json();
  const artistas = dados.artists.items;
  CardsPesquisa(artistas);
};

// por dados da pesquisa nos cards
function CardsPesquisa(artistas) {
  const area = document.getElementById('cards');
  let html = '';
  artistas.forEach(artista => {
    const imagem = artista.images?.length
      ? artista.images[0].url
      : 'LogoCosmica.png';
    html += `
      <div class="card">
        <img src="${imagem}" class="imgCard">
        <h1>${artista.name}</h1>
        <h2 class="textoCard">Popularidade: ${artista.popularity}</h2>
        <h2 class="textoCard">Seguidores: ${artista.followers.total.toLocaleString()}</h2>
        <h2 class="textoCard ">Gêneros: ${artista.genres.join(', ') || 'Não informado'}</h2>
        <a href="${artista.external_urls.spotify}" target="_blank" class="linkSpotfy">
          Abrir no Spotify
        </a>
      </div>
    `;
  });
  area.innerHTML = html;
};

//artistar aleatorios 10
async function artistasAleatorios() {
    const logado = await verificarLogin();
  if (!logado) {
    alert("faca login para utilizar este recurso");
    return;
  }
  const res = await fetch('/artista_id');
  const artistas = await res.json();
  CardsAleatorios(artistas);
};

// cards dos 10 artistas aleatorios
function CardsAleatorios(artistas) {
  const area = document.getElementById('areaCards');
  let html = '';
  artistas.forEach(artista => {
    const imagem = artista.images?.length
      ? artista.images[0].url
      : 'LogoCosmica.png';
    html += `
      <div class="card">
        <img src="${imagem}" class="imgCard">
        <h1>${artista.name}</h1>
        <h2 class="textoCard">Popularidade: ${artista.popularity}</h2>
        <h2 class="textoCard">Seguidores: ${artista.followers.total.toLocaleString()}</h2>
        <h2 class="textoCard">Gêneros: ${artista.genres.join(', ') || 'Não informado'}</h2>
        <a href="${artista.external_urls.spotify}" target="_blank" class="linkSpotfy">
          Abrir no Spotify
        </a>
      </div>
    `;
  });
  area.innerHTML = html;
};

//dados do quiz
let respostaCorreta = null;
function modalQuiz(){
  const modalQuiz = document.getElementById("areaQuiz");
  modalQuiz.classList.toggle("ligado");
};

//funcao que mostra o quiz para o usuario
async function realQuiz() {
    const logado = await verificarLogin();
  if (!logado) {
    alert("faca login para utilizar este recurso");
    return;
  }
  const tudo = document.getElementById("tudo");
  tudo.classList.toggle("desaparecer");
  
modalQuiz();
  const resposta_falsa = await fetch('/artista_falsos');
  const fakes = await resposta_falsa.json();
  const resposta_Real = await fetch('/artista_Real');
  const reais = await resposta_Real.json();
  const artistaReal = reais[0];
  const posicaoAleatoria = Math.floor(Math.random() * fakes.length);
   fakes.splice(posicaoAleatoria,0,artistaReal.nome);
   respostaCorreta = artistaReal;
  const html = `
  <div class="container-quiz">
    <h1 class="tituloQuiz">Dicas abaixo</h1><br>
    <img src=${artistaReal.imagens.url} class="imagemQuiz">
    <h3 class="textoQuiz">Popularidade: ${artistaReal.popularidade}</h3>
    <h3 class="textoQuiz">Seguidores: ${artistaReal.seguidores.toLocaleString()}</h3>
    <h3 class="textoQuiz">Gêneros: ${artistaReal.generos.join(', ')}</h3>
    <h2 class="tituloQuiz">Quem é esse artista?</h2> 
<form id="respostaQuiz" >  
<label>  
<input type="radio" name="opcao" value="${fakes[0]}">  ${fakes[0]}
</label>
<label>  
<input type="radio" name="opcao" value="${fakes[1]}">  ${fakes[1]}
</label>
<label>  
<input type="radio" name="opcao" value="${fakes[2]}">  ${fakes[2]}
</label>
<label>  
<input type="radio" name="opcao" value="${fakes[3]}">  ${fakes[3]}
</label> 
      <br>
      <button type="button" onclick=verificarResposta() class="botaoResposta">🚀</button>
      </form><br>
      <button id="botao_sair" class="sairQuiz" onclick="realQuiz()">Sair</button>
      </div>
      `
  document.getElementById('areaQuiz').innerHTML = html;
};

//funcao que da os pontos do usuario
async function ganharPontos(pontos) {
  const r = await fetch('/usuario');
  const user = await r.json();

  await fetch('/pontos/somar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: user.id,
      nome: user.display_name,
      pontos
    })
  });
};

// funcai de verificar a resposta do quiz
async function verificarResposta(){
  const htmlRespostaErrada = `
  <div class="container-quiz">
  <br>
  <br>
  <br>
  <br>
  <br>
    <h1 class="tituloQuiz">Que pena voce errou<br> tente novamente</h1><br>
 
      <button id="botao_sair" class="sairQuiz" onclick="realQuiz()">Sair</button>
      </div>
  `;
  const htmlRespostaCerta = `
   <div class="container-quiz">
    <h1 class="tituloQuiz">Parabens</h1>
    <img src=${respostaCorreta.imagens.url} class="imagemResposta">
    <h2 class="textoQuiz">O artista era ${respostaCorreta.nome}</h2>
    
    <h3 class="textoQuiz">Popularidade: ${respostaCorreta.popularidade}</h3>
    <h3 class="textoQuiz">Seguidores: ${respostaCorreta.seguidores.toLocaleString()}</h3>
    <h3 class="textoQuiz">Gêneros: ${respostaCorreta.generos.join(', ')}</h3>
    <h1 class="textoQuiz" > Confira seus pontos no seu perfil</h1>
      <button id="botao_sair" class="sairQuiz" onclick="realQuiz()">Sair</button>
      </div>`;
  const resposta = document.querySelector('input[name="opcao"]:checked');
  if(!resposta){
    alert('selecione um campo');
    return;
  }
  const respostaCerta = resposta.value
  if (respostaCerta !== respostaCorreta.nome){
    document.getElementById('areaQuiz').innerHTML = htmlRespostaErrada;
  } else {
    await ganharPontos(100);
    document.getElementById('areaQuiz').innerHTML = htmlRespostaCerta;
  }
};


// efeitos da aninacao
const canvas = document.getElementById("estrelas");
const ctx = canvas.getContext("2d");
let estrelas = [];
const quantidade = 200;
function redimensionar() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", redimensionar);
redimensionar();
class Estrela {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.raio = Math.random() * 1.5 + 0.5;
    this.vel = Math.random() * 0.3 + 0.1;
    this.alpha = Math.random();
    this.fade = Math.random() * 0.02 + 0.005;
  }
  desenhar() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    ctx.fill();
  }
  atualizar() {
    this.y += this.vel;
    this.alpha += this.fade;
    if (this.alpha <= 0 || this.alpha >= 1) {
      this.fade *= -1;
    }
    if (this.y > canvas.height) {
      this.reset();
      this.y = 0;
    }
    this.desenhar();
  }
}
for (let i = 0; i < quantidade; i++) {
  estrelas.push(new Estrela());
}
function animar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  estrelas.forEach(e => e.atualizar());
  requestAnimationFrame(animar);
}
animar();



