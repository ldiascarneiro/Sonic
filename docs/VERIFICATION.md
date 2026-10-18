# Registro de verificação — 18/10/2026

## Ajuste para quatro anos — verificação atual

17 testes Python aprovados. Os 500 casos gerados verificam: somas com resultado
até 10, reconhecimento e sequências até 50, três opções distintas, uma lacuna por
sequência, correção das respostas e estabilidade após erro. A integração verifica
reinício de sessões antigas, e tokens do currículo anterior são rejeitados.
Os registros de matemática até 100 abaixo são históricos e foram substituídos.
No navegador foram conferidos a soma 8 + 2 com grupos de anéis e a sequência
8, 9, ? com três alternativas grandes. Captura: `screenshots/preschool-quiz.png`.

## Matemática até 100

17 testes Python aprovados. A nova verificação percorre 500 perguntas geradas,
resolve os enunciados independentemente, testa acerto/erro, alternativas únicas,
limites de 1 a 100 e estabilidade após erro. Verifica também compatibilidade de
aventuras antigas. Os quatro modos continuam passando nos testes de integração.
No navegador, a nova aventura exibiu “Quanto é 21 mais 7?” com alternativas
27, 38 e 28. A escolha de 28 avançou para 1/5, somou 25 pontos e mostrou a
comemoração. Captura em `screenshots/math-100.png`.

## Áudio, olhadas e comemoração

15 testes Python e 10 testes JavaScript aprovados. Os quatro testes adicionais
verificam liberação após gesto, geração das notas, cancelamento e bloqueio de som
ao silenciar, preferência persistida, rejeição de vozes remotas/de outro idioma
e funcionamento sem APIs de áudio/armazenamento.

No navegador, o controle alternou entre som ligado e desligado e a corrida
permaneceu funcional. A saída sonora do dispositivo não foi capturada/auditada:
volume e qualidade da voz precisam ser conferidos no dispositivo de uso. A voz
depende de suporte local em português; existe aviso e botão de repetição.

Também foi conferido o acerto de um quiz no navegador: 305 → 330 pontos, avanço
para 4/5 e exibição do Sonic de frente fazendo joia, com botão para continuar.
Captura em `screenshots/quiz-celebration.png`. O desenho da comemoração também
foi renderizado isoladamente para conferir rosto, mão e enquadramento.

## Atualização: corrida com controles e quizzes

Na revisão visual seguinte, Sonic passou a ser desenhado de costas, com braços
e pernas alternados, sola visível ao levantar o pé, balanço e inclinação lateral.
Verificados no navegador a pose traseira, duas posições distintas dos pés e o
deslocamento para a faixa direita. A sintaxe do novo módulo foi verificada e os
15 testes Python e 6 testes JavaScript existentes passaram novamente.
Prévia: `screenshots/sonic-back-runner.png`. Não foi testado celular físico.

Após a correção de escopo, foram executados **15 testes Python** e **6 testes
JavaScript**, todos aprovados. Os testes JS cobrem limites das faixas, coleta única,
desvio, colisão sem perda de pontos, pausa nos checkpoints, retomada, geração de
fileiras com caminho livre e evolução por tempo entre quadros.

A integração Python agora inclui o modo misto e respostas JSON, inclusive reenvio
do formulário antigo sem duplicar o avanço. Também verifica que `.mjs` é servido
com MIME JavaScript no Windows; essa correção foi necessária no navegador real.

Na nova interface, foram observados: deslocamento pelas duas setas, objetos na
pista, coleta de quatro anéis (40 pontos), abertura automática do quiz com pista
pausada, tentativa incorreta sem perda e acerto elevando a contagem para 65 pontos.
O botão de continuar retomou a corrida sem reiniciar a pontuação. A validação de
celular físico e a observação acompanhada da criança continuam pendentes.

A corrida agora requer JavaScript. As observações abaixo sobre funcionamento sem
JavaScript referem-se somente à versão inicial, substituída pela corrida interativa.

## Histórico da primeira versão

## Ambiente
Windows, Python 3.12.14, dependências fixadas em `requirements-lock.txt`.
Servidores reais: Waitress em 127.0.0.1:5000 e Uvicorn em 127.0.0.1:8000.

## Testes executados

`python -m pytest`: **13 testes aprovados**.

- Conclusão dos três modos e nova tentativa sem perda de progresso.
- Mesmas opções e posições após tentativa incorreta.
- Rejeição de token adulterado e expirado.
- Autenticação da API, validação de modo e rejeição de campos extras.
- Rejeição de hosts não autorizados e ausência de documentação pública da API.
- CSRF ausente/inválido, tamanho máximo do formulário e cabeçalhos de segurança.
- Cookies seguros em produção, ausência de segredo e rejeição de host curinga.
- Jornada integrada Flask → FastAPI em cada modo, incluindo reenvio de formulário antigo.
- Erro amigável quando o back-end está indisponível.

`python -m pip check`: **nenhuma incompatibilidade encontrada**.

Há um aviso de depreciação no TestClient do Starlette sobre uso de httpx. Não
impediu os testes. Avaliar a migração do cliente de testes na próxima atualização
de dependências; o cliente HTTP da aplicação continua usando httpx.

## Navegador

Verificados no navegador local: tela inicial, cartões de atividades, carregamento
do cenário, resposta incorreta sem avanço, resposta correta com avanço de 0 para 1,
pausa com respostas ocultas/desabilitadas e retomada. Botão de voz disponível no
navegador usado; a qualidade/audibilidade da voz não foi avaliada.

Prévia salva em `screenshots/game.png`. O front-end não apresentou erro ao navegar
nesses fluxos. A integração completa sem JavaScript também é exercitada pelos
testes HTTP, que não executam scripts.

## Limites desta verificação

- Não foi feito deploy externo, teste de certificados ou validação executável do Nginx.
- Layout possui media queries para telas pequenas, mas falta testar celular físico.
- Falta observar uso pela criança, leitura assistiva e preferência real de movimento reduzido.
- `pip check` verifica compatibilidade; não é uma auditoria de vulnerabilidades.
- Os testes precisaram de execução fora do sandbox do Codex por bloqueio de sockets locais.
