// Global Variables
let allProducts = [];
let adminOrders = [];
let adminPromos = [];
let editingProductIndex = -1;

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// ===== Login =====
function adminLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadAdminData();
        switchTab('dashboard');
    } else {
        alert('❌ Invalid credentials!\nDefault: admin / admin123');
    }
}

function adminLogout() {
    if (confirm('Logout?')) {
        document.getElementById('login-modal').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }
}

// ===== Load Data =====
function loadAdminData() {
    fetch('products.json')
        .then(r => r.json())
        .then(data => {
            allProducts = data;
            updateInventory();
            updateProducts();
        });

    const saved = localStorage.getItem('adminOrders');
    adminOrders = saved ? JSON.parse(saved) : [];
    updateOrders();

    const promos = localStorage.getItem('adminPromos');
    adminPromos = promos ? JSON.parse(promos) : [
        { code: 'REDAMS10', type: 'percent', value: 10, uses: 0 },
        { code: 'SAVE50', type: 'fixed', value: 50, uses: 0 }
    ];
    updatePromos();
    updateStats();
}

// ===== Tab Switching =====
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(tab + '-content').classList.remove('hidden');
    
    document.querySelectorAll('.sidebar-btn').forEach(b => b.style.background = '');
    event.target.style.background = '#DC2626';
    
    if (tab === 'dashboard') updateStats();
}

// ===== Dashboard Stats =====
function updateStats() {
    const total = adminOrders.reduce((s, o) => s + parseInt(o.amount || 0), 0);
    const pending = adminOrders.filter(o => o.status === 'Pending').length;
    const outofstock = allProducts.filter(p => p.isOutOfStock).length;

    document.getElementById('stat-revenue').innerText = total.toLocaleString();
    document.getElementById('stat-orders').innerText = adminOrders.length;
    document.getElementById('stat-pending').innerText = pending;
    document.getElementById('stat-outofstock').innerText = outofstock;

    // Top products
    const topDiv = document.getElementById('top-products');
    if (topDiv) {
        topDiv.innerHTML = allProducts.slice(0, 5).map((p, i) => `
            <div class="flex justify-between p-3 bg-gray-50 rounded">
                <p class="font-bold text-sm">${i+1}. ${p.name.substring(0, 20)}</p>
                <p class="text-red-600 font-black">৳${p.price}</p>
            </div>
        `).join('');
    }

    // Chart
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

// ===== Orders =====
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
    document.getElementById('order-modal').classList.remove('hidden');
    document.getElementById('order-modal').classList.add('flex');
}

function saveOrder() {
    const name = document.getElementById('order-customer-name').value;
    const phone = document.getElementById('order-customer-phone').value;
    const amount = document.getElementById('order-amount').value;
    const status = document.getElementById('order-status').value;

    if (!name || !phone || !amount) {
        alert('Fill all fields!');
        return;
    }

    adminOrders.push({
        customerName: name,
        customerPhone: phone,
        amount: amount,
        status: status,
        date: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
    updateOrders();
    updateStats();
    closeModal('order-modal');

    document.getElementById('order-customer-name').value = '';
    document.getElementById('order-customer-phone').value = '';
    document.getElementById('order-amount').value = '';
}

// ===== Products =====
function updateProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = allProducts.map((p, i) => `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <img src="${p.images?.[0] || 'images/placeholder.jpg'}" class="w-full h-48 object-cover">
            <div class="p-4">
                <p class="font-bold text-sm line-clamp-2">${p.name}</p>
                <p class="text-lg font-black text-red-600 mt-2">৳${p.price}</p>
                <p class="text-xs text-gray-500 mt-1">${p.isOutOfStock ? '❌ Out of Stock' : '✓ Available'}</p>
                <button onclick="openEditProductModal(${i})" class="w-full mt-3 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
            </div>
        </div>
    `).join('');
}

function openAddProductModal() {
    editingProductIndex = -1;
    document.getElementById('product-modal-name').value = '';
    document.getElementById('product-modal-stock').value = '1';
    document.getElementById('product-modal-price').value = '';
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal').classList.add('flex');
}

function openEditProductModal(index) {
    editingProductIndex = index;
    const product = allProducts[index];
    document.getElementById('product-modal-name').value = product.name;
    document.getElementById('product-modal-stock').value = product.isOutOfStock ? '0' : '1';
    document.getElementById('product-modal-price').value = product.price;
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal').classList.add('flex');
}

function saveProduct() {
    const stock = parseInt(document.getElementById('product-modal-stock').value);
    const price = parseInt(document.getElementById('product-modal-price').value);

    if (!price || (stock !== 0 && stock !== 1)) {
        alert('Invalid stock or price!');
        return;
    }

    if (editingProductIndex === -1) {
        alert('Please edit existing products first. Add new products via products.json');
        return;
    }

    allProducts[editingProductIndex].isOutOfStock = stock === 0;
    allProducts[editingProductIndex].price = price;

    localStorage.setItem('adminProducts', JSON.stringify(allProducts));
    updateProducts();
    updateInventory();
    updateStats();
    closeModal('product-modal');
    alert('✓ Product updated!');
}

// ===== Inventory =====
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

// ===== Promos =====
function updatePromos() {
    const tbody = document.getElementById('promo-table');
    if (!tbody) return;

    tbody.innerHTML = adminPromos.map((p, i) => `
        <tr>
            <td class="px-6 py-4 font-bold text-red-600">${p.code}</td>
            <td class="px-6 py-4 text-sm">${p.type === 'delivery' ? 'Free' : (p.type === 'percent' ? '%' : '৳')}</td>
            <td class="px-6 py-4 font-bold">${p.type === 'delivery' ? 'FREE' : p.value}</td>
            <td class="px-6 py-4"><span class="text-xs text-gray-500">${p.uses} uses</span></td>
            <td class="px-6 py-4"><button onclick="deletePromo(${i})" class="text-red-600"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function openAddPromoModal() {
    document.getElementById('promo-modal').classList.remove('hidden');
    document.getElementById('promo-modal').classList.add('flex');
}

function savePromo() {
    const code = document.getElementById('promo-code').value.toUpperCase();
    const type = document.getElementById('promo-type').value;
    const value = document.getElementById('promo-value').value;

    if (!code || !value) {
        alert('Fill all fields!');
        return;
    }

    adminPromos.push({ code, type, value: parseInt(value), uses: 0 });
    localStorage.setItem('adminPromos', JSON.stringify(adminPromos));
    updatePromos();
    closeModal('promo-modal');
    alert('✓ Promo created!');
    
    document.getElementById('promo-code').value = '';
    document.getElementById('promo-value').value = '';
}

function deletePromo(i) {
    if (confirm('Delete?')) {
        adminPromos.splice(i, 1);
        localStorage.setItem('adminPromos', JSON.stringify(adminPromos));
        updatePromos();
    }
}

// ===== Modal Control =====
function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

// Initial Load
window.addEventListener('load', () => {
    document.getElementById('login-modal').classList.remove('hidden');
});
