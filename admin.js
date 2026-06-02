// ============================================
// COMPLETE ADMIN SYSTEM - FULL PRODUCT MANAGEMENT
// সম্পূর্ণ প্রোডাক্ট ম্যানেজমেন্ট সিস্টেম
// ============================================

let allProducts = [];
let adminOrders = [];
let adminPromos = [];
let editingProductIndex = -1;

const ADMIN_USERNAME = "redamsbd";
const ADMIN_PASSWORD = "redamsbd16";

// ===== LOGIN SYSTEM =====
function adminLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        localStorage.setItem('adminLoggedIn', 'true');
        loadAdminData();
        switchTab('dashboard');
    } else {
        alert('❌ Invalid credentials!\nUsername: redamsbd\nPassword: redamsbd16');
    }
}

function adminLogout() {
    if (confirm('Logout?')) {
        document.getElementById('login-modal').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        localStorage.removeItem('adminLoggedIn');
    }
}

// ===== LOAD ALL DATA =====
function loadAdminData() {
    const savedProducts = localStorage.getItem('adminProducts');
    if (savedProducts) {
        allProducts = JSON.parse(savedProducts);
    } else {
        fetch('products.json')
            .then(r => r.json())
            .then(data => {
                allProducts = data;
                localStorage.setItem('adminProducts', JSON.stringify(allProducts));
                updateAllTabs();
            })
            .catch(err => console.error('Error loading products:', err));
        return;
    }

    const saved = localStorage.getItem('adminOrders');
    adminOrders = saved ? JSON.parse(saved) : [];

    const promos = localStorage.getItem('adminPromos');
    adminPromos = promos ? JSON.parse(promos) : [
        { code: 'FREESHIP', type: 'delivery', value: 0, applicableCategories: [], uses: 0, maxUses: 0 },
        { code: 'REDAMS10', type: 'percent', value: 10, applicableCategories: [], uses: 0, maxUses: 0 },
        { code: 'SAVE50', type: 'fixed', value: 50, applicableCategories: [], uses: 0, maxUses: 0 },
        { code: 'DROPDROP15', type: 'percent', value: 15, applicableCategories: ['drop-shoulder'], uses: 0, maxUses: 0 }
    ];
    
    updateAllTabs();
}

function updateAllTabs() {
    updateInventory();
    updateProducts();
    updateOrders();
    updatePromos();
    updateStats();
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(tab + '-content').classList.remove('hidden');
    
    document.querySelectorAll('.sidebar-btn').forEach(b => b.style.background = '');
    event.target.style.background = '#DC2626';
    
    if (tab === 'dashboard') updateStats();
}

// ===== DASHBOARD STATS =====
function updateStats() {
    const total = adminOrders.reduce((s, o) => s + parseInt(o.amount || 0), 0);
    const pending = adminOrders.filter(o => o.status === 'Pending').length;
    const outofstock = allProducts.filter(p => p.isOutOfStock).length;

    document.getElementById('stat-revenue').innerText = total.toLocaleString();
    document.getElementById('stat-orders').innerText = adminOrders.length;
    document.getElementById('stat-pending').innerText = pending;
    document.getElementById('stat-outofstock').innerText = outofstock;

    const topDiv = document.getElementById('top-products');
    if (topDiv) {
        topDiv.innerHTML = allProducts.slice(0, 5).map((p, i) => `
            <div class="flex justify-between p-3 bg-gray-50 rounded">
                <p class="font-bold text-sm">${i+1}. ${p.name.substring(0, 20)}</p>
                <p class="text-red-600 font-black">৳${p.price}</p>
            </div>
        `).join('');
    }

    const ctx = document.getElementById('salesChart');
    if (ctx && window.Chart) {
        const data = new Array(30).fill(0);
        adminOrders.forEach(o => {
            const day = new Date(o.date).getDate();
            if (day <= 30) data[day-1] += parseInt(o.amount || 0);
        });

        if (window.salesChart) window.salesChart.destroy();
        window.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 30}, (_, i) => i+1),
                datasets: [{
                    label: 'Revenue',
                    data: data,
                    borderColor: '#DC2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
        });
    }
}

