# Sonic · Aprender brincando

Protótipo educativo **não oficial** para uma criança de 4 anos: Sonic corre em um
percurso de três faixas: a criança usa ←/→ ou botões de toque para desviar de
troncos, coletar anéis e somar pontos. Quizzes de números aparecem
em paradas ao longo do caminho. Não há
cronômetro, vidas, punições, cadastro ou publicidade. Cada aventura tem cinco descobertas.

**Stack:** Python 3.12+, Flask + Jinja + HTML/CSS no front-end; FastAPI no back-end.
Python fornece páginas, perguntas, validação e sessão. JavaScript é necessário
para controles, canvas, colisões e pontuação imediata, sem frameworks adicionais.

## Rodar nesta máquina

O ambiente `.venv` e o `.env` já foram preparados durante a implementação.
No PowerShell, dentro da pasta do projeto:

```powershell
.\.venv\Scripts\python.exe scripts/run_local.py
```

Abra **http://127.0.0.1:5000**. `Ctrl+C` encerra os dois servidores.
Se as portas 5000 ou 8000 estiverem ocupadas, encerre a execução anterior primeiro.
O aplicativo fica acessível apenas nesta máquina por padrão.

## Instalação em outra máquina Windows

Instale Python 3.12 ou superior e execute:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-lock.txt
.\.venv\Scripts\python.exe scripts/setup.py
.\.venv\Scripts\python.exe scripts/run_local.py
```

Não é necessário ativar o ambiente virtual ou alterar a política de scripts do PowerShell.
Se `python` abrir a Microsoft Store ou não funcionar, instale Python e use o caminho
do interpretador instalado. O `.venv` atual usa o runtime Python disponível no Codex;
recrie-o se esse runtime mudar ou for removido. Não copie `.venv` entre máquinas.

Em Linux/macOS, os comandos equivalentes usam `python3 -m venv .venv` e
`.venv/bin/python` no lugar de `.venv\Scripts\python.exe`.

## Estrutura

```text
AGENTS.md                Orientações gerais de desenvolvimento
plan.md                  Escopo, etapas e próximos passos
frontend/                Flask, templates, CSS, SVG e corrida em JavaScript
backend/                 FastAPI e regras pedagógicas
shared/                  Configuração e catálogo público
scripts/                 Geração de configuração e execução local
tests/                   Regras, integração e segurança
docs/                    Arquitetura, implantação e verificação
deploy/nginx.conf.example Exemplo de proxy HTTPS para futura implantação
SECURITY.md              Proteções e limites de segurança
.env.example             Variáveis sem segredos
requirements-lock.txt    Versões exatas verificadas (inclui testes)
```

Cada área principal possui `AGENTS.md`. O nome é intencionalmente plural e em maiúsculas.
Não há banco de dados nesta fase; o progresso fica em sessão temporária assinada.

## Páginas

| Endereço | Finalidade |
| --- | --- |
| `/` | Iniciar a corrida com exercícios numéricos |
| `/play` | Corrida e conclusão da aventura |
| `/adults` | Guia para o adulto acompanhar a criança |
| `/privacy` | Explicação sobre sessão, voz e privacidade |

Toque em “Vamos correr” para uma aventura com quatro tipos de exercícios numéricos. Toque em “Correr”, use ←/→ ou os botões da tela. Cada anel vale 10 pontos;
esbarrar apenas desacelera por um instante. Aproximadamente a cada 18 segundos de
percurso, a pista pausa para um quiz, sem limite de tempo para responder. Cada
descoberta vale 25 pontos. Após cinco descobertas, a aventura termina.

Os pontos são recreativos e locais, sem ranking, persistência ou validação de
colisões no servidor. Recarregar reinicia os pontos da corrida, preservando somente
o progresso dos quizzes da sessão. A voz usa vozes locais em português disponíveis.

## Testes

Os quizzes matemáticos trabalham reconhecimento de números de 1 a 50, sequências
de três números com uma lacuna, somas com resultado até 10 e contagem de 1 a 10 anéis,
com três opções numéricas. O reconhecimento
fala o número e mostra um modelo grande; a criança escolhe entre três opções.
As somas mostram grupos de anéis para ajudar a contar. As perguntas variam entre
aventuras e ficam estáveis após erros. Ao recarregar, sessões do conteúdo anterior
são reiniciadas automaticamente com as novas atividades.

O botão 🔊/🔇 controla efeitos e narração, lembrando a escolha neste navegador.
Ao entrar em um quiz, a pergunta é falada automaticamente. É necessário haver
uma voz local em português instalada/disponível no navegador; caso contrário,
o jogo pede ao adulto para configurá-la. A coleta toca duas notas suaves. Acertos
mostram Sonic de frente, sorrindo e fazendo um sinal de joia animado.

```powershell
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m pip check
node --test tests/runner.test.mjs tests/audio.test.mjs
```

Node é necessário apenas para executar os testes da simulação JavaScript; o
aplicativo continua usando somente servidores Python. `requirements.txt` declara
dependências diretas; `requirements-dev.txt` acrescenta pytest.
O lock registra as versões instaladas e verificadas nesta entrega. Revise e teste
atualizações antes de gerar um novo lock. A instalação não inclui assets externos.

## Configuração e publicação futura

Para Railway, usar dois serviços (frontend público e backend privado), com os
arquivos `deploy/railway.frontend.json` e `deploy/railway.backend.json`.
O [passo a passo de implantação](docs/DEPLOYMENT.md) explica diretório raiz,
variáveis, domínio, healthchecks e autodeploy. O build usa `deploy/Dockerfile`,
Python 3.12 e dependências fixadas. O workflow GitHub Actions executa testes e
build da imagem; habilitar **Wait for CI** no Railway para bloquear deploys com falha.
Essa configuração foi preparada no repositório; o deploy remoto ainda deve ser validado.

`scripts/setup.py` gera segredos diferentes para sessão, API e tokens do jogo.
O script preserva qualquer `.env` existente. Nunca publique esse arquivo.

Leia [arquitetura](docs/ARCHITECTURE.md), [segurança](SECURITY.md) e
[implantação](docs/DEPLOYMENT.md) antes de expor o aplicativo na internet.
O deploy não foi executado nesta entrega. O modo de produção exige HTTPS para que
os cookies funcionem. Não use `APP_ENV=production` no teste local em HTTP.

Sonic é propriedade dos respectivos titulares. O SVG local foi desenhado para este
protótipo, sem extração de imagens dos jogos. Antes da publicação, revise o uso do
personagem ou substitua-o por um personagem original.

## Salto durante a corrida

Com a pista em foco, pressione **Espaço** ou toque em **Pular**. Sonic se enrola
em uma bola durante um segundo e passa sobre troncos e anéis; anéis pulados não
são coletados. É possível trocar de faixa no ar. Não há pulo duplo nem repetição
automática ao segurar Espaço. Pausas e quizzes congelam o salto; um novo trecho
começa no chão. Movimento reduzido remove a rotação e diminui a altura visual,
sem mudar a duração ou as colisões. Desviar com as setas continua suficiente.
