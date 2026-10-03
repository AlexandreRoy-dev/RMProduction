/* Bandeau Loi 25 (repris du site actuel, RMProduction/consent.js). Les scripts type="text/plain" data-consent restent inactifs sans accord. */
(function () {
    var STORAGE_KEY = 'royMarketingConsent';
    var VERSION = 1;
    var root = null, prefs = null, lastFocus = null;

    function read() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (!data || data.v !== VERSION || typeof data.timestamp !== 'number') return null;
            return { v: VERSION, timestamp: data.timestamp, analytics: !!data.analytics, marketing: !!data.marketing };
        } catch (err) { return null; }
    }
    function isCurrent(record) {
        if (!record) return false;
        var expires = new Date(record.timestamp);
        expires.setMonth(expires.getMonth() + 12);
        return Date.now() <= expires.getTime();
    }
    function write(choice) {
        var record = { v: VERSION, timestamp: Date.now(), analytics: !!choice.analytics, marketing: !!choice.marketing };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch (err) { /* Navigation privée */ }
        return record;
    }
    function activate(category) {
        var nodes = document.querySelectorAll('script[type="text/plain"][data-consent="' + category + '"]');
        Array.prototype.forEach.call(nodes, function (node) {
            if (node.getAttribute('data-consent-loaded') === 'true') return;
            var el = document.createElement('script');
            var src = node.getAttribute('data-src');
            if (src) el.src = src;
            var code = node.textContent || '';
            if (!src && code.trim()) el.text = code;
            el.async = true;
            node.setAttribute('data-consent-loaded', 'true');
            node.parentNode.insertBefore(el, node.nextSibling);
        });
    }
    function apply(choice) {
        if (!choice) return;
        if (choice.analytics) activate('analytics');
        if (choice.marketing) activate('marketing');
    }
    function setExpanded(open) {
        var button = document.getElementById('rm-consent-customize');
        if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function openCustomize() {
        var saved = read();
        var analytics = document.getElementById('rm-consent-analytics');
        var marketing = document.getElementById('rm-consent-marketing');
        if (analytics) analytics.checked = !!(saved && saved.analytics && isCurrent(saved));
        if (marketing) marketing.checked = !!(saved && saved.marketing && isCurrent(saved));
        if (prefs) prefs.hidden = false;
        setExpanded(true);
        if (analytics) analytics.focus({ preventScroll: true });
    }
    function show(options) {
        options = options || {};
        if (!root) return;
        lastFocus = document.activeElement;
        root.hidden = false;
        if (options.customize) openCustomize();
        else if (prefs) {
            prefs.hidden = true;
            setExpanded(false);
            var reject = document.getElementById('rm-consent-reject');
            if (reject && options.focus !== false) reject.focus({ preventScroll: true });
        }
    }
    function hide() {
        if (!root) return;
        root.hidden = true;
        if (lastFocus && typeof lastFocus.focus === 'function' && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }
    function commit(choice) {
        var previous = read();
        var previousCurrent = isCurrent(previous);
        var record = write(choice);
        apply(record);
        hide();
        var revoked = previousCurrent && ((previous.marketing && !record.marketing) || (previous.analytics && !record.analytics));
        if (revoked) window.location.reload();
    }
    function render() {
        if (document.getElementById('rm-consent')) return;
        root = document.createElement('div');
        root.id = 'rm-consent';
        root.className = 'rm-consent';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'false');
        root.setAttribute('aria-labelledby', 'rm-consent-title');
        root.setAttribute('aria-describedby', 'rm-consent-desc');
        root.hidden = true;
        root.innerHTML =
            '<div class="rm-consent__panel">' +
                '<p class="rm-consent__kicker">Témoins</p>' +
                '<h2 id="rm-consent-title" class="rm-consent__title">Choix sur les témoins</h2>' +
                '<p id="rm-consent-desc" class="rm-consent__text">Les témoins analytiques et marketing restent bloqués tant que vous ne les avez pas acceptés. Les témoins essentiels servent seulement à retenir ce choix sur votre appareil. <a href="/politique-de-confidentialite">Politique de confidentialité</a>.</p>' +
                '<div class="rm-consent__actions">' +
                    '<button type="button" class="rm-consent__btn rm-consent__btn--reject" id="rm-consent-reject">Refuser</button>' +
                    '<button type="button" class="rm-consent__btn rm-consent__btn--accept" id="rm-consent-accept">Accepter</button>' +
                    '<button type="button" class="rm-consent__btn rm-consent__btn--customize" id="rm-consent-customize" aria-expanded="false" aria-controls="rm-consent-prefs">Personnaliser</button>' +
                '</div>' +
                '<div id="rm-consent-prefs" class="rm-consent__prefs" hidden role="group" aria-labelledby="rm-consent-prefs-title">' +
                    '<p id="rm-consent-prefs-title" class="rm-consent__prefs-title">Choisir par catégorie</p>' +
                    '<label class="rm-consent__choice"><input type="checkbox" id="rm-consent-essential" checked disabled><span>Essentiels</span><small>Toujours actifs. Ils retiennent votre décision dans ce navigateur. Ils ne servent pas à la publicité.</small></label>' +
                    '<label class="rm-consent__choice"><input type="checkbox" id="rm-consent-analytics"><span>Analytique</span><small>Mesure d\'audience. Aucun outil n\'est installé pour le moment. Un ajout futur resterait bloqué sans votre accord.</small></label>' +
                    '<label class="rm-consent__choice"><input type="checkbox" id="rm-consent-marketing"><span>Marketing</span><small>Publicité, dont le pixel Meta. Le script ne se charge qu\'avec votre accord.</small></label>' +
                    '<div class="rm-consent__actions"><button type="button" class="rm-consent__btn rm-consent__btn--save" id="rm-consent-save">Enregistrer mes choix</button></div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(root);
        prefs = document.getElementById('rm-consent-prefs');
        document.getElementById('rm-consent-reject').addEventListener('click', function () { commit({ analytics: false, marketing: false }); });
        document.getElementById('rm-consent-accept').addEventListener('click', function () { commit({ analytics: true, marketing: true }); });
        document.getElementById('rm-consent-customize').addEventListener('click', function () {
            if (prefs.hidden) openCustomize(); else { prefs.hidden = true; setExpanded(false); }
        });
        document.getElementById('rm-consent-save').addEventListener('click', function () {
            commit({ analytics: document.getElementById('rm-consent-analytics').checked, marketing: document.getElementById('rm-consent-marketing').checked });
        });
        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape' || !root || root.hidden) return;
            if (prefs && !prefs.hidden) {
                prefs.hidden = true; setExpanded(false);
                var customize = document.getElementById('rm-consent-customize');
                if (customize) customize.focus({ preventScroll: true });
                return;
            }
            if (isCurrent(read())) hide();
        });
        document.addEventListener('click', function (event) {
            var trigger = event.target && event.target.closest ? event.target.closest('[data-consent-manage]') : null;
            if (!trigger) return;
            event.preventDefault();
            show({ customize: true });
        });
    }
    function init() {
        render();
        var saved = read();
        if (isCurrent(saved)) { apply(saved); root.hidden = true; }
        else show({ customize: false, focus: false });
    }
    window.RoyConsent = { open: function () { show({ customize: true }); }, read: read };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
