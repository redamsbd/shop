// =================================================================
// REDAMS EXECUTIVE MASTER ADMIN ENGINE (admin.js)
// =================================================================

// 1. FIREBASE INITIALIZATION
const firebaseConfig = {
    apiKey: "AIzaSyAg3XAOu45DdQ1lruqmOZtTboqfk8tfMjw",
    authDomain: "redams-61f66.firebaseapp.com",
    projectId: "redams-61f66",
    storageBucket: "redams-61f66.firebasestorage.app",
    messagingSenderId: "852974979706",
    appId: "1:852974979706:web:0f332bafadc653565fc9c3",
    measurementId: "G-59WMZ7870M"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 2. CLOUDINARY CONFIG
const CLOUD_NAME = "redamsbd";
const UPLOAD_PRESET = "redams_preset";

// Global State Arrays
let allProducts = [];
let allOrders = [];
let allPromos = [];
let allCourierShipments = [];
let allReviews = [];

// Mobile Drawer Toggle (Left-aligned Sidebar)
function toggleMobileSidebar() {
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-overlay');
    if (drawer) drawer.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
}

// 3. PERSISTENT AUTHENTICATION ENGINE
function checkAdminSession() {
    const session = localStorage.getItem('redams_admin_session');
    const loginModal = document.getElementById('login-modal');
    const dashboard = document.getElementById('dashboard');

    if (session === 'active') {
        if (loginModal) loginModal.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        initDashboard();
    } else {
        if (loginModal) loginModal.classList.remove('hidden');
        if (dashboard) dashboard.classList.add('hidden');
    }
}

function adminLogin() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    
    const storedUser = localStorage.getItem('redams_admin_user') || 'redamsbd';
    const storedPass = localStorage.getItem('redams_admin_pass') || 'redamsbd16';

    if (u === storedUser && p === storedPass) {
        localStorage.setItem('redams_admin_session', 'active');
        checkAdminSession();
        Swal.fire({ icon: 'success', title: 'WELCOME BACK!', timer: 1200, showConfirmButton: false });
    } else {
        Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Invalid Username or Password!' });
    }
}

function adminLogout() {
    localStorage.removeItem('redams_admin_session');
    checkAdminSession();
}

function openChangePasswordModal() {
    document.getElementById('old-pass').value = '';
    document.getElementById('new-pass').value = '';
    document.getElementById('confirm-pass').value = '';
    document.getElementById('change-password-modal').classList.add('active');
}

function saveNewPassword() {
    const oldP = document.getElementById('old-pass').value.trim();
    const newP = document.getElementById('new-pass').value.trim();
    const confirmP = document.getElementById('confirm-pass').value.trim();
    const currentPass = localStorage.getItem('redams_admin_pass') || 'redamsbd16';

    if (oldP !== currentPass) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Current password is incorrect!' });
        return;
    }
    if (newP.length < 6) {
        Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Password must be at least 6 characters.' });
        return;
    }
    if (newP !== confirmP) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'New passwords do not match!' });
        return;
    }

    localStorage.setItem('redams_admin_pass', newP);
    Swal.fire({ icon: 'success', title: 'Success!', text: 'Password updated successfully.' });
    closeModal('change-password-modal');
}

// 4. NAVIGATION TAB SWITCHING
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('sidebar-active'));
    
    const targetContent = document.getElementById(`${tabId}-content`);
    if (targetContent) targetContent.classList.remove('hidden');
    
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('sidebar-active');

    if (window.innerWidth < 768) {
        const drawer = document.getElementById('sidebar-drawer');
        const overlay = document.getElementById('sidebar-overlay');
        if (drawer) drawer.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function openAddProductModal() {
    const form = document.getElementById('product-form');
    if (form) form.reset();
    document.getElementById('product-edit-id').value = '';
    document.getElementById('product-form-title').innerText = 'Add New Product';
    document.getElementById('product-modal').classList.add('active');
}

function openAddOrderModal() { 
    const orderModal = document.getElementById('order-modal');
    if (orderModal) orderModal.classList.add('active'); 
}

function openAddPromoModal() { 
    const promoModal = document.getElementById('promo-modal');
    if (promoModal) promoModal.classList.add('active'); 
}

// 5. CLOUDINARY DIRECT FILE UPLOADER ENGINE
async function uploadFileToCloudinary(fileInput) {
    if (!fileInput || !fileInput.files[0]) return null;
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ? data.error.message : "Cloudinary upload failed");
    return data.secure_url;
}

