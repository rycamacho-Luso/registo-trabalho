# Registo de Militantes — Fase 1

Aplicação para computador (PWA instalável, funciona sem internet) para registo de militantes de partido político em Portugal. Cores retiradas do site oficial do MPT (`https://mpt.pt/styles.css`, escala de verdes `--g-*`, e verde do logótipo `#006530`); letra Manrope, a mesma do site.

## Como usar no PC

1. Abrir `militantes/index.html` através de um servidor (GitHub Pages ou `python -m http.server`) no Chrome ou Edge.
2. Clicar em **Instalar** na barra de endereço. Fica como aplicação no menu Iniciar, com janela própria.
3. Os dados ficam guardados **apenas nesse computador** (IndexedDB). Fazer cópias de segurança regulares em *Configurações*.

## O que faz a Fase 1

- Inscrição em 6 passos: identificação, documento/NIF, morada, filiação e declarações, fotografia, revisão.
- **Validação do NIF**: 9 algarismos, dígito de controlo módulo 11, apenas pessoa singular (1, 2, 3 ou 45).
- **Validação do n.º do Cartão de Cidadão**: formato `12345678 9 ZZ0` e dígito de controlo (algoritmo publicado pela AMA).
- **Validação da data de validade**: recusa documentos caducados, avisa quando faltam 60 dias ou menos e recusa no CC validade superior a 10 anos.
- Idade mínima configurável (por omissão 18 anos), também verificada na data de admissão.
- Deteção de duplicados por NIF, documento e n.º de militante.
- Fotografia por ficheiro ou câmara, com recorte 3×4 (450×600 px, JPEG).
- Painel com indicadores, lista com pesquisa e filtros, ficha, histórico de alterações, impressão da ficha de inscrição em A4.
- Exportação para CSV (protegida contra injeção de fórmulas) e cópia de segurança/restauro em JSON.

## Base legal usada

Fonte: versão consolidada da CNE da Lei Orgânica n.º 2/2003 (Lei dos Partidos Políticos), com as alterações das LO n.º 2/2008 e n.º 1/2018.

| Regra | Artigo |
|---|---|
| Liberdade de filiação; estrangeiros e apátridas residentes podem filiar-se | art. 19.º (n.º 4) |
| Filiação pessoal; proibição de filiação em mais de um partido | art. 20.º, n.º 2 |
| Militares e agentes das forças de segurança em serviço efetivo não podem filiar-se | art. 21.º, n.º 1 |
| Magistrados e diplomatas na efetividade: sem atividade partidária pública | art. 21.º, n.º 2 |
| Inscrição de partido: 7500 eleitores, com nome, n.º de identificação e n.º de eleitor | art. 15.º |
| Opiniões políticas são dados sensíveis; tratamento lícito pelo partido para os seus membros | RGPD, art. 9.º, n.º 2, al. d) |

## Próximas fases (proposta)

- **Fase 2**: quotas e pagamentos com recibos e limites da Lei n.º 19/2003, mapa de quotas em atraso.
- **Fase 3**: cartão de militante em PDF com fotografia e código QR; lista oficial de concelhos e freguesias (CAOP).
- **Fase 4**: utilizadores com palavra-passe e perfis, cifra da base de dados, registo de acessos (RGPD).
- **Fase 5**: versão `.exe` (Electron/Tauri) e sincronização entre sedes, se necessário.
