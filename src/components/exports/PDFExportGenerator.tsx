import { Threshold, InvisibleThreshold, Absence, Case } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExportData {
  module: 'irreversa' | 'thresh' | 'nulla' | 'silva';
  caseData?: Case;
  thresholds?: Threshold[];
  invisibleThresholds?: (InvisibleThreshold & { tags?: string[]; intensity?: number })[];
  absences?: Absence[];
  silvaContent?: string;
}

export function generatePDFReport(data: ExportData): void {
  const htmlContent = generateHTMLReport(data);
  
  // Create printable window
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  
  // Auto print after load
  printWindow.onload = () => {
    printWindow.print();
  };
}

export function downloadHTMLReport(data: ExportData): void {
  const htmlContent = generateHTMLReport(data);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.module}-rapport-${format(new Date(), 'yyyy-MM-dd')}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function generateHTMLReport(data: ExportData): string {
  const { module, caseData, thresholds, invisibleThresholds, absences, silvaContent } = data;
  
  const moduleColors = {
    irreversa: { primary: '#8b5cf6', secondary: '#a78bfa' },
    thresh: { primary: '#f59e0b', secondary: '#fbbf24' },
    nulla: { primary: '#a855f7', secondary: '#c084fc' },
    silva: { primary: '#22c55e', secondary: '#4ade80' },
  };
  
  const colors = moduleColors[module];
  const date = format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr });

  let content = '';
  let stats = '';

  switch (module) {
    case 'irreversa':
      if (thresholds) {
        const crossed = thresholds.filter(t => t.is_crossed);
        const pending = thresholds.filter(t => !t.is_crossed);
        stats = `
          <div class="stats">
            <div class="stat"><span class="stat-value">${crossed.length}</span><span class="stat-label">Franchis</span></div>
            <div class="stat"><span class="stat-value">${pending.length}</span><span class="stat-label">En attente</span></div>
            <div class="stat"><span class="stat-value">${thresholds.length}</span><span class="stat-label">Total</span></div>
          </div>
        `;
        content = `
          <h2>Seuils d'irréversibilité</h2>
          ${crossed.length > 0 ? `
            <h3 class="section-title crossed">Seuils franchis (${crossed.length})</h3>
            ${crossed.map(t => `
              <div class="card crossed">
                <div class="card-header">
                  <h4>${t.title}</h4>
                  <span class="badge crossed">Franchi</span>
                </div>
                <p class="description">${t.description}</p>
                ${t.what_cannot_be_undone ? `<p class="meta"><strong>Ce qui ne peut être défait:</strong> ${t.what_cannot_be_undone}</p>` : ''}
                ${t.what_changes_after ? `<p class="meta"><strong>Ce qui change après:</strong> ${t.what_changes_after}</p>` : ''}
                ${t.crossed_at ? `<p class="date">Franchi le ${format(new Date(t.crossed_at), 'd MMMM yyyy', { locale: fr })}</p>` : ''}
              </div>
            `).join('')}
          ` : ''}
          ${pending.length > 0 ? `
            <h3 class="section-title pending">Seuils en attente (${pending.length})</h3>
            ${pending.map(t => `
              <div class="card pending">
                <div class="card-header">
                  <h4>${t.title}</h4>
                  <span class="badge pending">En attente</span>
                </div>
                <p class="description">${t.description}</p>
                ${t.conditions ? `<p class="meta"><strong>Conditions:</strong> ${t.conditions}</p>` : ''}
              </div>
            `).join('')}
          ` : ''}
        `;
      }
      break;

    case 'thresh':
      if (invisibleThresholds) {
        const sensed = invisibleThresholds.filter(t => t.sensed_at);
        const latent = invisibleThresholds.filter(t => !t.sensed_at);
        stats = `
          <div class="stats">
            <div class="stat"><span class="stat-value">${sensed.length}</span><span class="stat-label">Ressentis</span></div>
            <div class="stat"><span class="stat-value">${latent.length}</span><span class="stat-label">Latents</span></div>
            <div class="stat"><span class="stat-value">${invisibleThresholds.length}</span><span class="stat-label">Total</span></div>
          </div>
        `;
        content = `
          <h2>Seuils invisibles</h2>
          ${sensed.length > 0 ? `
            <h3 class="section-title sensed">Seuils ressentis (${sensed.length})</h3>
            ${sensed.map(t => `
              <div class="card sensed">
                <div class="card-header">
                  <h4>${t.title}</h4>
                  <span class="badge sensed">${t.thresh_type}</span>
                </div>
                <p class="description">${t.description}</p>
                ${t.intensity ? `<p class="meta"><strong>Intensité:</strong> ${t.intensity}/10</p>` : ''}
                ${t.sensed_at ? `<p class="date">Ressenti le ${format(new Date(t.sensed_at), 'd MMMM yyyy', { locale: fr })}</p>` : ''}
              </div>
            `).join('')}
          ` : ''}
          ${latent.length > 0 ? `
            <h3 class="section-title latent">Seuils latents (${latent.length})</h3>
            ${latent.map(t => `
              <div class="card latent">
                <div class="card-header">
                  <h4>${t.title}</h4>
                  <span class="badge latent">${t.thresh_type}</span>
                </div>
                <p class="description">${t.description}</p>
              </div>
            `).join('')}
          ` : ''}
        `;
      }
      break;

    case 'nulla':
      if (absences) {
        stats = `
          <div class="stats">
            <div class="stat"><span class="stat-value">${absences.length}</span><span class="stat-label">Absences</span></div>
            <div class="stat"><span class="stat-value">${absences.reduce((acc, a) => acc + (a.effects?.length || 0), 0)}</span><span class="stat-label">Effets</span></div>
          </div>
        `;
        content = `
          <h2>Absences structurantes</h2>
          ${absences.map(a => `
            <div class="card">
              <div class="card-header">
                <h4>${a.title}</h4>
              </div>
              <p class="description">${a.description}</p>
              ${a.effects && a.effects.length > 0 ? `
                <div class="effects">
                  <p class="effects-title">Effets (${a.effects.length}):</p>
                  <ul>
                    ${a.effects.map(e => `<li><strong>${e.effect_type}:</strong> ${e.description}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        `;
      }
      break;

    case 'silva':
      content = `
        <h2>Espace SILVA</h2>
        <div class="silva-content">
          ${silvaContent ? `<pre>${silvaContent}</pre>` : '<p class="empty">Aucun contenu enregistré.</p>'}
        </div>
      `;
      break;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${module.toUpperCase()} — Rapport${caseData ? ` • ${caseData.title}` : ''}</title>
  <style>
    @page { margin: 2cm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #1a1a2e;
      line-height: 1.6;
      background: #fff;
    }
    .header {
      border-bottom: 3px solid ${colors.primary};
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: ${colors.primary};
      letter-spacing: 0.1em;
    }
    .subtitle {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
    .case-title {
      font-size: 24px;
      font-weight: 600;
      margin: 16px 0 8px;
    }
    .case-description {
      font-size: 14px;
      color: #555;
    }
    .date-generated {
      font-size: 12px;
      color: #888;
      margin-top: 16px;
    }
    .stats {
      display: flex;
      gap: 24px;
      margin: 24px 0;
      padding: 20px;
      background: #f8f9fa;
      border-left: 4px solid ${colors.primary};
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      display: block;
      font-size: 32px;
      font-weight: 700;
      color: ${colors.primary};
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h2 {
      font-size: 20px;
      color: #1a1a2e;
      margin: 32px 0 16px;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
    .section-title {
      font-size: 16px;
      margin: 24px 0 12px;
      padding-left: 12px;
    }
    .section-title.crossed { border-left: 3px solid ${colors.primary}; }
    .section-title.pending { border-left: 3px solid #888; }
    .section-title.sensed { border-left: 3px solid #22c55e; }
    .section-title.latent { border-left: 3px solid #f59e0b; }
    .card {
      border: 1px solid #e5e7eb;
      padding: 20px;
      margin: 12px 0;
      break-inside: avoid;
    }
    .card.crossed { border-left: 4px solid ${colors.primary}; background: #faf5ff; }
    .card.pending { border-left: 4px solid #888; }
    .card.sensed { border-left: 4px solid #22c55e; background: #f0fdf4; }
    .card.latent { border-left: 4px solid #f59e0b; background: #fffbeb; }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .card h4 {
      margin: 0;
      font-size: 16px;
      color: #1a1a2e;
    }
    .badge {
      font-size: 10px;
      padding: 2px 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge.crossed { background: ${colors.primary}; color: white; }
    .badge.pending { background: #e5e7eb; color: #666; }
    .badge.sensed { background: #22c55e; color: white; }
    .badge.latent { background: #f59e0b; color: white; }
    .description { font-size: 14px; color: #444; margin: 8px 0; }
    .meta { font-size: 13px; color: #555; margin: 6px 0; }
    .date { font-size: 12px; color: #888; margin-top: 12px; }
    .effects { margin-top: 16px; padding-top: 12px; border-top: 1px dashed #ddd; }
    .effects-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
    .effects ul { margin: 0; padding-left: 20px; font-size: 13px; }
    .effects li { margin: 4px 0; }
    .silva-content { padding: 24px; background: #f8f9fa; white-space: pre-wrap; }
    .silva-content pre { margin: 0; font-family: inherit; }
    .empty { color: #888; font-style: italic; }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #eee;
      font-size: 11px;
      color: #888;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .card { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${module.toUpperCase()}</div>
    <div class="subtitle">Rapport de structuration</div>
    ${caseData ? `
      <div class="case-title">${caseData.title}</div>
      ${caseData.description ? `<div class="case-description">${caseData.description}</div>` : ''}
    ` : ''}
    <div class="date-generated">Généré le ${date}</div>
  </div>
  
  ${stats}
  ${content}
  
  <div class="footer">
    <p>Document généré par Threshold Engine — Suite de lucidité</p>
  </div>
</body>
</html>`;
}
