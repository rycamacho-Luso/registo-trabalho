'use strict';
// Copia a aplicação web (../militantes) para ./web antes de compilar o .exe
const fs = require('node:fs');
const path = require('node:path');

const origem = path.join(__dirname, '..', 'militantes');
const destino = path.join(__dirname, 'web');
const excluir = new Set(['LEIAME.md', 'sw.js']); // o service worker só serve a versão web

fs.rmSync(destino, { recursive: true, force: true });
fs.cpSync(origem, destino, { recursive: true, filter: f => !excluir.has(path.basename(f)) });
console.log(`Aplicação web copiada para ${destino}`);
