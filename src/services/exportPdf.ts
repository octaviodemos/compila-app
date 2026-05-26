import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { AttemptListItem } from './challenges';

const MESES_PT_BR = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatarDataHoraBr(d: Date | null): string {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) {
    return '—';
  }
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${h}:${min}`;
}

function formatarDataExtenso(d: Date): string {
  return `${d.getDate()} de ${MESES_PT_BR[d.getMonth()]} de ${d.getFullYear()}`;
}

function gerarLinhasTabela(attempts: AttemptListItem[]): string {
  if (attempts.length === 0) {
    return `
      <tr>
        <td colspan="4" class="empty-cell">Nenhuma tentativa registrada.</td>
      </tr>
    `;
  }

  return attempts
    .map((item, index) => {
      const zebra = index % 2 === 0 ? 'row-light' : 'row-dark';
      const resultClass = item.acertou ? 'status-ok' : 'status-err';
      const resultLabel = item.acertou ? 'Acertou' : 'Errou';
      const titulo = escapeHtml(item.titulo || '—');
      const data = escapeHtml(formatarDataHoraBr(item.criadoEm));
      return `
        <tr class="${zebra}">
          <td class="cell-titulo">${titulo}</td>
          <td class="cell-data">${data}</td>
          <td class="cell-status"><span class="badge ${resultClass}">${resultLabel}</span></td>
          <td class="cell-pontos">${item.pontos}</td>
        </tr>
      `;
    })
    .join('');
}

function gerarHtml(
  attempts: AttemptListItem[],
  username: string,
  sequencia: number
): string {
  const totalAcertos = attempts.filter((a) => a.acertou).length;
  const totalPontos = attempts.reduce(
    (acc, a) => (a.acertou ? acc + a.pontos : acc),
    0
  );
  const totalTentativas = attempts.length;
  const dataGeracao = formatarDataExtenso(new Date());
  const usernameSafe = escapeHtml(username || 'usuário');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Histórico Compila - ${usernameSafe}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #111827;
    margin: 0;
    padding: 0;
    background: #FFFFFF;
  }
  .container { padding: 32px 36px; }
  .header {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #FFFFFF;
    padding: 28px 36px;
    border-radius: 12px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header-left .logo {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin: 0 0 6px 0;
  }
  .header-left .subtitle {
    font-size: 14px;
    opacity: 0.85;
    margin: 0;
  }
  .header-right {
    text-align: right;
    font-size: 12px;
    opacity: 0.95;
  }
  .header-right .username {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 4px 0;
  }
  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin: 0 0 12px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #E5E7EB;
  }
  thead th {
    background: #F3F4F6;
    color: #111827;
    font-size: 12px;
    font-weight: 700;
    text-align: left;
    padding: 12px 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #E5E7EB;
  }
  tbody td {
    padding: 12px 14px;
    font-size: 13px;
    color: #1F2937;
    border-bottom: 1px solid #F3F4F6;
    vertical-align: middle;
  }
  tbody tr:last-child td { border-bottom: none; }
  .row-light { background: #FFFFFF; }
  .row-dark { background: #F9FAFB; }
  .cell-titulo { font-weight: 600; max-width: 320px; }
  .cell-data { color: #6B7280; white-space: nowrap; }
  .cell-status { width: 110px; }
  .cell-pontos {
    font-weight: 700;
    text-align: right;
    width: 80px;
    font-variant-numeric: tabular-nums;
  }
  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }
  .status-ok { background: #DCFCE7; color: #15803D; }
  .status-err { background: #FEE2E2; color: #B91C1C; }
  .empty-cell {
    text-align: center;
    color: #6B7280;
    padding: 28px 14px;
    font-style: italic;
  }
  .footer {
    margin-top: 28px;
    display: flex;
    gap: 12px;
  }
  .footer-card {
    flex: 1;
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
  }
  .footer-card .label {
    display: block;
    font-size: 11px;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 6px;
  }
  .footer-card .value {
    display: block;
    font-size: 22px;
    font-weight: 800;
    color: #111827;
  }
  .footer-card.ok .value { color: #15803D; }
  .footer-card.pts .value { color: #7C3AED; }
  .footer-card.streak .value { color: #EA580C; }
  .meta {
    margin-top: 20px;
    text-align: center;
    font-size: 11px;
    color: #9CA3AF;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <p class="logo">Compila</p>
        <p class="subtitle">Histórico de desafios</p>
      </div>
      <div class="header-right">
        <p class="username">@${usernameSafe}</p>
        <p>Gerado em ${escapeHtml(dataGeracao)}</p>
      </div>
    </div>

    <p class="section-title">Tentativas (${totalTentativas})</p>
    <table>
      <thead>
        <tr>
          <th>Desafio</th>
          <th>Data</th>
          <th>Resultado</th>
          <th style="text-align: right;">Pontos</th>
        </tr>
      </thead>
      <tbody>
        ${gerarLinhasTabela(attempts)}
      </tbody>
    </table>

    <div class="footer">
      <div class="footer-card ok">
        <span class="label">Total de acertos</span>
        <span class="value">${totalAcertos}</span>
      </div>
      <div class="footer-card pts">
        <span class="label">Pontos somados</span>
        <span class="value">${totalPontos.toLocaleString('pt-BR')}</span>
      </div>
      <div class="footer-card streak">
        <span class="label">Sequência atual</span>
        <span class="value">${sequencia} ${sequencia === 1 ? 'dia' : 'dias'}</span>
      </div>
    </div>

    <p class="meta">Compila • Relatório gerado automaticamente</p>
  </div>
</body>
</html>`;
}

function imprimirHtmlNoWeb(html: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('document indisponível para impressão web.'));
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const limpar = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const cw = iframe.contentWindow;
    const cd = iframe.contentDocument ?? cw?.document;
    if (!cw || !cd) {
      limpar();
      reject(new Error('Falha ao criar contexto de impressão.'));
      return;
    }

    const finalizarComSucesso = () => {
      setTimeout(() => {
        limpar();
        resolve();
      }, 500);
    };

    iframe.onload = () => {
      try {
        cw.focus();
        cw.print();
        finalizarComSucesso();
      } catch (err) {
        limpar();
        reject(err);
      }
    };

    try {
      cd.open();
      cd.write(html);
      cd.close();
    } catch (err) {
      limpar();
      reject(err);
    }
  });
}

export async function exportHistoricoPDF(
  attempts: AttemptListItem[],
  username: string,
  sequencia: number = 0
): Promise<void> {
  const html = gerarHtml(attempts, username, sequencia);

  if (Platform.OS === 'web') {
    await imprimirHtmlNoWeb(html);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });

  const podeCompartilhar = await Sharing.isAvailableAsync();
  if (!podeCompartilhar) {
    throw new Error(
      'Compartilhamento não está disponível neste dispositivo.'
    );
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartilhar histórico Compila',
    UTI: 'com.adobe.pdf',
  });
}
