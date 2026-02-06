// importaçoes
import express from 'express';
import axios from 'axios';
import fs from 'fs';

// app
const app = express();
app.use(express.json());
app.use(express.static('public'));

// dados do spotify
const client_id = '4532bba317bf472492db78f145c65a5d';
const client_secret = 'f45e8e3f8ad841b1844bc9fcae4a1b07';
const redirect_uri = process.env.REDIRECT_URI;


// token salvo na memoria
let access_token = null;

// banco de dados 
const DB = './banco.json';

function lerBanco() {
  return JSON.parse(fs.readFileSync(DB));
}

function salvarBanco(dados) {
  fs.writeFileSync(DB, JSON.stringify(dados, null, 2));
}

//rota principal
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});

// rota de login
app.get('/login', (req, res) => {
  const permissoes = 'user-read-private user-read-email';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id,
    scope: permissoes,
    redirect_uri
  });

  res.redirect('https://accounts.spotify.com/authorize?' + params.toString());
});

// callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const resposta = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(client_id + ':' + client_secret).toString('base64')
        }
      }
    );

    // salva o token na variável
    access_token = resposta.data.access_token;
    res.redirect('/');

  } catch (erro) {
    res.status(500).json({ erro: 'erro no login' });
  }
});

// buscar dados do usuário logado
app.get('/usuario', async (req, res) => {
  if (!access_token) {
    return res.status(401).json({ erro: 'faça login primeiro' });
  }

  try {
    const resposta = await axios.get(
      'https://api.spotify.com/v1/me',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    // retorna todos os dados concedidos
    res.json(resposta.data);

  } catch (erro) {
    res.status(500).json({ erro: 'erro ao buscar dados do usuário' });
  }
});

// buscar artista pelo nome 
app.get('/buscar-artista', async (req, res) => {
  const nome = req.query.q;

  if (!nome) {
    return res.status(400).json({ erro: 'informe o nome do artista' });
  }

  if (!access_token) {
    return res.status(401).json({ erro: 'faça login primeiro' });
  }

  try {
    const resposta = await axios.get(
      'https://api.spotify.com/v1/search',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        },
        params: {
          q: nome,
          type: 'artist',
          limit: 5
        }
      }
    );
    res.json(resposta.data);

  } catch (erro) {
    res.status(500).json({ erro: 'erro ao buscar artista' });
  }
});
// lista fixa de artistas 
const artistas_famosos = [
// Pop internacional
"06HL4z0CvFAxyc27GXpf02", // Taylor Swift
"1uNFoZAHBGtllmzznpCI3s", // Justin Bieber
"6qqNVTkY8uBg9cP3Jd7DAH", // Billie Eilish
"1Xyo4u8uXC1ZmMpatF05PJ", // The Weeknd
"66CXWjxzNUsdJxJ2JdwvnR", // Ariana Grande
"3TVXtAsR1Inumwj472S9r4", // Drake
"5pKCCKE2ajJHZ9KAiaK11H", // Rihanna
"7dGJo4pcD2V6oG8kP0tJRR", // Eminem
"4q3ewBCX7sLwd24euuV69X", // Bad Bunny
"246dkjvS1zLTtiykXe5h60", // Post Malone

// Rock / Alternative
"711MCceyCBcFnzjGY4Q7Un", // AC/DC
"3WrFJ7ztbogyGnTHbHJFl2", // The Beatles
"6olE6TJLqED3rqDCT0FyPh", // Nirvana
"776Uo845nYHJpNaStv1Ds4", // Jimi Hendrix
"0k17h0D3J5VfsdmQ1iZtE9", // Pink Floyd
"1dfeR4HaWDbWqFHLkxsg1d", // Queen
"22bE4uQ6baNwSHPVcDxLCe", // The Rolling Stones
"36QJpDe2go2KgaRleHCDTp", // Led Zeppelin
"7oPftvlwr6VrsViSDV7fJY", // Green Day
"5K4W6rqBFWDnAN6FQUkS6x", // Kanye West

// Latino / Reggaeton
"790FomKkXshlbRYZFtlgla", // KAROL G
"4q3ewBCX7sLwd24euuV69X", // Bad Bunny
"716NhGYqD1jl2wI1Qkgq36", // Ozuna
"4YRxDV8wJFPHPTeXepOstw", // Daddy Yankee

// Eletrônica
"60d24wfXkVzDSfLS6hyCjZ", // Martin Garrix
"64KEffDW9EtZ1y2vBYgq8T", // Marshmello
"1Cs0zKBU1kc0i8ypK3B9ai", // David Guetta
"6qqNVTkY8uBg9cP3Jd7DAH", // Billie Eilish (alt / electro pop)
"7CajNmpbOovFoOoasH2HaY", // Calvin Harris

// Rap / Hip-Hop
"699OTQXzgjhIYAHMy9RyPD", // Playboi Carti
"2YZyLoL8N0Wb9xBt1NhZWg", // Kendrick Lamar
"0c173mlxpT3dSFRgMO8XPh", // Travis Scott
"1RyvyyTE3xzB2ZywiAwp0i", // Future
"1Xyo4u8uXC1ZmMpatF05PJ", // The Weeknd (R&B)
"4YqwRbMLqGHRHLS1w2ZKse", // veigh
];


