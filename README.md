# Entre Museus — galeria virtual

Projeto educacional com **HTML, CSS, JavaScript e Vue.js no front-end** e **Node.js com Express no back-end**. A interface consulta nossa API, que reúne dados públicos de dois museus: [The Met](https://metmuseum.github.io/) e [Cleveland Museum of Art](https://openaccess-api.clevelandart.org/).

## Como iniciar (igual às aulas com Vue CLI)

Requer Node.js 20 ou superior. Abra dois terminais na pasta `museu-virtual`.

**Terminal 1 — back-end**

```powershell
cd .\museu-back-end
npm install
npm start
```

**Terminal 2 — front-end**

```powershell
cd .\museu-front-end
npm install
npm run serve
```

Abra **http://localhost:8080**. O Vue CLI é responsável pelo comando `serve`. Ele encaminha as chamadas `/api` para o Node em `http://localhost:3000`. Se a API não estiver ligada, a página abre, mas a busca e os favoritos não funcionarão.

## Estrutura e ligação com as aulas

```text
museu-virtual/
├── museu-front-end/
│   ├── public/index.html       # HTML inicial
│   ├── src/main.js             # inicializa Vue e Vue Router
│   ├── src/App.vue             # componente raiz
│   ├── src/assets/css/         # CSS da interface
│   ├── src/components/         # busca, lista, cabeçalho e rodapé
│   ├── src/views/              # páginas Explorar e Favoritos
│   ├── src/router/             # rotas das páginas
│   ├── src/services/           # instância Axios
│   ├── src/controllers/        # ações da interface
│   └── src/models/             # regras dos dados exibidos
└── museu-back-end/
    └── src/
        ├── models/            # consultas externas e favoritos em JSON
        ├── controllers/       # validação e lógica HTTP
        ├── routes/            # rotas REST
        └── views/             # respostas JSON
```

O front-end usa `v-model` no campo de busca, `v-if` para carregamento/erros e `v-for` para exibir as obras. Os componentes usam `data()`, `computed`, `mounted()` e `methods`, como nos exemplos das aulas. O Vue Router alterna as páginas sem recarregar o navegador. O Axios centraliza as requisições HTTP.

O back-end segue MVC: **models** obtêm e salvam dados, **controllers** recebem as requisições, **routes** definem os endereços e **views** retornam JSON. Não há MongoDB neste projeto: os favoritos são salvos em `museu-back-end/data/favorites.json` para manter a instalação simples.

## Fluxo de uma busca

1. O visitante digita um tema em `BuscaObras.vue`.
2. A view chama o controller do front-end, que usa a instância Axios.
3. O Node recebe `GET /api/artworks?q=...` e consulta as duas APIs públicas.
4. O model transforma os dados diferentes em um formato comum.
5. O Vue renderiza a lista. Ao favoritar, ele envia um `POST` para o Node.

Algumas palavras comuns em português são traduzidas para a pesquisa. Os catálogos também aceitam termos em inglês. Se um museu estiver temporariamente indisponível, o resultado do outro ainda pode aparecer.

## Rotas REST da nossa API

| Método | Rota | Função |
| --- | --- | --- |
| GET | `/api/health` | Verifica se a API está ligada |
| GET | `/api/artworks?q=flores` | Busca nos dois museus |
| GET | `/api/favorites` | Lista os favoritos |
| POST | `/api/favorites` | Salva uma obra |
| DELETE | `/api/favorites/:id` | Remove uma obra |

## Verificações

Na pasta `museu-back-end`, rode `npm test`. Na pasta `museu-front-end`, rode `npm run build` para verificar a compilação. As imagens e os metadados vêm dos museus de origem; o projeto é apenas educacional.
