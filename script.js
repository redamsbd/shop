// ===== Simple client-side search =====
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
}

function openSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    if (!overlay || !input) return;
    overlay.classList.remove('hidden');
    if (overlay.classList.contains('opacity-0')) {
        overlay.classList.remove('opacity-0');
    }
    input.value = '';
    setTimeout(() => input.focus(), 50);
}

function closeSearch() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    const isShopPage = window.location.pathname.toLowerCase().includes('shop.html');
    if (isShopPage) {
        const selectedCat = new URLSearchParams(window.location.search).get('cat');
        if (selectedCat) {
            const filtered = allProducts.filter(p => p.category && p.category.trim().toLowerCase() === selectedCat.trim().toLowerCase());
            displayProducts(filtered, true);
        } else {
            displayProducts(allProducts, true);
        }
    } else {
        displayProducts(allProducts, false);
        renderNewArrivals(allProducts);
    }
    const info = document.getElementById('search-results-info');
    if (info) info.classList.add('hidden');
}

function performSearch(query) {
    const q = (query || '').trim().toLowerCase();
    const info = document.getElementById('search-results-info');

    if (!q) {
        if (info) {
            info.innerText = "Please type something to search.";
            info.classList.remove('hidden');
        }
        return;
    }

    const results = allProducts.filter(p => {
        const name = (p.name || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const desc = stripHtml(p.description || '').toLowerCase();
        const colors = (p.colors || []).join(' ').toLowerCase();
        return name.includes(q) || category.includes(q) || desc.includes(q) || colors.includes(q);
    });

    displayProducts(results, true);

    if (info) {
        info.innerText = `${results.length} result(s) for "${query}"`;
        info.classList.remove('hidden');
    }

    const overlay = document.getElementById('search-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// bind events
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-search');
    const closeBtn = document.getElementById('search-close');
    const goBtn = document.getElementById('search-go');
    const input = document.getElementById('search-input');

    if (openBtn) openBtn.addEventListener('click', openSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    if (goBtn && input) goBtn.addEventListener('click', () => performSearch(input.value));
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch(input.value);
            } else if (e.key === 'Escape') {
                closeSearch();
            }
        });
    }
});
