/**
 * Update n8n Blog Automation Pipeline v9 → v10
 * 1. Switch model gpt-4o → gpt-5
 * 2. maxTokens 8000 → 16000
 * 3. Temperature 0.7 → 0.4
 * 4. System prompt: add GEO examples BON/MAUVAIS + reinforce links + FAQ minimums
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://n8n.srv1014329.hstgr.cloud';
const API_KEY = process.env.N8N_API_KEY;
const WORKFLOW_ID = 'eHUIv96VOtDCwhZc';

// Fetch current workflow
const wfPath = path.join(process.env.TEMP, 'n8n-wf-v10.json');

function fetchWorkflow() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}/api/v1/workflows/${WORKFLOW_ID}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: { 'X-N8N-API-KEY': API_KEY }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(body));
        else reject(new Error(`GET ${res.statusCode}: ${body.substring(0, 300)}`));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function pushWorkflow(workflow) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: { executionOrder: workflow.settings.executionOrder }
    });
    const url = new URL(`${API_BASE}/api/v1/workflows/${WORKFLOW_ID}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(body));
        else reject(new Error(`PUT ${res.statusCode}: ${body.substring(0, 500)}`));
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('Fetching workflow from n8n API...');
  const workflow = await fetchWorkflow();
  console.log(`✓ Fetched "${workflow.name}" (${workflow.nodes.length} nodes)\n`);

  // ===================================================================
  // 1. SWITCH MODEL TO GPT-5
  // ===================================================================
  const modelNode = workflow.nodes.find(n => n.name === 'OpenAI Chat Model');
  if (!modelNode) throw new Error('OpenAI Chat Model node not found');

  const oldModel = modelNode.parameters.model?.value || modelNode.parameters.model;
  modelNode.parameters.model = {
    __rl: true,
    value: 'gpt-5',
    mode: 'list',
    cachedResultName: 'gpt-5'
  };
  console.log(`✓ Model: ${oldModel} → gpt-5`);

  // ===================================================================
  // 2. maxTokens 8000 → 16000
  // ===================================================================
  const oldMaxTokens = modelNode.parameters.options?.maxTokens || 8000;
  modelNode.parameters.options = {
    ...modelNode.parameters.options,
    temperature: 0.4,
    maxTokens: 16000
  };
  console.log(`✓ maxTokens: ${oldMaxTokens} → 16000`);
  console.log(`✓ temperature: 0.7 → 0.4`);

  // ===================================================================
  // 3. REINFORCE SYSTEM PROMPT
  // ===================================================================
  const agentNode = workflow.nodes.find(n => n.name === 'Agent IA - Redacteur Blog');
  if (!agentNode) throw new Error('Agent node not found');

  let sysMsg = agentNode.parameters.options.systemMessage;

  // Add concrete examples and reinforced rules
  const reinforcement = `

EXEMPLES GEO — BON vs MAUVAIS (MEMORISE ces patterns) :

MAUVAIS (style marketing, INTERDIT) :
- "Découvrez comment optimiser votre Google Business Profile..."
- "Un GBP bien optimisé est essentiel pour améliorer le SEO local..."
- "N'hésitez pas à contacter un expert pour..."
- "Il est important de noter que..."

BON (style GEO declaratif, OBLIGATOIRE) :
- "Le Google Business Profile est l'outil gratuit de Google qui permet aux entreprises d'apparaître dans le Local Pack, les Maps et le Knowledge Panel. En 2026, 78 % des recherches locales sur mobile aboutissent à un achat en magasin dans les 24 heures."
- "Un agent IA autonome est un programme capable d'exécuter des tâches complexes sans intervention humaine, en combinant un modèle de langage avec des outils d'action. Les entreprises qui déploient des agents IA réduisent leurs coûts opérationnels de 25 à 40 % en moyenne."
- "Le GEO (Generative Engine Optimization) est la discipline qui consiste à optimiser le contenu d'un site web pour être cité dans les réponses des moteurs IA comme ChatGPT, Perplexity et Gemini."

Chaque premiere phrase de section DOIT suivre le pattern BON ci-dessus : definition factuelle + chiffre.

LIENS INTERNES — OBLIGATOIRE (3-5 par article) :
Tu DOIS inclure au minimum 3 liens vers les pages solutions du site dans le contenu HTML des sections.
Format exact : <a href="../solutions/SLUG.html" class="text-COLOR-400 hover:text-COLOR-300 underline underline-offset-2">texte naturel du lien</a>
Si l'article parle de SEO local → lien vers google-business-profile.html ET seo-acquisition-digitale.html
Si l'article parle d'IA → lien vers strategie-ia.html ET automation-n8n.html
Si l'article parle de marketing → lien vers strategie-marketing-branding.html ET publicite-digitale.html
VERIFIE que tu as au moins 3 liens <a href="../solutions/..."> dans ta sortie JSON avant de repondre.

FAQ — MINIMUM REQUIS :
- Au moins 5 questions (pas 3)
- Chaque reponse doit faire 2-4 phrases factuelles et autonomes (comprehensibles sans lire l'article)
- Chaque reponse doit contenir au moins un chiffre ou une donnee concrete
- Pas de renvois vagues ("consultez un expert", "il est recommande de...")

META DESCRIPTION — FORMAT OBLIGATOIRE :
La metaDescription doit commencer par une definition ou un fait, JAMAIS par "Découvrez", "Apprenez", "Guide pour".
MAUVAIS : "Découvrez comment optimiser votre GBP pour le SEO local"
BON : "Le Google Business Profile génère 5x plus de visites en magasin qu'un site web seul. Guide complet d'optimisation pour PME."`;

  sysMsg += reinforcement;
  agentNode.parameters.options.systemMessage = sysMsg;
  console.log('✓ System prompt reinforced (+examples BON/MAUVAIS, +links, +FAQ, +meta desc)');

  // ===================================================================
  // 4. RENAME TO v10
  // ===================================================================
  workflow.name = workflow.name.replace(/v\d+/, 'v10');
  console.log(`✓ Workflow renamed to: ${workflow.name}`);

  // ===================================================================
  // 5. PUSH
  // ===================================================================
  console.log('\nPushing to n8n API...');
  const result = await pushWorkflow(workflow);
  console.log(`\n✓ Workflow "${result.name}" updated successfully`);
  console.log(`  ID: ${result.id}`);
  console.log(`  Nodes: ${result.nodes.length}`);
  console.log(`  Updated: ${result.updatedAt}`);
}

main().catch(e => { console.error('✗ Error:', e.message); process.exit(1); });
