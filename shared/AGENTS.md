# Orientações de código compartilhado

Aplicam-se as regras de `../AGENTS.md`.

- Manter apenas configuração e metadados comuns; evitar acoplamento entre aplicações.
- Nenhum segredo padrão, arquivo `.env` embutido ou credencial em catálogo público.
- Variáveis do processo devem prevalecer sobre `.env`.
- Configuração inválida deve falhar na inicialização, com mensagem que não revele o segredo.
- Não adicionar dependência de Flask ou FastAPI neste pacote.
