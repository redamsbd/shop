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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. CLOUDINARY CONFIG
const CLOUD_NAME = "redamsbd";
const UPLOAD_PRESET = "redams_preset";

// Global State Arrays
let allProducts = [];
let allOrders = [];
let allPromos = [];
let allCourierShipments = [];

// Mobile Drawer Toggle
function toggleMobileSidebar() {
    document.getElementById('sidebar-drawer').classList.toggle('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.toggle('hidden');
}

// 3. AUTHENTICATION & PASSWORD ENGINE
function adminLogin() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    
    const storedUser = localStorage.getItem('redams_admin_user') || 'redamsbd';
    const storedPass = localStorage.getItem('redams_admin_pass') || 'redamsbd16';

    if (u === storedUser && p === storedPass) {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        initDashboard();
    } else {
        Swal.fire({ icon: 'error', title: 'Login Failed', text: 'ভুল ইউজারনেম বা পাসওয়ার্ড!' });
    }
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
        Swal.fire({ icon: 'error', title: 'Error', text: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!' });
        return;
    }
    if (newP.length < 6) {
        Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' });
        return;
    }
    if (newP !== confirmP) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'নতুন পাসওয়ার্ড দুটি মিলছে না!' });
        return;
    }

    localStorage.setItem('redams_admin_pass', newP);
    Swal.fire({ icon: 'success', title: 'Success!', text: 'পাসওয়ার্ড পরিবর্তিত হয়েছে।' });
    closeModal('change-password-modal');
}

function adminLogout() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-modal').classList.remove('hidden');
}

// 4. NAVIGATION TAB SWITCHING
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('sidebar-active'));
    
    document.getElementById(`${tabId}-content`).classList.remove('hidden');
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('sidebar-active');

    if (window.innerWidth < 768) {
        document.getElementById('sidebar-drawer').classList.add('-translate-x-full');
        document.getElementById('sidebar-overlay').classList.add('hidden');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openAddProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('product-edit-id').value = '';
    document.getElementById('product-form-title').innerText = 'Add New Product';
    document.getElementById('product-modal').classList.add('active');
}

