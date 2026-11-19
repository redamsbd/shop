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
const ADMIN_OFFICIAL_EMAIL = "redamsbd16@gmail.com";

// Global State Arrays
let allProducts = [];
let allOrders = [];
let allPromos = [];
let allCourierShipments = [];
let allReviews = [];
let currentEditImages = [];

// Default Fallback Size Measurements (In Inches)
const DEFAULT_SIZE_CHARTS = {
    'drop-shoulder': [
        { size: 'S', chest: '40', length: '27', sleeve: '8.5' },
        { size: 'M', chest: '42', length: '28', sleeve: '9' },
        { size: 'L', chest: '44', length: '29', sleeve: '9.5' },
        { size: 'XL', chest: '46', length: '30', sleeve: '10' },
        { size: 'XXL', chest: '48', length: '31', sleeve: '10.5' }
    ],
    'polo-tshirt': [
        { size: 'S', chest: '38', length: '26', sleeve: '7.5' },
        { size: 'M', chest: '40', length: '27', sleeve: '8' },
        { size: 'L', chest: '42', length: '28', sleeve: '8.5' },
        { size: 'XL', chest: '44', length: '29', sleeve: '9' },
        { size: 'XXL', chest: '46', length: '30', sleeve: '9.5' }
    ],
    'hoodie': [
        { size: 'S', chest: '42', length: '27', sleeve: '24' },
        { size: 'M', chest: '44', length: '28', sleeve: '25' },
        { size: 'L', chest: '46', length: '29', sleeve: '26' },
        { size: 'XL', chest: '48', length: '30', sleeve: '27' },
        { size: 'XXL', chest: '50', length: '31', sleeve: '28' }
    ],
    'regular-tshirt': [
        { size: 'S', chest: '38', length: '26', sleeve: '7.5' },
        { size: 'M', chest: '40', length: '27', sleeve: '8' },
        { size: 'L', chest: '42', length: '28', sleeve: '8.5' },
        { size: 'XL', chest: '44', length: '29', sleeve: '9' },
        { size: 'XXL', chest: '46', length: '30', sleeve: '9.5' }
    ],
    'acid-wash': [
        { size: 'S', chest: '40', length: '27', sleeve: '8.5' },
        { size: 'M', chest: '42', length: '28', sleeve: '9' },
        { size: 'L', chest: '44', length: '29', sleeve: '9.5' },
        { size: 'XL', chest: '46', length: '30', sleeve: '10' },
        { size: 'XXL', chest: '48', length: '31', sleeve: '10.5' }
    ],
    'couple-tshirt': [
        { size: 'S', chest: '38', length: '26', sleeve: '7.5' },
        { size: 'M', chest: '40', length: '27', sleeve: '8' },
        { size: 'L', chest: '42', length: '28', sleeve: '8.5' },
        { size: 'XL', chest: '44', length: '29', sleeve: '9' },
        { size: 'XXL', chest: '46', length: '30', sleeve: '9.5' }
    ],
    'henley': [
        { size: 'S', chest: '38', length: '26', sleeve: '8' },
        { size: 'M', chest: '40', length: '27', sleeve: '8.5' },
        { size: 'L', chest: '42', length: '28', sleeve: '9' },
        { size: 'XL', chest: '44', length: '29', sleeve: '9.5' },
        { size: 'XXL', chest: '46', length: '30', sleeve: '10' }
    ],
    'combo': [
        { size: 'S', chest: '40', length: '27', sleeve: '8.5' },
        { size: 'M', chest: '42', length: '28', sleeve: '9' },
        { size: 'L', chest: '44', length: '29', sleeve: '9.5' },
        { size: 'XL', chest: '46', length: '30', sleeve: '10' },
        { size: 'XXL', chest: '48', length: '31', sleeve: '10.5' }
    ]
};

// =================================================================
// UI & NAVIGATION HELPERS
// =================================================================

function toggleMobileSidebar() {
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-overlay');
    if (drawer) drawer.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('sidebar-active'));
    
    const targetContent = document.getElementById(`${tabId}-content`); 
    if (targetContent) targetContent.classList.remove('hidden');  
    
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('sidebar-active');

    if (tabId === 'sizechart-settings') {
        loadCategorySizeChartToEditor();
    }

    if (window.innerWidth < 768) {
        const drawer = document.getElementById('sidebar-drawer');
        const overlay = document.getElementById('sidebar-overlay');
        if (drawer) drawer.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.classList.add('hidden');
    }
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// =================================================================
// AUTHENTICATION & EMAIL OTP RECOVERY ENGINE
// =================================================================

function checkAdminSession() {
    const session = localStorage.getItem('redams_admin_session');
    const loginModal = document.getElementById('login-modal');
    const dashboard = document.getElementById('dashboard');

    if (session === 'active') {
        if (loginModal) loginModal.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        if (typeof initDashboard === 'function') initDashboard();
    } else {
        if (loginModal) loginModal.classList.remove('hidden');
        if (dashboard) dashboard.classList.add('hidden');
    }
}

async function adminLogin(e) {
    if (e) e.preventDefault();
    
    const u = document.getElementById('login-username')?.value.trim();
    const p = document.getElementById('login-password')?.value.trim();
    const btn = document.getElementById('login-btn');

    if (!u || !p) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'Attention', 
            text: 'Please enter both Username and Password!' 
        });
        return false;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;
    }

    let validPass = localStorage.getItem('redams_admin_pass') || 'redamsbd16';
    let validUser = localStorage.getItem('redams_admin_user') || 'redamsbd';

    // Fast Local Check
    if (u === validUser && p === validPass) {
        localStorage.setItem('redams_admin_session', 'active');
        if (document.getElementById('remember-me')?.checked) {
            localStorage.setItem('redams_remember_me', 'true');
        }

        checkAdminSession();
        
        Swal.fire({ 
            icon: 'success', 
            title: 'WELCOME BACK!', 
            text: 'Logged in successfully to REDAMS Admin Portal.',
            timer: 1200, 
            showConfirmButton: false 
        });

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login to Dashboard`;
        }
        return false;
    }

    // Firestore Fallback Check
    if (typeof db !== 'undefined' && db) {
        try {
            const docSnap = await db.collection("admin_settings").doc("credentials").get();
            if (docSnap && docSnap.exists) {
                const data = docSnap.data();
                if (data.adminPass) {
                    validPass = data.adminPass;
                    localStorage.setItem('redams_admin_pass', validPass);
                }
                if (data.adminUser) {
                    validUser = data.adminUser;
                    localStorage.setItem('redams_admin_user', validUser);
                }
            }
        } catch (err) {
            console.warn("Firestore auth sync fallback to local credentials.");
        }
    }

    if (u === validUser && p === validPass) {
        localStorage.setItem('redams_admin_session', 'active');
        if (document.getElementById('remember-me')?.checked) {
            localStorage.setItem('redams_remember_me', 'true');
        }

        checkAdminSession();
        
        Swal.fire({ 
            icon: 'success', 
            title: 'WELCOME BACK!', 
            text: 'Logged in successfully to REDAMS Admin Portal.',
            timer: 1200, 
            showConfirmButton: false 
        });
    } else {
        Swal.fire({ 
            icon: 'error', 
            title: 'Login Failed', 
            text: 'Invalid Username or Password! Please check carefully.',
            confirmButtonColor: '#dc2626'
        });
    }
    

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login to Dashboard`;
    }
    return false;
}

function adminLogout() {
    Swal.fire({
        title: 'Logout Admin?',
        text: 'Are you sure you want to end your current session?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#000',
        confirmButtonText: 'Yes, Logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('redams_admin_session');
            checkAdminSession();
        }
    });
}

function openChangePasswordModal() {
    if(document.getElementById('old-pass')) document.getElementById('old-pass').value = '';
    if(document.getElementById('new-pass')) document.getElementById('new-pass').value = '';
    if(document.getElementById('confirm-pass')) document.getElementById('confirm-pass').value = '';
    
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

async function saveNewPassword() {
    const oldP = document.getElementById('old-pass')?.value.trim();
    const newP = document.getElementById('new-pass')?.value.trim();
    const confirmP = document.getElementById('confirm-pass')?.value.trim();
    const currentPass = localStorage.getItem('redams_admin_pass') || 'redamsbd16';

    if (oldP !== currentPass) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Current password is incorrect!' });
        return;
    }
    if (newP.length < 6) {
        Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Password must be at least 6 characters long.' });
        return;
    }
    if (newP !== confirmP) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'New passwords do not match!' });
        return;
    }

    localStorage.setItem('redams_admin_pass', newP);
    
    if (typeof db !== 'undefined' && db) {
        try {
            await db.collection("admin_settings").doc("credentials").set({
                adminPass: newP,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch(err) {
            console.warn("Firestore sync warning:", err);
        }
    }

    Swal.fire({ icon: 'success', title: 'Success!', text: 'Password updated successfully.' });
    closeModal('change-password-modal');
}

function openForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        document.getElementById('forgot-step-1')?.classList.remove('hidden');
        document.getElementById('forgot-step-2')?.classList.add('hidden');
        if (document.getElementById('recovery-email')) {
            document.getElementById('recovery-email').value = ADMIN_OFFICIAL_EMAIL;
        }
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

async function sendPasswordResetOTP() {
    const emailInput = document.getElementById('recovery-email')?.value.trim() || ADMIN_OFFICIAL_EMAIL;
    const btn = document.getElementById('send-otp-btn');

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating OTP...`;

    try {
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        if (typeof db !== 'undefined' && db) {
            await db.collection("admin_recovery").doc("otp_verify").set({
                email: emailInput,
                otp: generatedOTP,
                createdAt: Date.now(),
                expiresAt: Date.now() + (10 * 60 * 1000)
            });
        }

        localStorage.setItem('redams_temp_otp', generatedOTP);

        if (typeof emailjs !== 'undefined') {
            emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
                to_email: emailInput,
                otp_code: generatedOTP
            }).catch(e => console.warn("EmailJS Dispatch Warning:", e));
        }

        Swal.fire({
            icon: 'success',
            title: 'OTP DISPATCHED!',
            html: `
                <p class="text-xs text-gray-600">Recovery verification code dispatched for <b>${emailInput}</b>.</p>
                <div class="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
                    <p class="text-[10px] font-black uppercase text-purple-500">Your Password Recovery Code</p>
                    <p class="text-3xl font-mono font-black text-purple-900 tracking-widest my-1">${generatedOTP}</p>
                    <p class="text-[10px] text-gray-400">Valid for 10 minutes</p>
                </div>
            `,
            confirmButtonColor: '#9333ea'
        });

        document.getElementById('forgot-step-1')?.classList.add('hidden');
        document.getElementById('forgot-step-2')?.classList.remove('hidden');

    } catch (err) {
        console.error("OTP Error:", err);
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not send OTP. Check connectivity.' });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send OTP Code`;
        }
    }
}

async function verifyOTPAndResetPassword() {
    const userOTP = document.getElementById('otp-input')?.value.trim();
    const newPassword = document.getElementById('reset-new-pass')?.value.trim();
    const btn = document.getElementById('verify-otp-btn');

    if (!userOTP || userOTP.length !== 6) {
        Swal.fire({ icon: 'warning', title: 'Invalid OTP', text: 'Please enter the 6-digit OTP code.' });
        return;
    }
    if (!newPassword || newPassword.length < 6) {
        Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'New password must be at least 6 characters long.' });
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;

    try {
        let isVerified = false;
        const localOTP = localStorage.getItem('redams_temp_otp');

        if (localOTP && localOTP === userOTP) {
            isVerified = true;
        }

        if (typeof db !== 'undefined' && db) {
            const docSnap = await db.collection("admin_recovery").doc("otp_verify").get();
            if (docSnap.exists) {
                const data = docSnap.data();
                if (Date.now() <= data.expiresAt && data.otp === userOTP) {
                    isVerified = true;
                }
            }
        }

        if (!isVerified) {
            throw new Error("Incorrect or expired 6-digit OTP code. Please check again.");
        }

        if (typeof db !== 'undefined' && db) {
            await db.collection("admin_settings").doc("credentials").set({
                adminPass: newPassword,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            await db.collection("admin_recovery").doc("otp_verify").delete();
        }

        localStorage.setItem('redams_admin_pass', newPassword);
        localStorage.removeItem('redams_temp_otp');

        Swal.fire({
            icon: 'success',
            title: 'PASSWORD RESET SUCCESSFUL!',
            text: 'Your admin password has been updated. Log in with your new password.',
            confirmButtonColor: '#16a34a'
        });

        closeModal('forgot-password-modal');

    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Verification Failed', text: err.message });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-key"></i> Verify & Update Password`;
        }
    }
}

// =================================================================
// DASHBOARD INIT & REALTIME LISTENERS (UPGRADED V4.0)
// =================================================================

let salesChartInstance = null;

function initDashboard() {
    switchTab('dashboard');

    db.collection("products").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProductsTab();
        renderInventoryTab();
        updateStats();
    }, err => console.log("Products Sync Warning:", err));

    db.collection("orders").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrdersTab();
        updateStats();
    }, err => console.log("Orders Sync Warning:", err));

    db.collection("promos").onSnapshot(snapshot => {
        allPromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPromoTab();
    }, err => console.log("Promos Sync Warning:", err));

    db.collection("courier_shipments").onSnapshot(snapshot => {
        allCourierShipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCourierTab();
    }, err => console.log("Courier Sync Warning:", err));

    initAdminReviewManager();
}

function updateStats() {
    // ১. মূল KPI স্ট্যাটাস আপডেট (Revenue, Total Orders, Pending, Out of Stock)
    const totalRev = allOrders.reduce((sum, o) => {
        const orderStatus = o.status || 'Pending';
        if (orderStatus === 'Completed' || orderStatus === 'Delivered') {
            const val = parseInt(String(o.TOTAL_BILL || o.amount || o.totalAmount || 0).replace(/[^0-9]/g, '')) || 0;
            return sum + val;
        }
        return sum;
    }, 0);

    const revElem = document.getElementById('stat-revenue');
    const orderElem = document.getElementById('stat-orders');
    const pendingElem = document.getElementById('stat-pending');
    const stockElem = document.getElementById('stat-outofstock');

    if (revElem) revElem.innerText = totalRev.toLocaleString();
    if (orderElem) orderElem.innerText = allOrders.length;
    if (pendingElem) pendingElem.innerText = allOrders.filter(o => (o.status || 'Pending') === 'Pending').length;
    if (stockElem) stockElem.innerText = allProducts.filter(p => p.isOutOfStock).length;

    // ২. প্রিমিয়াম ড্যাশবোর্ড উইজেট ও সেলস চার্ট লাইভ আপডেট
    syncPremiumDashboardWidgets();
    renderSalesChart();
}

