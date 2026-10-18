# Plano do projeto — Sonic: aprender brincando

## Escopo da primeira versão
Aplicativo web local em português, com Flask no front-end e FastAPI no back-end,
voltado à interação acompanhada de uma criança de 4 anos. Corrida automática com
desvios por setas/toque, anéis, reconhecimento e sequências até 50, somas até 10,
cores e formas.

## Decisões
- Python para regras, validação, sessão, renderização e inicialização.
- CSS para interface; JavaScript para a corrida em canvas, controles, colisões e voz.
- Trechos de corrida intercalados com quizzes; cinco descobertas encerram a aventura.
- Sem banco de dados, cadastro, competição, anúncios ou telemetria.
- API privada; sessão assinada; segredos distintos para Flask, autenticação e jogo.
- Imagens vetoriais locais; sem downloads de assets de terceiros.

## Etapas
- [x] Criar separação `frontend/`, `backend/`, `shared/`, `scripts/`, `tests/` e `docs/`.
- [x] Registrar orientações `AGENTS.md` na raiz e nas áreas relevantes.
- [x] Implementar catálogo, regras e contratos da API.
- [x] Implementar início, corrida, conclusão, guia para adultos, privacidade e erros.
- [x] Aplicar proteção CSRF, hosts explícitos, tokens assinados, CSP e cookies protegidos.
- [x] Criar scripts de configuração e execução local.
- [x] Escrever testes de regras, integração e segurança.
- [x] Executar testes automatizados e corrigir falhas (15 testes Python e 6 da corrida aprovados).
- [x] Verificar início, tentativa incorreta, avanço e pausa no navegador local.
- [x] Concluir README, arquitetura, segurança e guia de implantação.
- [ ] Validar em celular físico e observar uso acompanhado pela criança (próxima rodada).

## Critérios de aceite
1. Executar os dois servidores localmente seguindo o README.
2. Correr, trocar de faixa, coletar anéis e completar quizzes com JavaScript habilitado.
3. Tentativa incorreta não perde progresso; formulário antigo não avança nova rodada.
4. Tokens adulterados/expirados e chamadas sem credencial são rejeitados.
5. Não existir segredo no repositório ou chave da API exposta ao navegador.
6. Interface ter alvos grandes, pausa e suporte a movimento reduzido.

## Próximas fases (fora desta entrega)
- Observar o uso acompanhado pela criança e ajustar ritmo, linguagem e dificuldade.
- Avaliar narração gravada e licenciada para navegadores sem voz local.
- Se necessário, adicionar controles de responsáveis com autenticação real.
- Antes da publicação: domínio, TLS, firewall, limitação de tráfego, revisão de dependências,
  política de logs, aviso de privacidade com contato e revisão dos direitos sobre Sonic.
- Deploy no servidor escolhido e testes reais de HTTPS, proxy e recuperação.

## Limitações conhecidas
A corrida agora usa três faixas, setas/toque, obstáculos, anéis e pontuação local.
Não há salvamento permanente. A expiração após 30 minutos exige reiniciar a aventura.
A voz depende de uma voz local em português. A publicação na internet não faz parte desta etapa.

## Correção solicitada: corrida como atividade principal

A descrição inicial foi reinterpretada pelo usuário: a atividade precisa ser um
runner, com deslocamento lateral e coleta; quizzes são interrupções educativas.
Esta decisão substitui a exigência inicial de funcionamento sem JavaScript.

- [x] Implementar pista de três faixas, setas e controles grandes de toque.
- [x] Coletar anéis (10 pontos), desviar de troncos e desacelerar em colisões.
- [x] Pausar o jogo durante quizzes, preservar os pontos e retomar após acertos.
- [x] Criar aventura mista de números, cores e formas; manter seleção por tema.
- [x] Implementar pausa manual e automática ao perder foco.
- [x] Testar lógica Python e simulação JavaScript.
- [x] Concluir validação visual e integrada no navegador da nova corrida (setas, coleta, quiz, bônus e retomada).

Critérios atualizados: a corrida exige JavaScript; quizzes permanecem validados
em Python. A pontuação é local, sem persistência ou uso competitivo. Continuam
válidos os critérios de segurança, interface infantil e cinco descobertas.

## Personagem e animação de corrida

