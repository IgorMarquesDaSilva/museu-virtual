# Roadmap

Estas 14 tarefas são melhorias futuras independentes. Nenhuma delas está implementada apenas por aparecer nesta lista.

1. **Adicionar alteração de senha no perfil**
   Validar a senha atual e encerrar as outras sessões após a troca.

2. **Implementar recuperação de senha**
   Criar tokens temporários, expiração e fluxo de redefinição sem revelar se um e-mail existe.

3. **Limitar tentativas de login**
   Aplicar rate limit por IP e e-mail para reduzir ataques de força bruta.

4. **Criar migrações versionadas do MySQL**
   Separar mudanças de estrutura do banco da inicialização normal da aplicação.

5. **Adicionar arquivo `.env.example`**
   Documentar variáveis do MySQL, portas e configurações de produção sem incluir segredos.

6. **Testar a integração real com MySQL**
   Executar testes em um banco temporário e isolado no pipeline de integração contínua.

7. **Adicionar paginação aos favoritos**
   Evitar carregar toda a coleção de uma vez quando o usuário tiver muitas obras.

8. **Melhorar o cache das APIs dos museus**
   Definir expiração, limite de memória e métricas de acerto do cache.

9. **Carregar rotas Vue sob demanda**
   Usar imports dinâmicos para reduzir o bundle inicial do front-end.

10. **Revisar acessibilidade da interface**
    Validar navegação por teclado, foco, contraste e mensagens para leitores de tela.

11. **Aprimorar o menu em telas pequenas**
    Criar navegação móvel que comporte perfil, favoritos e logout sem apertar o cabeçalho.

12. **Adicionar testes ponta a ponta**
    Cobrir cadastro, login, busca, favorito, perfil e logout pelo navegador.

13. **Configurar integração contínua no GitHub Actions**
    Rodar testes do back-end e build do front-end em cada pull request.

14. **Preparar execução reproduzível do ambiente**
    Documentar versões e oferecer uma configuração opcional com containers para Node e MySQL.
