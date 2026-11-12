'use strict';
/*
 * Acesso à pasta partilhada (rede da sede) para o modo "vários computadores".
 * Só são permitidos nomes simples dentro da pasta escolhida (sem "..", sem caminhos absolutos).
 * Escritas atómicas: grava num ficheiro temporário e renomeia (um leitor nunca vê ficheiros a meio).
 * Os dados chegam já cifrados pela aplicação (AES-256-GCM); este módulo não vê dados pessoais.
 */
const fs = require('node:fs/promises');
const fsc = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PARTE = /^[A-Za-z0-9_.-]{1,80}$/;
const MAX = 64 * 1024 * 1024;

function criar(obterBase) {
  const abs = rel => {
    if (typeof rel !== 'string') throw new Error('Nome inválido');
    const partes = rel.split('/');
    if (partes.length > 4 || partes.some(p => !PARTE.test(p) || p === '.' || p === '..')) throw new Error('Nome inválido');
    const base = obterBase();
    if (!base) throw new Error('Pasta partilhada não configurada');
    const raiz = path.resolve(base);
    const f = path.resolve(raiz, ...partes);
    if (!f.startsWith(raiz + path.sep)) throw new Error('Fora da pasta partilhada');
    return f;
  };
  // A pasta principal nunca é criada aqui: se a rede/unidade estiver indisponível, a operação falha
  // (evita gravar numa pasta local "fantasma" com o mesmo nome).
  const exigirBase = async () => {
    const b = obterBase(); if (!b) throw new Error('Pasta partilhada não configurada');
    try { await fs.access(b, fsc.constants.R_OK | fsc.constants.W_OK); } catch { throw new Error('Pasta partilhada indisponível'); }
  };
  const bytes = s => {
    if (typeof s !== 'string' || s.length > MAX) throw new Error('Dados inválidos');
    return Buffer.from(s, 'base64');
  };
  return {
    async disponivel() {
      const b = obterBase(); if (!b) return false;
      try { await fs.access(b, fsc.constants.R_OK | fsc.constants.W_OK); return true; } catch { return false; }
    },
    async listar(dir) {
      try { return (await fs.readdir(abs(dir), { withFileTypes: true })).filter(d => d.isFile() && !d.name.includes('.tmp-')).map(d => d.name); }
      catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    },
    async listarDirs(dir) {
      try { return (await fs.readdir(abs(dir), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name); }
      catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    },
    async ler(rel) {
      try { return (await fs.readFile(abs(rel))).toString('base64'); }
      catch (e) { if (e.code === 'ENOENT') return null; throw e; }
    },
    async escrever(rel, dados) {
      const f = abs(rel), b = bytes(dados); await exigirBase();
      await fs.mkdir(path.dirname(f), { recursive: true });
      const tmp = `${f}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
      await fs.writeFile(tmp, b);
      await fs.rename(tmp, f);
      return true;
    },
    async criarExclusivo(rel, dados) {
      const f = abs(rel), b = bytes(dados); await exigirBase();
      await fs.mkdir(path.dirname(f), { recursive: true });
      try { await fs.writeFile(f, b, { flag: 'wx' }); return true; }
      catch (e) { if (e.code === 'EEXIST') return false; throw e; }
    },
    async apagar(rel) {
      try { await fs.unlink(abs(rel)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      return true;
    }
  };
}

module.exports = { criar };
