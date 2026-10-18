# Implantação no Railway ou servidor próprio

## Railway: configuração inicial

Os arquivos de implantação estão preparados; o deploy remoto ainda não foi
executado. Criar dois serviços, `frontend` e `backend`, no mesmo projeto e ambiente,
ligados ao repositório GitHub e à branch `main`. Usar um ambiente novo com rede
privada IPv4/IPv6 (ambientes anteriores a 16/10/2025 podem exigir IPv6).

Em ambos, manter **Root Directory** na raiz (`/`), pois os serviços importam
`shared/`. Em Settings, definir **Railway Config File**:

| Serviço | Arquivo de configuração | Exposição |
| --- | --- | --- |
| frontend | `/deploy/railway.frontend.json` | Domínio público HTTPS |
| backend | `/deploy/railway.backend.json` | Somente rede privada; sem domínio público nem TCP proxy |

O Dockerfile compartilhado usa Python 3.12, instala `requirements-lock.txt` e
executa como usuário 10001, sem privilégios. A versão menor do Python está fixa;
patches e a imagem base podem mudar nos rebuilds. O contexto Docker exclui `.env`,
`.git`, ambiente virtual e arquivos não necessários. Não configurar build/start
commands adicionais no painel: os arquivos JSON definem os comandos por serviço.
Não usar `scripts/run_local.py` no Railway.

### Variáveis

Cadastrar os valores em Variables antes de iniciar os serviços. Gerar três
segredos aleatórios diferentes, com pelo menos 32 caracteres, mantendo os mesmos
valores entre deploys. Para gerar um valor localmente no PowerShell:

```powershell
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
```

Executar três vezes e guardar os resultados somente no gestor de variáveis.
Não usar `scripts/setup.py` no build nem enviar `.env` para o GitHub.

| Variável | frontend | backend |
| --- | --- | --- |
| `APP_ENV` | `production` | `production` |
| `PORT` | `8080` | `8080` |
| `SECRET_KEY` | Primeiro segredo | Não necessário |
| `API_KEY` | Mesmo segundo segredo | Segundo segredo |
| `GAME_SECRET` | Não necessário | Terceiro segredo |
| `FRONTEND_HOSTS` | `SEU-DOMINIO.up.railway.app,healthcheck.railway.app` | Não necessário |
| `BACKEND_HOSTS` | Não necessário | `backend.railway.internal,healthcheck.railway.app` |
| `BACKEND_URL` | `http://backend.railway.internal:8080` | Não necessário |

Substituir o domínio público e o hostname privado pelos valores reais mostrados
em Networking. Hosts não levam protocolo, porta ou caminho; não usar curingas.
Se renomear o backend ou alterar sua porta, atualizar também `BACKEND_URL`.
O `API_KEY` pode ser uma variável compartilhada referenciada nos dois serviços.

Criar domínio somente no frontend, com target port 8080. O TLS é terminado na
borda do Railway; o HTTP interno permanece na rede privada. O navegador chama
somente o frontend. Não é necessário habilitar CORS nem `ProxyFix`.

### Saúde e deploy automático

Os dois arquivos configuram `/health`, timeout de 300 segundos e até cinco
reinícios em falha. O hostname `healthcheck.railway.app` precisa estar explicitamente
autorizado. A sonda do frontend não cria cookies e verifica somente o processo
Flask, sem chamar o backend; um healthcheck verde não comprova a jornada completa.
O Railway verifica a saúde durante o deploy, não como monitor contínuo.

Subir o backend primeiro e depois o frontend. Em cada serviço, habilitar autodeploy
da branch `main`. O workflow `.github/workflows/tests.yml` executa pytest, testes
JavaScript, `pip check` e build Docker no Linux. Habilitar **Wait for CI** nos dois
serviços após conectar o GitHub e conceder as permissões exigidas. Sem essa opção,
os testes não bloqueiam o deploy. Commits locais precisam chegar ao GitHub para
disparar o workflow e o Railway.

Não são necessários banco de dados ou volumes. Sessões permanecem temporárias;
rotacionar os segredos invalida sessões ou aventuras existentes.

### Verificação no ambiente real

- Confirmar os dois deploys saudáveis e o frontend acessível por HTTPS.
- Completar uma aventura: isso verifica URL privada, chave e comunicação Flask/API.
- Conferir cookies Secure/HttpOnly/SameSite, CSP e HSTS no navegador.
- Confirmar que o backend não tem domínio público nem TCP proxy.
- Configurar limites de tráfego/conexões e retenção de logs na infraestrutura:
  o Nginx de exemplo abaixo não é executado por esta imagem Docker.
- Validar reinício, indisponibilidade da API, desktop, celular, teclado e movimento reduzido.
- Aplicar os demais requisitos de `SECURITY.md` antes da divulgação pública.

Referências oficiais: [monorepos](https://docs.railway.com/deployments/monorepo),
[configuração como código](https://docs.railway.com/config-as-code/reference),
[comandos Docker e expansão de variáveis](https://docs.railway.com/deployments/start-command),
[rede privada](https://docs.railway.com/networking/private-networking/how-it-works),
[healthchecks](https://docs.railway.com/deployments/healthchecks) e
[autodeploy e Wait for CI](https://docs.railway.com/deployments/github-autodeploys).

## Alternativa: servidor próprio com Nginx

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