// ===== PRODUCTS MANAGEMENT =====
function updateProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = allProducts.map((p, i) => `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <img src="${p.images?.[0] || 'images/placeholder.jpg'}" class="w-full h-48 object-cover">
            <div class="p-4">
                <p class="font-bold text-sm line-clamp-2">${p.name}</p>
                <p class="text-xs text-gray-500 mb-2">${p.category}</p>
                <p class="text-lg font-black text-red-600 mt-2">৳${p.price}</p>
                <p class="text-xs text-gray-500 mt-1">${p.isOutOfStock ? '❌ Out of Stock' : '✓ Available'}</p>
                <div class="flex gap-2 mt-3">
                    <button onclick="openEditProductModal(${i})" class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button onclick="deleteProduct(${i})" class="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-700">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openAddProductModal() {
    editingProductIndex = -1;
    document.getElementById('product-form-title').innerText = 'Add New Product';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-original-price').value = '';
    document.getElementById('product-category').value = '';
    document.getElementById('product-description').value = '';
    document.getElementById('product-colors').value = '';
    document.getElementById('product-sizes').value = '';
    document.getElementById('product-images').value = '';
    document.getElementById('product-stock').value = '1';
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal').classList.add('flex');
}

function openEditProductModal(index) {
    editingProductIndex = index;
    const product = allProducts[index];
    document.getElementById('product-form-title').innerText = 'Edit Product';
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-original-price').value = product.originalPrice || product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-colors').value = (product.colors || []).join(', ');
    document.getElementById('product-sizes').value = (product.sizes || []).map(s => typeof s === 'string' ? s : s.name).join(', ');
    document.getElementById('product-images').value = (product.images || []).join('\n');
    document.getElementById('product-stock').value = product.isOutOfStock ? '0' : '1';
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal').classList.add('flex');
}

function saveProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseInt(document.getElementById('product-price').value);
    const originalPrice = parseInt(document.getElementById('product-original-price').value);
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value.trim();
    const colors = document.getElementById('product-colors').value.split(',').map(c => c.trim()).filter(c => c);
    const sizesList = document.getElementById('product-sizes').value.split(',').map(s => s.trim()).filter(s => s);
    const images = document.getElementById('product-images').value.split('\n').map(i => i.trim()).filter(i => i);
    const stock = parseInt(document.getElementById('product-stock').value);

    if (!name || !price || !category) {
        alert('Please fill Product Name, Price, and Category!');
        return;
    }

    const sizes = sizesList.map(s => ({ name: s, available: true }));
    const productData = {
        id: editingProductIndex === -1 ? allProducts.length + 1 : allProducts[editingProductIndex].id,
        name,
        price,
        originalPrice: originalPrice || price,
        category,
        description: description || "Premium quality product",
        isOutOfStock: stock === 0,
        colors,
        sizes,
        images: images.length > 0 ? images : ['images/placeholder.jpg']
    };

    if (editingProductIndex === -1) {
        allProducts.push(productData);
        alert('✓ Product added successfully!');
    } else {
        allProducts[editingProductIndex] = productData;
        alert('✓ Product updated successfully!');
    }

    localStorage.setItem('adminProducts', JSON.stringify(allProducts));
    updateAllTabs();
    closeModal('product-modal');
}

function deleteProduct(index) {
    if (confirm('Delete this product? This action cannot be undone.')) {
        allProducts.splice(index, 1);
        localStorage.setItem('adminProducts', JSON.stringify(allProducts));
        updateAllTabs();
        alert('✓ Product deleted!');
    }
}

// ===== INVENTORY MANAGEMENT =====
function updateInventory() {
    const tbody = document.getElementById('inventory-table');
    if (!tbody) return;

    tbody.innerHTML = allProducts.map((p, i) => `
        <tr>
            <td class="px-6 py-4 font-bold text-sm">${p.name}</td>
            <td class="px-6 py-4 text-sm">${p.category}</td>
            <td class="px-6 py-4"><span class="text-xs font-bold px-3 py-1 rounded-full ${p.isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">${p.isOutOfStock ? 'Out' : 'In Stock'}</span></td>
            <td class="px-6 py-4"><button onclick="openEditProductModal(${i})" class="text-red-600 font-bold text-sm"><i class="fa-solid fa-pen"></i></button></td>
        </tr>
    `).join('');
}

// ===== ORDERS MANAGEMENT =====
function updateOrders() {
    const tbody = document.getElementById('orders-table');
    if (!tbody) return;

    if (adminOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8">No orders</td></tr>';
        return;
    }

    tbody.innerHTML = adminOrders.map((o, i) => `
        <tr>
            <td class="px-6 py-4 font-bold">#${i+1}</td>
            <td class="px-6 py-4"><p class="font-bold">${o.customerName}</p><p class="text-xs text-gray-500">${o.customerPhone}</p></td>
            <td class="px-6 py-4 font-bold">৳${o.amount}</td>
            <td class="px-6 py-4">
                <select onchange="updateOrderStatus(${i}, this.value)" class="text-xs font-bold px-2 py-1 rounded border-2 ${
                    o.status === 'Delivered' ? 'bg-green-100 border-green-600' :
                    o.status === 'Shipped' ? 'bg-blue-100 border-blue-600' :
                    o.status === 'Confirmed' ? 'bg-yellow-100 border-yellow-600' :
                    'bg-red-100 border-red-600'
                }">
                    <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">${o.date}</td>
            <td class="px-6 py-4"><button onclick="deleteOrder(${i})" class="text-red-600 font-bold"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function updateOrderStatus(i, status) {
    adminOrders[i].status = status;
    localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
    updateOrders();
    updateStats();
}