// 6. REALTIME LISTENERS & DASHBOARD INIT
function initDashboard() {
    switchTab('dashboard');

    // Realtime Products Listener
    db.collection("products").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProductsTab();
        renderInventoryTab();
        updateStats();
    }, err => console.log("Products Sync Warning:", err));

    // Realtime Orders Listener
    db.collection("orders").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrdersTab();
        updateStats();
    }, err => console.log("Orders Sync Warning:", err));

    // Realtime Promos Listener
    db.collection("promos").onSnapshot(snapshot => {
        allPromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPromoTab();
    }, err => console.log("Promos Sync Warning:", err));

    // Realtime Courier Shipments Listener
    db.collection("courier_shipments").onSnapshot(snapshot => {
        allCourierShipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCourierTab();
    }, err => console.log("Courier Sync Warning:", err));

    // Realtime Customer Reviews Listener
    initAdminReviewManager();
}

// 7. SAVE & PUBLISH PRODUCT (Matches REDAMS Schema)
async function saveProduct(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('save-product-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Uploading to Cloud...';

    try {
        const editId = document.getElementById('product-edit-id').value;
        const imgFile = document.getElementById('product-img-file');
        const chartFile = document.getElementById('size-chart-file');

        let imageUrl = null;
        let chartUrl = null;

        if (imgFile && imgFile.files[0]) {
            imageUrl = await uploadFileToCloudinary(imgFile);
        }
        if (chartFile && chartFile.files[0]) {
            chartUrl = await uploadFileToCloudinary(chartFile);
        }

        const sizesConfig = [
            { name: "S", available: document.getElementById('size-S')?.checked ?? true },
            { name: "M", available: document.getElementById('size-M')?.checked ?? true },
            { name: "L", available: document.getElementById('size-L')?.checked ?? true },
            { name: "XL", available: document.getElementById('size-XL')?.checked ?? true },
            { name: "XXL", available: document.getElementById('size-XXL')?.checked ?? true }
        ];

        const colorsArr = document.getElementById('product-colors').value
            ? document.getElementById('product-colors').value.split(',').map(s => s.trim()).filter(Boolean)
            : ["Black"];

        const productData = {
            name: document.getElementById('product-name').value.trim(),
            price: parseInt(document.getElementById('product-price').value),
            originalPrice: document.getElementById('product-original-price').value ? parseInt(document.getElementById('product-original-price').value) : null,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            altText: document.getElementById('product-alt-text').value || document.getElementById('product-name').value,
            colors: colorsArr,
            sizes: sizesConfig,
            isOutOfStock: document.getElementById('product-stock').value === "0",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const imagesArr = [];
        if (imageUrl) imagesArr.push(imageUrl);
        if (chartUrl) imagesArr.push(chartUrl);

        if (imagesArr.length > 0) {
            productData.images = imagesArr;
        }

        if (editId) {
            await db.collection("products").doc(editId).update(productData);
            Swal.fire({ icon: 'success', title: 'Product Updated!', timer: 1500, showConfirmButton: false });
        } else {
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            if (!imageUrl) productData.images = ["images/placeholder.jpg"];
            await db.collection("products").add(productData);
            Swal.fire({ icon: 'success', title: 'Product Published Live!', timer: 1500, showConfirmButton: false });
        }

        closeModal('product-modal');
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Product & Publish';
    }
}

// RENDER & EDIT PRODUCTS
function renderProductsTab() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (allProducts.length === 0) {
        grid.innerHTML = '<p class="text-sm text-gray-500 col-span-3">No products found in database.</p>';
        return;
    }

    grid.innerHTML = allProducts.map(p => {
        const img = (p.images && p.images[0]) ? p.images[0] : 'images/placeholder.jpg';
        return `
            <div class="bg-white rounded-2xl p-3 md:p-4 card-shadow border border-gray-100 flex gap-3 items-center">
                <img src="${img}" class="w-16 h-20 object-cover rounded-xl border border-gray-100 shrink-0">
                <div class="flex-1 min-w-0">
                    <span class="text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full">${p.category}</span>
                    <h3 class="font-black text-gray-900 text-xs md:text-sm mt-1 truncate">${p.name}</h3>
                    <p class="text-xs font-bold text-gray-800 mt-0.5">৳${p.price} ${p.originalPrice ? `<span class="line-through text-gray-400 font-normal">৳${p.originalPrice}</span>` : ''}</p>
                    <span class="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded ${p.isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}">
                        ${p.isOutOfStock ? 'Stock Out' : 'In Stock'}
                    </span>
                </div>
                <div class="flex flex-col gap-1">
                    <button onclick="editProduct('${p.id}')" class="text-blue-600 hover:text-blue-800 p-1.5" title="Edit Product">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="deleteProduct('${p.id}')" class="text-red-500 hover:text-red-700 p-1.5" title="Delete Product">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-edit-id').value = product.id;
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-original-price').value = product.originalPrice || '';
    document.getElementById('product-category').value = product.category || 'drop-shoulder';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-colors').value = Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || '');
    document.getElementById('product-alt-text').value = product.altText || '';
    document.getElementById('product-stock').value = product.isOutOfStock ? "0" : "1";

    if (Array.isArray(product.sizes)) {
        ['S', 'M', 'L', 'XL', 'XXL'].forEach(size => {
            const sizeObj = product.sizes.find(s => s.name === size);
            const chk = document.getElementById(`size-${size}`);
            if (chk) chk.checked = sizeObj ? sizeObj.available : false;
        });
    }

    document.getElementById('product-form-title').innerText = 'Edit Product Details';
    document.getElementById('product-modal').classList.add('active');
}

async function deleteProduct(id) {
    Swal.fire({
        title: 'Delete Product?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#000',
        confirmButtonText: 'Delete'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await db.collection("products").doc(id).delete();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1000, showConfirmButton: false });
        }
    });
}

// 8. ORDERS & COURIER LOGISTICS
function renderOrdersTab() {
    const table = document.getElementById('orders-table');
    if (!table) return;

    if (allOrders.length === 0) {
        table.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400">No orders found in database.</td></tr>';
        return;
    }

    table.innerHTML = allOrders.map(o => `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-bold text-gray-900">#${o.id.substring(0, 6)}</td>
            <td class="px-4 py-3">
                <p class="font-bold text-gray-900">${o.Customer_Name || o.customerName || 'N/A'}</p>
                <p class="text-xs text-gray-400">${o.Customer_Phone || o.customerPhone || ''}</p>
            </td>
            <td class="px-4 py-3 font-black text-red-600">${o.TOTAL_BILL || o.amount || '৳0'}</td>
            <td class="px-4 py-3">
                <span class="px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${o.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${o.status || 'Pending'}
                </span>
            </td>
            <td class="px-4 py-3 flex items-center gap-2">
                <button onclick="openCourierDispatchModal('${o.id}')" class="px-2.5 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm hover:bg-purple-700 transition">
                    <i class="fa-solid fa-truck-fast"></i> Courier
                </button>
                <button onclick="deleteOrder('${o.id}')" class="text-red-500 hover:text-red-700 p-1"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function saveOrder() {
    const name = document.getElementById('order-customer-name')?.value.trim();
    const phone = document.getElementById('order-customer-phone')?.value.trim();
    const address = document.getElementById('order-customer-address')?.value.trim();
    const amount = document.getElementById('order-amount')?.value.trim();

    if (!name || !phone || !amount) {
        Swal.fire({ icon: 'warning', title: 'Attention', text: 'Please fill name, phone, and total amount.' });
        return;
    }

    await db.collection("orders").add({
        Customer_Name: name,
        Customer_Phone: phone,
        Delivery_Address: address,
        TOTAL_BILL: `৳${amount}`,
        amount: parseInt(amount),
        status: 'Pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    closeModal('order-modal');
    Swal.fire({ icon: 'success', title: 'Manual Order Created!', timer: 1200, showConfirmButton: false });
}

function openCourierDispatchModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('courier-order-id').value = order.id;
    document.getElementById('courier-cust-name').value = order.Customer_Name || order.customerName || '';
    document.getElementById('courier-cust-phone').value = order.Customer_Phone || order.customerPhone || '';
    document.getElementById('courier-cust-address').value = order.Delivery_Address || order.address || '';
    
    let amountNum = order.TOTAL_BILL ? parseInt(String(order.TOTAL_BILL).replace(/[^0-9]/g, '')) : (order.amount || 0);
    document.getElementById('courier-cod-amount').value = amountNum;

    document.getElementById('courier-modal').classList.add('active');
}

async function dispatchCourierParcel(e) {
    e.preventDefault();
    const btn = document.getElementById('dispatch-btn');
    btn.disabled = true;

    const orderId = document.getElementById('courier-order-id').value;
    const provider = document.getElementById('courier-provider').value;
    const name = document.getElementById('courier-cust-name').value;
    const phone = document.getElementById('courier-cust-phone').value;
    const address = document.getElementById('courier-cust-address').value;
    const cod = document.getElementById('courier-cod-amount').value;

    const trackingCode = provider.toUpperCase() + "-" + Math.floor(100000 + Math.random() * 900000);

    try {
        await db.collection("courier_shipments").add({
            orderId: orderId,
            provider: provider.toUpperCase(),
            trackingCode: trackingCode,
            customerName: name,
            customerPhone: phone,
            address: address,
            codAmount: cod,
            status: 'In Transit',
            bookedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection("orders").doc(orderId).update({
            status: 'Shipped',
            trackingCode: trackingCode
        });

        Swal.fire({ icon: 'success', title: 'Parcel Booked!', text: `Tracking Code: ${trackingCode}` });
        closeModal('courier-modal');
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Booking Failed', text: err.message });
    } finally {
        btn.disabled = false;
    }
}

function renderCourierTab() {
    const table = document.getElementById('courier-shipments-table');
    if (!table) return;

    if (allCourierShipments.length === 0) {
        table.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400">No courier parcels booked yet.</td></tr>';
        return;
    }

    table.innerHTML = allCourierShipments.map(s => `
        <tr>
            <td class="px-4 py-3 font-black text-purple-600">${s.trackingCode}</td>
            <td class="px-4 py-3 font-bold text-gray-900">${s.customerName}</td>
            <td class="px-4 py-3 uppercase text-xs font-bold text-gray-600">${s.provider}</td>
            <td class="px-4 py-3 font-black text-gray-900">৳${s.codAmount}</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-bold">${s.status}</span></td>
        </tr>
    `).join('');
}

async function deleteOrder(id) {
    Swal.fire({
        title: 'Delete Order?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#000',
        confirmButtonText: 'Delete'
    }).then(async (res) => {
        if (res.isConfirmed) {
            await db.collection("orders").doc(id).delete();
            Swal.fire({ icon: 'success', title: 'Order Deleted!', timer: 1000, showConfirmButton: false });
        }
    });
}

// 9. INVENTORY & GRANULAR SIZE TOGGLES
function renderInventoryTab() {
    const table = document.getElementById('inventory-table');
    if (!table) return;

    if (allProducts.length === 0) {
        table.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400">No products available.</td></tr>';
        return;
    }

    table.innerHTML = allProducts.map(p => {
        let sizesHtml = '';
        if (Array.isArray(p.sizes)) {
            sizesHtml = p.sizes.map(s => `
                <button onclick="toggleSingleSize('${p.id}', '${s.name}', ${!s.available})" class="px-2 py-1 text-[10px] font-black rounded-md mr-1 mb-1 transition ${s.available ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-600 border border-red-200 line-through opacity-60'}">
                    ${s.name}: ${s.available ? 'In' : 'Out'}
                </button>
            `).join('');
        } else {
            sizesHtml = '<span class="text-xs text-gray-400">Standard Sizes</span>';
        }

        return `
            <tr>
                <td class="px-4 py-3 font-bold text-gray-900">${p.name}</td>
                <td class="px-4 py-3 text-xs font-bold uppercase text-gray-500">${p.category}</td>
                <td class="px-4 py-3">
                    <button onclick="toggleOverallStock('${p.id}', ${!p.isOutOfStock})" class="px-2.5 py-1 text-xs rounded-xl font-bold ${p.isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-800'}">
                        ${p.isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </button>
                </td>
                <td class="px-4 py-3">${sizesHtml}</td>
            </tr>
        `;
    }).join('');
}

async function toggleOverallStock(id, newStatus) {
    await db.collection("products").doc(id).update({ isOutOfStock: newStatus });
}

async function toggleSingleSize(productId, sizeName, newAvailability) {
    const product = allProducts.find(p => p.id === productId);
    if (!product || !Array.isArray(product.sizes)) return;

    const updatedSizes = product.sizes.map(s => {
        if (s.name === sizeName) {
            return { ...s, available: newAvailability };
        }
        return s;
    });

    await db.collection("products").doc(productId).update({ sizes: updatedSizes });
}

// 10. PROMO CODE ENGINE
async function savePromo() {
    const code = document.getElementById('promo-code').value.trim().toUpperCase();
    const type = document.getElementById('promo-type').value;
    const val = parseInt(document.getElementById('promo-value').value) || 0;

    if (!code) return;

    await db.collection("promos").doc(code).set({
        code: code,
        type: type,
        value: val,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    Swal.fire({ icon: 'success', title: 'Promo Created!' });
    closeModal('promo-modal');
}

function renderPromoTab() {
    const table = document.getElementById('promo-table');
    if (!table) return;

    if (allPromos.length === 0) {
        table.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400">No promo codes created yet.</td></tr>';
        return;
    }

    table.innerHTML = allPromos.map(p => `
        <tr>
            <td class="px-4 py-3 font-black text-red-600">${p.code}</td>
            <td class="px-4 py-3 font-bold text-xs uppercase">${p.type}</td>
            <td class="px-4 py-3 font-bold">${p.type === 'percent' ? p.value + '%' : '৳' + p.value}</td>
            <td class="px-4 py-3"><button onclick="deletePromo('${p.id}')" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

async function deletePromo(id) {
    await db.collection("promos").doc(id).delete();
}

function updateStats() {
    const totalRev = allOrders.reduce((sum, o) => {
        const val = parseInt(String(o.TOTAL_BILL || o.amount || 0).replace(/[^0-9]/g, '')) || 0;
        return sum + val;
    }, 0);

    const revElem = document.getElementById('stat-revenue');
    const orderElem = document.getElementById('stat-orders');
    const pendingElem = document.getElementById('stat-pending');
    const stockElem = document.getElementById('stat-outofstock');

    if (revElem) revElem.innerText = totalRev;
    if (orderElem) orderElem.innerText = allOrders.length;
    if (pendingElem) pendingElem.innerText = allOrders.filter(o => o.status !== 'Completed').length;
    if (stockElem) stockElem.innerText = allProducts.filter(p => p.isOutOfStock).length;
}

// 11. ADMIN REALTIME REVIEW MANAGEMENT ENGINE
function initAdminReviewManager() {
    db.collection("reviews").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAdminReviewsList(allReviews);
    }, err => console.log("Reviews Sync Warning:", err));
}

function renderAdminReviewsList(reviews) {
    const listContainer = document.getElementById('admin-reviews-list');
    const badge = document.getElementById('pending-count-badge');
    if (!listContainer) return;

    const pendingCount = reviews.filter(r => r.status === "pending").length;
    if (badge) badge.innerText = `${pendingCount} Pending`;

    if (reviews.length === 0) {
        listContainer.innerHTML = '<p class="text-xs text-gray-400 font-bold uppercase col-span-full py-4">No submitted customer reviews found.</p>';
        return;
    }

    listContainer.innerHTML = reviews.map(r => {
        const isApproved = r.status === 'approved';
        const stars = '★'.repeat(r.rating || 5);

        return `
            <div class="p-5 border rounded-2xl flex flex-col justify-between ${isApproved ? 'bg-green-50/40 border-green-200' : 'bg-gray-50 border-gray-200'}">
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-black uppercase text-black">${r.name} <span class="text-[10px] text-gray-400 font-normal">(${r.email || 'No Email'})</span></span>
                        <span class="text-xs text-yellow-500 font-black">${stars}</span>
                    </div>
                    <p class="text-xs text-gray-700 italic mb-4">"${r.text}"</p>
                </div>

                <div class="flex items-center justify-between border-t border-gray-200/60 pt-3">
                    <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                        ${r.status || 'pending'}
                    </span>

                    <div class="flex gap-2">
                        ${!isApproved ? `
                            <button onclick="approveReview('${r.id}')" class="bg-black hover:bg-green-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition">
                                Approve ✓
                            </button>
                        ` : `
                            <button onclick="unapproveReview('${r.id}')" class="bg-gray-200 hover:bg-gray-300 text-black text-[10px] font-black uppercase px-4 py-2 rounded-xl transition">
                                Unapprove
                            </button>
                        `}
                        <button onclick="deleteReview('${r.id}')" class="bg-red-100 hover:bg-red-600 hover:text-white text-red-600 text-[10px] font-black uppercase px-3 py-2 rounded-xl transition">
                            Delete 🗑
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function approveReview(id) {
    db.collection("reviews").doc(id).update({ status: "approved" })
      .then(() => Swal.fire({ icon: 'success', title: 'APPROVED!', timer: 1000, showConfirmButton: false }));
}

function unapproveReview(id) {
    db.collection("reviews").doc(id).update({ status: "pending" });
}

function deleteReview(id) {
    Swal.fire({
        title: 'Delete Review?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#000',
        confirmButtonText: 'Delete'
    }).then((res) => {
        if (res.isConfirmed) db.collection("reviews").doc(id).delete();
    });
}

// 12. INITIALIZATION ON DOM LOAD
document.addEventListener('DOMContentLoaded', checkAdminSession);
