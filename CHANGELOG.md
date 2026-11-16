# Changelog

As mudanças relevantes do projeto são registradas aqui sem alterar autores ou datas do histórico Git.

## Não publicado

- Documentação do planejamento e do fluxo de contribuição colaborativa.

## 2026-11-16

### Corrigido

- Migração da persistência de SQLite para MySQL, com criação automática do banco `museu_virtual`.
- Consultas assíncronas de usuários, sessões e favoritos no MySQL.
- Compatibilidade da data de criação do perfil com o formato retornado pelo MySQL.
- Configuração do Vue CLI para compilar corretamente dentro do caminho `Program Files (x86)`.

### Adicionado

- Cadastro, login, logout e edição de perfil.
- Senhas protegidas com `scrypt` e sessões mantidas em cookie `HttpOnly`.
- Favoritos separados por usuário autenticado.
- Telas Vue de login, cadastro e perfil seguindo o padrão visual existente.
- Testes das rotas de autenticação, perfil e favoritos.

### Alterado

- Porta do front-end alterada de `8080` para `9090`.
- Documentação de instalação e conexão com MySQL atualizada.

## Versão inicial

- Galeria virtual em Vue.js e Node.js.
- Integração com The Met e Cleveland Museum of Art.
- Pesquisa unificada, detalhes de obras e coleção de favoritos.
