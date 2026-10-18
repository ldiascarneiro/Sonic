# Orientações de implantação

Aplicam-se as regras de `../AGENTS.md`.

- Configurações são exemplos para futura implantação; nunca publicar sem solicitação.
- Manter API e Flask vinculados a loopback ou rede privada.
- Exigir TLS, hosts explícitos, limites de tráfego e processos sem privilégios.
- Não colocar certificados ou segredos no repositório.
- Atualizar `../docs/DEPLOYMENT.md` e validar sintaxe no servidor de destino.