- [x] Desenhar Sonic de costas, voltado para o fundo da pista.
- [x] Articular pernas e braços em oposição, com elevação dos pés e leve balanço.
- [x] Suavizar troca de faixa e inclinar o corpo durante o deslocamento.
- [x] Congelar a pose durante pausas e reduzir efeitos conforme a preferência do sistema.
- [x] Conferir a apresentação no navegador e repetir os 21 testes existentes.

## Áudio e expressão do personagem

- [x] Som suave de coleta de anéis, gerado localmente por Web Audio.
- [x] Leitura automática das perguntas, repetição e feedback falado com voz local em português.
- [x] Botão único de som que interrompe efeitos e voz, com preferência salva no navegador.
- [x] Olhadas ocasionais para os lados, mantendo o corpo voltado à pista.
- [x] Comemoração frontal animada com sinal de joia após cada acerto.
- [x] Testes de ativação do áudio, silêncio, privacidade das vozes e APIs indisponíveis.

A narração exige uma voz local em português no navegador/dispositivo. Quando não
há voz compatível, o jogo informa a necessidade de configuração por um adulto.

## Matemática até 100 (etapa anterior, substituída)

- [x] Antecessor, sucessor, adição, subtração e comparação de números.
- [x] Alternativas grandes em algarismos e leitura automática também das opções.
- [x] Perguntas diferentes por aventura e estáveis ao tentar novamente.
- [x] Validar 500 casos gerados, limites de 1 a 100 e compatibilidade de aventuras antigas.

Novas aventuras usam o conteúdo ampliado. Uma aventura já aberta mantém suas
perguntas originais até terminar; voltar ao início e iniciar outra aplica a mudança.

## Conteúdo ajustado para quatro anos — versão atual

- [x] Apenas somas, com parcelas positivas e resultado até 10; anéis como apoio.
- [x] Reconhecimento de 1 a 50: voz, número modelo grande e três alternativas.
- [x] Sequência crescente de três números até 50 com uma lacuna visível e falada.
- [x] Retirar subtração, comparação e perguntas até 100 das novas sessões.
- [x] Reiniciar sessões antigas ao abrir a pista, evitando conteúdo incompatível.
- [x] Verificar 500 perguntas e integração dos quatro modos: 17 testes aprovados.

## Preparação para Railway

- [x] Configurar frontend e backend como serviços separados, com Docker e usuário sem privilégios.
- [x] Fixar Python 3.12 e instalar dependências pelo lock existente.
- [x] Adicionar healthcheck do frontend sem sessão, preservando hosts e cabeçalhos.
- [x] Adicionar CI para testes Python/JavaScript, dependências e build Docker.
- [x] Documentar variáveis, rede privada, domínio e Wait for CI.
- [x] Verificar localmente: 18 testes Python, 10 JavaScript, `pip check` e sintaxe JSON.
- [ ] Executar o build Docker/CI e validar o deploy real, HTTPS e rede privada no Railway.

## Exercícios somente de números — versão atual

- [x] Remover cores e formas da interface, geração e contratos da API.
- [x] Manter somas até 10, sequências e reconhecimento até 50.
- [x] Acrescentar contagem de 1 a 10 anéis estáticos, com três alternativas numéricas.
- [x] Garantir os quatro tipos por aventura de cinco descobertas.
- [x] Migrar sessões anteriores para `numbers-v4` e rejeitar tokens antigos.
- [x] Validar 14 testes Python (incluindo 500 perguntas) e 10 testes JavaScript.
- [x] Conferir templates renderizados em Chrome headless: 360 e 1280 px, foco via Tab,
  movimento reduzido, dez anéis e três respostas com alvos maiores que 48 px.
- [ ] Validar a nova versão no Railway e em celular físico; a conferência local de
  layout usou templates estáticos, sem executar a corrida no navegador.

## Salto em bola

- [x] Espaço na pista e botão Pular no toque iniciam salto de um segundo.
- [x] Bola passa sobre troncos e anéis sem coletar objetos no ar.
- [x] Sem pulo duplo; respeita pausas, quizzes e movimento reduzido.
- [x] Validar 14 testes Python e 13 JavaScript, incluindo pouso e passagem sobre objetos.
- [x] Verificar no Chrome local em 1280 e 360 px: Espaço, botão Pular, pausa/retomada,
  movimento reduzido, ausência de erros JavaScript e alvos de toque de pelo menos 48 px.
- [ ] Publicar e validar o salto no Railway e em celular físico.
