# Arquitetura

```text
Navegador → Flask/Waitress :5000 → FastAPI/Uvicorn :8000
              ↓                       ↓
         Jinja + HTML/CSS        regras + token assinado
```

## Separação de responsabilidades

O navegador recebe HTML do Flask. Formulários enviam escolhas ao Flask, que valida
CSRF e chama a API com uma chave do ambiente. FastAPI valida contratos, verifica
assinatura/expiração do estado e avalia a resposta. O Flask armazena o retorno na
sessão assinada. O início usa POST/Redirect/GET; as respostas durante a corrida
usam JSON com fragmento HTML, sem recarregar a pista.

`backend/game.py` não conhece Flask ou HTTP. `shared/catalog.py` contém somente
metadados públicos. O front-end não importa o back-end e não decide o resultado.
`shared/config.py` carrega ambiente, exige segredos e valida hosts explícitos.
Os dois serviços podem ser executados em processos ou servidores separados; nesse
caso, proteger a comunicação interna com rede privada e TLS quando necessário.

## Estado

Não existe banco de dados. A sessão Flask contém modo, opções e token do jogo. O
token interno contém a ordem dos desafios e o progresso, assinado com segredo
exclusivo. A assinatura garante integridade, não confidencialidade. Não colocar
informações pessoais nesses dados.

A sessão expira após 30 minutos de inatividade; o token de desafio tem validade
de 30 minutos desde sua emissão. Tokens válidos antigos podem ser reapresentados:
isso é aceitável para um brinquedo sem ranking ou premiação, mas não constitui um
histórico confiável de desempenho. O token do formulário evita que um reenvio
sequencial da página anterior avance uma questão diferente.

## Contratos da API

Todas as rotas de jogo exigem `X-API-Key`. A API não é acessada pelo navegador.

| Rota | Entrada | Resultado |
| --- | --- | --- |
| `GET /health` | Nenhuma | `{"status":"ok"}` |
| `POST /v1/games` | `{"mode":"mixed"}` (ou `numbers`, `colors`, `shapes`) | Estado e opções |
| `POST /v1/games/answer` | `{"token":"…","choice":"…"}` | Novo estado e feedback |

O estado retornado contém `token`, `mode`, `step`, `total`, `complete`, `feedback`,
`options`, `title` e `prompt`. Campos extras e modos inválidos retornam 422;
credencial ausente/incorreta, 401; token adulterado/expirado, 400.

## Corrida interativa (escopo corrigido)

`runner-core.mjs` implementa a simulação de três faixas, deslocamento dos objetos,
coleta, colisão e checkpoints, independentemente do DOM. `runner.js` usa canvas e
requestAnimationFrame para desenho e controles. A velocidade considera o tempo
entre quadros e limita saltos após travamentos. Pausa, aba oculta e quizzes param
a simulação. Movimento reduzido remove efeitos decorativos, mantendo os objetos.

A corrida exige JavaScript por sua interação em tempo real. Python continua
responsável por perguntas e respostas. O personagem da pista é desenhado de
costas em `sonic-runner.mjs`, com membros articulados em canvas. O ciclo de passos
usa o tempo da simulação: pausa junto com o jogo e desacelera em colisões. A troca
de faixa tem interpolação visual curta e inclinação; movimento reduzido desliga
articulação e inclinação. A imagem lateral `sonic.svg` permanece na página inicial.

Durante um quiz, o navegador envia um
formulário com CSRF ao Flask com `Accept: application/json`; Flask devolve o estado
e um fragmento Jinja `quiz_html`. Isso evita recarregar a corrida e perder pontos.
Reenvios do token anterior devolvem o estado atual sem avançar novamente.

O modo `mixed` alterna números, cores, formas, números e cores. Os modos anteriores
selecionam o tema das perguntas, mas todos agora possuem corrida interativa.
Anéis valem 10 pontos e acertos valem 25. A pontuação é local e recreativa; não é
enviada como um resultado confiável à API nem persistida. Recarregar reinicia a
simulação e a pontuação, preservando o progresso de quizzes na sessão.

## Interface

- Atividades curtas, três escolhas por vez, sem limite de tempo.
- Corrida real com troca de faixa, obstáculos e coleta; cinco checkpoints educativos.
- Setas esquerda/direita e botões grandes de toque; sem salto obrigatório.
- Colisão desacelera, sem retirar pontos ou vidas.
- Sem JavaScript, a página explica que ele é necessário para controlar a corrida.
- Páginas informativas não são painéis administrativos autenticados.

## Evolução

`backend/math_quiz.py` gera reconhecimento e sequências de 1 a 50 e somas com
resultado até 10, a partir de uma semente assinada. Os cinco desafios numéricos
distribuem dois reconhecimentos, duas sequências e uma soma. A validação ocorre
no servidor. A interface recebe o número modelo, a sequência com `null` na lacuna
ou as parcelas, além de uma fala específica. Não recebe um campo de correção.
O currículo `preschool-v3` reinicia sessões antigas ao abrir a pista; o novo salt
também rejeita tokens antigos. Assim não reaparecem subtrações ou números até 100.

`game-audio.mjs` controla sons de anéis (osciladores Web Audio) e narração com
SpeechSynthesis. O primeiro gesto do jogador libera áudio. Perguntas são lidas
automaticamente, somente usando vozes locais em português. O botão de som cancela
fala e notas ativas; apenas a preferência é mantida no localStorage. Nenhum áudio
ou texto é enviado a serviços externos. Ausência de voz ou erro de reprodução
gera orientação na interface. `sonic-runner.mjs` também desenha olhadas laterais
e uma comemoração frontal com polegar levantado, respeitando movimento reduzido.

Somente adicionar persistência se surgir uma necessidade explícita. Controles
sensíveis exigirão autenticação de responsáveis, autorização, retenção definida e
armazenamento de estado no servidor. Evitar adicionar coleta de dados da criança
como requisito implícito para atividades educativas.
