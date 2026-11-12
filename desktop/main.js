'use strict';
/*
 * Registo de Militantes — aplicação de computador (Windows)
 * Envolve a aplicação web (pasta "web", copiada de ../militantes) numa janela Electron.
 *
 * Segurança:
 * - Sem acesso do conteúdo ao Node.js (contextIsolation, sandbox, nodeIntegration desligado).
 * - Ficheiros servidos por um protocolo próprio (app://), com política de segurança de conteúdo (CSP).
 * - TODOS os pedidos à internet são bloqueados: os dados nunca saem do computador.
 * - Só são autorizadas a câmara (fotografia e leitura de QR) e a cópia para a área de transferência.
 * - Uma única instância aberta de cada vez (evita conflitos na base de dados).
 */
const { app, BrowserWindow, Menu, dialog, net, protocol, session, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const WEB = path.join(__dirname, 'web');
const ORIGEM = 'app://militantes';
const PERMISSOES = new Set(['media', 'clipboard-sanitized-write']);
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob: mediastream:",
  "font-src 'self'",
  "connect-src 'self' data: blob:",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'"
].join('; ');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

if (!app.requestSingleInstanceLock()) { app.quit(); }

let janela = null;

function criarJanela() {
  janela = new BrowserWindow({
    width: 1360, height: 880, minWidth: 900, minHeight: 600,
    title: 'Registo de Militantes',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#F6F8F5',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true,
      devTools: !app.isPackaged
    }
  });
  janela.once('ready-to-show', () => { janela.maximize(); janela.show(); });
  janela.loadURL(`${ORIGEM}/index.html`);

  // Sem janelas novas nem navegação para fora da aplicação
  janela.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\/[^/]+\.gov\.pt\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  janela.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(ORIGEM + '/')) e.preventDefault(); });

  // Alterações por guardar: perguntar antes de fechar
  janela.webContents.on('will-prevent-unload', e => {
    const r = dialog.showMessageBoxSync(janela, {
      type: 'question', buttons: ['Sair sem guardar', 'Cancelar'], defaultId: 1, cancelId: 1,
      title: 'Alterações por guardar', message: 'Há alterações por guardar. Quer sair mesmo assim?'
    });
    if (r === 0) e.preventDefault();
  });
  janela.on('closed', () => { janela = null; });
}

function acerca() {
  dialog.showMessageBox(janela, {
    type: 'info', title: 'Acerca',
    message: `Registo de Militantes ${app.getVersion()}`,
    detail: [
      'Registo e gestão de militantes, quotas, recibos e cartões.',
      'Os dados são guardados cifrados (AES-256) apenas neste computador.',
      'A aplicação não comunica com a internet.',
      '',
      `Dados da aplicação: ${app.getPath('userData')}`,
      '',
      'Componentes: Electron (MIT), jsPDF (MIT), qrcode-generator (MIT), jsQR (Apache-2.0),',
      'letra Manrope (SIL OFL 1.1), CAOP2025 (Direção-Geral do Território).'
    ].join('\n')
  });
}

function menu() {
  const m = Menu.buildFromTemplate([
    { label: 'Ficheiro', submenu: [
      { label: 'Imprimir…', accelerator: 'CmdOrCtrl+P', click: () => janela?.webContents.print() },
      { type: 'separator' },
      { label: 'Abrir pasta dos dados', click: () => shell.openPath(app.getPath('userData')) },
      { type: 'separator' },
      { label: 'Sair', role: 'quit' }
    ] },
    { label: 'Editar', submenu: [
      { label: 'Desfazer', role: 'undo' }, { label: 'Refazer', role: 'redo' }, { type: 'separator' },
      { label: 'Cortar', role: 'cut' }, { label: 'Copiar', role: 'copy' }, { label: 'Colar', role: 'paste' }, { label: 'Selecionar tudo', role: 'selectAll' }
    ] },
    { label: 'Ver', submenu: [
      { label: 'Recarregar', role: 'reload' },
      { type: 'separator' },
      { label: 'Aumentar', role: 'zoomIn' }, { label: 'Diminuir', role: 'zoomOut' }, { label: 'Tamanho normal', role: 'resetZoom' },
      { type: 'separator' },
      { label: 'Ecrã inteiro', role: 'togglefullscreen' },
      ...(app.isPackaged ? [] : [{ label: 'Ferramentas de programador', role: 'toggleDevTools' }])
    ] },
    { label: 'Ajuda', submenu: [{ label: 'Acerca do Registo de Militantes', click: acerca }] }
  ]);
  Menu.setApplicationMenu(m);
}

app.whenReady().then(() => {
  // Ficheiros da aplicação: só dentro da pasta "web" (impede ../)
  protocol.handle('app', async pedido => {
    const url = new URL(pedido.url);
    if (url.host !== 'militantes') return new Response('Não encontrado', { status: 404 });
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/' || rel === '') rel = '/index.html';
    const ficheiro = path.normalize(path.join(WEB, rel));
    if (!ficheiro.startsWith(WEB + path.sep)) return new Response('Proibido', { status: 403 });
    const r = await net.fetch(pathToFileURL(ficheiro).toString());
    const h = new Headers(r.headers);
    h.set('Content-Security-Policy', CSP);
    h.set('X-Content-Type-Options', 'nosniff');
    h.set('Cross-Origin-Opener-Policy', 'same-origin');
    return new Response(r.body, { status: r.status, headers: h });
  });

  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((wc, perm, cb, det) => cb(PERMISSOES.has(perm) && (det?.requestingUrl || '').startsWith(ORIGEM)));
  ses.setPermissionCheckHandler((wc, perm, origem) => PERMISSOES.has(perm) && String(origem || '').startsWith(ORIGEM));
  // Bloquear qualquer acesso à internet
  ses.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] }, (d, cb) => cb({ cancel: true }));

  menu();
  criarJanela();
});

app.on('second-instance', () => {
  if (!janela) return;
  if (janela.isMinimized()) janela.restore();
  janela.focus();
});
app.on('window-all-closed', () => app.quit());
