# Orientações dos testes

Aplicam-se também as regras de `../AGENTS.md`.

- Usar pytest; definir segredos fictícios por fixture, nunca usar valores reais.
- Testar comportamento observável: jornada completa, tentativa incorreta e limites de confiança.
- Testes não devem chamar a internet ou depender dos servidores locais em execução.
- Usar TestClient para FastAPI e test_client para Flask; simular somente a fronteira HTTP entre eles.
- Garantir que mocks não escondam erros de contratos ou validação do back-end.
- Testar CSRF, adulteração/expiração, cookies de produção e hosts não autorizados.
- Testes visuais e validação com a criança são complementares; não alegar que pytest os substitui.
- Executar `node --test tests/runner.test.mjs` ao mudar a simulação da corrida.
- Validar coleta única, desvios, colisões sem perda, checkpoints e independência de taxa de quadros.
