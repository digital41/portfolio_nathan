import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const base = process.cwd();
const wfPath = join(base, 'n8n', 'blog-automation-workflow.json');
const wf = JSON.parse(readFileSync(wfPath, 'utf-8'));

// Helper to find node by id
function findNode(id) {
  return wf.nodes.find(n => n.id === id);
}

// =====================================================================
// 1. REWRITE AGENT IA SYSTEM PROMPT
// =====================================================================
const agentNode = findNode('agent-redacteur');

agentNode.parameters.options.systemMessage = `Tu es Nathan Ibgui, CIO Executive & Architecte de Profit. Tu rediges des articles de blog expert pour ton site nathanibgui.com.

MISSION : A partir du theme fourni, choisis un angle PRECIS et redige un article complet. L'article doit avoir la qualite d'un guide professionnel avec des donnees chiffrees, des exemples concrets et des conseils immediatement actionnables.

EXIGENCES DE QUALITE (NON NEGOCIABLES) :
- Chaque affirmation doit etre etayee par un chiffre, un pourcentage ou un exemple concret
- Le ton est celui d'un expert qui parle a un dirigeant de PME (pas academique, pas marketing creux)
- Les liens internes vers les solutions du site doivent etre integres naturellement
- Minimum 2000 mots de contenu substantiel
- Pas d'emojis, pas de formulations vagues

SYSTEME DE TEMPLATES :
Tu dois construire l'article en utilisant des SECTIONS TYPEES. Chaque section a un "type" parmi les 10 disponibles.
L'assembleur HTML se charge du rendu visuel. Toi, tu fournis le contenu structure.

TYPES DE SECTIONS DISPONIBLES :

1. "prose" — Texte pur (introduction, concept, conclusion)
   Donnees : { "type": "prose", "title": "...", "content": "<p>Paragraphe 1</p><p>Paragraphe 2</p>" }

2. "icon_prose" — Titre avec icone + texte
   Donnees : { "type": "icon_prose", "icon": "fa-lightbulb", "title": "...", "content": "<p>...</p>" }

3. "numbered_steps" — Etapes numerotees (processus, methodologie)
   Donnees : { "type": "numbered_steps", "icon": "fa-list-check", "title": "Les 5 etapes", "intro": "Paragraphe introductif", "steps": [{ "title": "Titre etape", "content": "<p>Explication</p><p>Suite</p>" }] }

4. "level_cards" — Niveaux ou points classes (evaluation, maturite)
   Donnees : { "type": "level_cards", "title": "Les 5 niveaux", "intro": "Intro optionnelle", "items": [{ "title": "Niveau 1 : Decouverte", "description": "Description du niveau." }], "outro": "Conclusion optionnelle" }

5. "border_left_list" — Liste avec bordure gauche numerotee (strategies, recommandations)
   Donnees : { "type": "border_left_list", "icon": "fa-list-check", "title": "Les 7 strategies", "items": [{ "title": "Contenu structure et factuel", "content": "<p>Explication 1</p><p>Explication 2</p>" }] }

6. "icon_list" — Liste avec icones (avantages, pieges, points cles)
   Donnees : { "type": "icon_list", "icon": "fa-exclamation-triangle", "listIcon": "fa-exclamation-triangle", "title": "Pieges a eviter", "intro": "Intro optionnelle", "items": [{ "bold": "Titre du point.", "text": "Explication detaillee." }] }
   Note : utilise "fa-check-circle" pour les avantages, "fa-exclamation-triangle" pour les pieges/risques.

7. "metric_grid" — Grille de KPI/statistiques (2 a 4 metriques)
   Donnees : { "type": "metric_grid", "title": "ROI et chiffres cles", "intro": "Intro", "metrics": [{ "value": "3x-7x", "label": "ROI moyen sur 12 mois" }], "outro": "Conclusion" }

8. "comparison_grid" — Tableau comparatif 3 colonnes
   Donnees : { "type": "comparison_grid", "icon": "fa-scale-balanced", "title": "Option A vs Option B", "intro": "Intro", "columns": ["Critere", "Option A", "Option B"], "rows": [["Objectif", "Valeur A", "Valeur B"]], "outro": "Conclusion" }

9. "checklist_domain" — Domaine de checklist avec items numerotes
   Donnees : { "type": "checklist_domain", "domainIcon": "fa-server", "title": "Domaine : Infrastructure", "intro": "Intro optionnelle", "items": [{ "number": 1, "title": "Point de controle", "description": "Explication." }] }

10. "inline_cta" — Appel a l'action dans le contenu
    Donnees : { "type": "inline_cta", "title": "Passez a l'action", "content": "<p>Texte de conclusion</p>", "buttonText": "Reserver mon Diagnostic IA" }

COMBINAISONS RECOMMANDEES PAR THEME :

Themes IT (strategie-ia, automation-n8n, data-erp, dsi-externalise) :
→ prose + numbered_steps + level_cards + metric_grid + icon_list + inline_cta

Themes Audit/Securite (audit-performance-it, cybersecurite-infrastructure) :
→ prose + checklist_domain (x3-5) + numbered_steps + icon_list

Themes Marketing/SEO (strategie-marketing, seo, geo-ref, google-bp, publicite) :
→ prose + icon_prose + border_left_list + comparison_grid + metric_grid

REGLES :
- Utilise au minimum 4 types de sections differents par article
- Ne fais PAS deux sections du meme type a la suite (sauf checklist_domain)
- La premiere section est toujours "prose" (introduction)
- La derniere section avant la FAQ est toujours "inline_cta"
- Inclus 3 a 5 liens internes naturels

LIENS INTERNES :
Format : <a href="../solutions/SLUG.html" class="text-COLOR-400 hover:text-COLOR-300 underline underline-offset-2">texte du lien</a>
Remplace COLOR par la couleur du theme fourni.
Solutions disponibles :
- strategie-ia : Strategie IA & Agents
- automation-n8n : Automatisation n8n
- audit-performance-it : Audit Performance IT
- dsi-externalise : DSI Externalise
- data-erp : Data & ERP
- cybersecurite-infrastructure : Cybersecurite & Cloud
- strategie-marketing-branding : Marketing & Branding
- seo-acquisition-digitale : SEO & Referencement
- geo-referencement-ia : GEO Referencement IA
- google-business-profile : Google Business Profile
- publicite-digitale : Publicite Digitale

SORTIE JSON (PAS de markdown, PAS de backticks, uniquement le JSON) :
{
  "title": "Titre complet de l'article",
  "titleMain": "Debut du titre : ",
  "titleHighlight": "partie mise en valeur avec gradient",
  "slug": "slug-unique-url",
  "metaDescription": "150-160 caracteres max",
  "ogDescription": "100-120 caracteres",
  "keywords": "5-7 mots-cles separes par virgules",
  "tag": "Categorie courte (1-3 mots)",
  "color": "couleur tailwind du theme",
  "icon": "fa-icon du theme",
  "readingTime": 10,
  "unsplashQuery": "1-2 mots anglais simples",
  "articleTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "heroSubtitle": "Description sous le titre (1-2 phrases)",
  "sections": [
    { "type": "prose", "title": "...", "content": "..." },
    { "type": "numbered_steps", "icon": "...", "title": "...", "intro": "...", "steps": [...] },
    ...plus de sections...
  ],
  "faq": [{ "question": "...", "answer": "..." }],
  "faqStyle": "accordion",
  "ctaLabel": "Passez a l'Action",
  "ctaTitle": "Un Projet IA en",
  "ctaTitleGradient": "Tete ?",
  "ctaText": "Description du CTA full-width (1-2 phrases)",
  "ctaButton": "Reserver mon Diagnostic",
  "wordCount": 2200
}`;