function deleteOrder(i) {
    if (confirm('Delete this order?')) {
        adminOrders.splice(i, 1);
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        updateOrders();
        updateStats();
    }
}

function openAddOrderModal() {
    document.getElementById('order-customer-name').value = '';
    document.getElementById('order-customer-phone').value = '';
    document.getElementById('order-items').value = '';
    document.getElementById('order-amount').value = '';
    document.getElementById('order-status').value = 'Pending';
    document.getElementById('order-modal').classList.remove('hidden');
    document.getElementById('order-modal').classList.add('flex');
}

function saveOrder() {
    const name = document.getElementById('order-customer-name').value.trim();
    const phone = document.getElementById('order-customer-phone').value.trim();
    const items = document.getElementById('order-items').value.trim();
    const amount = document.getElementById('order-amount').value.trim();
    const status = document.getElementById('order-status').value;

    if (!name || !phone || !amount) {
        alert('Fill all required fields!');
        return;
    }

    adminOrders.push({
        customerName: name,
        customerPhone: phone,
        items: items,
        amount: amount,
        status: status,
        date: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
    updateOrders();
    updateStats();
    closeModal('order-modal');
    alert('✓ Order added!');
}

// ===== PROMO MANAGEMENT =====
function updatePromos() {
    const tbody = document.getElementById('promo-table');
    if (!tbody) return;

    tbody.innerHTML = adminPromos.map((p, i) => {
        const categoryText = p.applicableCategories && p.applicableCategories.length > 0 
            ? p.applicableCategories.join(', ') 
            : 'All Products';
        
        return `
        <tr>
            <td class="px-6 py-4 font-bold text-red-600">${p.code}</td>
            <td class="px-6 py-4 text-sm">${p.type === 'delivery' ? 'Free Delivery' : (p.type === 'percent' ? 'Percentage (%)' : 'Fixed (৳)')}</td>
            <td class="px-6 py-4 font-bold">${p.type === 'delivery' ? 'FREE' : p.value}</td>
            <td class="px-6 py-4 text-xs text-gray-600">${categoryText}</td>
            <td class="px-6 py-4"><span class="text-xs text-gray-500">${p.uses}/${p.maxUses === 0 ? '∞' : p.maxUses}</span></td>
            <td class="px-6 py-4">
                <button onclick="deletePromo(${i})" class="text-red-600 font-bold text-sm"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `}).join('');
}

function getCategories() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    return categories;
}

function openAddPromoModal() {
    const categories = getCategories();
    const categoryOptions = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    document.getElementById('promo-code').value = '';
    document.getElementById('promo-type').value = 'percent';
    document.getElementById('promo-value').value = '';
    document.getElementById('promo-max-uses').value = '0';
    document.getElementById('promo-categories').innerHTML = `
        <p class="text-xs font-bold mb-2">Select categories (leave empty for all products):</p>
        <select multiple class="w-full border rounded p-2">${categoryOptions}</select>
    `;
    document.getElementById('promo-modal').classList.remove('hidden');
    document.getElementById('promo-modal').classList.add('flex');
}

function savePromo() {
    const code = document.getElementById('promo-code').value.toUpperCase().trim();
    const type = document.getElementById('promo-type').value;
    const value = parseInt(document.getElementById('promo-value').value);
    const maxUses = parseInt(document.getElementById('promo-max-uses').value) || 0;
    
    // Get selected categories
    const selects = document.getElementById('promo-categories').querySelectorAll('option:checked');
    let applicableCategories = [];
    selects.forEach(opt => {
        if (opt.value) applicableCategories.push(opt.value);
    });

    if (!code || !value) {
        alert('Fill all fields!');
        return;
    }

    if (adminPromos.some(p => p.code === code)) {
        alert('Promo code already exists!');
        return;
    }

    adminPromos.push({ code, type, value, applicableCategories, uses: 0, maxUses });
    localStorage.setItem('adminPromos', JSON.stringify(adminPromos));
    updatePromos();
    closeModal('promo-modal');
    alert('✓ Promo created!');
}

function deletePromo(i) {
    if (confirm('Delete this promo?')) {
        adminPromos.splice(i, 1);
        localStorage.setItem('adminPromos', JSON.stringify(adminPromos));
        updatePromos();
    }
}

// ===== MODAL CONTROL =====
function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

// ===== INITIALIZE =====
window.addEventListener('load', () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        document.getElementById('login-modal').classList.remove('hidden');
    } else {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadAdminData();
        switchTab('dashboard');
    }
});