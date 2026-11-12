'use strict';
// Ponte segura entre a aplicação e a pasta partilhada: só estas funções ficam disponíveis (window.partilha).
const { contextBridge, ipcRenderer } = require('electron');

const FUNCOES = ['disponivel', 'listar', 'listarDirs', 'ler', 'escrever', 'criarExclusivo', 'apagar', 'estado', 'escolher', 'esquecer'];
contextBridge.exposeInMainWorld('partilha', Object.fromEntries(FUNCOES.map(n => [n, (...a) => ipcRenderer.invoke('partilha:' + n, ...a)])));
