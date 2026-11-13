(function() {
    // Inject Search CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .btn-search-trigger {
            background: #0284C7;
            color: #FFFFFF !important;
            border: 1px solid #38BDF8;
            padding: 7px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);
        }
        .btn-search-trigger:hover {
            background: #0369A1;
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
            transform: translateY(-1px);
        }
        .search-modal-backdrop {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            z-index: 9998;
            display: none;
        }
        .search-modal {
            position: fixed;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 720px;
            background: #FFFFFF;
            border-radius: 14px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0,0,0,0.1);
            z-index: 9999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Inter', system-ui, sans-serif;
            animation: modalFadeIn 0.2s ease-out;
        }
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translate(-50%, -10px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        .search-modal-header {
            display: flex;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #E2E8F0;
            background: #F8FAFC;
            gap: 12px;
        }
        .search-modal-header input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 16px;
            color: #0F172A;
            outline: none;
            font-family: inherit;
        }
        .search-close-btn {
            background: none;
            border: none;
            font-size: 20px;
            color: #94A3B8;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            line-height: 1;
        }
        .search-close-btn:hover {
            color: #0F172A;
            background: #E2E8F0;
        }
        .search-results-box {
            max-height: 60vh;
            overflow-y: auto;
            padding: 12px 16px;
        }
        .search-result-item {
            display: block;
            text-decoration: none;
            padding: 12px 14px;
            border-radius: 8px;
            border-bottom: 1px solid #F1F5F9;
            transition: background 0.15s ease;
        }
        .search-result-item:hover, .search-result-item.selected {
            background: #F0F9FF;
            outline: 2px solid #38BDF8;
        }
        .search-res-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 7px;
            border-radius: 4px;
            background: #E0F2FE;
            color: #0369A1;
            margin-bottom: 4px;
        }
        .search-res-title {
            font-weight: 600;
            font-size: 14px;
            color: #0F172A;
            margin-bottom: 4px;
        }
        .search-res-snippet {
            font-size: 13px;
            color: #64748B;
            line-height: 1.5;
        }
        .search-res-snippet mark {
            background: #FEF08A;
            color: #854D0E;
            font-weight: 600;
            padding: 1px 3px;
            border-radius: 2px;
        }
        .search-empty-state {
            padding: 32px 16px;
            text-align: center;
            color: #94A3B8;
            font-size: 14px;
        }
        .search-footer {
            padding: 8px 16px;
            background: #F8FAFC;
            border-top: 1px solid #E2E8F0;
            font-size: 11px;
            color: #94A3B8;
            display: flex;
            justify-content: space-between;
        }
    `;
    document.head.appendChild(style);

    // Create Modal Elements
    const backdrop = document.createElement('div');
    backdrop.className = 'search-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-header">
            <span style="font-size: 18px;">🔍</span>
            <input type="text" id="efic-search-field" placeholder="Zoek op begrip, auteur, test, medicijn (bijv. ID-Pain, Le Bars, DNIC)..." autocomplete="off">
            <button class="search-close-btn" id="efic-modal-close">&times;</button>
        </div>
        <div class="search-results-box" id="efic-search-list">
            <div class="search-empty-state">Typ minimaal 2 letters om te zoeken door alle 11 studiegidsen...</div>
        </div>
        <div class="search-footer">
            <span>Druk op <b>ESC</b> om te sluiten &bull; Sneltoetsen: <b>/</b> of <b>Ctrl+Shift+K</b> (of <b>Ctrl+K</b>)</span>
            <span>↑ ↓ navigeren &bull; ↵ openen</span>
        </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    let searchIndex = null;

    // Load search index
    async function loadIndex() {
        if (searchIndex) return searchIndex;
        try {
            const basePath = window.location.pathname.includes('/efic/') ? '/efic/' : './';
            const res = await fetch(basePath + 'search_index.json');
            searchIndex = await res.json();
            return searchIndex;
        } catch (e) {
            console.error('Failed to load EFIC search index:', e);
            return [];
        }
    }

    function openModal() {
        backdrop.style.display = 'block';
        modal.style.display = 'flex';
        const input = document.getElementById('efic-search-field');
        input.value = '';
        input.focus();
        loadIndex();
    }

    function closeModal() {
        backdrop.style.display = 'none';
        modal.style.display = 'none';
    }

    backdrop.addEventListener('click', closeModal);
    document.getElementById('efic-modal-close').addEventListener('click', closeModal);

    function isInputElement(el) {
        if (!el) return false;
        const tag = el.tagName ? el.tagName.toUpperCase() : '';
        return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    }

    function updateSelection(items, index) {
        items.forEach((item, idx) => {
            if (idx === index) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Keyboard Shortcuts (Ctrl+K, Cmd+K, Ctrl+Shift+K, Alt+K, /)
    function handleKeydown(e) {
        if (!e) return;
        const key = e.key ? e.key.toLowerCase() : '';
        const code = e.code || '';
        const isK = key === 'k' || code === 'KeyK' || e.keyCode === 75;
        const isSlash = key === '/' || code === 'Slash';
        const isEscape = key === 'escape' || code === 'Escape' || e.keyCode === 27;

        const isInputFocused = isInputElement(document.activeElement);

        // Open/toggle shortcuts:
        // - Ctrl+K or Cmd+K
        // - Ctrl+Shift+K or Cmd+Shift+K (immune to Chrome Windows Omnibox intercept)
        // - Alt+K
        // - Single key '/' when not inside an input/textarea
        const isCtrlK = (e.ctrlKey || e.metaKey) && isK;
        const isAltK = e.altKey && isK;
        const isBareSlash = isSlash && !isInputFocused;

        if (isCtrlK || isAltK || isBareSlash) {
            e.preventDefault();
            e.stopPropagation();
            if (modal.style.display === 'flex' && (isCtrlK || isAltK)) {
                closeModal();
            } else if (modal.style.display !== 'flex') {
                openModal();
            }
            return;
        }

        // Escape closes modal
        if (isEscape && modal.style.display === 'flex') {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            return;
        }

        // Arrow navigation and Enter in search results
        if (modal.style.display === 'flex') {
            const searchList = document.getElementById('efic-search-list');
            const items = searchList ? searchList.querySelectorAll('.search-result-item') : [];
            if (!items.length) return;

            let selectedIndex = -1;
            items.forEach((item, idx) => {
                if (item.classList.contains('selected')) selectedIndex = idx;
            });

            if (key === 'arrowdown' || code === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelection(items, selectedIndex);
            } else if (key === 'arrowup' || code === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateSelection(items, selectedIndex);
            } else if ((key === 'enter' || code === 'Enter') && selectedIndex >= 0) {
                e.preventDefault();
                items[selectedIndex].click();
            }
        }
    }

    // Attach with capture: true on both window and document to intercept before browser or bubbling
    window.addEventListener('keydown', handleKeydown, true);
    document.addEventListener('keydown', handleKeydown, true);

    // Add search trigger to top bar
    function injectTrigger() {
        const topActions = document.querySelector('.top-bar .actions');
        if (topActions && !document.getElementById('efic-search-nav-btn')) {
            const btn = document.createElement('button');
            btn.id = 'efic-search-nav-btn';
            btn.className = 'btn-search-trigger';
            btn.innerHTML = '🔍 Zoeken <kbd style="background: rgba(255,255,255,0.25); font-size:10px; padding:2px 5px; border-radius:3px;">/</kbd> <kbd style="background: rgba(255,255,255,0.25); font-size:10px; padding:2px 5px; border-radius:3px;">Ctrl+K</kbd>';
            btn.addEventListener('click', openModal);
            topActions.insertBefore(btn, topActions.firstChild);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectTrigger);
    } else {
        injectTrigger();
    }

    // Search Logic
    const searchInput = document.getElementById('efic-search-field');
    const searchList = document.getElementById('efic-search-list');

    function highlightText(text, words) {
        if (!words.length) return text;
        const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')).join('|')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    searchInput.addEventListener('input', async (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (q.length < 2) {
            searchList.innerHTML = '<div class="search-empty-state">Typ minimaal 2 letters om te zoeken door alle 11 studiegidsen...</div>';
            return;
        }

        const data = await loadIndex();
        const words = q.split(/\s+/).filter(w => w.length > 0);

        const results = [];
        for (const item of data) {
            const mod = item.module.toLowerCase();
            const sec = item.section.toLowerCase();
            const txt = item.text.toLowerCase();
            const blob = `${mod} ${sec} ${txt}`;

            if (words.every(w => blob.includes(w))) {
                let score = 0;
                if (sec.includes(q)) score += 50;
                if (txt.includes(q)) score += 20;
                for (const w of words) {
                    if (sec.includes(w)) score += 10;
                    score += (txt.match(new RegExp(w, 'g')) || []).length;
                }
                results.push({ score, item });
            }
        }

        results.sort((a, b) => b.score - a.score);

        if (!results.length) {
            searchList.innerHTML = `<div class="search-empty-state">Geen resultaten gevonden voor "<b>${q}</b>". Probeer een synoniem of kortere term.</div>`;
            return;
        }

        const basePath = window.location.pathname.includes('/efic/') ? '/efic/' : './';
        let html = '';
        for (const res of results.slice(0, 15)) {
            const item = res.item;
            const fullTxt = item.text;
            const firstWord = words[0];
            const idx = fullTxt.toLowerCase().indexOf(firstWord);
            let snippet = '';
            if (idx !== -1) {
                const start = Math.max(0, idx - 60);
                const end = Math.min(fullTxt.length, idx + 140);
                snippet = (start > 0 ? '...' : '') + fullTxt.slice(start, end).trim() + (end < fullTxt.length ? '...' : '');
            } else {
                snippet = fullTxt.slice(0, 180) + '...';
            }

            const highlightedTitle = highlightText(item.section, words);
            const highlightedSnippet = highlightText(snippet, words);

            html += `
                <a href="${basePath}${item.page}" class="search-result-item">
                    <span class="search-res-badge">${item.module}</span>
                    <div class="search-res-title">${highlightedTitle}</div>
                    <div class="search-res-snippet">${highlightedSnippet}</div>
                </a>
            `;
        }

        searchList.innerHTML = html;
    });
})();
