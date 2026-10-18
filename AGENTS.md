# Orientações para agentes e colaboradores

## Objetivo
Aplicativo educativo de corrida inspirado em Sonic para uma criança de 4 anos.
Priorizar a segurança, a compreensão da criança e a simplicidade de manutenção.
Idioma da interface e documentação: português brasileiro.

## Arquitetura obrigatória
- `frontend/`: Flask, Jinja, HTML e CSS; JavaScript apenas para melhorias que exigem o navegador.
- `backend/`: FastAPI, contratos HTTP e regras pedagógicas em Python.
- `shared/`: configuração e metadados públicos. Não colocar regras de jogo no front-end.
- O navegador acessa somente Flask. Flask acessa FastAPI com chave privada no servidor.
- Não substituir a stack por SPA, React, Node ou outro framework sem solicitação.

## Experiência infantil
- Alvos de toque de pelo menos 48 px, escolhas visuais e instruções curtas.
- Sem contagem regressiva, punições, vidas, anúncios, compras ou ranking.
- Rodadas curtas; feedback acolhedor; incentivar pausas.
- Respeitar `prefers-reduced-motion`; não depender de áudio, leitura ou precisão motora.
- A corrida usa JavaScript para controles, simulação e canvas, conforme a correção de escopo do usuário.
- Perguntas e respostas continuam validadas em Python. Sem JavaScript, explicar como habilitá-lo.

## Segurança e privacidade
- Não coletar identificação da criança nem adicionar analytics ou serviços externos.
- Nunca versionar `.env`, chaves, cookies, tokens ou logs com dados sensíveis.
- Validar entradas no servidor; preservar CSRF, CSP, cookies protegidos e hosts explícitos.
- Não habilitar debug público, CORS amplo ou expor a porta da API na internet.
- Alterações de produção devem seguir `docs/DEPLOYMENT.md` e `SECURITY.md`.
- Assets devem ter origem documentada. O protótipo não é um produto oficial da Sega.

## Rotina de trabalho
1. Ler este arquivo, `plan.md` e o `AGENTS.md` da pasta alterada.
2. Fazer mudanças pequenas e coerentes com o escopo solicitado.
3. Executar `.venv/Scripts/python.exe -m pytest` no Windows (ou equivalente Linux).
4. Para alterações visuais, verificar desktop e celular, teclado e movimento reduzido.
5. Atualizar documentos quando comportamento, execução ou configuração mudarem.
6. Informar verificações realmente executadas e limitações; não declarar deploy validado sem executá-lo.

Não criar agentes auxiliares automaticamente. A autorização deve vir do usuário.

## Convenção de nomes
Usar `AGENTS.md` (plural e em maiúsculas), nome reconhecido pelas ferramentas.
Este arquivo atende ao pedido de arquivos de orientação de agentes; evitar cópias `agent.md`
com instruções divergentes. `plan.md` é o registro do plano e do estado de entrega.
