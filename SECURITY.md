# Segurança

## Proteções implementadas

- Segredos aleatórios distintos, exigidos na inicialização; `.env` ignorado no Git.
- API autenticada com comparação em tempo constante; porta local por padrão.
- Token de jogo assinado e limitado a 30 minutos, com validação no back-end.
- Proteção CSRF em todos os formulários POST e cookies HttpOnly/SameSite=Lax.
- Cookies Secure e HSTS quando `APP_ENV=production`.
- Hosts explícitos, sem curinga, nos dois serviços.
- Escape automático de templates; CSP sem CDN, código inline, frames ou plugins.
- Câmera, microfone, localização e pagamentos desabilitados por Permissions-Policy.
- Corpo de requisição do Flask limitado a 8 KiB; campos da API limitados por Pydantic.
- Nenhuma credencial de API enviada ao navegador; nenhuma configuração de CORS aberta.
- Debug desligado; uso de Waitress e Uvicorn; sem stack trace na interface.
- Sem cadastro, publicidade, analytics ou dados pessoais da criança.

## Limites e decisões

Cookies e tokens assinados podem ser lidos pelo portador: não são criptografados.
O jogo não evita replay de tokens válidos nem estabelece identidade de jogador.
Anéis, colisões e pontos da corrida são simulados localmente no navegador e podem
ser alterados pelo usuário. Servem apenas como feedback recreativo, sem ranking.
Não utilizar esta solução para rankings, avaliações formais ou recompensas de valor.

A proteção contra tráfego abusivo e requisições lentas depende do proxy e da
infraestrutura. `deploy/nginx.conf.example` fornece limites de tamanho e taxa.
Não há garantia de proteção contra DDoS. O servidor da API deve permanecer privado.

No Railway, somente o frontend recebe domínio público. O backend usa a rede
privada do mesmo ambiente. A imagem roda sem privilégios; os segredos são variáveis
de runtime e não entram no build. O Nginx de exemplo não faz parte dessa imagem:
limites de tráfego e política de logs precisam ser configurados na infraestrutura.
As sondas `/health` preservam a validação de hosts; autorizar explicitamente
`healthcheck.railway.app` nas variáveis de hosts. O frontend não cria sessão nessa rota.

O guia para adultos é público e informativo; não protege configurações sensíveis.
A versão atual não possui configurações administrativas mutáveis.

## Antes de publicar

1. Configurar domínio e TLS válido; servir todo tráfego externo por HTTPS.
2. Gerar novos segredos de produção e restringir permissões do arquivo/gestor de segredos.
3. Configurar hosts e backend; manter portas 5000 e 8000 inacessíveis externamente.
4. Aplicar limites de tráfego, conexões, corpo e timeout no proxy.
5. Instalar versões revisadas, verificar vulnerabilidades e manter atualizações.
6. Usar serviço com usuário sem privilégios e supervisão/reinício dos processos.
7. Definir retenção mínima de logs; nunca registrar tokens, cookies ou cabeçalhos de autorização.
8. Revisar privacidade, contato do operador e direitos dos assets antes da divulgação.
9. Validar o ambiente real conforme `docs/DEPLOYMENT.md`.

## Reportar problemas

Em um repositório compartilhado, comunicar falhas de segurança ao mantenedor por
um canal privado. Não publicar chaves, tokens ou dados da criança em issues.
Ao suspeitar de vazamento, rotacionar os três segredos e reiniciar ambos os serviços;
isso invalida as sessões e aventuras existentes.

Referências: [segurança do Flask](https://flask.palletsprojects.com/en/stable/web-security/)
e [HTTPS no FastAPI](https://fastapi.tiangolo.com/deployment/https/).
