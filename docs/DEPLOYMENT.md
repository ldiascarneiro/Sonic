# Implantação futura em servidor web

Este guia é uma base de configuração. Nenhum servidor externo foi configurado ou
publicado nesta entrega. Os valores de domínio e certificados são exemplos e
precisam ser substituídos no ambiente escolhido.

## Topologia recomendada

Internet → Nginx com TLS → Waitress/Flask em 127.0.0.1:5000 → Uvicorn/FastAPI em
127.0.0.1:8000. Publicar apenas 80 (redirecionamento) e 443. Manter administração
do servidor restrita conforme o provedor. Não publicar a API diretamente.

## Instalação

1. Instalar Python 3.12+, Nginx e obter certificado válido pelo mecanismo do provedor.
2. Copiar código, criar `.venv` e instalar `requirements-lock.txt`.
3. Gerar segredos exclusivos, usando `scripts/setup.py` em uma instalação nova.
4. Guardar configuração fora de diretórios públicos, acessível somente pelo usuário do serviço.
5. Configurar ambiente:

```dotenv
APP_ENV=production
SECRET_KEY=<segredo-aleatorio-exclusivo-de-no-minimo-32-caracteres>
API_KEY=<outro-segredo-aleatorio-de-no-minimo-32-caracteres>
GAME_SECRET=<terceiro-segredo-aleatorio-de-no-minimo-32-caracteres>
BACKEND_URL=http://127.0.0.1:8000
FRONTEND_HOSTS=brincar.seudominio.com
BACKEND_HOSTS=127.0.0.1
```

Os exemplos acima não são segredos válidos para uso. Gere valores aleatórios novos.
As variáveis reais do processo têm precedência sobre `.env`.

## Processos

Executar a partir da raiz do projeto, usando o interpretador do ambiente virtual:

```sh
.venv/bin/python -m uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000 --no-access-log
.venv/bin/python -m waitress --host=127.0.0.1 --port=5000 --call frontend.app:create_app
```

São dois serviços independentes: configurar um supervisor, como systemd, para
cada comando. Definir diretório de trabalho, usuário sem privilégios, variáveis
de ambiente, reinício em falha e encerramento gracioso. Não usar o iniciador local
como supervisor de produção. O exemplo não habilita múltiplos workers.

## Proxy

Adaptar `deploy/nginx.conf.example`, instalar certificados e validar com `nginx -t`
antes de recarregar a configuração. O proxy aceita somente o domínio configurado,
redireciona HTTP, limita corpo e tráfego e encaminha apenas para Flask.

O aplicativo usa caminhos relativos e configura cookies seguros pelo ambiente;
não precisa confiar em cabeçalhos `X-Forwarded-*` nesta topologia. Não habilitar
`ProxyFix` ou confiança indiscriminada em proxies. Se uma futura integração exigir
URLs absolutas ou múltiplos proxies, revisar explicitamente essa configuração.

O exemplo desliga access logs para minimizar coleta. Erros do proxy ainda podem
conter IPs: definir retenção curta e acesso restrito. Ajustar limites de taxa com
observação de uso legítimo, especialmente em redes com vários usuários por IP.

## Verificação antes de liberar acesso

- Executar pytest e verificar dependências no ambiente do servidor.
- Confirmar redirecionamento HTTP → HTTPS e certificado válido.
- Confirmar cookies Secure/HttpOnly/SameSite e cabeçalhos CSP/HSTS no navegador.
- Confirmar que 5000 e 8000 não respondem pela rede externa.
- Confirmar rejeição de hosts não autorizados, POST sem CSRF e API sem chave.
- Completar os três modos em desktop e celular; testar pausa e voz disponível.
- Confirmar reinício dos serviços e mensagens amigáveis em indisponibilidade.
- Revisar aviso de privacidade com contato do operador e uso da marca/personagem.

Referências: [Flask: segurança](https://flask.palletsprojects.com/en/stable/web-security/),
[FastAPI: HTTPS](https://fastapi.tiangolo.com/deployment/https/) e
[conceitos de implantação](https://fastapi.tiangolo.com/deployment/concepts/).
