# Orientações do front-end

Aplicam-se também as regras de `../AGENTS.md`.

- Flask é a camada de apresentação e o intermediário da API; não decide respostas corretas.
- Templates em `templates/`, estilos e scripts locais em `static/`.
- Usar Jinja com escape automático. Não usar `|safe` em conteúdo externo.
- Todo formulário POST deve incluir `csrf_token`; respostas usam também `round_token`.
- Usar POST/Redirect/GET nas páginas; quizzes usam fetch com CSRF e resposta JSON da mesma origem.
- Não colocar chaves de API em HTML, JavaScript ou URLs.
- Preservar CSP sem scripts ou estilos inline e sem dependências de CDN.
- Usar CSS para layout e JS para a corrida em tempo real, controles, colisões, pausa e voz.
- Manter simulação testável em `runner-core.mjs`, independente de DOM e renderização.
- A pontuação da corrida é recreativa e local. Não apresentá-la como validada pelo servidor.
- Manter botões grandes, rótulos acessíveis, foco visível e contraste suficiente.
- Validar larguras de 360 px e desktop; evitar scroll horizontal.
- Mostrar mensagens acolhedoras se a API estiver indisponível, sem rastros de erro.
- A página para adultos é informativa e pública; não é uma área administrativa autenticada.
- Mudanças em cookies, cabeçalhos e formulários exigem testes de segurança.