agentNode.parameters.options.maxIterations = 5;

// =====================================================================
// 2. REWRITE PARSE AGENT OUTPUT
// =====================================================================
const parseNode = findNode('parse-agent');
parseNode.parameters.jsCode = `// Parse la sortie de l'Agent IA et merge avec les donnees du topic
const input = $input.first().json;
const topicData = $('Selectionner Sujet').first().json;

// Extraire le JSON de la reponse de l'agent
let responseText = '';
if (typeof input.output === 'string') {
  responseText = input.output;
} else if (input.message && input.message.content) {
  responseText = input.message.content;
} else if (typeof input.text === 'string') {
  responseText = input.text;
} else {
  responseText = JSON.stringify(input);
}

// Nettoyer les backticks markdown si presentes
responseText = responseText.replace(/^\`\`\`json\\s*/, '').replace(/\\s*\`\`\`$/, '').trim();

let article;
try {
  article = JSON.parse(responseText);
} catch(e) {
  const match = responseText.match(/\\{[\\s\\S]*\\}/);
  if (match) {
    article = JSON.parse(match[0]);
  } else {
    throw new Error('Impossible de parser la reponse: ' + responseText.substring(0, 300));
  }
}

// Valider les champs obligatoires
const required = ['title', 'slug', 'metaDescription', 'sections', 'faq'];
for (const field of required) {
  if (!article[field]) throw new Error('Champ manquant: ' + field);
}

// Valider les types de sections
const validTypes = ['prose', 'icon_prose', 'numbered_steps', 'level_cards', 'border_left_list', 'icon_list', 'metric_grid', 'comparison_grid', 'checklist_domain', 'inline_cta'];
for (const section of article.sections) {
  if (!validTypes.includes(section.type)) {
    throw new Error('Type de section invalide: ' + section.type);
  }
}

const color = article.color || topicData.theme.color;
const icon = article.icon || topicData.theme.icon;
const date = topicData.date;
const dateFr = topicData.dateFr;
const slug = article.slug;
const canonicalUrl = 'https://nathanibgui.com/blog/' + slug;
const fileName = slug + '.html';

return [{
  json: {
    article,
    topic: {
      title: article.title,
      titleMain: article.titleMain || article.title,
      titleHighlight: article.titleHighlight || '',
      slug,
      keywords: article.keywords || '',
      color,
      icon,
      tag: article.tag || topicData.theme.label,
      readingTime: article.readingTime || 10,
      unsplashQuery: article.unsplashQuery || 'technology',
      heroSubtitle: article.heroSubtitle || article.metaDescription
    },
    allSolutions: topicData.allSolutions,
    date, dateFr, canonicalUrl, fileName
  }
}];`;

