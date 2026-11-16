# Como contribuir

## Fluxo recomendado

1. Escolha uma tarefa do `ROADMAP.md` ou uma issue do GitHub.
2. Crie um branch curto, como `feat/alterar-senha` ou `fix/login`.
3. Faça apenas uma mudança coerente por commit.
4. Execute `npm test` no back-end e `npm run build` no front-end.
5. Abra um pull request e peça a revisão do outro colaborador.

## Mensagens de commit

Use mensagens objetivas e verdadeiras:

- `feat: adiciona alteração de senha`
- `fix: corrige expiração da sessão`
- `test: cobre cadastro duplicado`
- `docs: documenta variáveis do MySQL`
- `refactor: separa criação das tabelas`

Cada commit deve manter o autor real configurado no Git. Não altere datas, autoria ou histórico já publicado para simular contribuições.

## Antes de enviar

```powershell
cd museu-back-end
npm test
cd ..\museu-front-end
npm run build
```
