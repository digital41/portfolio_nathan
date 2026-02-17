/**
 * Shared Header & Footer Components
 * Auto-detects page context (root vs solutions/) via location.pathname
 */
var SiteComponents = (function () {
    'use strict';

    // --- Auto-detect context ---
    var path = location.pathname;
    var inSolutions = path.includes('/solutions/');
    var p = inSolutions ? '../' : '';           // prefix to root
    var s = inSolutions ? '' : 'solutions/';    // prefix to solutions/
    var cur = path.split('/').pop().replace(/\.html$/, '') || 'index';
    var isIndex = cur === 'index' || cur === '' || cur === '/';

    // Helper: link class with aria-current for active page
    function fLink(href, label, page) {
        var active = cur === page;
        return '<a href="' + href + '" class="text-sm ' +
            (active ? 'text-white font-bold' : 'text-slate-500 hover:text-white') +
            ' transition-colors"' + (active ? ' aria-current="page"' : '') + '>' + label + '</a>';
    }

    function fLinkIcon(href, icon, label, page, external) {
        var active = cur === page;
        var rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return '<a href="' + href + '"' + rel + ' class="text-sm ' +
            (active ? 'text-white font-bold' : 'text-slate-500 hover:text-white') +
            ' transition-colors flex items-center gap-2"' +
            (active ? ' aria-current="page"' : '') + '>' +
            '<i class="' + icon + '" aria-hidden="true"></i> ' + label + '</a>';
    }

    // --- Nav link prefix ---
    var nav = isIndex ? '#' : p + 'index.html#';

    // ==========================================================
    // HEADER
    // ==========================================================
    function header() {
        var isSimple = cur === 'mentions-legales' || cur === '404';
        var html = '';

        // Analytics (Umami Cloud - RGPD-friendly, no cookies)
        html += '<script defer src="https://cloud.umami.is/script.js" data-website-id="cedce968-49c4-4613-a89f-c967db893af0"><\/script>';

        // Skip to content
        html += '<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-blue-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:font-bold">Aller au contenu principal</a>';

        // Noscript
        html += '<noscript><div style="background:#1e3a8a;color:white;text-align:center;padding:16px;font-family:sans-serif;">Ce site fonctionne mieux avec JavaScript activé. <a href="https://calendly.com/ibguinathan/30min" style="color:#93c5fd;text-decoration:underline;">Réservez directement votre consultation ici.</a></div></noscript>';

        if (isSimple) {
            // Simple header: logo + theme toggle + back button
            html += '<header class="fixed top-0 w-full z-50 glass py-5 px-4 sm:px-8 flex justify-between items-center border-b border-white/5" style="background:rgba(11,17,32,0.92);backdrop-filter:blur(20px)" role="banner">';
            html += '<a href="' + p + 'index.html" class="premium-logo" aria-label="Nathan Ibgui - Accueil">Nathan<span>Ibgui.</span></a>';
            html += '<button class="theme-toggle" aria-label="Changer le thème"><i class="fas fa-moon"></i><i class="fas fa-sun"></i></button>';
            html += '<a href="' + p + 'index.html" class="bg-cobalt-gradient text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-900/40 border border-white/10">Retour à l\'accueil</a>';
            html += '</header>';
        } else {
            // Full header: logo + nav + theme toggle + CTA + mobile menu
            html += '<header class="fixed top-0 w-full z-50 glass py-5 px-4 sm:px-8 flex justify-between items-center border-b border-white/5" style="background:rgba(11,17,32,0.92);backdrop-filter:blur(20px)" role="banner">';
            html += '<a href="' + (isIndex ? '/' : p + 'index.html') + '" class="premium-logo" aria-label="Nathan Ibgui - Accueil">Nathan<span>Ibgui.</span></a>';

            // Desktop nav
            html += '<nav class="hidden lg:flex gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500" aria-label="Navigation principale">';
            html += '<a href="' + nav + 'vision" class="hover:text-white transition-colors duration-300">Vision</a>';
            html += '<a href="' + nav + 'audit" class="hover:text-white transition-colors duration-300">Diagnostic</a>';
            html += '<a href="' + nav + 'skills" class="hover:text-white transition-colors duration-300">Performance</a>';
            html += '<a href="' + nav + 'solutions" class="hover:text-white transition-colors duration-300">Solutions</a>';
            html += '<a href="' + nav + 'impact" class="hover:text-white transition-colors duration-300">Impact</a>';
            html += '</nav>';

            // Right side: theme toggle + CTA + hamburger
            html += '<div class="flex items-center gap-4">';
            html += '<button class="theme-toggle hidden lg:inline-flex" aria-label="Changer le thème"><i class="fas fa-moon"></i><i class="fas fa-sun"></i></button>';
            html += '<button onclick="Calendly.initPopupWidget({url: \'https://calendly.com/ibguinathan/30min\'});" class="hidden sm:inline-flex bg-cobalt-gradient text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-900/40 border border-white/10" aria-label="Réserver une consultation" data-ab="header-cta"><span data-ab-text>Consultation Call</span></button>';
            html += '<button @click="mobileMenu = !mobileMenu" class="lg:hidden text-white text-xl p-2" aria-label="Ouvrir le menu" :aria-expanded="mobileMenu.toString()"><i class="fas" :class="mobileMenu ? \'fa-times\' : \'fa-bars\'"></i></button>';
            html += '</div>';
            html += '</header>';

            // Mobile menu
            html += '<div x-show="mobileMenu" x-cloak x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-4" x-transition:enter-end="opacity-100 translate-y-0" x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 -translate-y-4" class="fixed top-[73px] inset-x-0 z-40 glass border-b border-white/5 p-6 lg:hidden" style="background:rgba(11,17,32,0.95);backdrop-filter:blur(20px)" @click.away="mobileMenu = false">';
            html += '<nav class="flex flex-col gap-6 text-sm font-bold uppercase tracking-widest text-slate-400" aria-label="Navigation mobile">';
            html += '<a href="' + nav + 'vision" @click="mobileMenu = false" class="hover:text-white transition-colors">Vision</a>';
            html += '<a href="' + nav + 'audit" @click="mobileMenu = false" class="hover:text-white transition-colors">Diagnostic</a>';
            html += '<a href="' + nav + 'skills" @click="mobileMenu = false" class="hover:text-white transition-colors">Performance</a>';
            html += '<a href="' + nav + 'solutions" @click="mobileMenu = false" class="hover:text-white transition-colors">Solutions</a>';
            html += '<a href="' + nav + 'impact" @click="mobileMenu = false" class="hover:text-white transition-colors">Impact</a>';
            html += '<button class="theme-toggle theme-toggle-mobile" @click="mobileMenu = false" aria-label="Changer le thème"><i class="fas fa-moon"></i><i class="fas fa-sun"></i><span>Thème</span></button>';
            html += '<button onclick="Calendly.initPopupWidget({url: \'https://calendly.com/ibguinathan/30min\'});" class="sm:hidden bg-cobalt-gradient text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest text-center" data-ab="header-cta"><span data-ab-text>Consultation Call</span></button>';
            html += '</nav>';
            html += '</div>';
        }

        return html;
    }

    // ==========================================================
    // FOOTER
    // ==========================================================
    function footer() {
        var html = '';

        html += '<footer class="py-12 sm:py-16 lg:py-20 border-t border-white/5 bg-black" style="background-color:#0a1020" role="contentinfo">';
        html += '<div class="max-w-7xl mx-auto px-4 sm:px-8">';
        html += '<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-16">';

        // Column 1: Brand
        html += '<div>';
        html += '<a href="' + (isIndex ? '/' : p + 'index.html') + '" class="premium-logo inline-block mb-4">Nathan<span>Ibgui.</span></a>';
        html += '<p class="text-sm text-slate-500 max-w-xs">CIO Executive & Architecte de Profit. Stratégie IA, automation et transformation digitale pour PME et ETI industrielles.</p>';
        html += '</div>';

        // Column 2: Solutions IT
        html += '<div>';
        html += '<h4 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Solutions IT</h4>';
        html += '<nav aria-label="Solutions IT" class="flex flex-col gap-3">';
        html += fLink(s + 'strategie-ia.html', 'Stratégie IA & Agents', 'strategie-ia');
        html += fLink(s + 'automation-n8n.html', 'Automation n8n', 'automation-n8n');
        html += fLink(s + 'audit-performance-it.html', 'Audit Performance IT', 'audit-performance-it');
        html += fLink(s + 'dsi-externalise.html', 'DSI Externalisé', 'dsi-externalise');
        html += fLink(s + 'data-erp.html', 'Data & ERP', 'data-erp');
        html += fLink(s + 'cybersecurite-infrastructure.html', 'Cybersécurité & Cloud', 'cybersecurite-infrastructure');
        html += '</nav>';
        html += '</div>';

        // Column 3: Marketing & Visibilité
        html += '<div>';
        html += '<h4 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Marketing & Visibilité</h4>';
        html += '<nav aria-label="Marketing et Visibilité" class="flex flex-col gap-3">';
        html += fLink(s + 'strategie-marketing-branding.html', 'Marketing & Branding', 'strategie-marketing-branding');
        html += fLink(s + 'seo-acquisition-digitale.html', 'SEO & Référencement', 'seo-acquisition-digitale');
        html += fLink(s + 'geo-referencement-ia.html', 'GEO Référencement IA', 'geo-referencement-ia');
        html += fLink(s + 'google-business-profile.html', 'Google Business Profile', 'google-business-profile');
        html += fLink(s + 'publicite-digitale.html', 'Publicité Digitale & Ads', 'publicite-digitale');
        html += '</nav>';
        html += '</div>';

        // Column 4: Contact & Legal
        html += '<div>';
        html += '<h4 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Contact</h4>';
        html += '<div class="flex flex-col gap-3">';
        html += fLinkIcon('https://fr.linkedin.com/in/nathan-ibgui', 'fab fa-linkedin', 'LinkedIn', '', true);
        html += fLinkIcon('https://www.instagram.com/nathan.ibgui/', 'fab fa-instagram', 'Instagram', '', true);
        html += fLinkIcon(p + 'contact.html', 'fas fa-envelope', 'Contact', 'contact', false);
        html += '<hr class="border-white/5 my-2">';
        html += fLink(p + 'mentions-legales.html', 'Mentions légales', 'mentions-legales');
        html += '<a href="' + p + 'mentions-legales.html#confidentialite" class="text-sm text-slate-500 hover:text-white transition-colors">Politique de confidentialité</a>';
        html += '</div>';
        html += '</div>';

        html += '</div>'; // grid

        // Copyright
        html += '<div class="border-t border-white/5 pt-8 text-center">';
        html += '<p class="text-[9px] text-white font-black uppercase tracking-[0.5em]">NathanIbgui. &bull; CIO &bull; STRATEGY & AUDIT &bull; 2026</p>';
        html += '</div>';

        html += '</div>'; // max-w
        html += '</footer>';

        // WhatsApp floating widget
        html += '<a href="https://wa.me/33618852010" target="_blank" rel="noopener noreferrer" class="whatsapp-widget" aria-label="Nous contacter sur WhatsApp" style="position:fixed;bottom:28px;right:28px;z-index:9999;width:56px;height:56px;border-radius:50%;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 4px 14px rgba(37,211,102,0.4);text-decoration:none">';
        html += '<i class="fab fa-whatsapp" aria-hidden="true"></i>';
        html += '</a>';

        return html;
    }

    // --- Copy protection ---
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'c' || e.key === 'a')) e.preventDefault();
        if (e.key === 'F12') e.preventDefault();
    });
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });

    return { header: header, footer: footer };
})();