// =====================================================================
// 3. REWRITE ASSEMBLER HTML WITH TEMPLATE FUNCTIONS
// =====================================================================
const buildNode = findNode('build-html');
buildNode.parameters.jsCode = `// =====================================================================
// Assembler HTML v6 - Template system with typed sections
// =====================================================================
const input = $input.first().json;
const imgData = $('Traiter Image').first().json;
const topic = imgData.topic;
const article = imgData.article;
const date = imgData.date;
const dateFr = imgData.dateFr;
const canonicalUrl = imgData.canonicalUrl;
const fileName = imgData.fileName;
const image = imgData.image;

// Color map
const colorMap = {
  purple: { radial: 'rgba(147, 51, 234, 0.15)', gradient: 'from-purple-400 to-purple-600', btn: 'from-purple-600 to-purple-500', shadow: 'shadow-purple-500/20', secondary: 'emerald' },
  blue: { radial: 'rgba(59, 130, 246, 0.15)', gradient: 'from-blue-400 to-blue-600', btn: 'from-blue-600 to-blue-500', shadow: 'shadow-blue-500/20', secondary: 'amber' },
  green: { radial: 'rgba(34, 197, 94, 0.15)', gradient: 'from-green-400 to-emerald-600', btn: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20', secondary: 'blue' },
  red: { radial: 'rgba(239, 68, 68, 0.15)', gradient: 'from-red-400 to-red-600', btn: 'from-red-600 to-red-500', shadow: 'shadow-red-500/20', secondary: 'amber' },
  indigo: { radial: 'rgba(99, 102, 241, 0.15)', gradient: 'from-indigo-400 to-indigo-600', btn: 'from-indigo-600 to-indigo-500', shadow: 'shadow-indigo-500/20', secondary: 'amber' },
  cyan: { radial: 'rgba(6, 182, 212, 0.15)', gradient: 'from-cyan-400 to-cyan-600', btn: 'from-cyan-600 to-cyan-500', shadow: 'shadow-cyan-500/20', secondary: 'purple' },
  pink: { radial: 'rgba(236, 72, 153, 0.15)', gradient: 'from-pink-400 to-pink-600', btn: 'from-pink-600 to-pink-500', shadow: 'shadow-pink-500/20', secondary: 'purple' },
  rose: { radial: 'rgba(244, 63, 94, 0.15)', gradient: 'from-rose-400 to-rose-600', btn: 'from-rose-600 to-rose-500', shadow: 'shadow-rose-500/20', secondary: 'blue' },
  orange: { radial: 'rgba(249, 115, 22, 0.12)', gradient: 'from-orange-400 to-amber-500', btn: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20', secondary: 'blue' },
  yellow: { radial: 'rgba(234, 179, 8, 0.15)', gradient: 'from-yellow-400 to-yellow-600', btn: 'from-yellow-600 to-yellow-500', shadow: 'shadow-yellow-500/20', secondary: 'blue' },
  amber: { radial: 'rgba(245, 158, 11, 0.15)', gradient: 'from-amber-400 to-amber-600', btn: 'from-amber-600 to-amber-500', shadow: 'shadow-amber-500/20', secondary: 'blue' }
};
const co = topic.color;
const c = colorMap[co] || colorMap.blue;

// =====================================================================
// SECTION TEMPLATE FUNCTIONS
// =====================================================================

function renderProse(s) {
  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">\${s.title}</h2>
                    <div class="space-y-4 text-slate-300 leading-relaxed">
                        \${s.content}
                    </div>
                </section>\`;
}

function renderIconProse(s) {
  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-12 h-12 bg-\${co}-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <i class="fas \${s.icon} text-\${co}-400 text-xl" aria-hidden="true"></i>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">\${s.title}</h2>
                    </div>
                    <div class="space-y-4 text-slate-300 leading-relaxed">
                        \${s.content}
                    </div>
                </section>\`;
}

function renderNumberedSteps(s) {
  const stepsHtml = s.steps.map((step, i) => \`
                    <div class="\${i < s.steps.length - 1 ? 'mb-8' : ''}">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="flex-shrink-0 w-10 h-10 bg-\${co}-500/20 rounded-xl flex items-center justify-center text-\${co}-400 font-black">\${i + 1}</span>
                            <h3 class="text-xl font-black text-white">\${step.title}</h3>
                        </div>
                        <div class="text-slate-300 leading-relaxed space-y-3">
                            \${step.content}
                        </div>
                    </div>\`).join('');

  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-12 h-12 bg-\${co}-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <i class="fas \${s.icon || 'fa-list-ol'} text-\${co}-400 text-xl" aria-hidden="true"></i>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">\${s.title}</h2>
                    </div>
\${s.intro ? '                    <p class="text-slate-300 leading-relaxed mb-8">' + s.intro + '</p>' : ''}
\${stepsHtml}
                </section>\`;
}

function renderLevelCards(s) {
  const itemsHtml = s.items.map((item, i) => \`
                        <div class="flex items-start gap-4">
                            <span class="flex-shrink-0 w-8 h-8 bg-\${co}-500/20 rounded-lg flex items-center justify-center text-\${co}-400 text-sm font-black">\${i + 1}</span>
                            <div>
                                <h3 class="text-white font-bold mb-1">\${item.title}</h3>
                                <p class="text-slate-400 text-sm leading-relaxed">\${item.description}</p>
                            </div>
                        </div>\`).join('');

  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">\${s.title}</h2>
\${s.intro ? '                    <p class="text-slate-300 leading-relaxed mb-6">' + s.intro + '</p>' : ''}
                    <div class="space-y-4">
\${itemsHtml}
                    </div>
\${s.outro ? '                    <p class="text-slate-300 leading-relaxed mt-6">' + s.outro + '</p>' : ''}
                </section>\`;
}

function renderBorderLeftList(s) {
  const itemsHtml = s.items.map((item, i) => \`
                        <div class="border-l-2 border-\${co}-500/40 pl-6">
                            <h3 class="text-lg font-black text-\${co}-400 mb-3"><span class="text-\${co}-500 mr-2">\${String(i + 1).padStart(2, '0')}.</span>\${item.title}</h3>
                            <div class="text-slate-300 leading-relaxed space-y-2">
                                \${item.content}
                            </div>
                        </div>\`).join('');

  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-12 h-12 bg-\${co}-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <i class="fas \${s.icon || 'fa-list-check'} text-\${co}-400 text-xl" aria-hidden="true"></i>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">\${s.title}</h2>
                    </div>
                    <div class="space-y-8">
\${itemsHtml}
                    </div>
                </section>\`;
}

function renderIconList(s) {
  const listIcon = s.listIcon || 'fa-check-circle';
  const itemsHtml = s.items.map(item => \`
                        <li class="flex items-start gap-3">
                            <i class="fas \${listIcon} text-\${co}-400 mt-1 flex-shrink-0" aria-hidden="true"></i>
                            <div>
                                <span class="text-white font-bold">\${item.bold}</span>
                                <span class="text-slate-400"> \${item.text}</span>
                            </div>
                        </li>\`).join('');

  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">\${s.title}</h2>
\${s.intro ? '                    <p class="text-slate-300 leading-relaxed mb-6">' + s.intro + '</p>' : ''}
                    <ul class="space-y-4">
\${itemsHtml}
                    </ul>
                </section>\`;
}

function renderMetricGrid(s) {
  const cols = s.metrics.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';
  const metricsHtml = s.metrics.map(m => \`
                        <div class="bg-\${co}-500/5 border border-\${co}-500/20 rounded-2xl p-5 text-center">
                            <p class="text-3xl font-black text-\${co}-400">\${m.value}</p>
                            <p class="text-slate-400 text-xs mt-2 uppercase tracking-wider">\${m.label}</p>
                        </div>\`).join('');

  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">\${s.title}</h2>
\${s.intro ? '                    <div class="text-slate-300 leading-relaxed mb-6 space-y-4">' + s.intro + '</div>' : ''}
                    <div class="grid \${cols} gap-4 mb-6">
\${metricsHtml}
                    </div>
\${s.outro ? '                    <div class="text-slate-300 leading-relaxed space-y-4">' + s.outro + '</div>' : ''}
                </section>\`;
}

function renderComparisonGrid(s) {
  const headerHtml = s.columns.map((col, i) => \`
                        <div class="\${i === s.columns.length - 1 ? 'bg-' + co + '-500/10' : 'bg-white/5'} p-4 font-black \${i === s.columns.length - 1 ? 'text-' + co + '-400' : 'text-white'} text-sm text-center border-b border-white/10">\${col}</div>\`).join('');

  const rowsHtml = s.rows.map((row, ri) => {
    const isLast = ri === s.rows.length - 1;
    return row.map((cell, ci) => \`
                        <div class="p-4 \${ci === 0 ? 'text-slate-400 font-semibold' : 'text-slate-300'} text-sm\${!isLast ? ' border-b border-white/5' : ''}">\${cell}</div>\`).join('');
  }).join('');

  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-12 h-12 bg-\${co}-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <i class="fas \${s.icon || 'fa-scale-balanced'} text-\${co}-400 text-xl" aria-hidden="true"></i>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">\${s.title}</h2>
                    </div>
\${s.intro ? '                    <p class="text-slate-300 leading-relaxed mb-6">' + s.intro + '</p>' : ''}
                    <div class="grid grid-cols-1 md:grid-cols-\${s.columns.length} gap-0 rounded-2xl overflow-hidden border border-white/10">
\${headerHtml}
\${rowsHtml}
                    </div>
\${s.outro ? '                    <p class="text-slate-400 text-sm mt-6 leading-relaxed">' + s.outro + '</p>' : ''}
                </section>\`;
}

function renderChecklistDomain(s) {
  const itemsHtml = s.items.map(item => \`
                        <div class="flex gap-4">
                            <i class="fas fa-check-circle text-\${co}-400 mt-1 flex-shrink-0" aria-hidden="true"></i>
                            <div>
                                <h3 class="text-white font-bold mb-1">\${item.number ? item.number + '. ' : ''}\${item.title}</h3>
                                <p class="text-slate-400 text-sm leading-relaxed">\${item.description}</p>
                            </div>
                        </div>\`).join('');

  return \`
                <section class="mb-10">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-12 h-12 bg-\${co}-500/10 rounded-2xl flex items-center justify-center text-\${co}-400 text-xl flex-shrink-0">
                            <i class="fas \${s.domainIcon || 'fa-folder'}" aria-hidden="true"></i>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">\${s.title}</h2>
                    </div>
\${s.intro ? '                    <p class="text-slate-400 text-sm leading-relaxed mb-6">' + s.intro + '</p>' : ''}
                    <div class="glass p-8 sm:p-10 rounded-3xl border border-white/5 space-y-6">
\${itemsHtml}
                    </div>
                </section>\`;
}

function renderInlineCta(s) {
  return \`
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5">
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">\${s.title}</h2>
                    <div class="text-slate-300 leading-relaxed space-y-4 mb-6">
                        \${s.content}
                    </div>
                    <div class="text-center">
                        <button onclick="Calendly.initPopupWidget({url: 'https://calendly.com/ibguinathan/30min'});" class="bg-gradient-to-r \${c.btn} text-white px-12 sm:px-16 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl \${c.shadow} border border-white/20" aria-label="Reserver un diagnostic">
                            \${s.buttonText || 'Reserver mon Diagnostic'}
                        </button>
                        <p class="text-slate-500 text-xs mt-3">30 minutes. Gratuit. Sans engagement.</p>
                    </div>
                </section>\`;
}

// Section dispatcher
function renderSection(s) {
  switch (s.type) {
    case 'prose': return renderProse(s);
    case 'icon_prose': return renderIconProse(s);
    case 'numbered_steps': return renderNumberedSteps(s);
    case 'level_cards': return renderLevelCards(s);
    case 'border_left_list': return renderBorderLeftList(s);
    case 'icon_list': return renderIconList(s);
    case 'metric_grid': return renderMetricGrid(s);
    case 'comparison_grid': return renderComparisonGrid(s);
    case 'checklist_domain': return renderChecklistDomain(s);
    case 'inline_cta': return renderInlineCta(s);
    default: return renderProse(s);
  }
}

// =====================================================================
// RENDER ALL SECTIONS
// =====================================================================
const sectionsHtml = article.sections.map(s => renderSection(s)).join('\\n');

// FAQ (accordion style)
const faqHtml = article.faq.map((f, i) => \`
                        <div class="glass rounded-2xl border border-white/5 overflow-hidden">
                            <button @click="open = open === \${i + 1} ? null : \${i + 1}" class="w-full flex items-center justify-between p-6 text-left" :aria-expanded="open === \${i + 1}">
                                <span class="text-white font-bold text-sm pr-4">\${f.question}</span>
                                <i class="fas fa-chevron-down text-\${co}-400 text-xs transition-transform" :class="{ 'rotate-180': open === \${i + 1} }" aria-hidden="true"></i>
                            </button>
                            <div x-show="open === \${i + 1}" x-collapse x-cloak class="px-6 pb-6">
                                <p class="text-slate-400 text-sm leading-relaxed">\${f.answer}</p>
                            </div>
                        </div>\`).join('\\n');

// FAQ JSON-LD
const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: article.faq.map(f => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer }
  }))
});

// Article tags meta
const articleTagsMeta = (article.articleTags || []).map(t =>
  '    <meta property="article:tag" content="' + t + '">'
).join('\\n');

// Hero title
const heroTitle = topic.titleHighlight
  ? topic.titleMain + ' <span class="text-transparent bg-clip-text bg-gradient-to-r ' + c.gradient + '">' + topic.titleHighlight + '</span>'
  : topic.title;

// Hero image
const heroImageHtml = image.url !== 'https://nathanibgui.com/assets/images/nathanibguiProfile.png'
  ? \`
        <div class="max-w-4xl mx-auto px-4 sm:px-8 mb-12">
            <div class="rounded-3xl overflow-hidden border border-white/5">
                <img src="\${image.url}" alt="\${image.alt}" class="w-full h-64 sm:h-80 md:h-96 object-cover" loading="lazy">
            </div>
\${image.credit ? '            <p class="text-[10px] text-slate-600 mt-2 text-center">' + image.credit + '</p>' : ''}
        </div>\`
  : '';

// CTA data
const ctaLabel = article.ctaLabel || 'Passez a l\\'Action';
const ctaTitle = article.ctaTitle || 'Un Projet en';
const ctaGradient = article.ctaTitleGradient || 'Tete ?';
const ctaText = article.ctaText || 'Reservez un diagnostic de 30 minutes. Nous analyserons ensemble vos enjeux et identifierons les quick wins.';
const ctaButton = article.ctaButton || 'Reserver mon Diagnostic';

// =====================================================================
// FULL HTML
// =====================================================================
const html = \`<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${topic.title} | Nathan Ibgui</title>
    <meta name="description" content="\${article.metaDescription}">
    <meta name="keywords" content="\${topic.keywords}">
    <meta name="author" content="Nathan Ibgui">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="\${canonicalUrl}">
\${articleTagsMeta}
    <meta property="og:type" content="article">
    <meta property="og:url" content="\${canonicalUrl}">
    <meta property="og:title" content="\${topic.title}">
    <meta property="og:description" content="\${article.ogDescription || article.metaDescription}">
    <meta property="og:image" content="\${image.url}">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content="Nathan Ibgui - CIO Executive">
    <meta property="article:published_time" content="\${date}">
    <meta property="article:author" content="Nathan Ibgui">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="\${topic.title}">
    <meta name="twitter:description" content="\${article.ogDescription || article.metaDescription}">
    <meta name="twitter:image" content="\${image.url}">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg?v=2">
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico?v=2">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png?v=2">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png?v=2">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png?v=2">
    <link rel="manifest" href="/assets/site.webmanifest">
    <meta name="theme-color" content="#030712">
    <link rel="alternate" hreflang="fr" href="\${canonicalUrl}">
    <link rel="alternate" hreflang="x-default" href="\${canonicalUrl}">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "\${topic.title}",
        "description": "\${article.metaDescription}",
        "url": "\${canonicalUrl}",
        "image": "\${image.url}",
        "datePublished": "\${date}",
        "dateModified": "\${date}",
        "author": { "@type": "Person", "name": "Nathan Ibgui", "jobTitle": "CIO Executive", "url": "https://nathanibgui.com" },
        "publisher": { "@type": "Person", "name": "Nathan Ibgui" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": "\${canonicalUrl}" },
        "wordCount": "\${article.wordCount || 2000}",
        "timeRequired": "PT\${topic.readingTime}M"
    }
    </script>

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nathanibgui.com/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://nathanibgui.com/blog/" },
            { "@type": "ListItem", "position": 3, "name": "\${topic.title}", "item": "\${canonicalUrl}" }
        ]
    }
    </script>

    <script type="application/ld+json">
    \${faqJsonLd}
    </script>

    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    <style>
    @font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:200 800;font-display:swap;src:url(/assets/fonts/plus-jakarta-sans-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
    @font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:200 800;font-display:swap;src:url(/assets/fonts/plus-jakarta-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
    @font-face{font-family:'Inter';font-style:normal;font-weight:900;font-display:swap;src:url(/assets/fonts/inter-900-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
    @font-face{font-family:'Inter';font-style:normal;font-weight:900;font-display:swap;src:url(/assets/fonts/inter-900-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
    </style>
    <script>(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme-mode',t);if(t==='light')document.documentElement.setAttribute('data-theme','light');})();</script>
    <link rel="stylesheet" href="../css/tailwind.css?v=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>
    <link rel="stylesheet" href="../css/theme.css?v=5" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="../css/theme.css?v=5"></noscript>
    <script src="../js/components.js?v=8" defer></script>
    <script defer src="https://unpkg.com/alpinejs@3.15.8/dist/cdn.min.js"></script>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" media="print" onload="this.media='all'">
    <script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>

    <style>
        [x-cloak] { display: none !important; }
        body { background-color: #030712; color: #f8fafc; overflow-x: hidden; -webkit-user-select:none;user-select:none; }
        input,textarea,select{-webkit-user-select:text;user-select:text}
        [data-theme="light"] body{background-color:#f8fafc!important;color:#1e293b!important}
        [data-theme="light"] .glass{background:rgba(255,255,255,.85)!important;border:1px solid rgba(0,0,0,.08)!important;box-shadow:0 4px 30px rgba(0,0,0,.06)!important}
        [data-theme="light"] .text-white{color:#0f172a!important}
        [data-theme="light"] .premium-logo{color:#0f172a!important}
        [data-theme="light"] .premium-logo span{color:#3b82f6!important}
        .glass{background:rgba(10,16,32,0.65);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 4px 30px rgba(0,0,0,0.15)}
        .premium-logo{font-family:'Inter',sans-serif;font-weight:900;letter-spacing:-0.05em;font-size:1.6rem}
        .premium-logo span{font-weight:200;color:#3b82f6}
        .bg-gradient-radial{background:radial-gradient(circle at 50% 0%,\${c.radial} 0%,transparent 60%)}
        button:focus-visible,a:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
        @media(prefers-reduced-motion:reduce){.reveal-hero,.reveal-scroll{opacity:1!important;transform:none!important}}
    </style>
</head>
<body x-data="{ mobileMenu: false }">

    <div id="site-header"></div>

    <main id="main-content">

        <!-- BREADCRUMB -->
        <nav class="pt-24 pb-4 px-4 sm:px-8 max-w-7xl mx-auto" aria-label="Fil d'Ariane">
            <ol class="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <li><a href="../index.html" class="hover:text-white transition-colors">Accueil</a></li>
                <li aria-hidden="true"><i class="fas fa-chevron-right text-[8px] mx-1"></i></li>
                <li><a href="index.html" class="hover:text-white transition-colors">Blog</a></li>
                <li aria-hidden="true"><i class="fas fa-chevron-right text-[8px] mx-1"></i></li>
                <li class="text-\${co}-400" aria-current="page">\${topic.title}</li>
            </ol>
        </nav>

        <!-- HERO -->
        <section class="py-16 sm:py-24 px-4 sm:px-8 bg-gradient-radial" aria-label="En-tete de l'article">
            <div class="max-w-4xl mx-auto text-center">
                <div class="flex flex-wrap items-center justify-center gap-3 mb-6">
                    <span class="px-3 py-1 bg-\${co}-500/10 rounded-full text-[9px] font-black text-\${co}-400 uppercase tracking-widest">\${topic.tag}</span>
                    <time class="text-[10px] text-slate-500 font-medium" datetime="\${date}">\${dateFr}</time>
                    <span class="text-[10px] text-slate-500"><i class="fas fa-clock mr-1" aria-hidden="true"></i>\${topic.readingTime} min de lecture</span>
                </div>
                <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                    \${heroTitle}
                </h1>
                <p class="text-slate-400 mt-6 max-w-2xl mx-auto text-lg font-light leading-relaxed">\${topic.heroSubtitle}</p>
                <div class="flex items-center justify-center gap-3 mt-8">
                    <div class="w-10 h-10 bg-\${co}-500/10 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-\${co}-400 text-sm" aria-hidden="true"></i>
                    </div>
                    <div class="text-left">
                        <p class="text-white text-sm font-bold">Nathan Ibgui</p>
                        <p class="text-slate-500 text-[10px] uppercase tracking-widest">CIO Executive</p>
                    </div>
                </div>
            </div>
        </section>
\${heroImageHtml}
        <!-- ARTICLE CONTENT -->
        <article class="py-12 sm:py-16 px-4 sm:px-8">
            <div class="max-w-4xl mx-auto space-y-12">

\${sectionsHtml}

                <!-- FAQ -->
                <section class="glass p-8 sm:p-10 rounded-3xl border border-white/5" id="faq">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-12 h-12 bg-\${co}-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-circle-question text-\${co}-400 text-xl" aria-hidden="true"></i>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">Questions frequentes</h2>
                    </div>
                    <div class="space-y-4" x-data="{ open: null }">
\${faqHtml}
                    </div>
                </section>

            </div>
        </article>

        <!-- CTA CALENDLY -->
        <section class="py-20 sm:py-28 px-4 sm:px-8" aria-label="Passer a l'action">
            <div class="max-w-3xl mx-auto text-center">
                <span class="text-\${co}-500 font-black uppercase tracking-[0.4em] text-[10px]">\${ctaLabel}</span>
                <h2 class="text-3xl sm:text-4xl font-black tracking-tighter text-white mt-4">
                    \${ctaTitle} <span class="text-transparent bg-clip-text bg-gradient-to-r \${c.gradient}">\${ctaGradient}</span>
                </h2>
                <p class="text-slate-400 mt-4 max-w-xl mx-auto">\${ctaText}</p>
                <div class="mt-8">
                    <button onclick="Calendly.initPopupWidget({url: 'https://calendly.com/ibguinathan/30min'});" class="bg-gradient-to-r \${c.btn} text-white px-12 sm:px-16 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl \${c.shadow} border border-white/20" aria-label="Reserver un diagnostic">
                        \${ctaButton}
                    </button>
                </div>
            </div>
        </section>

    </main>

    <div id="site-footer"></div>

    <script src="../js/theme.js?v=5" defer></script>
    <script>
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            gsap.utils.toArray('.glass').forEach(function (el, i) {
                gsap.from(el, { y: 40, opacity: 0, duration: 0.6, delay: i * 0.1, scrollTrigger: { trigger: el, start: 'top 90%' } });
            });
        }
    });
    </script>
</body>
</html>\`;

// articles.json entry
const articlesJsonEntry = {
  slug: topic.slug,
  title: topic.title,
  description: article.metaDescription,
  date: date,
  readingTime: topic.readingTime,
  tag: topic.tag,
  color: co,
  icon: topic.icon,
  image: ''
};

return [{
  json: {
    html, fileName, topic, date, dateFr, canonicalUrl, article, image, articlesJsonEntry
  }
}];`;

