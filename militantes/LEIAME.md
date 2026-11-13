# Registo de Militantes — Fases 1 a 5

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
- **Valor diferente do devido** pelos períodos escolhidos (a mais ou a menos): o recibo só é emitido com o motivo escrito nas *Observações* (mínimo 10 caracteres), que fica impresso no recibo (versão 1.1.1).
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

## O que faz a Fase 4 — Segurança (RGPD, arts. 5.º, 25.º, 30.º e 32.º)

- **Dados cifrados** com AES-256-GCM: militantes (incluindo fotografias), recibos e registo de acessos. No disco só existe texto cifrado.
- **Chave de dados aleatória**, protegida pela palavra-passe de cada utilizador (PBKDF2-SHA256, 600 000 iterações — recomendação OWASP). As palavras-passe **nunca são guardadas**.
- **Configuração inicial**: cria o administrador, cifra automaticamente os dados das fases anteriores (numa só operação: ou tudo ou nada) e gera uma **chave de recuperação** (imprimir e guardar em cofre).
- **Perfis**: Administrador (tudo), Secretaria (inscrições, fichas, cartões), Tesoureiro(a) (quotas, recibos, contabilidade), Consulta (só leitura e verificação de cartões).
- **Utilizadores**: palavra-passe temporária obrigatoriamente alterada no primeiro acesso; repor palavra-passe; desativar (destrói a chave de acesso da conta).
- **Política de palavras-passe** (NIST SP 800-63B): mínimo 12 caracteres, sem palavras comuns nem o nome do utilizador; medidor de força.
- **Proteção contra tentativas**: 5 falhas em 15 minutos bloqueiam a conta por 5 minutos (tempo crescente); o utilizador é avisado das tentativas falhadas no acesso seguinte.
- **Bloqueio automático** por inatividade (por omissão 10 minutos): a chave é apagada da memória.
- **Registo de acessos**: início/fim de sessão, consulta de fichas, alterações, recibos, cartões, exportações, utilizadores. Cifrado, encadeado por SHA-256 (botão *Verificar integridade* deteta registos apagados ou alterados) e conservado 2 anos (configurável).
- **Cópias de segurança cifradas** com palavra-passe própria. As cópias antigas, sem cifra, continuam a poder ser restauradas.

### Limites (a ter em conta)

- Os perfis controlam o uso normal da aplicação; a proteção forte é a cifra. Quem tiver acesso ao computador **com a sessão aberta** vê os dados — bloqueie o Windows (tecla Windows + L) ao afastar-se.
- Recomenda-se também a **cifra do disco** (BitLocker no Windows): o navegador pode manter restos dos dados antigos (anteriores à cifra) nos seus ficheiros internos durante algum tempo.
- Desativar um utilizador impede novos acessos, mas não "apaga" o que essa pessoa possa ter copiado antes.

## Fase 5 — Aplicação para Windows (.exe)

A pasta `desktop/` transforma a aplicação num programa de Windows (Electron 44), com instalador e versão portátil.

**Obter o .exe:** no GitHub, separador *Actions* → *Compilar aplicação Windows* → última execução → *Artifacts* → `Registo-de-Militantes-Windows`. Contém:
- `Registo-de-Militantes-<versão>-instalador.exe` — instala no utilizador atual, cria atalhos no ambiente de trabalho e no menu Iniciar;
- `Registo-de-Militantes-<versão>-portatil.exe` — corre sem instalar (ex.: a partir de uma pen cifrada);
- `SHA256SUMS.txt` — impressões digitais para confirmar que os ficheiros não foram alterados.

**Segurança da versão Windows:**
- **Não comunica com a internet**: todos os pedidos externos são bloqueados; os dados nunca saem do computador.
- Conteúdo isolado do sistema (sem acesso ao Node.js, *sandbox*), política de segurança de conteúdo (CSP) e navegação restrita à aplicação.
- Só a câmara (fotografias e leitura de QR) e a área de transferência são autorizadas.
- Uma só janela aberta de cada vez; pergunta antes de fechar com alterações por guardar.
- Letra Manrope incluída na aplicação (sem pedidos ao Google Fonts).
- Os dados ficam em `%APPDATA%\Registo de Militantes` (menu *Ficheiro → Abrir pasta dos dados*). Desinstalar **não** apaga os dados.

**Nota:** o .exe não tem assinatura digital de código, por isso o Windows SmartScreen mostra o aviso "O Windows protegeu o computador" → *Mais informações* → *Executar mesmo assim*. Para eliminar o aviso é preciso um certificado de assinatura de código (custo anual).

**Mudar de computador:** criar uma cópia de segurança cifrada na versão antiga e restaurá-la na nova (*Configurações → Cópias de segurança*). Os dados da versão web (navegador) e os da versão Windows são independentes.

**Programadores:** `cd desktop && npm ci && npm run iniciar` (executar) ou `npm run dist` (compilar em Windows).

## Vários computadores na mesma sede (versão 1.1)

Os computadores da sede partilham os mesmos dados através de uma **pasta partilhada da rede local** — sem servidor de internet, sem custos.

**Como funciona**
- Cada computador mantém uma cópia local cifrada e continua a funcionar se a rede falhar; as alterações são enviadas quando a ligação voltar.
- Na pasta partilhada só existem dados **cifrados** (AES-256-GCM, a mesma chave de dados): ninguém consegue ler os ficheiros fora da aplicação.
- Sincronização automática a cada 10 segundos (ou *Sincronizar agora*).
- **Uma única série** de números de militante e de recibos para toda a sede, atribuída com bloqueio exclusivo na pasta: dois computadores nunca dão o mesmo número. Sem ligação à pasta, a aplicação **recusa** emitir recibos ou atribuir números (para não criar duplicados); o resto continua a funcionar.
- Utilizadores, palavras-passe, perfis e configurações são comuns a todos os computadores.
- Edições simultâneas da mesma ficha: vence a mais recente. Um recibo anulado num computador fica anulado em todos.
- Cada computador tem a sua própria cadeia no registo de acessos; *Verificar integridade* confirma todas.

**Instalação na sede (3 computadores)**
1. Escolher o local da pasta partilhada: um disco de rede (NAS) ou o computador que fica sempre ligado. Criar a pasta (ex.: `D:\Partilhas\Partido`) e partilhá-la no Windows (*Propriedades → Partilha*) **só** com as contas de utilizador das pessoas da sede, com leitura e escrita.
2. No computador que já tem os dados: *Segurança → Vários computadores* → nome do computador → **Escolher pasta partilhada e ativar** (escolher a pasta partilhada, ex.: `\\PC-SECRETARIA\Partido`). É criada a subpasta `RegistoMilitantes`.
3. Nos outros dois computadores: instalar a aplicação e, no ecrã inicial, **Ligar a uma pasta partilhada da sede** → escolher a mesma pasta → entrar com um utilizador existente.
4. Confirmar em *Segurança → Vários computadores* que os três aparecem em *Computadores ligados*.

**Cuidados:** o relógio dos computadores deve estar certo (sincronização automática de hora do Windows); o computador/NAS da pasta tem de estar ligado para emitir recibos; continuar a fazer cópias de segurança cifradas.

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

- Várias sedes em locais diferentes (servidor central), se o partido vier a precisar.