function openAddOrderModal() { document.getElementById('order-modal').classList.add('active'); }
function openAddPromoModal() { document.getElementById('promo-modal').classList.add('active'); }

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

    db.collection("products").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProductsTab();
        renderInventoryTab();
        updateStats();
    });

    db.collection("orders").onSnapshot(snapshot => {
        allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrdersTab();
        updateStats();
    });

    db.collection("promos").onSnapshot(snapshot => {
        allPromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPromoTab();
    });

    db.collection("courier_shipments").onSnapshot(snapshot => {
        allCourierShipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCourierTab();
    });
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

        if (imgFile.files[0]) {
            imageUrl = await uploadFileToCloudinary(imgFile);
        }
        if (chartFile.files[0]) {
            chartUrl = await uploadFileToCloudinary(chartFile);
        }

        // Construct Sizes Array
        const sizesConfig = [
            { name: "S", available: document.getElementById('size-S').checked },
            { name: "M", available: document.getElementById('size-M').checked },
            { name: "L", available: document.getElementById('size-L').checked },
            { name: "XL", available: document.getElementById('size-XL').checked },
            { name: "XXL", available: document.getElementById('size-XXL').checked }
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
        } else {
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            if (!imageUrl) productData.images = ["images/placeholder.jpg"];
            await db.collection("products").add(productData);
        }

        Swal.fire({ icon: 'success', title: 'Product Live!', text: 'প্রোডাক্টটি ওয়েবসাইটে সেভ ও লাইভ হয়ে গেছে।' });
        closeModal('product-modal');
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Product & Publish';
    }
}
// ১. প্রোডাক্ট কার্ডে এডিট ও ডিলিট বাটন রেন্ডার (admin.js - renderProductsTab)
function renderProductsTab() {
    const grid = document.getElementById('products-grid');
    if (allProducts.length === 0) {
        grid.innerHTML = '<p class="text-sm text-gray-500 col-span-3">কোনো প্রোডাক্ট পাওয়া যায়নি। উপর থেকে Add Product-এ চাপ দিন।</p>';
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
                    <!-- EDIT BUTTON -->
                    <button onclick="editProduct('${p.id}')" class="text-blue-600 hover:text-blue-800 p-1.5" title="Edit Product">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <!-- DELETE BUTTON -->
                    <button onclick="deleteProduct('${p.id}')" class="text-red-500 hover:text-red-700 p-1.5" title="Delete Product">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ২. প্রোডাক্ট এডিট করার ফাংশন (admin.js-এর নিচে যুক্ত করুন)
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

    // সাইজ সমূহের চেকবক্স পপুলেট করা
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


// 8. ORDERS & COURIER LOGISTICS
function renderOrdersTab() {
    const table = document.getElementById('orders-table');
    if (allOrders.length === 0) {
        table.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400">কোনো অর্ডার ডাটাবেজে নেই।</td></tr>';
        return;
    }

    table.innerHTML = allOrders.map(o => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-bold text-gray-900">#${o.id.substring(0, 6)}</td>
            <td class="px-4 py-3">
                <p class="font-bold text-gray-900">${o.Customer_Name || o.customerName || 'N/A'}</p>
                <p class="text-xs text-gray-400">${o.Customer_Phone || o.customerPhone || 'N/A'}</p>
            </td>
            <td class="px-4 py-3 font-black text-gray-900">${o.TOTAL_BILL || o.amount || '৳0'}</td>
            <td class="px-4 py-3">
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">${o.status || 'Pending'}</span>
            </td>
            <td class="px-4 py-3 flex items-center gap-2">
                <button onclick="openCourierDispatchModal('${o.id}')" class="px-2.5 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm">
                    <i class="fa-solid fa-truck-fast"></i> Book Courier
                </button>
                <button onclick="deleteOrder('${o.id}')" class="text-red-500 p-1"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openCourierDispatchModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('courier-order-id').value = order.id;
    document.getElementById('courier-cust-name').value = order.Customer_Name || order.customerName || '';
    document.getElementById('courier-cust-phone').value = order.Customer_Phone || order.customerPhone || '';
    document.getElementById('courier-cust-address').value = order.Delivery_Address || order.address || '';
    
    let amountNum = order.TOTAL_BILL ? parseInt(order.TOTAL_BILL.replace(/[^0-9]/g, '')) : (order.amount || 0);
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
    if (allCourierShipments.length === 0) {
        table.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400">কোনো পার্সেল বুকিং দেওয়া হয়নি।</td></tr>';
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
    if (confirm("অর্ডারটি ডিলিট করবেন?")) {
        await db.collection("orders").doc(id).delete();
    }
}

// 9. INVENTORY & GRANULAR SIZE TOGGLES
function renderInventoryTab() {
    const table = document.getElementById('inventory-table');
    if (allProducts.length === 0) {
        table.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400">কোনো প্রোডাক্ট নেই।</td></tr>';
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
    if (allPromos.length === 0) {
        table.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400">কোনো প্রমো কোড তৈরি করা নেই।</td></tr>';
        return;
    }

    table.innerHTML = allPromos.map(p => `
        <tr>
            <td class="px-4 py-3 font-black text-red-600">${p.code}</td>
            <td class="px-4 py-3 font-bold text-xs uppercase">${p.type}</td>
            <td class="px-4 py-3 font-bold">${p.type === 'percent' ? p.value + '%' : '৳' + p.value}</td>
            <td class="px-4 py-3"><button onclick="deletePromo('${p.id}')" class="text-red-500"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

async function deletePromo(id) {
    await db.collection("promos").doc(id).delete();
}

function updateStats() {
    document.getElementById('stat-revenue').innerText = allOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    document.getElementById('stat-orders').innerText = allOrders.length;
    document.getElementById('stat-pending').innerText = allOrders.filter(o => o.status === 'Pending').length;
    document.getElementById('stat-outofstock').innerText = allProducts.filter(p => p.isOutOfStock).length;
}
// =================================================================
// ADMIN REALTIME REVIEW MANAGEMENT ENGINE
// =================================================================
function initAdminReviewManager() {
    const listContainer = document.getElementById('admin-reviews-list');
    const badge = document.getElementById('pending-count-badge');
    if (!listContainer) return;

    const db = firebase.firestore();

    // Listen to all reviews in Realtime
    db.collection("reviews").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pendingCount = reviews.filter(r => r.status === "pending").length;

        if (badge) badge.innerText = `${pendingCount} Pending`;

        if (reviews.length === 0) {
            listContainer.innerHTML = '<p class="text-xs text-zinc-400 font-bold uppercase col-span-full py-4">No submitted reviews found.</p>';
            return;
        }

        listContainer.innerHTML = reviews.map(r => {
            const isApproved = r.status === 'approved';
            const stars = '★'.repeat(r.rating || 5);

            return `
                <div class="p-5 border rounded-2xl flex flex-col justify-between ${isApproved ? 'bg-green-50/30 border-green-200' : 'bg-zinc-50 border-zinc-200'}">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-black uppercase text-black">${r.name} <span class="text-[10px] text-zinc-400 font-normal">(${r.email || 'No Email'})</span></span>
                            <span class="text-xs text-yellow-500 font-black">${stars}</span>
                        </div>
                        <p class="text-xs text-zinc-700 italic mb-4">"${r.text}"</p>
                    </div>

                    <div class="flex items-center justify-between border-t border-zinc-200/60 pt-3">
                        <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                            ${r.status || 'pending'}
                        </span>

                        <div class="flex gap-2">
                            ${!isApproved ? `
                                <button onclick="approveReview('${r.id}')" class="bg-black hover:bg-green-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition">
                                    Approve ✓
                                </button>
                            ` : `
                                <button onclick="unapproveReview('${r.id}')" class="bg-zinc-200 hover:bg-zinc-300 text-black text-[10px] font-black uppercase px-4 py-2 rounded-xl transition">
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
    });
}

// Action Functions
function approveReview(id) {
    firebase.firestore().collection("reviews").doc(id).update({
        status: "approved"
    }).then(() => {
        Swal.fire({ icon: 'success', title: 'APPROVED!', text: 'Review is now live on the website.', timer: 1200, showConfirmButton: false });
    });
}

function unapproveReview(id) {
    firebase.firestore().collection("reviews").doc(id).update({
        status: "pending"
    });
}

function deleteReview(id) {
    Swal.fire({
        title: 'Delete Review?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#000',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            firebase.firestore().collection("reviews").doc(id).delete();
        }
    });
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', initAdminReviewManager);
