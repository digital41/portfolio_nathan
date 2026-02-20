/**
 * Update n8n Blog Automation Pipeline v8 → v9
 * 3 modifications:
 * 1. Agent IA system prompt: add GEO rules + howTo output field
 * 2. Assembler HTML: enrich Person schema + add HowTo JSON-LD
 * 3. Selectionner Sujet: add supply-chain solution
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://n8n.srv1014329.hstgr.cloud';
const API_KEY = process.env.N8N_API_KEY;
const WORKFLOW_ID = 'eHUIv96VOtDCwhZc';

// Read the fetched workflow
const wfPath = path.join(process.env.TEMP, 'n8n-wf.json');
const workflow = JSON.parse(fs.readFileSync(wfPath, 'utf-8'));

// =====================================================================
// 1. MODIFY AGENT IA SYSTEM PROMPT
// =====================================================================
const agentNode = workflow.nodes.find(n => n.name === 'Agent IA - Redacteur Blog');
if (!agentNode) throw new Error('Agent node not found');

const currentSystemMsg = agentNode.parameters.options.systemMessage;

// Add howTo field to the JSON output example (before the closing })
const oldJsonEnd = `  "wordCount": 2200\n}`;
const newJsonEnd = `  "wordCount": 2200,\n  "howTo": null\n}`;

let newSystemMsg = currentSystemMsg.replace(oldJsonEnd, newJsonEnd);

// Add GEO rules and howTo documentation at the end
const geoRules = `

CHAMP OPTIONNEL "howTo" :
Si l'article contient une section "numbered_steps" avec une méthodologie en étapes, ajoute un champ "howTo" dans le JSON :
"howTo": {
  "name": "Titre de la méthodologie",
  "description": "Description en 1-2 phrases",
  "steps": [{ "name": "Nom court de l'étape", "text": "Description actionnable de l'étape en 1-2 phrases." }]
}
Si l'article n'a pas de méthodologie en étapes, mettre "howTo": null.

RÈGLES GEO (Generative Engine Optimization) — OBLIGATOIRES :
1. DÉFINITIONS DÉCLARATIVES : Chaque section H2 doit commencer par une définition factuelle et citable. Pas "Découvrez comment..." mais "Le GEO est..." / "Un agent IA autonome est...". Les 2-3 premières phrases de chaque section doivent pouvoir être extraites par une IA comme réponse à une question.
2. STATISTIQUES QUANTIFIÉES : Inclure au moins une donnée chiffrée vérifiable dans chaque section (pourcentages, euros, délais, comparatifs).
3. TON EXPERT FACTUEL : Zéro slogans, zéro superlatifs creux. Tu écris comme un CIO qui partage son expertise technique, pas comme un commercial. Pas de "Découvrez comment...", "N'hésitez pas à...", "Il est important de...".
4. CONTENU CITABLE : Chaque H2 doit pouvoir être reformulé comme une question que la cible poserait à ChatGPT. La réponse complète doit être dans les 2-3 premières phrases du paragraphe suivant.
5. STRUCTURE SCHEMA.ORG FRIENDLY : Les FAQ doivent avoir des réponses autonomes (compréhensibles sans lire le reste de l'article). Chaque réponse FAQ doit faire 2-4 phrases factuelles.`;

newSystemMsg = newSystemMsg + geoRules;
agentNode.parameters.options.systemMessage = newSystemMsg;
console.log('✓ Agent IA system prompt updated (+GEO rules, +howTo field)');

// =====================================================================
// 2. MODIFY ASSEMBLER HTML
// =====================================================================
const htmlNode = workflow.nodes.find(n => n.name === 'Assembler HTML');
if (!htmlNode) throw new Error('Assembler HTML node not found');

let jsCode = htmlNode.parameters.jsCode;

// 2a. Enrich Person schema in BlogPosting JSON-LD
const oldAuthor = `"author": { "@type": "Person", "name": "Nathan Ibgui", "jobTitle": "CIO Executive", "url": "https://nathanibgui.com" },`;
const newAuthor = `"author": { "@type": "Person", "name": "Nathan Ibgui", "jobTitle": "CIO Executive", "url": "https://nathanibgui.com", "sameAs": ["https://fr.linkedin.com/in/nathan-ibgui"], "knowsAbout": ["Intelligence artificielle", "Automatisation", "Transformation digitale", "Management IT", "Stratégie marketing digitale"] },`;

if (jsCode.includes(oldAuthor)) {
  jsCode = jsCode.replace(oldAuthor, newAuthor);
  console.log('✓ Person schema enriched (sameAs + knowsAbout)');
} else {
  console.log('⚠ Person schema pattern not found - skipping');
}

// 2b. Add HowTo JSON-LD generation after the FAQPage JSON-LD
// Find the faqJsonLd variable and add howToJsonLd after it
const faqJsonLdLine = `const faqJsonLd = JSON.stringify({`;
const faqJsonLdEnd = `});\n\n// Article tags meta`;

if (jsCode.includes(faqJsonLdEnd)) {
  const howToBlock = `});

// HowTo JSON-LD (if article has methodological steps)
let howToJsonLdScript = '';
if (article.howTo && article.howTo.steps && article.howTo.steps.length > 0) {
  const howToJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": article.howTo.name,
    "description": article.howTo.description,
    "step": article.howTo.steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.name,
      "text": s.text
    }))
  });
  howToJsonLdScript = '\\n    <script type="application/ld+json">\\n    ' + howToJsonLd + '\\n    </script>';
}

// Article tags meta`;

  jsCode = jsCode.replace(faqJsonLdEnd, howToBlock);
  console.log('✓ HowTo JSON-LD generation added');
} else {
  console.log('⚠ FAQ JSON-LD pattern not found - skipping');
}

// 2c. Insert the HowTo script tag in the HTML template after the FAQPage script
const faqScriptInHtml = `    \${faqJsonLd}\n    </script>`;
const faqScriptWithHowTo = `    \${faqJsonLd}\n    </script>\${howToJsonLdScript}`;

if (jsCode.includes(faqScriptInHtml)) {
  jsCode = jsCode.replace(faqScriptInHtml, faqScriptWithHowTo);
  console.log('✓ HowTo script tag inserted in HTML template');
} else {
  console.log('⚠ FAQ script pattern not found in HTML template - trying alternative');
  // Try alternative pattern
  const alt = '${faqJsonLd}\n    </script>';
  const altNew = '${faqJsonLd}\n    </script>${howToJsonLdScript}';
  if (jsCode.includes(alt)) {
    jsCode = jsCode.replace(alt, altNew);
    console.log('✓ HowTo script tag inserted (alt pattern)');
  }
}

htmlNode.parameters.jsCode = jsCode;

// =====================================================================
// 3. MODIFY SELECTIONNER SUJET - add supply-chain
// =====================================================================
const topicNode = workflow.nodes.find(n => n.name === 'Selectionner Sujet');
if (!topicNode) throw new Error('Selectionner Sujet node not found');

let topicCode = topicNode.parameters.jsCode;

// Check if supply-chain is already present
if (!topicCode.includes('supply-chain')) {
  const insertAfter = `{ slug: 'publicite-digitale', label: 'Publicite Digitale (Google Ads, Meta Ads)', color: 'amber', icon: 'fa-ad' }`;
  const insertNew = `{ slug: 'publicite-digitale', label: 'Publicite Digitale (Google Ads, Meta Ads)', color: 'amber', icon: 'fa-ad' },\n  { slug: 'supply-chain', label: 'Supply Chain & Operations', color: 'teal', icon: 'fa-truck-fast' }`;

  if (topicCode.includes(insertAfter)) {
    topicCode = topicCode.replace(insertAfter, insertNew);
    topicNode.parameters.jsCode = topicCode;
    console.log('✓ supply-chain solution added to topic selector');
  } else {
    console.log('⚠ Could not find insertion point for supply-chain');
  }
} else {
  console.log('✓ supply-chain already present');
}

// =====================================================================
// 4. Update workflow name to v9
// =====================================================================
workflow.name = workflow.name.replace('v8', 'v9');
console.log('✓ Workflow renamed to v9');

// =====================================================================
// 5. PUSH via n8n API
// =====================================================================
// Only send settings properties the API accepts
const cleanSettings = { executionOrder: workflow.settings.executionOrder };
const payload = JSON.stringify({
  name: workflow.name,
  nodes: workflow.nodes,
  connections: workflow.connections,
  settings: cleanSettings
});

const url = new URL(`${API_BASE}/api/v1/workflows/${WORKFLOW_ID}`);
const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': API_KEY,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      const result = JSON.parse(body);
      console.log(`\n✓ Workflow "${result.name}" updated successfully`);
      console.log(`  ID: ${result.id}`);
      console.log(`  Nodes: ${result.nodes.length}`);
      console.log(`  Updated: ${result.updatedAt}`);
    } else {
      console.error(`\n✗ API error ${res.statusCode}:`, body.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(payload);
req.end();
