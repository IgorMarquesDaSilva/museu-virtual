# Entre Museus — galeria virtual

Projeto educacional com **Vue.js (HTML, CSS e JavaScript)** no front-end e **Node.js + Express** no back-end. A aplicação consulta duas APIs públicas gratuitas: [The Met](https://metmuseum.github.io/) e [Cleveland Museum of Art](https://openaccess-api.clevelandart.org/).

## Estrutura (MVC)

```text
museu-virtual/
├── museu-front-end/
│   └── src/
│       ├── models/       # regras simples dos dados exibidos
│       ├── views/        # componentes Vue e HTML da interface
│       ├── controllers/  # estado e ações da interface
│       └── services/     # chamadas HTTP para o nosso back-end
└── museu-back-end/
    └── src/
        ├── models/       # consulta às APIs e gravação dos favoritos
        ├── views/        # formato das respostas JSON
        ├── controllers/  # validação e lógica das rotas
        └── routes/       # endereços HTTP da API
```

No front-end, o Vue usa componentes reativos; por isso a divisão MVC é uma adaptação didática. No back-end, as *views* entregam JSON em vez de páginas HTML.

## Como executar

Requer Node.js 22.12 ou mais recente. Abra **dois terminais**:

**Terminal 1 — API**

```bash
cd museu-back-end
npm install
npm run dev
```

**Terminal 2 — interface**

```bash
cd museu-front-end
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite encaminha `/api` para o Node em `http://localhost:3000`.

## Como funciona uma busca

1. O usuário escreve um tema no Vue.
2. O Vue chama `GET /api/artworks?q=...` no Node.
3. O model do Node consulta os dois museus e transforma os campos diferentes em um formato comum.
4. O controller devolve JSON e a view Vue mostra os cartões.
5. Ao favoritar, o Vue chama `POST /api/favorites`; o Node salva em `museu-back-end/data/favorites.json`.

Uma busca pode retornar obras de apenas um museu se o outro estiver temporariamente indisponível. As buscas repetidas ficam em cache por cinco minutos para reduzir chamadas externas. Algumas palavras comuns em português são traduzidas para a pesquisa, mas os catálogos também funcionam melhor com termos em inglês.

## Rotas da API

| Método | Rota | Função |
| --- | --- | --- |
| GET | `/api/health` | Verifica se a API está ligada |
| GET | `/api/artworks?q=flores` | Busca nos dois museus |
| GET | `/api/favorites` | Lista favoritos |
| POST | `/api/favorites` | Salva uma obra |
| DELETE | `/api/favorites/:id` | Remove uma obra |

## Testes

Na pasta `museu-back-end`, rode `npm test`. Na pasta `museu-front-end`, rode `npm run build` para verificar a compilação.

Os dados e imagens pertencem aos museus de origem. Esta aplicação é um exercício educacional, sem comércio.