function syncPremiumDashboardWidgets() {
    // ক. ৮টি ক্যাটাগরির লাইভ প্রোডাক্ট ও স্টক ম্যাট্রিক্স
    const categories = [
        { id: 'drop-shoulder', label: 'Drop Shoulder', icon: 'fa-shirt', color: 'text-red-600 bg-red-50' },
        { id: 'hoodie', label: 'Hoodie', icon: 'fa-vest', color: 'text-purple-600 bg-purple-50' },
        { id: 'henley', label: 'Henley T-Shirt', icon: 'fa-user-tie', color: 'text-amber-600 bg-amber-50' },
        { id: 'polo-tshirt', label: 'Polo T-Shirt', icon: 'fa-shirt', color: 'text-blue-600 bg-blue-50' },
        { id: 'acid-wash', label: 'Acid Wash', icon: 'fa-fire', color: 'text-orange-600 bg-orange-50' },
        { id: 'regular-tshirt', label: 'Regular T-Shirt', icon: 'fa-tshirt', color: 'text-emerald-600 bg-emerald-50' },
        { id: 'couple-tshirt', label: 'Couple T-Shirt', icon: 'fa-heart', color: 'text-pink-600 bg-pink-50' },
        { id: 'combo', label: 'Combo Offer', icon: 'fa-boxes-stacked', color: 'text-cyan-600 bg-cyan-50' }
    ];

    const matrixEl = document.getElementById('dash-category-matrix');
    if (matrixEl && Array.isArray(allProducts)) {
        matrixEl.innerHTML = categories.map(cat => {
            const catItems = allProducts.filter(p => p.category === cat.id);
            const outStockCount = catItems.filter(p => p.isOutOfStock === true || String(p.inStock ?? p.stock) === '0').length;
            const inStockCount = catItems.length - outStockCount;

            return `
                <div onclick="switchTab('products'); document.getElementById('product-category-filter').value='${cat.id}'; if(typeof filterProductsCatalog === 'function') filterProductsCatalog();" 
                     class="cursor-pointer p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-cyan-400 hover:shadow-md transition group">
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-7 h-7 rounded-xl ${cat.color} flex items-center justify-center text-xs">
                            <i class="fa-solid ${cat.icon}"></i>
                        </div>
                        <span class="text-sm font-black text-gray-900 bg-white px-2.5 py-0.5 rounded-lg border border-gray-200">${catItems.length}</span>
                    </div>
                    <p class="text-[11px] font-black text-gray-800 group-hover:text-cyan-700 truncate">${cat.label}</p>
                    <div class="flex items-center gap-1.5 mt-2 text-[9px] font-black uppercase">
                        <span class="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">✓ ${inStockCount} In</span>
                        ${outStockCount > 0 
                            ? `<span class="text-red-600 bg-red-50 px-1.5 py-0.5 rounded">✗ ${outStockCount} Out</span>` 
                            : `<span class="text-gray-400">Full Stock</span>`}
                    </div>
                </div>
            `;
        }).join('');
    }

    // খ. চ্যানেল অনুযায়ী (Website, Facebook, WhatsApp, Manual) অর্ডার ব্রেকডাউন
    if (Array.isArray(allOrders)) {
        const total = allOrders.length;
        const countBySource = (src) => allOrders.filter(o => (o.source || o.channel || o.ORDER_SOURCE || 'Website').toLowerCase().includes(src)).length;

        const web = countBySource('web');
        const fb = countBySource('facebook');
        const wa = countBySource('whatsapp');
        const manual = Math.max(0, total - (web + fb + wa));

        const setBar = (key, count) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const txtEl = document.getElementById(`dash-source-${key}`);
            const barEl = document.getElementById(`dash-bar-${key}`);
            if (txtEl) txtEl.innerText = `${count} (${pct}%)`;
            if (barEl) barEl.style.width = `${pct}%`;
        };

        setBar('web', web);
        setBar('fb', fb);
        setBar('wa', wa);
        setBar('manual', manual);

        // গ. সর্বশেষ ৫টি Pending অর্ডার কিউ (সরাসরি কুরিয়ার বুকিং বাটনসহ)
        const pendingOrders = allOrders.filter(o => (o.status || 'Pending') === 'Pending').slice(0, 5);
        const pendingBody = document.getElementById('dash-pending-orders-body');
        if (pendingBody) {
            if (pendingOrders.length === 0) {
                pendingBody.innerHTML = `<tr><td colspan="5" class="px-4 py-6 text-center text-emerald-600 font-black">All pending orders have been dispatched!</td></tr>`;
            } else {
                pendingBody.innerHTML = pendingOrders.map(o => {
                    const src = o.source || o.channel || o.ORDER_SOURCE || 'Website';
                    const badgeClass = src.toLowerCase().includes('whatsapp') ? 'bg-emerald-50 text-emerald-700' 
                                     : src.toLowerCase().includes('facebook') ? 'bg-blue-50 text-blue-700' 
                                     : 'bg-red-50 text-red-600';
                    const bill = parseInt(String(o.TOTAL_BILL || o.amount || o.totalAmount || 0).replace(/[^0-9]/g, '')) || 0;
                    const custName = o.customerName || o.CUSTOMER_NAME || o.name || '-';
                    const custPhone = o.customerPhone || o.PHONE || o.phone || '-';
                    const orderItems = o.items || o.ITEMS || o.itemsSummary || 'Apparel Item';
                    const displayId = o.orderId || o.ORDER_ID || (o.id || '').slice(0, 6);

                    return `
                        <tr class="hover:bg-gray-50 transition">
                            <td class="px-4 py-3">
                                <span class="font-mono font-black text-gray-900 block">#${displayId}</span>
                                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded ${badgeClass}">${src}</span>
                            </td>
                            <td class="px-4 py-3">
                                <p class="font-black text-gray-900">${custName}</p>
                                <p class="text-[11px] font-mono text-gray-500">${custPhone}</p>
                            </td>
                            <td class="px-4 py-3 max-w-[220px] truncate text-gray-600">${orderItems}</td>
                            <td class="px-4 py-3 font-black text-gray-900">৳${bill.toLocaleString()}</td>
                            <td class="px-4 py-3 text-right space-x-1">
                                <button type="button" onclick="openCourierModal('${o.id}')" class="bg-purple-600 hover:bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer">
                                    <i class="fa-solid fa-truck-fast"></i> Book Courier
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }
}

function renderSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx || !Array.isArray(allOrders)) return;

    const labels = [];
    const revenueData = [];
    const orderCountData = [];

    // শেষ ৭ দিনের তারিখ অনুযায়ী সেলস ও অর্ডার ভলিউম হিসাব
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const displayLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        labels.push(displayLabel);

        const dayOrders = allOrders.filter(o => {
            if (!o.createdAt) return false;
            const orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
            return !isNaN(orderDate) && orderDate.toISOString().split('T')[0] === dateStr;
        });

        orderCountData.push(dayOrders.length);

        const dayRev = dayOrders.reduce((sum, o) => {
            if ((o.status || '') === 'Cancelled') return sum;
            const val = parseInt(String(o.TOTAL_BILL || o.amount || o.totalAmount || 0).replace(/[^0-9]/g, '')) || 0;
            return sum + val;
        }, 0);
        revenueData.push(dayRev);
    }

    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sales Volume (৳)',
                    data: revenueData,
                    backgroundColor: 'rgba(220, 38, 38, 0.85)',
                    borderRadius: 8,
                    barPercentage: 0.5,
                    yAxisID: 'y'
                },
                {
                    label: 'Total Orders',
                    data: orderCountData,
                    type: 'line',
                    borderColor: '#111827',
                    backgroundColor: '#111827',
                    borderWidth: 2.5,
                    pointRadius: 4,
                    tension: 0.35,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: { font: { family: 'Inter', weight: 'bold', size: 11 } }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Inter', weight: 'bold', size: 10 } }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        callback: value => '৳' + value,
                        font: { family: 'Inter', weight: 'bold', size: 10 }
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    grid: { drawOnChartArea: false },
                    ticks: {
                        stepSize: 1,
                        font: { family: 'Inter', weight: 'bold', size: 10 }
                    }
                }
            }
        }
    });
}
// =================================================================
// PRODUCTS CATALOG & CLOUDINARY ENGINE (V2.0 PRO)
// =================================================================

function openAddProductModal() {
    const form = document.getElementById('product-form');
    if (form) form.reset();
    if (document.getElementById('product-edit-id')) document.getElementById('product-edit-id').value = '';
    if (document.getElementById('product-form-title')) document.getElementById('product-form-title').innerText = 'Add New Product';
    
    currentEditImages = [];
    const previewContainer = document.getElementById('existing-images-preview');
    if (previewContainer) previewContainer.classList.add('hidden');

    handleCategoryChange();
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

async function uploadMultipleFilesToCloudinary(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return [];

    const files = Array.from(fileInput.files);
    const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        return fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.secure_url) return data.secure_url;
            throw new Error(data.error ? data.error.message : "Image upload failed");
        });
    });

    return await Promise.all(uploadPromises);
}

function handleCategoryChange() {
    const category = document.getElementById('product-category')?.value;
    const stdContainer = document.getElementById('standard-options-container');
    const coupleContainer = document.getElementById('couple-options-container');

    if (category === 'couple-tshirt') {
        if (stdContainer) stdContainer.classList.add('hidden');
        if (coupleContainer) coupleContainer.classList.remove('hidden');
    } else {
        if (stdContainer) stdContainer.classList.remove('hidden');
        if (coupleContainer) coupleContainer.classList.add('hidden');
    }
}

async function saveProduct(e) {
    if (e) e.preventDefault();
    const submitBtn = document.getElementById('save-product-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ UPLOADING IMAGES & SAVING...';
    }

    try {
        const editId = document.getElementById('product-edit-id')?.value;
        const fileInput = document.getElementById('product-img-files');
        const category = document.getElementById('product-category')?.value;

        const newlyUploadedUrls = await uploadMultipleFilesToCloudinary(fileInput);

        let finalImages = [...currentEditImages, ...newlyUploadedUrls];
        if (finalImages.length === 0) {
            finalImages = ["images/placeholder.jpg"];
        }

        const productData = {
            name: document.getElementById('product-name').value.trim(),
            price: parseInt(document.getElementById('product-price').value),
            originalPrice: document.getElementById('product-original-price').value ? parseInt(document.getElementById('product-original-price').value) : null,
            category: category,
            description: document.getElementById('product-description').value,
            altText: document.getElementById('product-alt-text').value.trim() || document.getElementById('product-name').value.trim(),
            images: finalImages,
            isOutOfStock: document.getElementById('product-stock').value === "0",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (category === 'couple-tshirt') {
            const p1Colors = document.getElementById('partner1-colors').value
                ? document.getElementById('partner1-colors').value.split(',').map(s => s.trim()).filter(Boolean)
                : ["Black"];
            const p2Colors = document.getElementById('partner2-colors').value
                ? document.getElementById('partner2-colors').value.split(',').map(s => s.trim()).filter(Boolean)
                : ["White"];

            productData.colors = { partner1: p1Colors, partner2: p2Colors };
            productData.sizes = {
                partner1: [
                    { name: "S", available: document.getElementById('p1-size-S')?.checked ?? true },
                    { name: "M", available: document.getElementById('p1-size-M')?.checked ?? true },
                    { name: "L", available: document.getElementById('p1-size-L')?.checked ?? true },
                    { name: "XL", available: document.getElementById('p1-size-XL')?.checked ?? true },
                    { name: "XXL", available: document.getElementById('p1-size-XXL')?.checked ?? true }
                ],
                partner2: [
                    { name: "S", available: document.getElementById('p2-size-S')?.checked ?? true },
                    { name: "M", available: document.getElementById('p2-size-M')?.checked ?? true },
                    { name: "L", available: document.getElementById('p2-size-L')?.checked ?? true },
                    { name: "XL", available: document.getElementById('p2-size-XL')?.checked ?? true },
                    { name: "XXL", available: document.getElementById('p2-size-XXL')?.checked ?? true }
                ]
            };
        } else {
            const colorsArr = document.getElementById('product-colors').value
                ? document.getElementById('product-colors').value.split(',').map(s => s.trim()).filter(Boolean)
                : ["Black"];

            productData.colors = colorsArr;
            productData.sizes = [
                { name: "S", available: document.getElementById('size-S')?.checked ?? true },
                { name: "M", available: document.getElementById('size-M')?.checked ?? true },
                { name: "L", available: document.getElementById('size-L')?.checked ?? true },
                { name: "XL", available: document.getElementById('size-XL')?.checked ?? true },
                { name: "XXL", available: document.getElementById('size-XXL')?.checked ?? true }
            ];
        }

        if (editId) {
            await db.collection("products").doc(editId).update(productData);
            Swal.fire({ icon: 'success', title: 'PRODUCT UPDATED!', timer: 1500, showConfirmButton: false });
        } else {
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("products").add(productData);
            Swal.fire({ icon: 'success', title: 'PRODUCT PUBLISHED!', timer: 1500, showConfirmButton: false });
        }

        closeModal('product-modal');
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message });
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Save Product & Publish ↘";
        }
    }
}

function filterProductsCatalog() {
    const query = document.getElementById('product-search-input')?.value.toLowerCase().trim() || '';
    const selectedCategory = document.getElementById('product-category-filter')?.value || 'all';
    const selectedStock = document.getElementById('product-stock-filter')?.value || 'all';

    const filtered = allProducts.filter(p => {
        const matchesQuery = (p.name || '').toLowerCase().includes(query) || 
                             (p.category || '').toLowerCase().includes(query) ||
                             String(p.price || '').includes(query);
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesStock = selectedStock === 'all' || 
                             (selectedStock === 'in-stock' && !p.isOutOfStock) || 
                             (selectedStock === 'out-of-stock' && p.isOutOfStock);

        return matchesQuery && matchesCategory && matchesStock;
    });

    renderProductsTab(filtered);
}

function renderProductsTab(productsToRender = allProducts) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // ৪টি KPI কার্ডের লাইভ হিসাব আপডেট
    const totalCount = Array.isArray(allProducts) ? allProducts.length : 0;
    const inStockCount = Array.isArray(allProducts) ? allProducts.filter(p => !p.isOutOfStock).length : 0;
    const outStockCount = totalCount - inStockCount;
    const avgPrice = totalCount > 0 
        ? Math.round(allProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / totalCount) 
        : 0;

    if (document.getElementById('stat-cat-total')) document.getElementById('stat-cat-total').innerText = totalCount;
    if (document.getElementById('stat-cat-instock')) document.getElementById('stat-cat-instock').innerText = inStockCount;
    if (document.getElementById('stat-cat-outstock')) document.getElementById('stat-cat-outstock').innerText = outStockCount;
    if (document.getElementById('stat-cat-avgprice')) document.getElementById('stat-cat-avgprice').innerText = `৳${avgPrice.toLocaleString()}`;

    if (!productsToRender || productsToRender.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100 card-shadow">
                <i class="fa-solid fa-box-open text-4xl text-gray-300 mb-2"></i>
                <p class="text-xs font-black text-gray-500 uppercase tracking-wider">No matching products found</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = productsToRender.map(p => {
        const imagesList = Array.isArray(p.images) ? p.images : [];
        const mainImg = imagesList[0] || 'images/placeholder.jpg';
        const imageCount = imagesList.length;

        // ডিসকাউন্ট % হিসাব
        let discountBadge = '';
        if (p.originalPrice && Number(p.originalPrice) > Number(p.price)) {
            const offPct = Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100);
            if (offPct > 0) {
                discountBadge = `<span class="text-[9px] font-black uppercase text-white bg-red-600 px-2 py-0.5 rounded-md shadow-sm">-${offPct}% OFF</span>`;
            }
        }

        // স্টকড সাইজ ও কালার সামারি
        let sizesPreview = '';
        if (Array.isArray(p.sizes)) {
            sizesPreview = p.sizes.map(s => `
                <span class="px-1.5 py-0.5 rounded text-[9px] font-black ${s.available ? 'bg-gray-100 text-gray-800' : 'bg-red-50 text-red-400 line-through'}">${s.name}</span>
            `).join('');
        } else if (p.sizes && typeof p.sizes === 'object') {
            sizesPreview = `<span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-50 text-purple-700">Couple Set</span>`;
        }

        const colorCount = Array.isArray(p.colors) ? p.colors.length : (p.colors ? 2 : 1);

        return `
            <div class="bg-white rounded-3xl border border-gray-100 card-shadow overflow-hidden group hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col justify-between">
                <div class="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    <img src="${mainImg}" alt="${p.altText || p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    
                    <!-- Top-Left Badges -->
                    <div class="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        <span class="text-[9px] font-black uppercase text-white bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">${p.category}</span>
                        ${discountBadge}
                        ${imageCount > 1 ? `<span class="text-[9px] font-bold text-gray-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-sm"><i class="fa-regular fa-images"></i> ${imageCount}</span>` : ''}
                    </div>

                    <!-- Top-Right Stock Pill -->
                    <div class="absolute top-2.5 right-2.5">
                        <span class="text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${p.isOutOfStock ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}">
                            ${p.isOutOfStock ? 'Sold Out' : 'In Stock'}
                        </span>
                    </div>

                    <!-- Bottom-Right Quick Share Link -->
                    <button type="button" onclick="copyProductShopLink('${p.id}')" class="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/90 hover:bg-black text-gray-900 hover:text-white backdrop-blur-md shadow-md flex items-center justify-center text-xs transition cursor-pointer" title="Copy Customer Product Link">
                        <i class="fa-solid fa-link"></i>
                    </button>
                </div>

                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between gap-2">
                            <h3 class="font-black text-gray-900 text-sm truncate" title="${p.name}">${p.name}</h3>
                            <span class="text-[9px] font-bold text-gray-400 shrink-0">${colorCount} Color${colorCount > 1 ? 's' : ''}</span>
                        </div>
                        
                        <div class="flex items-baseline gap-2 mt-1">
                            <span class="text-base font-black text-red-600">৳${p.price}</span>
                            ${p.originalPrice ? `<span class="text-xs font-bold text-gray-400 line-through">৳${p.originalPrice}</span>` : ''}
                        </div>

                        <!-- Available Sizes Row -->
                        <div class="flex flex-wrap items-center gap-1 mt-2.5">
                            ${sizesPreview}
                        </div>
                    </div>

                    <!-- Action Toolbar -->
                    <div class="flex items-center gap-1.5 pt-3 border-t border-gray-100 mt-3">
                        <button type="button" onclick="editProduct('${p.id}')" class="flex-1 bg-gray-900 hover:bg-black text-white text-[11px] font-black uppercase py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button type="button" onclick="duplicateProduct('${p.id}')" class="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 transition text-xs cursor-pointer" title="Clone / Duplicate Product">
                            <i class="fa-regular fa-clone"></i>
                        </button>
                        <button type="button" onclick="toggleOverallStock('${p.id}', ${!p.isOutOfStock})" class="p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${p.isOutOfStock ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-600 hover:text-white'}" title="Toggle In/Out of Stock">
                            <i class="fa-solid ${p.isOutOfStock ? 'fa-check' : 'fa-ban'}"></i>
                        </button>
                        <button type="button" onclick="deleteProduct('${p.id}')" class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 transition text-xs cursor-pointer" title="Delete Product">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// প্রোডাক্ট ডুপ্লিকেট / ক্লোন করার ফাংশন
function duplicateProduct(id) {
    const product = allProducts.find(p => p.id === id || String(p.id) === String(id));
    if (!product) return;

    editProduct(id);
    document.getElementById('product-edit-id').value = '';
    document.getElementById('product-name').value = `${product.name} (Copy)`;
    document.getElementById('product-form-title').innerText = 'Duplicate Product (Save as New)';

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Cloned! Update name/images & click Publish.',
        timer: 2500,
        showConfirmButton: false
    });
}

// কাস্টমার প্রোডাক্ট লিংক কপি করার ফাংশন
function copyProductShopLink(id) {
    const shareUrl = `https://redamsbd.me/product.html?id=${id}`;
    navigator.clipboard.writeText(shareUrl);
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Product Link Copied!',
        timer: 1400,
        showConfirmButton: false
    });
}

function editProduct(id) {
    const product = allProducts.find(p => p.id === id || String(p.id) === String(id));
    if (!product) return;

    document.getElementById('product-edit-id').value = product.id;
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-original-price').value = product.originalPrice || '';
    document.getElementById('product-category').value = product.category || 'drop-shoulder';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-alt-text').value = product.altText || '';
    document.getElementById('product-stock').value = product.isOutOfStock ? "0" : "1";

    currentEditImages = Array.isArray(product.images) ? [...product.images] : [];
    const previewContainer = document.getElementById('existing-images-preview');
    const imagesList = document.getElementById('existing-images-list');

    if (currentEditImages.length > 0 && previewContainer && imagesList) {
        previewContainer.classList.remove('hidden');
        imagesList.innerHTML = currentEditImages.map((img, idx) => `
            <div class="relative group">
                <img src="${img}" class="w-12 h-14 object-cover rounded-lg border border-gray-200">
                <button type="button" onclick="removeExistingImage(${idx})" class="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center shadow">&times;</button>
            </div>
        `).join('');
    } else if (previewContainer) {
        previewContainer.classList.add('hidden');
    }

    handleCategoryChange();

    if (product.category === 'couple-tshirt') {
        if (product.colors && typeof product.colors === 'object') {
            document.getElementById('partner1-colors').value = Array.isArray(product.colors.partner1) ? product.colors.partner1.join(', ') : '';
            document.getElementById('partner2-colors').value = Array.isArray(product.colors.partner2) ? product.colors.partner2.join(', ') : '';
        }

        if (product.sizes && typeof product.sizes === 'object') {
            ['S', 'M', 'L', 'XL', 'XXL'].forEach(sz => {
                const p1Size = Array.isArray(product.sizes.partner1) ? product.sizes.partner1.find(s => s.name === sz) : null;
                const p2Size = Array.isArray(product.sizes.partner2) ? product.sizes.partner2.find(s => s.name === sz) : null;
                const chkP1 = document.getElementById(`p1-size-${sz}`);
                const chkP2 = document.getElementById(`p2-size-${sz}`); 
                if (chkP1) chkP1.checked = p1Size ? p1Size.available : false; 
                if (chkP2) chkP2.checked = p2Size ? p2Size.available : false; 
            }); 
        } 
    } else { 
        document.getElementById('product-colors').value = Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || '');  
        if (Array.isArray(product.sizes)) { 
            ['S', 'M', 'L', 'XL', 'XXL'].forEach(sz => { 
                const sizeObj = product.sizes.find(s => s.name === sz); 
                const chk = document.getElementById(`size-${sz}`);
                if (chk) chk.checked = sizeObj ? sizeObj.available : false;
            });
        }
    }

    document.getElementById('product-form-title').innerText = 'Edit Product Details';
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

function removeExistingImage(index) {
    currentEditImages.splice(index, 1);
    const imagesList = document.getElementById('existing-images-list');
    if (imagesList) {
        imagesList.innerHTML = currentEditImages.map((img, idx) => `
            <div class="relative group">
                <img src="${img}" class="w-12 h-14 object-cover rounded-lg border border-gray-200">
                <button type="button" onclick="removeExistingImage(${idx})" class="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center shadow">&times;</button>
            </div>
        `).join('');
    }
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

// =================================================================
// ORDERS MANAGEMENT ENGINE (RESPONSIVE PC + MOBILE V4.2)
// =================================================================

function openAddOrderModal() { 
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        orderModal.classList.remove('hidden');
        orderModal.classList.add('active');
    }
}

function setOrderSourceQuickFilter(source, btnEl) {
    const sourceDropdown = document.getElementById('order-source-filter');
    if (sourceDropdown) sourceDropdown.value = source;

    document.querySelectorAll('.ord-pill-btn').forEach(btn => {
        btn.classList.remove('bg-gray-900', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    if (btnEl) {
        btnEl.classList.remove('bg-gray-100', 'text-gray-700');
        btnEl.classList.add('bg-gray-900', 'text-white');
    }
    filterOrdersTable();
}

function setOrderStatusQuickFilter(status) {
    const statusDropdown = document.getElementById('order-status-filter');
    if (statusDropdown) statusDropdown.value = status;
    filterOrdersTable();
}

function filterOrdersTable() {
    const query = document.getElementById('order-search-input')?.value.toLowerCase().trim() || '';
    const selectedSource = document.getElementById('order-source-filter')?.value || 'all';
    const selectedStatus = document.getElementById('order-status-filter')?.value || 'all';

    const filtered = allOrders.filter(o => {
        const name = (o.Customer_Name || o.customerName || '').toLowerCase();
        const phone = (o.Customer_Phone || o.customerPhone || '').toLowerCase();
        const items = (o.Ordered_Items || o.items || o.Product_Details || '').toLowerCase();
        const id = (o.id || '').toLowerCase();
        const matchesQuery = name.includes(query) || phone.includes(query) || id.includes(query) || items.includes(query);

        const src = o.orderSource || o.source || 'Website';
        const matchesSource = selectedSource === 'all' || src.toLowerCase().includes(selectedSource.toLowerCase());

        const st = o.status || 'Pending';
        let matchesStatus = selectedStatus === 'all';
        if (selectedStatus === 'Pending') matchesStatus = st === 'Pending';
        else if (selectedStatus === 'Confirmed') matchesStatus = st === 'Confirmed';
        else if (selectedStatus === 'Shipped') matchesStatus = st === 'Shipped';
        else if (selectedStatus === 'Completed') matchesStatus = (st === 'Completed' || st === 'Delivered');
        else if (selectedStatus === 'Cancelled') matchesStatus = st === 'Cancelled';

        return matchesQuery && matchesSource && matchesStatus;
    });

    renderOrdersTab(filtered);
}

function renderOrdersTab(ordersToRender = allOrders) {
    // ১. মিনি KPI কাউন্টার আপডেট
    if (Array.isArray(allOrders)) {
        const kpiAll = document.getElementById('ord-kpi-all');
        const kpiPending = document.getElementById('ord-kpi-pending');
        const kpiShipped = document.getElementById('ord-kpi-shipped');
        const kpiCompleted = document.getElementById('ord-kpi-completed');

        if (kpiAll) kpiAll.innerText = allOrders.length;
        if (kpiPending) kpiPending.innerText = allOrders.filter(o => (o.status || 'Pending') === 'Pending').length;
        if (kpiShipped) kpiShipped.innerText = allOrders.filter(o => (o.status || '') === 'Shipped').length;
        if (kpiCompleted) kpiCompleted.innerText = allOrders.filter(o => ['Completed', 'Delivered'].includes(o.status || '')).length;
    }

    const tbody = document.getElementById('orders-table');
    if (!tbody) return;

    // ২. প্যারেন্ট কন্টেইনার ও টেবিলকে অটোমেটিক ফুল-রেসপন্সিভ করা (PC-তে ডানপাশ কাটবে না, Mobile-এ কার্ড হবে)
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.classList.add('min-w-0');

    const tableEl = tbody.closest('table');
    const theadEl = tableEl ? tableEl.querySelector('thead') : null;
    if (tableEl) {
        tableEl.classList.remove('min-w-[920px]', 'min-w-[750px]');
        tableEl.classList.add('block', 'md:table', 'w-full');
    }
    if (theadEl) {
        theadEl.classList.add('hidden', 'md:table-header-group');
    }
    tbody.classList.add('block', 'md:table-row-group', 'p-3', 'md:p-0', 'space-y-3', 'md:space-y-0', 'bg-gray-50/60', 'md:bg-white');

    if (!ordersToRender || ordersToRender.length === 0) {
        tbody.innerHTML = '<tr class="block md:table-row"><td colspan="6" class="block md:table-cell p-8 text-center text-gray-400 font-bold uppercase text-xs">No matching orders found.</td></tr>';
        return;
    }

    tbody.innerHTML = ordersToRender.map(o => {
        const source = o.orderSource || o.source || 'Website';
        const method = o.Payment_Method || o.paymentMethod || 'COD';
        const status = o.status || 'Pending';
        const custName = o.Customer_Name || o.customerName || 'N/A';
        const custPhone = o.Customer_Phone || o.customerPhone || '';
        const cleanPhone = custPhone.replace(/[^0-9]/g, '');
        const waPhone = cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone;
        const address = o.Delivery_Address || o.address || '';
        const itemsText = o.Ordered_Items || o.items || o.Product_Details || 'Apparel Item';
        const billText = o.TOTAL_BILL || ('৳' + (o.amount || o.totalAmount || 0));
        const shortId = o.id.substring(0, 6).toUpperCase();
        
        // চ্যানেল ব্যাজ স্টাইল
        let sourceBadge = 'text-red-600 bg-red-50 border-red-200';
        let sourceIcon = 'fa-solid fa-globe';
        if (source.toLowerCase().includes('facebook')) {
            sourceBadge = 'text-blue-700 bg-blue-50 border-blue-200';
            sourceIcon = 'fa-brands fa-facebook';
        } else if (source.toLowerCase().includes('whatsapp')) {
            sourceBadge = 'text-emerald-700 bg-emerald-50 border-emerald-200';
            sourceIcon = 'fa-brands fa-whatsapp';
        } else if (source.toLowerCase().includes('manual')) {
            sourceBadge = 'text-amber-700 bg-amber-50 border-amber-200';
            sourceIcon = 'fa-solid fa-pen-to-square';
        }

        // স্ট্যাটাস ড্রপডাউন কালার
        let statusSelectStyle = 'bg-amber-50 text-amber-700 border-amber-300';
        if (status === 'Confirmed') statusSelectStyle = 'bg-blue-50 text-blue-700 border-blue-300';
        else if (status === 'Shipped') statusSelectStyle = 'bg-purple-50 text-purple-700 border-purple-300';
        else if (status === 'Completed' || status === 'Delivered') statusSelectStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300';
        else if (status === 'Cancelled') statusSelectStyle = 'bg-red-50 text-red-600 border-red-300';

        // অর্ডার তারিখ ও সময়
        let dateStr = '';
        if (o.createdAt) {
            const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
            if (!isNaN(d)) {
                dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }

        return `
            <tr class="block md:table-row bg-white rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-200/80 md:border-0 md:border-b md:border-gray-100 p-3.5 md:p-0 hover:bg-gray-50/90 transition">
                
                <!-- 1. Order ID & Channel -->
                <td class="flex md:table-cell items-center justify-between md:px-3.5 md:py-3.5 pb-2.5 md:pb-3.5 border-b border-gray-100 md:border-0 align-top">
                    <div class="flex md:block items-center gap-2">
                        <span class="font-mono font-black text-gray-900 text-xs block">#${shortId}</span>
                        <span class="inline-flex items-center gap-1 text-[9px] font-black uppercase border px-1.5 py-0.5 rounded mt-0 md:mt-1 ${sourceBadge}">
                            <i class="${sourceIcon}"></i> ${source}
                        </span>
                    </div>
                    ${dateStr ? `<span class="block text-[9px] font-semibold text-gray-400 md:mt-1">${dateStr}</span>` : ''}
                </td>

                <!-- 2. Customer & Direct Call/WA -->
                <td class="block md:table-cell md:px-3.5 md:py-3.5 py-2 md:py-3.5 align-top">
                    <div class="flex items-center justify-between md:block">
                        <p class="font-black text-gray-900 text-xs">${custName}</p>
                        <div class="flex items-center gap-1 mt-0 md:mt-1">
                            <span class="text-[11px] text-gray-600 font-mono font-bold">${custPhone}</span>
                            ${cleanPhone ? `
                                <a href="tel:${cleanPhone}" title="Call Customer" class="w-5 h-5 rounded bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center text-[9px] transition shrink-0">
                                    <i class="fa-solid fa-phone"></i>
                                </a>
                                <a href="https://wa.me/${waPhone}" target="_blank" title="WhatsApp Chat" class="w-5 h-5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-[10px] transition shrink-0">
                                    <i class="fa-brands fa-whatsapp"></i>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                    ${address ? `<p class="text-[10px] text-gray-400 font-medium mt-1 md:max-w-[155px] truncate" title="${address}">${address}</p>` : ''}
                </td>

                <!-- 3. Ordered Items -->
                <td class="block md:table-cell md:px-3.5 md:py-3.5 py-2 md:py-3.5 align-top">
                    <div class="bg-gray-50 md:bg-transparent p-2 md:p-0 rounded-xl border border-gray-100 md:border-0 text-[11px] font-bold text-gray-800 md:max-w-[165px] line-clamp-2 leading-snug" title="${itemsText}">
                        ${itemsText}
                    </div>
                </td>

                <!-- 4. Total & Payment -->
                <td class="flex md:table-cell items-center justify-between md:px-3.5 md:py-3.5 py-2 md:py-3.5 border-t border-gray-100 md:border-0 align-top whitespace-nowrap">
                    <span class="font-black text-red-600 text-sm md:text-xs block">${billText}</span>
                    <div class="text-right md:text-left">
                        <span class="inline-block text-[10px] font-bold text-gray-700">${method}</span>
                        ${o.Transaction_ID && o.Transaction_ID !== 'N/A' ? `<span class="block text-[9px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded mt-0.5">Trx: ${o.Transaction_ID}</span>` : ''}
                    </div>
                </td>

                <!-- 5 & 6. Status + Quick Actions (Side-by-side on Mobile, Separate Columns on PC) -->
                <td class="block md:table-cell md:px-3 md:py-3.5 pt-2 md:pt-3.5 align-top">
                    <div class="flex items-center justify-between gap-2 md:block">
                        <select onchange="updateOrderStatusDirectly('${o.id}', this.value)" 
                                class="flex-1 md:flex-none px-2 py-1.5 rounded-xl text-[11px] font-black border outline-none cursor-pointer transition shadow-sm ${statusSelectStyle}">
                            <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="Confirmed" ${status === 'Confirmed' ? 'selected' : ''}>✅ Confirmed</option>
                            <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>🚚 Shipped</option>
                            <option value="Completed" ${(status === 'Completed' || status === 'Delivered') ? 'selected' : ''}>🎉 Completed</option>
                            <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                        </select>

                        <!-- Mobile Actions (Visible only on mobile) -->
                        <div class="flex md:hidden items-center gap-1.5 shrink-0">
                            <button onclick="viewOrderDetails('${o.id}')" class="px-2.5 py-1.5 bg-gray-900 text-white font-bold text-xs rounded-xl"><i class="fa-solid fa-eye"></i></button>
                            <button onclick="openCourierDispatchModal('${o.id}')" class="px-2.5 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl"><i class="fa-solid fa-truck-fast"></i></button>
                            <button onclick="deleteOrder('${o.id}')" class="p-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </td>

                <!-- Desktop Quick Actions Column (Hidden on mobile, compact on PC so nothing cuts off) -->
                <td class="hidden md:table-cell px-3.5 py-3.5 align-top text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="viewOrderDetails('${o.id}')" class="px-2.5 py-1.5 bg-gray-900 text-white font-bold text-[11px] rounded-xl hover:bg-black transition cursor-pointer" title="View Full Details">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button onclick="openCourierDispatchModal('${o.id}')" class="px-2.5 py-1.5 bg-purple-600 text-white font-bold text-[11px] rounded-xl hover:bg-purple-700 transition cursor-pointer" title="Dispatch Courier">
                            <i class="fa-solid fa-truck-fast"></i>
                        </button>
                        <button onclick="deleteOrder('${o.id}')" class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Delete Order">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ম্যানুয়ালি কুরিয়ার বুক করার পর বা যেকোনো সময় সরাসরি স্ট্যাটাস আপডেট করার ফাংশন
async function updateOrderStatusDirectly(orderId, newStatus) {
    try {
        await db.collection("orders").doc(orderId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Status updated to "${newStatus}"`,
            timer: 1600,
            showConfirmButton: false
        });
    } catch (err) {
        console.error("Status Update Error:", err);
        Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message });
    }
}

function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('detail-order-id').innerText = `Order #${order.id.substring(0, 8).toUpperCase()}`; 
    document.getElementById('detail-source-badge').innerText = order.orderSource || order.source || 'Website Order'; 
    document.getElementById('detail-cust-name').innerText = order.Customer_Name || order.customerName || 'N/A'; 
    
    const rawPhone = order.Customer_Phone || order.customerPhone || 'N/A';
    document.getElementById('detail-cust-phone').innerText = rawPhone; 

    // মডালের ভেতরের কল ও হোয়াটসঅ্যাপ বাটন কানেক্ট করা
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const callBtn = document.getElementById('detail-phone-call-btn');
    const waBtn = document.getElementById('detail-whatsapp-btn');
    if (callBtn && cleanPhone) callBtn.href = `tel:${cleanPhone}`;
    if (waBtn && cleanPhone) waBtn.href = `https://wa.me/${cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone}`;

    document.getElementById('detail-cust-address').innerText = order.Delivery_Address || order.address || 'N/A'; 
    document.getElementById('detail-items').innerText = order.Ordered_Items || order.items || order.Product_Details || 'No item specifications recorded.';  
    document.getElementById('detail-subtotal').innerText = order.Subtotal || '৳0'; 
    document.getElementById('detail-delivery').innerText = order.Delivery_Charge || '৳60'; 
    document.getElementById('detail-discount').innerText = order.Discount ? `-৳${order.Discount}` : '৳0';
    document.getElementById('detail-total').innerText = order.TOTAL_BILL || ('৳' + (order.amount || order.totalAmount || 0));
    
    document.getElementById('detail-pay-method').innerText = order.Payment_Method || order.paymentMethod || 'Cash On Delivery';
    document.getElementById('detail-trxid').innerText = order.Transaction_ID || 'N/A';

    const dispatchBtn = document.getElementById('dispatch-from-detail-btn');
    if (dispatchBtn) {
        dispatchBtn.onclick = function() {
            closeModal('order-details-modal');
            openCourierDispatchModal(order.id);
        };
    }

    const modal = document.getElementById('order-details-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

async function saveOrder(e) {
    if (e) e.preventDefault();
    const submitBtn = document.getElementById('save-order-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
    }

    try {
        const name = document.getElementById('order-customer-name')?.value.trim();
        const phone = document.getElementById('order-customer-phone')?.value.trim();
        const address = document.getElementById('order-customer-address')?.value.trim();
        const items = document.getElementById('order-items-detail')?.value.trim() || 'Manual Order Entry';
        const amount = document.getElementById('order-amount')?.value.trim();
        const channel = document.getElementById('order-channel')?.value || 'Manual';
        const status = document.getElementById('order-status-select')?.value || 'Completed';
        const payMethod = document.getElementById('order-payment-method')?.value || 'COD';

        if (!name || !phone || !amount) {
            Swal.fire({ icon: 'warning', title: 'Attention', text: 'Please fill in Customer Name, Phone, and Total Amount.' });
            return;
        }

        const numAmount = parseInt(amount) || 0;

        const newOrderData = {
            Customer_Name: name,
            customerName: name,
            Customer_Phone: phone,
            customerPhone: phone,
            Delivery_Address: address,
            address: address,
            Ordered_Items: items,
            items: items,
            TOTAL_BILL: `৳${numAmount}`,
            amount: numAmount,
            totalAmount: numAmount,
            orderSource: channel,
            source: channel,
            status: status,
            Payment_Method: payMethod,
            paymentMethod: payMethod,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("orders").add(newOrderData);

        closeModal('order-modal');
        const form = document.getElementById('manual-order-form');
        if (form) form.reset();

        Swal.fire({ 
            icon: 'success', 
            title: 'ORDER RECORDED!', 
            text: `Order saved successfully with status "${status}". Dashboard metrics updated!`,
            timer: 1500, 
            showConfirmButton: false 
        });
    } catch (err) {
        console.error("Error saving order:", err);
        Swal.fire({ icon: 'error', title: 'Failed to Save', text: err.message });
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save & Sync Revenue`;
        }
    }
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

// =================================================================
// AUTONOMOUS LOGISTICS ENGINE (STEADFAST & PATHAO V6.0 PRO)
// =================================================================

const OWN_CLOUDFLARE_PROXY = "https://redams-courier-proxy.anmridwanulhassan.workers.dev";

const COURIER_CREDENTIALS = {
    steadfast: {
        locations: [
            { 
                id: "loc_dhaka", 
                name: "Kohinoor Gate Hub (Main)", 
                apiKey: "lxvwxbuudnywwjfdye9hldpkditxz2fr", 
                secretKey: "fain4ueocrmazwfw1iszsixi" 
            }
        ]
    },
    pathao: {
        clientId: "GRb4qN7dBL",
        clientSecret: "yByfviXZLyQ3uU5MQCADtjvA6zYpG5krZQpyYMqg",
        username: "redamsbd16@gmail.com",
        password: "RedAms16%",
        locations: [
            { id: "1001", name: "Pathao Store (Auto-Fetch)" }
        ]
    }
};

// বাংলাদেশি ১১ ডিজিটের ফোন নম্বর ক্লিনার
function formatBDPhone(rawPhone) {
    let digits = String(rawPhone || '').replace(/[^0-9]/g, '');
    if (digits.startsWith('880')) digits = '0' + digits.slice(3);
    else if (digits.startsWith('88')) digits = digits.slice(2);
    if (!digits.startsWith('0') && digits.length === 10) digits = '0' + digits;
    return digits;
}

// ঠিকানা থেকে Pathao City ID অনুমান করার হেল্পার
function detectPathaoCityId(addressText) {
    const addr = (addressText || '').toLowerCase();
    if (addr.includes('chittagong') || addr.includes('chattogram')) return 2;
    if (addr.includes('sylhet')) return 3;
    if (addr.includes('khulna')) return 4;
    if (addr.includes('rajshahi')) return 5;
    if (addr.includes('rangpur') || addr.includes('nilphamari') || addr.includes('saidpur')) return 6;
    if (addr.includes('barisal') || addr.includes('barishal')) return 7;
    if (addr.includes('mymensingh')) return 8;
    if (addr.includes('gazipur')) return 9;
    if (addr.includes('narayanganj')) return 10;
    if (addr.includes('comilla') || addr.includes('cumilla')) return 11;
    return 1; // Default Dhaka
}

async function callCourierApi(targetUrl, fetchOptions = {}) {
    const method = fetchOptions.method || 'POST';
    const headers = fetchOptions.headers || {};
    const body = fetchOptions.body || null;
    const cleanProxyBase = OWN_CLOUDFLARE_PROXY.replace(/\/+$/, '');

    const workerUrl = `${cleanProxyBase}?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(workerUrl, { method, headers, body });
    const rawText = await res.text();

    let data;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        throw new Error(`Invalid Server Response (HTTP ${res.status}): Server returned HTML instead of JSON.`);
    }

    if (!res.ok) {
        let detailedError = data?.message || data?.error || `Courier API Error (${res.status})`;
        if (data?.errors && typeof data.errors === 'object') {
            const errorList = Object.entries(data.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join(' | ');
            if (errorList) detailedError = errorList;
        }
        throw new Error(detailedError);
    }
    return data;
}

async function onCourierProviderChange() {
    const provider = document.getElementById('courier-provider')?.value || 'steadfast';
    const locationSelect = document.getElementById('courier-pickup-location');
    if (!locationSelect) return;

    if (provider === 'steadfast') {
        const locList = COURIER_CREDENTIALS.steadfast.locations || [];
        locationSelect.innerHTML = locList.map(loc => `
            <option value="${loc.id}">${loc.name}</option>
        `).join('');
    } 
    else if (provider === 'pathao') {
        locationSelect.innerHTML = `<option value="">Loading Pathao Stores...</option>`;
        try {
            const token = await getPathaoAccessToken();
            const storeRes = await callCourierApi("https://api-hermes.pathao.com/aladdin/api/v1/stores", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
            });
            const stores = storeRes?.data?.data || [];
            if (stores.length > 0) {
                locationSelect.innerHTML = stores.map(st => `
                    <option value="${st.store_id}">${st.store_name} (ID: ${st.store_id})</option>
                `).join('');
            } else {
                locationSelect.innerHTML = `<option value="">No Active Pathao Store Found</option>`;
            }
        } catch (err) {
            console.error("Pathao Store Fetch Error:", err);
            locationSelect.innerHTML = `<option value="">Failed to load stores (${err.message})</option>`;
        }
    }
}

function calculateTotalCod() {
    const productAmt = parseInt(document.getElementById('courier-product-amount')?.value) || 0;
    const deliveryFee = parseInt(document.getElementById('courier-delivery-charge')?.value) || 0;
    const totalCodInput = document.getElementById('courier-cod-amount');
    if (totalCodInput) totalCodInput.value = productAmt + deliveryFee;
}

function openCourierDispatchModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('courier-order-id').value = order.id;
    document.getElementById('courier-cust-name').value = order.Customer_Name || order.customerName || '';
    document.getElementById('courier-cust-phone').value = formatBDPhone(order.Customer_Phone || order.customerPhone || '');
    document.getElementById('courier-cust-address').value = order.Delivery_Address || order.address || '';
    
    const rawBill = order.TOTAL_BILL ? parseInt(String(order.TOTAL_BILL).replace(/[^0-9]/g, '')) : (order.amount || order.totalAmount || 0);
    
    if (document.getElementById('courier-product-amount')) document.getElementById('courier-product-amount').value = rawBill;
    if (document.getElementById('courier-delivery-charge')) document.getElementById('courier-delivery-charge').value = 0;
    
    calculateTotalCod();
    onCourierProviderChange();

    const modal = document.getElementById('courier-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

async function getPathaoAccessToken() {
    const creds = COURIER_CREDENTIALS.pathao;
    const targetUrl = "https://api-hermes.pathao.com/aladdin/api/v1/issue-token";

    const data = await callCourierApi(targetUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            username: creds.username,
            password: creds.password,
            grant_type: "password"
        })
    });

    if (data && data.access_token) return data.access_token;
    throw new Error(data?.message || "Pathao Auth Token Generation Failed");
}

async function dispatchCourierParcel(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById('dispatch-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Dispatching to Courier...`;
    }

    const orderId = document.getElementById('courier-order-id')?.value;
    const provider = document.getElementById('courier-provider')?.value || 'steadfast';
    const locationSelectEl = document.getElementById('courier-pickup-location');
    const selectedLocId = locationSelectEl?.value;
    const selectedLocName = locationSelectEl?.options[locationSelectEl.selectedIndex]?.text || selectedLocId;
    const name = document.getElementById('courier-cust-name')?.value.trim();
    const phone = formatBDPhone(document.getElementById('courier-cust-phone')?.value);
    const address = document.getElementById('courier-cust-address')?.value.trim();
    const productAmt = parseInt(document.getElementById('courier-product-amount')?.value) || 0;
    const deliveryFee = parseInt(document.getElementById('courier-delivery-charge')?.value) || 0;
    const codAmount = parseInt(document.getElementById('courier-cod-amount')?.value) || (productAmt + deliveryFee);
    const note = document.getElementById('courier-note')?.value.trim() || "REDAMS Apparel - Allow customer to check product";

    try {
        if (phone.length !== 11) {
            throw new Error(`Invalid Phone Number (${phone}). Must be 11 digits (e.g. 017XXXXXXXX).`);
        }

        let consignmentId = "";
        let trackingCode = "";
        let trackingUrl = "";
        let courierOriginalFee = 0;
        let courierCodCharge = 0;
        let liveApiStatus = "Pending Pickup";
        const invoiceNo = "RED-" + (orderId ? orderId.substring(0, 6).toUpperCase() : Math.floor(100000 + Math.random() * 900000));

        if (provider === 'steadfast') {
            const locConfig = COURIER_CREDENTIALS.steadfast.locations.find(l => l.id === selectedLocId) || COURIER_CREDENTIALS.steadfast.locations[0];
            
            const steadfastPayload = {
                invoice: invoiceNo,
                recipient_name: name,
                recipient_phone: phone,
                recipient_address: address,
                cod_amount: codAmount,
                note: note
            };

            const resData = await callCourierApi("https://portal.packzy.com/api/v1/create_order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": locConfig.apiKey,
                    "Secret-Key": locConfig.secretKey
                },
                body: JSON.stringify(steadfastPayload)
            });

            if (resData && (resData.status === 200 || resData.status === "200") && resData.consignment) {
                consignmentId = String(resData.consignment.consignment_id || resData.consignment.id || '');
                trackingCode = String(resData.consignment.tracking_code || consignmentId);
                trackingUrl = `https://steadfast.com.bd/t/${trackingCode}`;
                liveApiStatus = resData.consignment.status || "In Review";
            } else {
                throw new Error(resData?.message || (resData?.errors ? JSON.stringify(resData.errors) : "Steadfast Rejected Parcel"));
            }
        } 
        else if (provider === 'pathao') {
            const realStoreId = parseInt(selectedLocId);
            if (!realStoreId) {
                throw new Error("Please select a valid Pathao Pickup Store from the dropdown.");
            }

            const token = await getPathaoAccessToken();
            const detectedCity = detectPathaoCityId(address);

            let validZoneId = 1;
            try {
                const zoneRes = await callCourierApi(`https://api-hermes.pathao.com/aladdin/api/v1/cities/${detectedCity}/zone-list`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
                });
                const zones = zoneRes?.data?.data || [];
                if (zones.length > 0) validZoneId = zones[0].zone_id;
            } catch (zErr) {
                console.warn("Zone fetch fallback:", zErr);
            }

            const pathaoPayload = {
                store_id: realStoreId,
                merchant_order_id: invoiceNo,
                recipient_name: name,
                recipient_phone: phone,
                recipient_address: address.length < 10 ? `${address}, Bangladesh` : address,
                recipient_city: detectedCity,
                recipient_zone: validZoneId,
                delivery_type: 48,
                item_type: 2,
                special_instruction: note,
                item_quantity: 1,
                item_weight: 0.5,
                amount_to_collect: codAmount
            };

            const resData = await callCourierApi("https://api-hermes.pathao.com/aladdin/api/v1/orders", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json", 
                    "Accept": "application/json" 
                }, 
                body: JSON.stringify(pathaoPayload) 
            });  
            
            if (resData && (resData.type === 'success' || resData.code === 200) && resData.data) { 
                consignmentId = String(resData.data.consignment_id || ''); 
                trackingCode = consignmentId; 
                trackingUrl = `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}`;
                liveApiStatus = resData.data.order_status || "Pending";

                // Pathao API থেকে আসা আসল ডেলিভারি চার্জ ও ১% COD চার্জ (ঢাকা ও ঢাকার বাইরে সবক্ষেত্রেই প্রযোজ্য)
                const rawDeliveryFee = Number(resData.data.delivery_fee || 0);
                const rawCodFee = (resData.data.cod_fee !== undefined && Number(resData.data.cod_fee) > 0)
                    ? Number(resData.data.cod_fee)
                    : (codAmount > 0 ? (codAmount * 0.01) : 0);

                // দশমিকের পর কোনো পয়সা থাকলেই পরবর্তী পূর্ণ টাকায় (Round Up) নিয়ে যাবে
                courierOriginalFee = Math.ceil(rawDeliveryFee);
                courierCodCharge = Math.ceil(rawCodFee);
            } else {
                throw new Error(resData?.message || "Pathao Rejected Parcel");
            }
        }

        const totalCourierDeduction = courierOriginalFee + courierCodCharge;
        const netReceivableAmount = codAmount - totalCourierDeduction;

        // Firebase-এ সম্পূর্ণ আর্থিক ও লজিস্টিক রেকর্ড সংরক্ষণ
        await db.collection("courier_shipments").add({
            orderId: orderId || '',
            provider: provider.toUpperCase(),
            pickupLocationId: selectedLocId,
            pickupLocationName: selectedLocName,
            consignmentId: consignmentId,
            trackingCode: trackingCode,
            trackingUrl: trackingUrl,
            invoiceNo: invoiceNo,
            customerName: name,
            customerPhone: phone,
            address: address,
            productAmount: productAmt,
            deliveryCharge: deliveryFee,
            codAmount: codAmount,
            courierDeliveryFee: courierOriginalFee,
            courierCodCharge: courierCodCharge,
            totalCourierFee: totalCourierDeduction,
            netReceivable: netReceivableAmount,
            liveCourierStatus: liveApiStatus,
            status: 'In Transit',
            bookedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // মূল অর্ডারের স্ট্যাটাস অটোমেটিক 'Shipped' করা
        if (orderId) {
            await db.collection("orders").doc(orderId).update({
                status: 'Shipped',
                consignmentId: consignmentId,
                trackingCode: trackingCode,
                trackingUrl: trackingUrl,
                finalCodAmount: codAmount
            });
        }

        Swal.fire({
            icon: 'success',
            title: 'PARCEL BOOKED SUCCESSFULLY!',
            html: `
                <div class="text-left text-xs space-y-2 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 mt-2">
                    <div class="flex justify-between"><b>Courier:</b> <span class="uppercase font-black text-purple-700">${provider}</span></div>
                    <div class="flex justify-between"><b>Consignment ID:</b> <span class="font-mono text-purple-900 font-black">${consignmentId}</span></div>
                    <div class="flex justify-between"><b>Collectable COD:</b> <span class="font-black text-gray-900">৳${codAmount}</span></div>
                    ${totalCourierDeduction > 0 ? `
                        <div class="flex justify-between text-red-600"><b>Courier Charge (Del + COD):</b> <span class="font-bold">-৳${totalCourierDeduction} (৳${courierOriginalFee} + ৳${courierCodCharge})</span></div>
                        <div class="flex justify-between text-emerald-700 border-t border-gray-200 pt-1.5"><b>Net Merchant Payout:</b> <span class="font-black text-sm">৳${netReceivableAmount}</span></div>
                    ` : ''}
                    <div class="pt-2 flex gap-2">
                        <a href="${trackingUrl}" target="_blank" class="flex-1 text-center bg-purple-600 text-white font-bold px-3 py-2 rounded-xl text-[10px] uppercase">Live Tracking ↗</a>
                    </div>
                </div>
            `,
            confirmButtonColor: '#9333ea'
        });

        closeModal('courier-modal');
    } catch (err) {
        console.error("Logistics Dispatch Error:", err);
        Swal.fire({ 
            icon: 'error', 
            title: 'Booking Failed!', 
            text: err.message
        });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-truck-fast"></i> Confirm & Book Parcel`;
        }
    }
}

// Steadfast অ্যাকাউন্টের বর্তমান ব্যালেন্স চেক করার ফাংশন
async function checkSteadfastWalletBalance() {
    const labelEl = document.getElementById('sf-balance-label');
    if (labelEl) labelEl.innerText = 'Checking...';

    try {
        const sfLoc = COURIER_CREDENTIALS.steadfast.locations[0];
        const res = await callCourierApi("https://portal.packzy.com/api/v1/get_balance", {
            method: "GET",
            headers: {
                "Api-Key": sfLoc.apiKey,
                "Secret-Key": sfLoc.secretKey
            }
        });

        const currentBal = res?.current_balance ?? 0;
        if (labelEl) labelEl.innerText = `Bal: ৳${Number(currentBal).toLocaleString()}`;

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Steadfast Balance: ৳${Number(currentBal).toLocaleString()}`,
            timer: 2500,
            showConfirmButton: false
        });
    } catch (err) {
        if (labelEl) labelEl.innerText = 'Steadfast Balance';
        Swal.fire({ icon: 'error', title: 'Balance Check Failed', text: err.message });
    }
}

// ইন-অ্যাপ লাইভ পার্সেল ইনস্পেক্টর (Pathao/Steadfast অ্যাপে না ঢুকেই সব ডিটেইলস দেখার জন্য)
async function inspectCourierShipment(shipmentId) {
    const s = allCourierShipments.find(item => item.id === shipmentId);
    if (!s) return;

    Swal.fire({
        title: 'Fetching Live Courier Info...',
        text: `Checking #${s.consignmentId} from ${s.provider} server.`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    let liveStatusText = s.liveCourierStatus || s.status || 'In Transit';
    let liveFee = Math.ceil(Number(s.courierDeliveryFee || 0));
    let liveCodFee = Math.ceil(Number(s.courierCodCharge || 0));

    try {
        if (s.provider === 'PATHAO' && s.consignmentId) {
            const token = await getPathaoAccessToken();
            const res = await callCourierApi(`https://api-hermes.pathao.com/aladdin/api/v1/orders/${s.consignmentId}/info`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });
            if (res?.data) {
                liveStatusText = res.data.order_status || liveStatusText;

                if (res.data.delivery_fee !== undefined) {
                    liveFee = Math.ceil(Number(res.data.delivery_fee));
                }

                // Pathao API থেকে cod_fee বা total_fee পেলে সেটাও রাউন্ড-আপ করবে
                if (res.data.cod_fee !== undefined) {
                    liveCodFee = Math.ceil(Number(res.data.cod_fee));
                } else if (res.data.total_fee !== undefined) {
                    const roundedTotal = Math.ceil(Number(res.data.total_fee));
                    liveCodFee = Math.max(0, roundedTotal - liveFee);
                } else if (liveCodFee === 0 && Number(s.codAmount) > 0) {
                    // ঢাকার বাইরে ১% COD চার্জ রাউন্ড আপ (যেমন 14.40 -> 15)
                    const isOutsideDhaka = !(s.address || '').toLowerCase().includes('dhaka');
                    if (isOutsideDhaka) {
                        liveCodFee = Math.ceil(Number(s.codAmount) * 0.01);
                    }
                }

                const updatedTotalFee = liveFee + liveCodFee;
                const updatedNetPay = (Number(s.codAmount) || 0) - updatedTotalFee;

                // ডাটাবেসে রাউন্ড-আপ করা চার্জ ও নেট পে-আউট আপডেট রাখা
                await db.collection("courier_shipments").doc(s.id).update({
                    liveCourierStatus: liveStatusText,
                    courierDeliveryFee: liveFee,
                    courierCodCharge: liveCodFee,
                    totalCourierFee: updatedTotalFee,
                    netReceivable: updatedNetPay
                });
            }
        } 
        else if (s.provider === 'STEADFAST' && s.consignmentId) {
            const sfLoc = COURIER_CREDENTIALS.steadfast.locations[0];
            const res = await callCourierApi(`https://portal.packzy.com/api/v1/status_by_cid/${s.consignmentId}`, {
                method: "GET",
                headers: {
                    "Api-Key": sfLoc.apiKey,
                    "Secret-Key": sfLoc.secretKey
                }
            });
            if (res?.delivery_status) {
                liveStatusText = res.delivery_status.toUpperCase();
                await db.collection("courier_shipments").doc(s.id).update({
                    liveCourierStatus: liveStatusText
                });
            }
        }
    } catch (err) {
        console.warn("Live inspect fallback to cached data:", err.message);
    }

    const totalDed = liveFee + liveCodFee;
    const netPay = (Number(s.codAmount) || 0) - totalDed;

    Swal.fire({
        title: `<span class="text-base font-black uppercase">Parcel #${s.consignmentId}</span>`,
        html: `
            <div class="text-left text-xs space-y-3 mt-2">
                <div class="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                    <div>
                        <span class="text-[9px] font-black uppercase text-purple-600 block">Live Courier Status</span>
                        <span class="font-black text-purple-950 text-sm">${liveStatusText}</span>
                    </div>
                    <span class="px-2.5 py-1 rounded-xl bg-white text-purple-700 font-black text-[10px] border border-purple-200">${s.provider}</span>
                </div>

                <div class="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                    <p><b>Recipient:</b> ${s.customerName} (${s.customerPhone})</p>
                    <p><b>Address:</b> ${s.address}</p>
                    <p><b>Pickup Hub:</b> ${s.pickupLocationName || s.pickupLocationId || 'Main Store'}</p>
                    <p><b>Invoice:</b> <span class="font-mono">${s.invoiceNo || 'N/A'}</span></p>
                </div>

                <div class="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                    <div class="flex justify-between"><span>Customer COD Amount:</span> <b>৳${Number(s.codAmount || 0).toLocaleString()}</b></div>
                    <div class="flex justify-between text-red-600"><span>Courier Delivery Fee:</span> <b>-৳${liveFee}</b></div>
                    <div class="flex justify-between text-red-600"><span>COD Handling Charge (Rounded):</span> <b>-৳${liveCodFee}</b></div>
                    <div class="flex justify-between text-amber-700 text-[11px] pt-0.5"><span>Total Courier Cost:</span> <b>-৳${totalDed}</b></div>
                    <div class="flex justify-between text-emerald-800 border-t border-emerald-200 pt-1.5 text-sm font-black">
                        <span>Net Payout to You:</span> <span>৳${netPay.toLocaleString()}</span>
                    </div>
                </div>

                <div class="flex gap-2 pt-1">
                    <button type="button" onclick="printParcelSlip('${s.id}')" class="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-black text-[11px] uppercase cursor-pointer">
                        <i class="fa-solid fa-print mr-1"></i> Print Label
                    </button>
                    <a href="${s.trackingUrl}" target="_blank" class="flex-1 text-center bg-purple-600 text-white py-2.5 rounded-xl font-black text-[11px] uppercase">
                        Tracking Link ↗
                    </a>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true
    });
}

// প্রিন্টেবল প্রিমিয়াম REDAMS ব্র্যান্ডেড পার্সেল ডিসপ্যাচ স্লিপ জেনারেটর
function printParcelSlip(shipmentId) {
    const s = allCourierShipments.find(item => item.id === shipmentId);
    if (!s) return;

    // মূল অর্ডার থেকে অর্ডারকৃত প্রোডাক্টের বিবরণ খুঁজে বের করা
    const linkedOrder = Array.isArray(allOrders) ? allOrders.find(o => o.id === s.orderId) : null;
    const orderedItems = linkedOrder?.Ordered_Items || linkedOrder?.items || linkedOrder?.Product_Details || 'REDAMS Premium Apparel';
    const bookedDate = s.bookedAt?.seconds 
        ? new Date(s.bookedAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const isPathao = (s.provider || '').toUpperCase() === 'PATHAO';
    const providerColor = isPathao ? '#e11d48' : '#7c3aed';

    const printWin = window.open('', '_blank', 'width=460,height=720');
    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>REDAMS Dispatch Label - ${s.consignmentId}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap');
                
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Inter', Arial, sans-serif; 
                    background: #f3f4f6; 
                    padding: 16px; 
                    color: #09090b;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .slip-card {
                    max-width: 400px;
                    margin: 0 auto;
                    background: #ffffff;
                    border: 2.5px solid #09090b;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                }
                .top-accent {
                    height: 6px;
                    background: linear-gradient(90deg, #dc2626 0%, #09090b 50%, #dc2626 100%);
                }
                .header {
                    background: #09090b;
                    color: #ffffff;
                    padding: 16px 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .brand-title {
                    font-size: 24px;
                    font-weight: 900;
                    letter-spacing: 3px;
                    line-height: 1;
                }
                .brand-title span { color: #ef4444; }
                .brand-sub {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    color: #a1a1aa;
                    text-transform: uppercase;
                    margin-top: 4px;
                }
                .courier-pill {
                    background: ${providerColor};
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 900;
                    padding: 5px 11px;
                    border-radius: 8px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                .meta-strip {
                    background: #fef2f2;
                    border-bottom: 1.5px dashed #fca5a5;
                    padding: 8px 18px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    font-weight: 800;
                    color: #991b1b;
                }
                .cid-section {
                    padding: 14px 18px;
                    text-align: center;
                    border-bottom: 2px dashed #e4e4e7;
                    background: #fafafa;
                }
                .cid-label {
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #71717a;
                }
                .cid-code {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 20px;
                    font-weight: 800;
                    color: #09090b;
                    background: #ffffff;
                    border: 2px solid #09090b;
                    border-radius: 10px;
                    padding: 6px 12px;
                    margin: 6px 0 8px;
                    display: inline-block;
                    letter-spacing: 1px;
                }
                .barcode-lines {
                    height: 26px;
                    width: 82%;
                    margin: 0 auto;
                    background: repeating-linear-gradient(
                        90deg,
                        #09090b 0px, #09090b 2px,
                        transparent 2px, transparent 5px,
                        #09090b 5px, #09090b 9px,
                        transparent 9px, transparent 11px,
                        #09090b 11px, #09090b 12px,
                        transparent 12px, transparent 16px
                    );
                    opacity: 0.85;
                }
                .section {
                    padding: 14px 18px;
                    border-bottom: 1.5px solid #f4f4f5;
                }
                .sec-tag {
                    display: inline-block;
                    font-size: 9px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background: #09090b;
                    color: #ffffff;
                    padding: 2px 8px;
                    border-radius: 4px;
                    margin-bottom: 8px;
                }
                .cust-name {
                    font-size: 16px;
                    font-weight: 900;
                    color: #09090b;
                }
                .cust-phone {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    font-weight: 800;
                    color: #dc2626;
                    margin: 3px 0 6px;
                }
                .cust-addr {
                    font-size: 12px;
                    font-weight: 600;
                    color: #3f3f46;
                    line-height: 1.45;
                }
                .items-box {
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 10px 12px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1.4;
                }
                .cod-banner {
                    margin: 14px 18px;
                    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                    color: #ffffff;
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .cod-title {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.9;
                }
                .cod-sub {
                    font-size: 9px;
                    font-weight: 600;
                    opacity: 0.85;
                    margin-top: 2px;
                }
                .cod-amount {
                    font-size: 24px;
                    font-weight: 900;
                    letter-spacing: 0.5px;
                }
                .footer {
                    background: #09090b;
                    color: #e4e4e7;
                    padding: 10px 18px;
                    text-align: center;
                    font-size: 10px;
                    font-weight: 700;
                }
                .footer span { color: #ef4444; font-weight: 900; }
                @media print {
                    body { background: #ffffff; padding: 0; }
                    .slip-card { box-shadow: none; max-width: 100%; }
                }
            </style>
        </head>
        <body onload="setTimeout(() => window.print(), 300)">
            <div class="slip-card">
                <div class="top-accent"></div>
                
                <!-- REDAMS Brand Header -->
                <div class="header">
                    <div>
                        <div class="brand-title">RED<span>AMS</span></div>
                        <div class="brand-sub">Authentic Streetwear • redamsbd.me</div>
                    </div>
                    <div class="courier-pill">${s.provider}</div>
                </div>

                <!-- Invoice & Date Strip -->
                <div class="meta-strip">
                    <span>INV: ${s.invoiceNo || 'RED-APPAREL'}</span>
                    <span>DATE: ${bookedDate}</span>
                </div>

                <!-- Consignment ID & Barcode -->
                <div class="cid-section">
                    <div class="cid-label">Consignment / Tracking ID</div>
                    <div class="cid-code">${s.consignmentId}</div>
                    <div class="barcode-lines"></div>
                </div>

                <!-- Recipient Information -->
                <div class="section">
                    <div class="sec-tag">Deliver To</div>
                    <div class="cust-name">${s.customerName}</div>
                    <div class="cust-phone">📞 ${s.customerPhone}</div>
                    <div class="cust-addr">📍 ${s.address}</div>
                </div>

                <!-- Parcel Content Summary -->
                <div class="section" style="border-bottom: none; padding-bottom: 4px;">
                    <div class="sec-tag" style="background: #dc2626;">Parcel Contents</div>
                    <div class="items-box">${orderedItems}</div>
                </div>

                <!-- High-Visibility COD Box -->
                <div class="cod-banner">
                    <div>
                        <div class="cod-title">Cash On Delivery</div>
                        <div class="cod-sub">Check product in front of rider</div>
                    </div>
                    <div class="cod-amount">৳${Number(s.codAmount || 0).toLocaleString()}</div>
                </div>

                <!-- Brand Footer -->
                <div class="footer">
                    Sender: <span>REDAMS APPAREL</span> • Hub: ${s.pickupLocationName || 'Main Hub'}
                </div>
            </div>
        </body>
        </html>
    `);
    printWin.document.close();
}

// রিয়েল লাইভ স্ট্যাটাস সিঙ্ক (Steadfast & Pathao উভয় API থেকে আসল স্ট্যাটাস আপডেট)
async function syncLiveCourierStatuses() {
    const activeShipments = allCourierShipments.filter(s => ['In Transit', 'Hold'].includes(s.status) && s.consignmentId);
    if (activeShipments.length === 0) {
        Swal.fire({ icon: 'info', title: 'Nothing to Sync', text: 'No active "In Transit" shipments found.', timer: 1500, showConfirmButton: false });
        return;
    }

    Swal.fire({
        title: `Syncing ${activeShipments.length} Parcels...`,
        text: 'Fetching real-time delivery status from Steadfast & Pathao.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    let updatedCount = 0;
    const sfLoc = COURIER_CREDENTIALS.steadfast.locations[0];
    let pathaoToken = null;

    for (const s of activeShipments) {
        try {
            let mappedStatus = null;
            let rawApiStatus = null;

            if (s.provider === 'STEADFAST') {
                const res = await callCourierApi(`https://portal.packzy.com/api/v1/status_by_cid/${s.consignmentId}`, {
                    method: "GET",
                    headers: {
                        "Api-Key": sfLoc.apiKey,
                        "Secret-Key": sfLoc.secretKey
                    }
                });

                const deliveryStatus = (res?.delivery_status || '').toLowerCase();
                rawApiStatus = res?.delivery_status || '';
                if (deliveryStatus === 'delivered' || deliveryStatus === 'partial_delivered') mappedStatus = 'Delivered';
                else if (deliveryStatus === 'cancelled') mappedStatus = 'Cancelled';
                else if (deliveryStatus === 'hold') mappedStatus = 'Hold';
            } 
            else if (s.provider === 'PATHAO') {
                if (!pathaoToken) pathaoToken = await getPathaoAccessToken();
                const res = await callCourierApi(`https://api-hermes.pathao.com/aladdin/api/v1/orders/${s.consignmentId}/info`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${pathaoToken}`,
                        "Accept": "application/json"
                    }
                });
                rawApiStatus = res?.data?.order_status || '';
                const st = rawApiStatus.toLowerCase();
                if (st.includes('delivered')) mappedStatus = 'Delivered';
                else if (st.includes('cancel') || st.includes('return')) mappedStatus = 'Cancelled';
                else if (st.includes('hold')) mappedStatus = 'Hold';
            }

            const updatePayload = {};
            if (rawApiStatus && rawApiStatus !== s.liveCourierStatus) {
                updatePayload.liveCourierStatus = rawApiStatus;
            }
            if (mappedStatus && mappedStatus !== s.status) {
                updatePayload.status = mappedStatus;
                if (s.orderId && mappedStatus === 'Delivered') {
                    await db.collection("orders").doc(s.orderId).update({ status: 'Completed' });
                }
                updatedCount++;
            }
            if (Object.keys(updatePayload).length > 0) {
                await db.collection("courier_shipments").doc(s.id).update(updatePayload);
            }
        } catch (err) {
            console.warn(`Sync skipped for ${s.consignmentId}:`, err.message);
        }
    }

    Swal.fire({
        icon: 'success',
        title: 'SYNC COMPLETE!',
        text: `${updatedCount} parcel(s) updated with latest delivery status.`,
        timer: 1800,
        showConfirmButton: false
    });
}

// ম্যানুয়ালি কুরিয়ার স্ট্যাটাস পরিবর্তনের ফাংশন
async function updateCourierStatusDirectly(shipmentId, orderId, newStatus) {
    try {
        await db.collection("courier_shipments").doc(shipmentId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (orderId) {
            if (newStatus === 'Delivered') {
                await db.collection("orders").doc(orderId).update({ status: 'Completed' });
            } else if (newStatus === 'Cancelled') {
                await db.collection("orders").doc(orderId).update({ status: 'Cancelled' });
            }
        }

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Parcel marked as "${newStatus}"`,
            timer: 1500,
            showConfirmButton: false
        });
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message });
    }
}

// আসল Pathao API Cancel + Firebase Sync
async function cancelCourierShipment(shipmentDocId, orderId, trackingCode) {
    const shipment = allCourierShipments.find(item => item.id === shipmentDocId);
    const cid = shipment?.consignmentId || trackingCode;
    const provider = (shipment?.provider || '').toUpperCase();

    Swal.fire({
        title: 'Cancel Courier Parcel?',
        text: `This will send a live cancellation request to ${provider || 'Courier'} for #${cid}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#000',
        confirmButtonText: 'Yes, Cancel on Courier'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Cancelling on Courier...',
                text: 'Sending live cancellation request to courier portal.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                if (provider === 'PATHAO' && cid) {
                    const token = await getPathaoAccessToken();
                    await callCourierApi(`https://api-hermes.pathao.com/aladdin/api/v1/orders/${cid}/cancel`, {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        }
                    });
                }

                await db.collection("courier_shipments").doc(shipmentDocId).update({
                    status: 'Cancelled',
                    liveCourierStatus: 'Cancelled',
                    cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                if (orderId) {
                    await db.collection("orders").doc(orderId).update({
                        status: 'Pending',
                        trackingCode: firebase.firestore.FieldValue.delete(),
                        consignmentId: firebase.firestore.FieldValue.delete(),
                        trackingUrl: firebase.firestore.FieldValue.delete()
                    });
                }

                Swal.fire({
                    icon: 'success',
                    title: 'PARCEL CANCELLED!',
                    text: `${provider} parcel #${cid} cancelled successfully & main order reset to Pending.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Courier Cancel Error:", err);
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Courier Cancel Failed', 
                    text: err.message || "Could not cancel on courier portal (parcel may already be picked up)." 
                });
            }
        }
    });
}

async function deleteCourierShipment(shipmentDocId) {
    Swal.fire({
        title: 'Delete Record?',
        text: 'Permanently remove this parcel record from admin panel?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#000',
        confirmButtonText: 'Delete'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await db.collection("courier_shipments").doc(shipmentDocId).delete();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1000, showConfirmButton: false });
        }
    });
}

function copyParcelPrintLabel(shipmentId) {
    const s = allCourierShipments.find(item => item.id === shipmentId);
    if (!s) return;

    const labelText = 
`----------------------------------------
REDAMS APPAREL - PARCEL DISPATCH LABEL
----------------------------------------
CONSIGNMENT ID : ${s.consignmentId || s.trackingCode}
TRACKING CODE  : ${s.trackingCode}
INVOICE NO     : ${s.invoiceNo || 'N/A'}
COURIER        : ${s.provider}

RECIPIENT NAME : ${s.customerName}
PHONE NUMBER   : ${s.customerPhone}
ADDRESS        : ${s.address}

TOTAL COD TO COLLECT : ৳${s.codAmount}
NET PAYOUT           : ৳${s.netReceivable ?? s.codAmount}
TRACKING LINK  : ${s.trackingUrl || 'N/A'}
----------------------------------------`;

    navigator.clipboard.writeText(labelText);
    Swal.fire({
        icon: 'success',
        title: 'LABEL COPIED!',
        text: 'Parcel label text copied to clipboard.',
        timer: 1500,
        showConfirmButton: false
    });
}

function setCourierProviderQuickFilter(provider, btnEl) {
    const drop = document.getElementById('courier-provider-filter');
    if (drop) drop.value = provider;

    document.querySelectorAll('.cour-pill-btn').forEach(btn => {
        btn.classList.remove('bg-gray-900', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    if (btnEl) {
        btnEl.classList.remove('bg-gray-100', 'text-gray-700');
        btnEl.classList.add('bg-gray-900', 'text-white');
    }
    filterCourierShipments();
}

function setCourierStatusQuickFilter(status) {
    const drop = document.getElementById('courier-status-filter');
    if (drop) drop.value = status;
    filterCourierShipments();
}

function filterCourierShipments() {
    const query = document.getElementById('courier-search-input')?.value.toLowerCase().trim() || '';
    const selectedProvider = document.getElementById('courier-provider-filter')?.value || 'all';
    const selectedStatus = document.getElementById('courier-status-filter')?.value || 'all';

    const filtered = allCourierShipments.filter(s => {
        const matchesQuery = (s.consignmentId || '').toLowerCase().includes(query) ||
                             (s.trackingCode || '').toLowerCase().includes(query) ||
                             (s.customerName || '').toLowerCase().includes(query) ||
                             (s.customerPhone || '').toLowerCase().includes(query);
        const matchesProvider = selectedProvider === 'all' || s.provider === selectedProvider;
        const matchesStatus = selectedStatus === 'all' || 
            (selectedStatus === 'Cancelled' ? (s.status === 'Cancelled' || s.status === 'Hold') : s.status === selectedStatus);

        return matchesQuery && matchesProvider && matchesStatus;
    });

    renderCourierTab(filtered);
}

function renderCourierTab(shipmentsToRender = allCourierShipments) {
    const table = document.getElementById('courier-shipments-table');
    if (!table) return;

    const total = allCourierShipments.length;
    const transit = allCourierShipments.filter(s => s.status === 'In Transit').length;
    const delivered = allCourierShipments.filter(s => s.status === 'Delivered').length;
    const cancelled = allCourierShipments.filter(s => s.status === 'Cancelled' || s.status === 'Hold').length;
    const activeCod = allCourierShipments.filter(s => s.status === 'In Transit').reduce((sum, s) => sum + (parseInt(s.codAmount) || 0), 0);
    const totalFees = allCourierShipments.filter(s => s.status !== 'Cancelled').reduce((sum, s) => sum + (Number(s.totalCourierFee) || 0), 0);

    if (document.getElementById('stat-courier-total')) document.getElementById('stat-courier-total').innerText = total;
    if (document.getElementById('stat-courier-transit')) document.getElementById('stat-courier-transit').innerText = transit;
    if (document.getElementById('stat-courier-delivered')) document.getElementById('stat-courier-delivered').innerText = delivered;
    if (document.getElementById('stat-courier-cancelled')) document.getElementById('stat-courier-cancelled').innerText = cancelled;
    if (document.getElementById('stat-courier-cod')) document.getElementById('stat-courier-cod').innerText = `৳${activeCod.toLocaleString()}`;
    if (document.getElementById('stat-courier-fees')) document.getElementById('stat-courier-fees').innerText = `৳${totalFees.toLocaleString()}`;

    if (shipmentsToRender.length === 0) {
        table.innerHTML = '<tr class="block md:table-row"><td colspan="5" class="block md:table-cell p-8 text-center text-gray-400 font-bold uppercase text-xs">No parcel shipment records found.</td></tr>';
        return;
    }

    table.innerHTML = shipmentsToRender.map(s => {
        const providerBadge = s.provider === 'STEADFAST' 
            ? 'bg-purple-50 text-purple-700 border-purple-200' 
            : 'bg-red-50 text-red-600 border-red-200';
        
        const status = s.status || 'In Transit';
        let statusSelectStyle = 'bg-blue-50 text-blue-700 border-blue-300';
        if (status === 'Delivered') statusSelectStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300';
        else if (status === 'Hold') statusSelectStyle = 'bg-amber-50 text-amber-700 border-amber-300';
        else if (status === 'Cancelled') statusSelectStyle = 'bg-red-50 text-red-600 border-red-300';

        const displayCid = s.consignmentId || s.trackingCode || 'N/A';
        const liveTrackingUrl = s.trackingUrl || (s.provider === 'STEADFAST' 
            ? `https://steadfast.com.bd/t/${s.trackingCode}` 
            : `https://merchant.pathao.com/tracking?consignment_id=${s.consignmentId}`);

        const cleanPhone = String(s.customerPhone || '').replace(/[^0-9]/g, '');
        const waPhone = cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone;
        const bookedDate = s.bookedAt?.seconds 
            ? new Date(s.bookedAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) 
            : 'Recently';

        const hasOriginalFee = Number(s.totalCourierFee || 0) > 0;
        const netPayout = Number(s.netReceivable ?? ((Number(s.codAmount) || 0) - Number(s.totalCourierFee || 0)));

        return `
            <tr class="block md:table-row bg-white rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-200/80 md:border-0 md:border-b md:border-gray-100 p-3.5 md:p-0 hover:bg-gray-50/90 transition">
                
                <!-- 1. CID, Provider & Live Sub-Status -->
                <td class="flex md:table-cell items-center justify-between md:px-4 md:py-3.5 pb-2.5 md:pb-3.5 border-b border-gray-100 md:border-0 align-top">
                    <div>
                        <button type="button" onclick="copyTrackingCode('${displayCid}')" title="Click to Copy CID" class="inline-flex items-center gap-1.5 font-mono font-black text-purple-900 hover:text-red-600 text-xs cursor-pointer">
                            <span class="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">CID</span>
                            ${displayCid} <i class="fa-regular fa-copy text-[10px] opacity-60"></i>
                        </button>
                        <div class="flex flex-wrap items-center gap-1.5 mt-1">
                            <span class="px-2 py-0.5 text-[9px] font-black rounded border uppercase ${providerBadge}">${s.provider}</span>
                            <span class="text-[9px] font-bold text-gray-400">${bookedDate}</span>
                        </div>
                        ${s.liveCourierStatus ? `<span class="inline-block text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1">API: ${s.liveCourierStatus}</span>` : ''}
                    </div>
                </td>

                <!-- 2. Recipient & Contact -->
                <td class="block md:table-cell md:px-4 md:py-3.5 py-2 md:py-3.5 align-top">
                    <div class="flex items-center justify-between md:block">
                        <p class="font-black text-gray-900 text-xs">${s.customerName || 'N/A'}</p>
                        <div class="flex items-center gap-1 mt-0 md:mt-1">
                            <span class="text-[11px] text-gray-700 font-mono font-bold">${s.customerPhone || ''}</span>
                            ${cleanPhone ? `
                                <a href="tel:${cleanPhone}" class="w-5 h-5 rounded bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center text-[9px] transition"><i class="fa-solid fa-phone"></i></a>
                                <a href="https://wa.me/${waPhone}" target="_blank" class="w-5 h-5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-[10px] transition"><i class="fa-brands fa-whatsapp"></i></a>
                            ` : ''}
                        </div>
                    </div>
                    <p class="text-[10px] text-gray-500 font-medium mt-1 md:max-w-[175px] truncate" title="${s.address || ''}">${s.address || ''}</p>
                </td>

                <!-- 3. COD, Original Courier Fee & Net Payout -->
                <td class="flex md:table-cell items-center justify-between md:px-4 md:py-3.5 py-2 md:py-3.5 border-t border-gray-100 md:border-0 align-top whitespace-nowrap">
                    <div>
                        <span class="font-black text-purple-700 text-sm md:text-xs block">COD: ৳${Number(s.codAmount || 0).toLocaleString()}</span>
                        ${hasOriginalFee ? `
                            <span class="text-[9px] font-bold text-red-500 block">
                                Fee: -৳${s.totalCourierFee} (Del: ৳${s.courierDeliveryFee || 0} + COD: ৳${s.courierCodCharge || 0})
                            </span>
                            <span class="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                Net: ৳${netPayout.toLocaleString()}
                            </span>
                        ` : `
                            <span class="text-[9px] font-bold text-gray-400 block">Prod: ৳${s.productAmount || 0} + Del: ৳${s.deliveryCharge || 0}</span>
                        `}
                    </div>
                </td>

                <!-- 4. Editable Live Status -->
                <td class="block md:table-cell md:px-4 md:py-3.5 pt-2 md:pt-3.5 align-top">
                    <div class="flex items-center justify-between gap-2 md:block">
                        <select onchange="updateCourierStatusDirectly('${s.id}', '${s.orderId || ''}', this.value)" 
                                class="flex-1 md:flex-none px-2.5 py-1.5 rounded-xl text-[11px] font-black border outline-none cursor-pointer transition shadow-sm ${statusSelectStyle}">
                            <option value="In Transit" ${status === 'In Transit' ? 'selected' : ''}>🚚 In Transit</option>
                            <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>🎉 Delivered</option>
                            <option value="Hold" ${status === 'Hold' ? 'selected' : ''}>⏸️ Hold / Return</option>
                            <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                        </select>

                        <!-- Mobile Actions -->
                        <div class="flex md:hidden items-center gap-1 shrink-0">
                            <button type="button" onclick="inspectCourierShipment('${s.id}')" class="px-2.5 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold" title="Live Info"><i class="fa-solid fa-eye"></i></button>
                            <button type="button" onclick="printParcelSlip('${s.id}')" class="px-2.5 py-1.5 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold" title="Print"><i class="fa-solid fa-print"></i></button>
                            <button type="button" onclick="cancelCourierShipment('${s.id}', '${s.orderId || ''}', '${s.trackingCode}')" class="px-2.5 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold" title="Cancel"><i class="fa-solid fa-ban"></i></button>
                            <button type="button" onclick="deleteCourierShipment('${s.id}')" class="p-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </td>

                <!-- 5. Desktop Quick Actions -->
                <td class="hidden md:table-cell px-4 py-3.5 align-top text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                        <button type="button" onclick="inspectCourierShipment('${s.id}')" class="px-2.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-[11px] font-black transition cursor-pointer inline-flex items-center gap-1" title="Live Courier Details & Financials">
                            <i class="fa-solid fa-eye"></i> Details
                        </button>
                        <button type="button" onclick="printParcelSlip('${s.id}')" class="p-2 bg-gray-100 hover:bg-black hover:text-white text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer" title="Print Parcel Slip">
                            <i class="fa-solid fa-print"></i>
                        </button>
                        <button type="button" onclick="cancelCourierShipment('${s.id}', '${s.orderId || ''}', '${s.trackingCode}')" class="p-2 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer" title="Cancel Booking on Courier">
                            <i class="fa-solid fa-ban"></i>
                        </button>
                        <button type="button" onclick="deleteCourierShipment('${s.id}')" class="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer" title="Delete Record">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function copyTrackingCode(code) {
    navigator.clipboard.writeText(code);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Copied: ${code}`, timer: 1200, showConfirmButton: false });
}

// =================================================================
// INVENTORY, REVIEWS & PROMO ENGINE (V2.0 PRO)
// =================================================================

function filterInventoryMatrix() {
    const query = document.getElementById('inventory-search-input')?.value.toLowerCase().trim() || '';
    const cat = document.getElementById('inventory-category-filter')?.value || 'all';
    const stock = document.getElementById('inventory-stock-filter')?.value || 'all';

    const filtered = allProducts.filter(p => {
        const matchQ = (p.name || '').toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query);
        const matchCat = cat === 'all' || p.category === cat;
        const matchStock = stock === 'all' || (stock === 'in-stock' && !p.isOutOfStock) || (stock === 'out-of-stock' && p.isOutOfStock);
        return matchQ && matchCat && matchStock;
    });

    renderInventoryTab(filtered);
}

function renderInventoryTab(productsList = allProducts) {
    const table = document.getElementById('inventory-table');
    if (!table) return;

    if (!productsList || productsList.length === 0) {
        table.innerHTML = '<tr class="block md:table-row"><td colspan="4" class="block md:table-cell p-8 text-center text-gray-400 font-bold uppercase text-xs">No matching products in inventory.</td></tr>';
        return;
    }

    table.innerHTML = productsList.map(p => {
        const thumbImg = (Array.isArray(p.images) && p.images[0]) ? p.images[0] : 'images/placeholder.jpg';
        let sizesHtml = '';

        if (Array.isArray(p.sizes)) {
            sizesHtml = p.sizes.map(s => `
                <button type="button" onclick="toggleSingleSize('${p.id}', '${s.name}', ${!s.available})" 
                    class="px-2.5 py-1.5 text-[10px] font-black rounded-xl mr-1.5 mb-1 transition cursor-pointer inline-flex items-center gap-1 ${s.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white' : 'bg-red-50 text-red-500 border border-red-200 line-through opacity-75 hover:opacity-100'}">
                    <span>${s.name}</span>
                    <i class="fa-solid ${s.available ? 'fa-check text-[9px]' : 'fa-xmark text-[9px]'}"></i>
                </button>
            `).join('');
        } else {
            sizesHtml = '<span class="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">Couple Set Sizes (Edit in Catalog)</span>';
        }

        return `
            <tr class="block md:table-row bg-white rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-200/80 md:border-0 md:border-b md:border-gray-100 p-3.5 md:p-0 hover:bg-gray-50/90 transition">
                <td class="flex md:table-cell items-center justify-between md:px-5 md:py-3.5 pb-2.5 md:pb-3.5 border-b border-gray-100 md:border-0">
                    <div class="flex items-center gap-3">
                        <img src="${thumbImg}" class="w-10 h-12 rounded-xl object-cover border border-gray-200 shrink-0">
                        <div>
                            <p class="font-black text-gray-900 text-xs">${p.name}</p>
                            <p class="text-[10px] font-bold text-red-600 mt-0.5">৳${p.price}</p>
                        </div>
                    </div>
                </td>
                <td class="hidden md:table-cell px-5 py-3.5">
                    <span class="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-black uppercase">${p.category}</span>
                </td>
                <td class="flex md:table-cell items-center justify-between md:px-5 md:py-3.5 py-2.5 md:py-3.5 border-b border-gray-100 md:border-0">
                    <span class="md:hidden text-[10px] font-black uppercase text-gray-400">Overall Stock:</span>
                    <button type="button" onclick="toggleOverallStock('${p.id}', ${!p.isOutOfStock})" 
                        class="px-3 py-1.5 text-[11px] rounded-xl font-black uppercase tracking-wider transition cursor-pointer ${p.isOutOfStock ? 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white'}">
                        ${p.isOutOfStock ? '❌ Out of Stock' : '✅ In Stock'}
                    </button>
                </td>
                <td class="block md:table-cell md:px-5 md:py-3.5 pt-2.5 md:pt-3.5">
                    <span class="block md:hidden text-[10px] font-black uppercase text-gray-400 mb-1.5">Tap Size to Toggle:</span>
                    <div class="flex flex-wrap items-center">${sizesHtml}</div>
                </td>
            </tr>
        `;
    }).join('');
}

async function toggleOverallStock(id, newStatus) {
    await db.collection("products").doc(id).update({ isOutOfStock: newStatus });
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: newStatus ? 'Marked Out of Stock' : 'Marked In Stock',
        timer: 1200,
        showConfirmButton: false
    });
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
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Size ${sizeName}: ${newAvailability ? 'Available' : 'Sold Out'}`,
        timer: 1200,
        showConfirmButton: false
    });
}

// =================================================================
// UPDATED PROMO CODE ENGINE V2.0 PRO (GLOBAL, CATEGORY & PRODUCT)
// =================================================================

function updatePromoLivePreview() {
    const code = document.getElementById('promo-code')?.value.trim().toUpperCase() || 'REDAMS20';
    const type = document.getElementById('promo-type')?.value || 'percent';
    const val = document.getElementById('promo-value')?.value || '0';
    const scopeEl = document.getElementById('promo-scope');
    const scopeText = scopeEl ? scopeEl.options[scopeEl.selectedIndex].text : 'All Storefront Drops';

    const codePreview = document.getElementById('promo-live-code-preview');
    const valPreview = document.getElementById('promo-live-val-preview');
    const scopePreview = document.getElementById('promo-live-scope-preview');

    if (codePreview) codePreview.innerText = code;
    if (scopePreview) scopePreview.innerText = scopeText;
    if (valPreview) {
        if (type === 'delivery') valPreview.innerText = 'FREE DEL';
        else if (type === 'percent') valPreview.innerText = `${val}% OFF`;
        else valPreview.innerText = `৳${val} OFF`;
    }
}

function openAddPromoModal() { 
    const promoModal = document.getElementById('promo-modal');
    if (!promoModal) return;

    // Reset Form Fields
    if (document.getElementById('promo-code')) document.getElementById('promo-code').value = '';
    if (document.getElementById('promo-type')) document.getElementById('promo-type').value = 'percent';
    if (document.getElementById('promo-value')) document.getElementById('promo-value').value = '';
    if (document.getElementById('promo-scope')) document.getElementById('promo-scope').value = 'global';

    // Populate Individual Products Dropdown
    populatePromoProductDropdown();

    // Reset Target Visibilities & Live Preview
    handlePromoScopeChange();
    togglePromoValueInput();
    updatePromoLivePreview();

    // Display Modal
    promoModal.classList.remove('hidden');
    promoModal.classList.add('flex');
}

function populatePromoProductDropdown() {
    const productSelect = document.getElementById('promo-target-product');
    if (!productSelect) return;

    const products = (typeof allProducts !== 'undefined' && Array.isArray(allProducts)) ? allProducts : (window.allProducts || []);
    if (products.length === 0) {
        productSelect.innerHTML = `<option value="">No products available</option>`;
        return;
    }

    productSelect.innerHTML = products.map(p => `
        <option value="${p.id}">${p.name} (৳${p.price}) [${p.category || 'N/A'}]</option>
    `).join('');
}

function handlePromoScopeChange() {
    const scope = document.getElementById('promo-scope')?.value || 'global';
    const categoryWrapper = document.getElementById('promo-category-target');
    const productWrapper = document.getElementById('promo-product-target');

    if (categoryWrapper) categoryWrapper.classList.add('hidden');
    if (productWrapper) productWrapper.classList.add('hidden');

    if (scope === 'category' && categoryWrapper) {
        categoryWrapper.classList.remove('hidden');
    } else if (scope === 'product' && productWrapper) {
        productWrapper.classList.remove('hidden');
    }
    updatePromoLivePreview();
}

function togglePromoValueInput() {
    const type = document.getElementById('promo-type')?.value;
    const valueWrapper = document.getElementById('promo-value-wrapper');
    const valueInput = document.getElementById('promo-value');

    if (type === 'delivery') {
        if (valueWrapper) valueWrapper.classList.add('opacity-50', 'pointer-events-none');
        if (valueInput) valueInput.value = '0';
    } else {
        if (valueWrapper) valueWrapper.classList.remove('opacity-50', 'pointer-events-none');
    }
    updatePromoLivePreview();
}

async function savePromo() {
    const code = document.getElementById('promo-code')?.value.trim().toUpperCase();
    const type = document.getElementById('promo-type')?.value;
    const valueNum = parseFloat(document.getElementById('promo-value')?.value || 0);
    const scope = document.getElementById('promo-scope')?.value || 'global';

    const targetCategory = document.getElementById('promo-target-category')?.value;
    const targetProductId = document.getElementById('promo-target-product')?.value;

    if (!code) {
        Swal.fire({ icon: 'warning', title: 'Attention!', text: 'Please enter a valid Promo Code string.' });
        return;
    }

    if (type !== 'delivery' && (isNaN(valueNum) || valueNum <= 0)) {
        Swal.fire({ icon: 'warning', title: 'Attention!', text: 'Please enter a valid discount amount or percentage.' });
        return;
    }

    if (scope === 'product' && !targetProductId) {
        Swal.fire({ icon: 'warning', title: 'Attention!', text: 'Please select a target product.' });
        return;
    }

    const promoData = {
        code: code,
        type: type, // 'percent', 'fixed', 'delivery'
        value: type === 'delivery' ? 0 : valueNum,
        scope: scope, // 'global', 'category', 'product'
        targetCategory: scope === 'category' ? targetCategory : null,
        targetProductId: scope === 'product' ? String(targetProductId) : null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("promos").doc(code).set(promoData);

        closeModal('promo-modal');

        Swal.fire({
            icon: 'success',
            title: 'PROMO CREATED!',
            text: `Voucher Code '${code}' is now active.`,
            timer: 1500,
            showConfirmButton: false
        });
    } catch (err) {
        console.error("Save Promo Error:", err);
        Swal.fire({ icon: 'error', title: 'Failed to Save', text: err.message });
    }
}

function copyPromoVoucherCode(code) {
    navigator.clipboard.writeText(code);
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Copied Code: ${code}`,
        timer: 1300,
        showConfirmButton: false
    });
}

function editPromoVoucher(promoEncoded) {
    try {
        const p = JSON.parse(decodeURIComponent(promoEncoded));
        openAddPromoModal();

        if (document.getElementById('promo-code')) document.getElementById('promo-code').value = p.code || '';
        if (document.getElementById('promo-type')) document.getElementById('promo-type').value = p.type || 'percent';
        if (document.getElementById('promo-value')) document.getElementById('promo-value').value = p.value ?? '';
        if (document.getElementById('promo-scope')) document.getElementById('promo-scope').value = p.scope || 'global';

        handlePromoScopeChange();
        togglePromoValueInput();

        if (p.scope === 'category' && document.getElementById('promo-target-category')) {
            document.getElementById('promo-target-category').value = p.targetCategory || 'drop-shoulder';
        } else if (p.scope === 'product' && document.getElementById('promo-target-product')) {
            document.getElementById('promo-target-product').value = p.targetProductId || '';
        }

        updatePromoLivePreview();
    } catch (e) {
        console.error("Edit Promo Error:", e);
    }
}

function renderPromoTab() {
    const table = document.getElementById('promo-table');
    if (!table) return;

    const productsList = (typeof allProducts !== 'undefined' && Array.isArray(allProducts)) ? allProducts : (window.allProducts || []);

    db.collection("promos").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        if (snapshot.empty) {
            table.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-400 font-bold uppercase text-xs">No active promo codes created yet.</td></tr>';
            return;
        }

        table.innerHTML = snapshot.docs.map(doc => {
            const p = doc.data();
            const id = doc.id;
            const encodedPromo = encodeURIComponent(JSON.stringify({
                code: p.code,
                type: p.type,
                value: p.value,
                scope: p.scope,
                targetCategory: p.targetCategory,
                targetProductId: p.targetProductId
            }));

            // Type Label Formatting
            let typeBadge = '';
            if (p.type === 'percent') {
                typeBadge = `<span class="bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">% Percentage</span>`;
            } else if (p.type === 'fixed') {
                typeBadge = `<span class="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">৳ Fixed Cash</span>`;
            } else {
                typeBadge = `<span class="bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">🚚 Free Delivery</span>`;
            }

            // Target Scope Display Text
            let targetText = '';
            if (p.scope === 'category') {
                targetText = `<span class="text-cyan-700 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-lg font-black uppercase text-[10px]">📁 Category: ${p.targetCategory || 'N/A'}</span>`;
            } else if (p.scope === 'product') {
                const matchedProduct = productsList.find(item => String(item.id) === String(p.targetProductId));
                const prodName = matchedProduct ? matchedProduct.name : `Product ID: ${p.targetProductId}`;
                targetText = `<span class="text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg font-black uppercase text-[10px]">👕 Product: ${prodName}</span>`;
            } else {
                targetText = `<span class="text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg font-black uppercase text-[10px]">🌐 All Products (Global)</span>`;
            }

            // Discount Display
            const valDisplay = p.type === 'percent' ? `${p.value}% OFF` : (p.type === 'fixed' ? `৳${p.value} OFF` : 'FREE DELIVERY');

            return `
                <tr class="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
                    <td class="px-5 py-4">
                        <button type="button" onclick="copyPromoVoucherCode('${p.code}')" title="Click to Copy Promo Code" class="inline-flex items-center gap-2 font-mono font-black text-gray-900 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-gray-200 tracking-wider uppercase cursor-pointer transition">
                            <span>${p.code}</span>
                            <i class="fa-regular fa-copy text-[11px] opacity-60"></i>
                        </button>
                    </td>
                    <td class="px-5 py-4">${typeBadge}</td>
                    <td class="px-5 py-4 font-black text-red-600 text-sm">${valDisplay}</td>
                    <td class="px-5 py-4 text-xs">${targetText}</td>
                    <td class="px-5 py-4 text-right whitespace-nowrap">
                        <div class="inline-flex items-center gap-1.5">
                            <button type="button" onclick="editPromoVoucher('${encodedPromo}')" class="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 hover:bg-black hover:text-white transition inline-flex items-center justify-center cursor-pointer active:scale-95" title="Edit / Clone Voucher">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button type="button" onclick="deletePromo('${id}')" class="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition inline-flex items-center justify-center cursor-pointer active:scale-95" title="Delete Promo">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }, (err) => {
        console.error("Error fetching promos:", err);
    });
}

async function deletePromo(id) {
    Swal.fire({
        title: 'Delete Promo Voucher?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#000',
        confirmButtonText: 'Delete'
    }).then(async (res) => {
        if (res.isConfirmed) {
            await db.collection("promos").doc(id).delete();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1000, showConfirmButton: false });
        }
    });
}

// =================================================================
// REVIEWS ENGINE
// =================================================================

function initAdminReviewManager() {
    db.collection("reviews").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAdminReviewsList(allReviews);
    }, err => console.log("Reviews Sync Warning:", err));
}

function filterReviewsList() {
    const query = document.getElementById('review-search-input')?.value.toLowerCase().trim() || '';
    const selectedStatus = document.getElementById('review-status-filter')?.value || 'all';

    const filtered = allReviews.filter(r => {
        const name = (r.name || '').toLowerCase();
        const text = (r.text || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        const matchesQuery = name.includes(query) || text.includes(query) || email.includes(query);

        const st = r.status || 'pending';
        const matchesStatus = selectedStatus === 'all' || st === selectedStatus;

        return matchesQuery && matchesStatus;
    });

    renderAdminReviewsList(filtered);
}

function renderAdminReviewsList(reviews = allReviews) {
    const listContainer = document.getElementById('admin-reviews-list');
    const badge = document.getElementById('pending-count-badge');
    if (!listContainer) return;

    const pendingCount = allReviews.filter(r => r.status === "pending").length;
    if (badge) badge.innerText = `${pendingCount} Pending`;

    if (reviews.length === 0) {
        listContainer.innerHTML = '<p class="text-xs text-gray-400 font-bold uppercase col-span-full py-4 text-center">No submitted customer reviews found.</p>';
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
// =================================================================
// CATEGORY SIZE CHART EDITOR ENGINE (ULTRA-DYNAMIC V2.0 PRO)
// =================================================================

let currentSizeChartColumns = ['size', 'chest', 'length', 'sleeve'];

function highlightActiveSizeChartPill(category) {
    const container = document.getElementById('sizechart-settings-content');
    if (!container) return;

    const pillButtons = container.querySelectorAll('button[onclick*="editor-chart-category"]');
    pillButtons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${category}'`)) {
            btn.classList.remove('bg-gray-100', 'text-gray-700');
            btn.classList.add('bg-gray-900', 'text-white');
        } else {
            btn.classList.remove('bg-gray-900', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        }
    });
}

async function loadCategorySizeChartToEditor() {
    const categorySelect = document.getElementById('editor-chart-category');
    const tbody = document.getElementById('size-chart-inputs-body');
    if (!tbody) return;

    const category = categorySelect?.value || 'drop-shoulder';
    highlightActiveSizeChartPill(category);

    tbody.innerHTML = `
        <tr>
            <td colspan="10" class="p-8 text-center text-xs font-bold text-gray-400">
                <i class="fa-solid fa-spinner fa-spin text-cyan-600 text-lg mb-1.5 block"></i> Loading ${category.toUpperCase()} size measurements...
            </td>
        </tr>
    `;

    let rowsData = (typeof DEFAULT_SIZE_CHARTS !== 'undefined' && DEFAULT_SIZE_CHARTS[category]) 
        ? JSON.parse(JSON.stringify(DEFAULT_SIZE_CHARTS[category])) 
        : [
            { size: 'M', chest: '40', length: '27.5', sleeve: '8.5' },
            { size: 'L', chest: '42', length: '28.5', sleeve: '9.0' },
            { size: 'XL', chest: '44', length: '29.5', sleeve: '9.5' }
        ];
    currentSizeChartColumns = ['size', 'chest', 'length', 'sleeve'];

    try {
        const docSnap = await db.collection("size_charts").doc(category).get();
        if (docSnap.exists) {
            const data = docSnap.data();
            if (data.columns && Array.isArray(data.columns) && data.columns.length > 0) {
                currentSizeChartColumns = data.columns;
            }
            if (data.rows && Array.isArray(data.rows)) {
                rowsData = data.rows;
            } else if (data.measurements && typeof data.measurements === 'object') {
                rowsData = Object.keys(data.measurements).map(sz => ({
                    size: sz,
                    chest: data.measurements[sz].chest || '',
                    length: data.measurements[sz].length || '',
                    sleeve: data.measurements[sz].sleeve || ''
                }));
            }
        }
    } catch (err) {
        console.warn("Using fallback default size chart data:", err);
    }

    renderSizeChartHeadersHTML();
    renderSizeChartRowsHTML(rowsData);
}

function renderSizeChartHeadersHTML() {
    const headerRow = document.getElementById('size-chart-headers-row');
    if (!headerRow) return;

    headerRow.innerHTML = currentSizeChartColumns.map((col, colIdx) => `
        <th class="p-3 border-r border-gray-800 relative group">
            <div class="flex items-center justify-between gap-2">
                <input type="text" value="${col.replace(/_/g, ' ').toUpperCase()}" onchange="updateColumnKey(${colIdx}, this.value)" class="bg-transparent text-white font-black uppercase outline-none focus:bg-gray-800 p-1 rounded w-full text-xs tracking-wider">
                ${currentSizeChartColumns.length > 1 ? `
                    <button type="button" onclick="deleteSizeChartColumn(${colIdx})" class="text-red-400 hover:text-red-300 p-1 text-xs cursor-pointer" title="Delete Column">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                ` : ''}
            </div>
        </th>
    `).join('') + `<th class="p-3 text-center w-24">Actions</th>`;
}

function updateColumnKey(colIdx, newValue) {
    const oldKey = currentSizeChartColumns[colIdx];
    const cleanKey = newValue.trim().toLowerCase().replace(/\s+/g, '_') || `col_${colIdx + 1}`;
    currentSizeChartColumns[colIdx] = cleanKey;

    document.querySelectorAll(`#size-chart-inputs-body input[data-key="${oldKey}"]`).forEach(inp => {
        inp.setAttribute('data-key', cleanKey);
    });

    renderSizeChartHeadersHTML();
}

function addNewSizeChartColumn() {
    Swal.fire({
        title: 'Add Measurement Column',
        input: 'text',
        inputPlaceholder: 'e.g. Shoulder, Waist, Hem, Collar',
        showCancelButton: true,
        confirmButtonColor: '#9333ea',
        confirmButtonText: 'Add Column',
        customClass: { input: 'text-xs font-bold' }
    }).then((result) => {
        if (result.isConfirmed && result.value.trim()) {
            const newColKey = result.value.trim().toLowerCase().replace(/\s+/g, '_');
            if (currentSizeChartColumns.includes(newColKey)) {
                Swal.fire({ icon: 'warning', title: 'Duplicate', text: 'Column already exists!' });
                return;
            }
            currentSizeChartColumns.push(newColKey);
            
            const tbody = document.getElementById('size-chart-inputs-body');
            const trs = tbody.querySelectorAll('tr');
            trs.forEach(tr => {
                if (!tr.querySelector('td[colspan]')) {
                    const actionTd = tr.querySelector('td:last-child');
                    const newTd = document.createElement('td');
                    newTd.className = "p-3 border-r border-gray-100";
                    newTd.innerHTML = `<input type="text" data-key="${newColKey}" placeholder="-" class="chart-cell-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">`;
                    tr.insertBefore(newTd, actionTd);
                }
            });

            renderSizeChartHeadersHTML();
        }
    });
}

function deleteSizeChartColumn(colIdx) {
    if (currentSizeChartColumns.length <= 1) {
        Swal.fire({ icon: 'warning', title: 'Action Denied', text: 'At least one measurement column is required!' });
        return;
    }

    const targetKey = currentSizeChartColumns[colIdx];
    currentSizeChartColumns.splice(colIdx, 1);
    
    const tbody = document.getElementById('size-chart-inputs-body');
    const tableRows = tbody.querySelectorAll('tr');
    const currentRowsData = [];

    tableRows.forEach(tr => {
        const rowObj = {};
        const inputs = tr.querySelectorAll('.chart-cell-val');
        inputs.forEach(input => {
            const key = input.getAttribute('data-key');
            if (key !== targetKey && currentSizeChartColumns.includes(key)) {
                rowObj[key] = input.value;
            }
        });
        if (Object.keys(rowObj).length > 0) currentRowsData.push(rowObj);
    });

    renderSizeChartHeadersHTML();
    renderSizeChartRowsHTML(currentRowsData);
}

function buildSizeChartRowHTML(rowObj = {}) {
    return `
        <tr class="hover:bg-cyan-50/30 transition-colors border-b border-gray-100">
            ${currentSizeChartColumns.map((col, idx) => `
                <td class="p-3 border-r border-gray-100">
                    <input type="text" data-key="${col}" value="${rowObj[col] || ''}" placeholder="${idx === 0 ? 'e.g. XL' : '-'}" 
                        class="chart-cell-val w-full p-2.5 ${idx === 0 ? 'bg-gray-900 text-white font-black uppercase text-center' : 'bg-gray-50 text-gray-900 font-bold'} border border-gray-200 rounded-xl text-xs outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/10 transition shadow-sm">
                </td>
            `).join('')}
            <td class="p-3 text-center whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5">
                    <button type="button" onclick="duplicateSizeChartRow(this)" class="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 hover:bg-black hover:text-white transition inline-flex items-center justify-center cursor-pointer shadow-sm active:scale-95" title="Duplicate Row">
                        <i class="fa-regular fa-clone text-xs"></i>
                    </button>
                    <button type="button" onclick="deleteSizeChartRow(this)" class="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition inline-flex items-center justify-center cursor-pointer shadow-sm active:scale-95" title="Remove Row">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderSizeChartRowsHTML(rows) {
    const tbody = document.getElementById('size-chart-inputs-body');
    if (!tbody) return;

    if (!rows || rows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${currentSizeChartColumns.length + 1}" class="p-8 text-center text-xs font-bold text-gray-400">
                    No measurements recorded. Click "Add Size Row" to create.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rows.map(r => buildSizeChartRowHTML(r)).join('');
}

function addNewSizeChartRow() {
    const tbody = document.getElementById('size-chart-inputs-body');
    if (!tbody) return;

    if (tbody.children.length === 1 && tbody.children[0].querySelector('td[colspan]')) {
        tbody.innerHTML = '';
    }

    tbody.insertAdjacentHTML('beforeend', buildSizeChartRowHTML({}));
}

function duplicateSizeChartRow(btn) {
    const row = btn.closest('tr');
    if (!row) return;

    const rowObj = {};
    row.querySelectorAll('.chart-cell-val').forEach(inp => {
        rowObj[inp.getAttribute('data-key')] = inp.value;
    });

    row.insertAdjacentHTML('afterend', buildSizeChartRowHTML(rowObj));
    Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Row Duplicated!', timer: 1000, showConfirmButton: false });
}

function deleteSizeChartRow(btn) {
    const row = btn.closest('tr');
    if (row) row.remove();
}

async function saveCategorySizeChart() {
    const category = document.getElementById('editor-chart-category')?.value || 'drop-shoulder';
    const tableRows = document.querySelectorAll('#size-chart-inputs-body tr');
    const rowsData = [];

    tableRows.forEach(row => {
        const rowObj = {};
        const inputs = row.querySelectorAll('.chart-cell-val');
        let hasValue = false;

        inputs.forEach(input => {
            const key = input.getAttribute('data-key');
            const val = input.value.trim();
            if (val) hasValue = true;
            rowObj[key] = val || '-';
        });

        if (hasValue) {
            rowsData.push(rowObj);
        }
    });

    if (rowsData.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Size Chart',
            text: 'Please add at least one row with valid size measurements.',
            confirmButtonColor: '#000'
        });
        return;
    }

    try {
        await db.collection("size_charts").doc(category).set({
            category: category,
            columns: currentSizeChartColumns,
            rows: rowsData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        Swal.fire({
            icon: 'success',
            title: 'SIZE CHART SAVED!',
            text: `Live storefront measurements updated for ${category.toUpperCase()}`,
            timer: 1500,
            showConfirmButton: false
        });
    } catch (err) {
        console.error("Save Size Chart Error:", err);
        Swal.fire({ icon: 'error', title: 'Save Failed', text: err.message });
    }
}

// Auto Session Check on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
});