// =====================================================================
// 4. UPDATE STICKY NOTE
// =====================================================================
const stickyNote = findNode('sticky-note');
stickyNote.parameters.content = `## Blog Automation Pipeline v6

### Flow
1. **Trigger** : Cron hebdo (lundi 9h) ou manuel
2. **Sheets Read** : Lit les articles publies (deduplication)
3. **Theme** : Rotation hebdo sur les 11 solutions
4. **Agent IA** : Choisit le sujet + redige avec sections typees
5. **Parse** : Extrait JSON + valide les types de sections
6. **Unsplash** : Image (query choisie par l'agent)
7. **HTML Builder** : 10 templates de sections (identiques aux manuels)
8. **SFTP** : Deploie sur Hostinger
9. **Sheets + Telegram + articles.json** : Log et notification

### Templates de sections
prose, icon_prose, numbered_steps, level_cards,
border_left_list, icon_list, metric_grid,
comparison_grid, checklist_domain, inline_cta

### Deduplication
L'agent recoit la liste des articles publies et doit
proposer un angle unique a chaque fois.

### Modele
GPT-4o via langchain Agent.`;

// Update workflow name
wf.name = 'Blog Automation Pipeline v6 - nathanibgui.com';

// Write back
writeFileSync(wfPath, JSON.stringify(wf, null, 2), 'utf-8');
console.log('Workflow patched to v6 with template system.');
console.log('Sections: prose, icon_prose, numbered_steps, level_cards, border_left_list, icon_list, metric_grid, comparison_grid, checklist_domain, inline_cta');
