# Orientações do back-end

Aplicam-se também as regras de `../AGENTS.md`.

- Implementar regras de aprendizagem em `game.py`, sem dependência de Flask.
- Expor contratos em `main.py` com validação Pydantic e rejeição de campos extras.
- Usar a fábrica `create_app`; não criar segredos implicitamente ao importar módulos.
- Exigir `X-API-Key` nas rotas de jogo e comparar segredos em tempo constante.
- Tokens de jogo são assinados e expiram em 30 minutos; não confiar em progresso enviado pelo cliente.
- Não persistir dados pessoais ou respostas individuais nesta versão.
- `GET /health` deve retornar somente estado mínimo, sem configuração ou segredos.
- Não habilitar documentação pública, CORS ou acesso direto do navegador sem revisar a arquitetura.
- Cinco acertos encerram a aventura; erros não reduzem progresso nem geram punições.
- Testar os três modos, adulteração, expiração, autenticação e contratos inválidos.
- Tokens são stateless: reapresentação de um token válido é possível. Não implementar rankings,
  recompensas financeiras ou histórico confiável sobre este mecanismo sem armazenamento no servidor.
