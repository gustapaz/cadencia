# Arquitetura

Modo integrado, conforme solution-contract.md. Doz consome Hattip + Runtypes na mesma origem. SSR contém conteúdo, metadados e navegação; o bundle próprio monta depois da hidratação.

Ordem topológica, passagem adiante/atrás CPM, folgas e dependências críticas. Ciclos são rejeitados. Pressupõe recursos ilimitados, dias abstratos e dependências fim-início.

API HTTP de mesma origem.

service.mjs: domínio e exportação. input-schema.mjs: restrições canônicas. validator.mjs: validação da stack. api.mjs: protocolo/router. store.mjs: D1, tokens, CAS, TTL e cotas. transport.mjs: bytes/UTF-8, origem, erros mascarados e cabeçalhos.


A interface usa templates Doz de uma raiz com valores textuais escapados. Eventos são delegados no host; não há eventos JavaScript construídos a partir de texto do usuário. Propriedades booleanas nativas são sincronizadas após o desenho, evitando o tratamento de atributos ausentes da biblioteca. A dependência Doz contém caminhos legados com eval; o produto não usa esses caminhos para eventos ou dados do usuário.