// buscar artista pelo id
app.get('/artista_id', async (req, res) => {
if (!access_token) {
return res.status(401).json({ erro: 'faça login primeiro' });
}
try {
const artista_fixos = [];
const random_artistas = [];

while (random_artistas.length < 20) {
  const artista = artistas_famosos[Math.floor(Math.random() * artistas_famosos.length)];

  if (!random_artistas.includes(artista)) {
    random_artistas.push(artista);
  } else {
    continue;
  }
}

for (const id of random_artistas) {  
  const response = await axios.get(  
    `https://api.spotify.com/v1/artists/${id}`,  
    {  
      headers: {  
        Authorization: `Bearer ${access_token}`  
      }  
    }  
  );  

  artista_fixos.push(response.data);  
}  

res.json(artista_fixos);

} catch (error) {
console.error(error.response?.data || error.message);
res.status(500).json({ erro: "Erro ao buscar artistas" });
}
});

// artista reais
app.get('/artista_Real', async (req, res) => {
  if (!access_token) {
    return res.status(401).json({ erro: 'faça login primeiro' });
  }

  try {
    const id = artistas_famosos[Math.floor(Math.random() * artistas_famosos.length)];

    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    res.json([{
      nome: response.data.name,
      popularidade: response.data.popularity,
      seguidores: response.data.followers.total,
      generos: response.data.genres,
      imagens: response.data.images[0]
    }]);

  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar artista verdadeiro" });
  }
});

// artistas fakes
app.get('/artista_falsos', async (req, res) => {
  if (!access_token) {
    return res.status(401).json({ erro: 'faça login primeiro' });
  }

  try {
    const artista_fake = [];

    for (let i = 0; i < 3; i++) {
      const id = artistas_famosos[Math.floor(Math.random() * artistas_famosos.length)];

      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );

      artista_fake.push(response.data.name);
    }

    res.json(artista_fake);

  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar artistas fake" });
  }
});

// rota de logout
app.get('/logout', (req, res) => {
  access_token = null;
  res.redirect('/');
});

// rota somar pontos
app.post('/pontos/somar', (req, res) => {
  const { id, nome, pontos } = req.body;

  if (!id || !nome || !pontos) {
    return res.status(400).json({ erro: 'dados inválidos' });
  }

  const banco = lerBanco();

  let user = banco.find(u => u.id === id);

  if (!user) {
    banco.push({ id, nome, pontos });
  } else {
    user.pontos += pontos;
  }

  salvarBanco(banco);

  res.json({ sucesso: true, ganho: pontos });
});

//consultar pontos

app.get('/pontos/:id', (req, res) => {
  const banco = lerBanco();

  const user = banco.find(u => u.id === req.params.id);

  if (!user) return res.json({ pontos: 0 });

  res.json({ pontos: user.pontos });
});

// servidor
const porta = process.env.PORT || 3000;

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});