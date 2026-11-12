# Registo de Militantes — Fases 1, 2 e 3

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

## O que faz a Fase 2 — Quotas, donativos e recibos

- Separador **Quotas e recibos**: situação de cada militante (em dia, períodos em atraso, valor em dívida), receitas do ano, percentagem de quotas em dia e numerário acumulado face ao limite legal.
- Quotas mensais, trimestrais, semestrais ou anuais, com regime normal, reduzido ou isento por militante.
- Registo de pagamentos (quota, donativo, contribuição de eleito), com escolha dos períodos a pagar, incluindo atrasos e adiantamentos.
- **Recibos** numerados por ano (`2026/0001`), sem saltos nem repetições, com valor por extenso; impressão em A4 com original e duplicado.
- Recibos **nunca são apagados**: só anulados, com motivo, data e hora. Ao eliminar um militante, os recibos são conservados.
- Exportação para a contabilidade (CSV com a classificação legal de cada receita) e mapa de quotas em atraso.
- Cópia de segurança inclui os recibos. As bases de dados da Fase 1 são atualizadas automaticamente, sem perda de dados.

### Limites legais aplicados automaticamente (Lei n.º 19/2003, IAS 2026 = 537,13 €)

| Regra | Limite 2026 | Artigo |
|---|---|---|
| Pagamento em numerário tem de ser inferior a 25% do IAS | < 134,28 € | art. 3.º, n.os 2 e 3 |
| Total anual recebido em numerário | ≤ 26.856,50 € (50 × IAS) | art. 3.º, n.º 3 |
| Donativos por doador e por ano | ≤ 13.428,25 € (25 × IAS) | art. 7.º, n.º 1 |
| Donativos só por cheque ou transferência | — | art. 7.º, n.º 1 |
| Receitas discriminadas por alínea do art. 3.º | — | art. 12.º, n.º 3, al. b) |

O IAS de cada ano é editável em *Configurações* (2026: Portaria n.º 480-A/2025/1).

## O que faz a Fase 3 — Cartão de militante e moradas oficiais

- **Cartão de militante** em PDF, no formato de cartão bancário CR80 (85,6 × 54 mm), para impressoras de cartões PVC, ou em **folha A4 com 10 cartões** e linhas de corte.
- O cartão tem fotografia, nome, n.º de militante, data de admissão, validade (configurável, por omissão 2 anos), estrutura e **código QR**.
- O QR contém só `MIL1` + um código aleatório de 8 caracteres (ex.: `MIL16VF9WJNB`): **nenhum dado pessoal** (RGPD, art. 5.º, n.º 1, al. c)). Só letras e algarismos, para os leitores USB funcionarem com o teclado português.
- **Nova via** em caso de perda ou roubo: gera um código novo e o anterior passa a ser recusado como "substituído".
- **Emissão em lote** no separador *Cartões*, com indicação de quem não tem cartão, quem o tem a caducar ou caducado, e quem não tem fotografia.
- **Verificação** (ex.: à entrada de congressos): câmara do PC, leitor de QR USB ou código escrito à mão. Mostra fotografia, estado da filiação, validade e quotas.
- **Concelhos e freguesias oficiais** — CAOP2025 da Direção-Geral do Território (Aviso n.º 3502/2026/2): 308 municípios e 3259 freguesias, já com as desagregações de 2025. Ao escolher o concelho, o distrito e a lista de freguesias são preenchidos automaticamente.
- Funciona sem internet: as bibliotecas (jsPDF, qrcode-generator, jsQR) estão em `lib/` (licenças em `lib/LICENCAS.txt`).

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

- **Fase 4**: utilizadores com palavra-passe e perfis, cifra da base de dados, registo de acessos (RGPD).
- **Fase 5**: versão `.exe` (Electron/Tauri) e sincronização entre sedes, se necessário.
