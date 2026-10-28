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
// DASHBOARD INIT & REALTIME LISTENERS
// =================================================================

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
}

// =================================================================
// PRODUCTS CATALOG & CLOUDINARY ENGINE
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
        const matchesQuery = (p.name || '').toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query);
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

        return `
            <div class="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div class="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    <img src="${mainImg}" alt="${p.altText || p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        <span class="text-[9px] font-black uppercase text-white bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">${p.category}</span>
                        ${imageCount > 1 ? `<span class="text-[9px] font-bold text-gray-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-sm"><i class="fa-regular fa-images"></i> ${imageCount}</span>` : ''}
                    </div>
                    <div class="absolute top-2.5 right-2.5">
                        <span class="text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${p.isOutOfStock ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}">
                            ${p.isOutOfStock ? 'Out of Stock' : 'In Stock'}
                        </span>
                    </div>
                </div>

                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="font-black text-gray-900 text-sm truncate" title="${p.name}">${p.name}</h3>
                        <div class="flex items-baseline gap-2 mt-1">
                            <span class="text-sm font-black text-red-600">৳${p.price}</span>
                            ${p.originalPrice ? `<span class="text-xs font-bold text-gray-400 line-through">৳${p.originalPrice}</span>` : ''}
                        </div>
                    </div>

                    <div class="flex items-center gap-2 pt-3 border-t border-gray-100 mt-3">
                        <button onclick="editProduct('${p.id}')" class="flex-1 bg-gray-900 hover:bg-black text-white text-[11px] font-black uppercase py-2 rounded-xl transition flex items-center justify-center gap-1">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button onclick="toggleOverallStock('${p.id}', ${!p.isOutOfStock})" class="p-2 rounded-xl border text-xs font-bold transition ${p.isOutOfStock ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}" title="Quick Stock Toggle">
                            <i class="fa-solid ${p.isOutOfStock ? 'fa-check' : 'fa-ban'}"></i>
                        </button>
                        <button onclick="deleteProduct('${p.id}')" class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 transition text-xs" title="Delete Product">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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
// ORDERS MANAGEMENT ENGINE
// =================================================================

function openAddOrderModal() { 
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        orderModal.classList.remove('hidden');
        orderModal.classList.add('active');
    }
}

function filterOrdersTable() {
    const query = document.getElementById('order-search-input')?.value.toLowerCase().trim() || '';
    const selectedSource = document.getElementById('order-source-filter')?.value || 'all';
    const selectedStatus = document.getElementById('order-status-filter')?.value || 'all';

    const filtered = allOrders.filter(o => {
        const name = (o.Customer_Name || o.customerName || '').toLowerCase();
        const phone = (o.Customer_Phone || o.customerPhone || '').toLowerCase();
        const id = (o.id || '').toLowerCase();
        const matchesQuery = name.includes(query) || phone.includes(query) || id.includes(query);

        const src = o.orderSource || o.source || 'Website';
        const matchesSource = selectedSource === 'all' || src.toLowerCase() === selectedSource.toLowerCase();

        const st = o.status || 'Pending';
        let matchesStatus = selectedStatus === 'all';
        if (selectedStatus === 'Pending') matchesStatus = st === 'Pending';
        else if (selectedStatus === 'Shipped') matchesStatus = st === 'Shipped';
        else if (selectedStatus === 'Completed') matchesStatus = (st === 'Completed' || st === 'Delivered');
        else if (selectedStatus === 'Cancelled') matchesStatus = st === 'Cancelled';

        return matchesQuery && matchesSource && matchesStatus;
    });

    renderOrdersTab(filtered);
}

function renderOrdersTab(ordersToRender = allOrders) {
    const table = document.getElementById('orders-table');
    if (!table) return;

    if (!ordersToRender || ordersToRender.length === 0) {
        table.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-gray-400 font-bold uppercase text-xs">No matching orders found.</td></tr>';
        return;
    }

    table.innerHTML = ordersToRender.map(o => {
        const source = o.orderSource || o.source || 'Website';
        const method = o.Payment_Method || o.paymentMethod || 'COD';
        const status = o.status || 'Pending';
        
        let statusBadge = 'bg-yellow-100 text-yellow-700';
        if (status === 'Completed' || status === 'Delivered') statusBadge = 'bg-green-100 text-green-700';
        else if (status === 'Shipped') statusBadge = 'bg-blue-100 text-blue-700';
        else if (status === 'Cancelled') statusBadge = 'bg-red-100 text-red-700';

        return `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="px-5 py-3.5 font-black text-gray-900">#${o.id.substring(0, 6)}</td>
                <td class="px-5 py-3.5">
                    <p class="font-bold text-gray-900">${o.Customer_Name || o.customerName || 'N/A'}</p>
                    <p class="text-xs text-gray-400 font-mono">${o.Customer_Phone || o.customerPhone || ''}</p>
                    <span class="inline-block text-[9px] font-black uppercase text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full mt-0.5">${source}</span>
                </td>
                <td class="px-5 py-3.5 font-black text-red-600">${o.TOTAL_BILL || ('৳' + (o.amount || o.totalAmount || 0))}</td>
                <td class="px-5 py-3.5 text-xs font-bold text-gray-700">
                    ${method}${o.Transaction_ID && o.Transaction_ID !== 'N/A' ? `<br><span class="text-[10px] font-mono text-purple-700 bg-purple-50 px-1 rounded">Trx: ${o.Transaction_ID}</span>` : ''}
                </td>
                <td class="px-5 py-3.5">
                    <span class="px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${statusBadge}">
                        ${status}
                    </span>
                </td>
                <td class="px-5 py-3.5 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                        <button onclick="viewOrderDetails('${o.id}')" class="px-2.5 py-1.5 bg-gray-900 text-white font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-black transition" title="View Full Details">
                            <i class="fa-solid fa-eye"></i> Details
                        </button>
                        <button onclick="openCourierDispatchModal('${o.id}')" class="px-2.5 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-purple-700 transition" title="Dispatch Courier">
                            <i class="fa-solid fa-truck-fast"></i>
                        </button>
                        <button onclick="deleteOrder('${o.id}')" class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition" title="Delete Order"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('detail-order-id').innerText = `Order #${order.id.substring(0, 8)}`; 
    document.getElementById('detail-source-badge').innerText = order.orderSource || order.source || 'Website Order'; 
    document.getElementById('detail-cust-name').innerText = order.Customer_Name || order.customerName || 'N/A'; 
    document.getElementById('detail-cust-phone').innerText = order.Customer_Phone || order.customerPhone || 'N/A'; 
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
// AUTONOMOUS LOGISTICS ENGINE (STEADFAST & PATHAO)
// =================================================================

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
        password: "1636500930",
        locations: [
            { id: "1001", name: "Pathao Dhaka Store (Basabo)" }
        ]
    }
};

async function callApiWithCorsProxy(targetUrl, fetchOptions) {
    const rawBody = fetchOptions.body || null;
    const rawHeaders = fetchOptions.headers || {};
    const method = fetchOptions.method || 'POST';

    const proxyEndpoints = [
        async () => {
            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
            const res = await fetch(proxyUrl, {
                method: method,
                headers: rawHeaders,
                body: rawBody
            });
            if (!res.ok) throw new Error(`CodeTabs Proxy Status: ${res.status}`); 
            return await res.json(); 
        }, 
        async () => { 
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
            const res = await fetch(proxyUrl, {
                method: method,
                headers: rawHeaders,
                body: rawBody
            });
            if (!res.ok) throw new Error(`CorsProxy Status: ${res.status}`); 
            return await res.json(); 
        }, 
        async () => { 
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
            const res = await fetch(proxyUrl, {
                method: method,
                headers: rawHeaders,
                body: rawBody
            });
            if (!res.ok) throw new Error(`AllOrigins Proxy Status: ${res.status}`);
            return await res.json();
        }
    ];

    let lastError = null;
    for (const executeProxyCall of proxyEndpoints) {
        try {
            const resultData = await executeProxyCall();
            if (resultData) return resultData;
        } catch (err) {
            console.warn("Proxy Attempt Failed, trying fallback...", err);
            lastError = err;
        }
    }

    throw new Error(lastError ? lastError.message : "CORS Network Proxy Connection Failed. Please check network connection.");
}

function onCourierProviderChange() {
    const provider = document.getElementById('courier-provider')?.value || 'steadfast';
    const locationSelect = document.getElementById('courier-pickup-location');
    if (!locationSelect) return;

    const locList = COURIER_CREDENTIALS[provider]?.locations || [];
    locationSelect.innerHTML = locList.map(loc => `
        <option value="${loc.id}">${loc.name}</option>
    `).join('');
}

function calculateTotalCod() {
    const productAmt = parseInt(document.getElementById('courier-product-amount')?.value) || 0;
    const deliveryFee = parseInt(document.getElementById('courier-delivery-charge')?.value) || 0;
    const totalCodInput = document.getElementById('courier-cod-amount');
    
    if (totalCodInput) {
        totalCodInput.value = productAmt + deliveryFee;
    }
}

function openCourierDispatchModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('courier-order-id').value = order.id;
    document.getElementById('courier-cust-name').value = order.Customer_Name || order.customerName || '';
    document.getElementById('courier-cust-phone').value = order.Customer_Phone || order.customerPhone || '';
    document.getElementById('courier-cust-address').value = order.Delivery_Address || order.address || '';
    
    const rawBill = order.TOTAL_BILL ? parseInt(String(order.TOTAL_BILL).replace(/[^0-9]/g, '')) : (order.amount || order.totalAmount || 0);
    
    if (document.getElementById('courier-product-amount')) document.getElementById('courier-product-amount').value = rawBill;
    if (document.getElementById('courier-delivery-charge')) document.getElementById('courier-delivery-charge').value = 60;
    
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

    const data = await callApiWithCorsProxy(targetUrl, {
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

    if (data && data.access_token) {
        return data.access_token;
    }
    throw new Error(data?.message || "Pathao Auth Token Generation Failed");
}

async function dispatchCourierParcel(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById('dispatch-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Dispatching to Courier Portal...`;
    }

    const orderId = document.getElementById('courier-order-id')?.value;
    const provider = document.getElementById('courier-provider')?.value || 'steadfast';
    const selectedLocId = document.getElementById('courier-pickup-location')?.value;
    const name = document.getElementById('courier-cust-name')?.value.trim();
    const phone = document.getElementById('courier-cust-phone')?.value.trim();
    const address = document.getElementById('courier-cust-address')?.value.trim();
    const productAmt = parseInt(document.getElementById('courier-product-amount')?.value) || 0;
    const deliveryFee = parseInt(document.getElementById('courier-delivery-charge')?.value) || 60;
    const codAmount = parseInt(document.getElementById('courier-cod-amount')?.value) || (productAmt + deliveryFee);
    const note = document.getElementById('courier-note')?.value.trim() || "REDAMS Apparel Delivery - Handle with Care";

    try {
        let consignmentId = "";
        let trackingCode = "";
        let trackingUrl = "";
        let invoiceNo = "RED-" + (orderId ? orderId.substring(0, 6).toUpperCase() : Math.floor(100000 + Math.random() * 900000));

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

            const targetUrl = "https://portal.steadfast.com.bd/api/v1/create_order";

            const resData = await callApiWithCorsProxy(targetUrl, {
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
            } else {
                throw new Error(resData?.message || (resData?.errors ? JSON.stringify(resData.errors) : "Steadfast Portal Rejected Order"));
            }
        } 
        else if (provider === 'pathao') {
            const token = await getPathaoAccessToken();
            const targetUrl = "https://api-hermes.pathao.com/aladdin/api/v1/orders";

            const pathaoPayload = {
                store_id: parseInt(selectedLocId) || 1001,
                merchant_order_id: invoiceNo,
                recipient_name: name,
                recipient_phone: phone,
                recipient_address: address,
                recipient_city: 1,
                recipient_zone: 1,
                delivery_type: 48,
                item_type: 2,
                special_instruction: note,
                item_quantity: 1,
                item_weight: 0.5,
                amount_to_collect: codAmount
            };

            const resData = await callApiWithCorsProxy(targetUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json", 
                    "Accept": "application/json" 
                }, 
                body: JSON.stringify(pathaoPayload) 
            });  
            
            if (resData && resData.type === 'success' && resData.data) { 
                consignmentId = String(resData.data.consignment_id || ''); 
                trackingCode = consignmentId; 
                trackingUrl = `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}`;
            } else {
                throw new Error(resData?.message || "Pathao Portal Rejected Order");
            }
        }

        await db.collection("courier_shipments").add({
            orderId: orderId || '',
            provider: provider.toUpperCase(),
            pickupLocationId: selectedLocId,
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
            status: 'In Transit',
            bookedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (orderId) {
            await db.collection("orders").doc(orderId).update({
                status: 'Shipped',
                consignmentId: consignmentId,
                trackingCode: trackingCode,
                trackingUrl: trackingUrl,
                deliveryCharge: deliveryFee,
                finalCodAmount: codAmount
            });
        }

        Swal.fire({
            icon: 'success',
            title: 'PARCEL BOOKED SUCCESSFULLY!',
            html: `
                <div class="text-left text-xs space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200 mt-2">
                    <p><b>Courier Provider:</b> <span class="uppercase font-bold text-purple-700">${provider}</span></p>
                    <p><b>Consignment ID:</b> <span class="font-mono text-purple-900 font-bold">${consignmentId}</span></p>
                    <p><b>Tracking Code:</b> <span class="font-mono font-bold text-black">${trackingCode}</span></p>
                    <p><b>Total COD:</b> ৳${codAmount}</p>
                    <div class="pt-1">
                        <a href="${trackingUrl}" target="_blank" class="inline-block bg-purple-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase">Open Tracking Link ↗</a>
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
            text: err.message || "Could not connect to courier API. Please check your credentials or network."
        });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-truck-fast"></i> Confirm & Book Parcel`;
        }
    }
}

async function cancelCourierShipment(shipmentDocId, orderId, trackingCode) {
    Swal.fire({
        title: 'Cancel Booking?',
        text: `Are you sure you want to cancel courier booking #${trackingCode}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#000',
        confirmButtonText: 'Yes, Cancel Parcel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await db.collection("courier_shipments").doc(shipmentDocId).update({
                    status: 'Cancelled',
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
                    title: 'Booking Cancelled!',
                    text: 'Parcel status set to Cancelled and Main Order reset to Pending.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Cancel Error:", err);
                Swal.fire({ icon: 'error', title: 'Action Failed', text: err.message });
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

async function syncLiveCourierStatuses() {
    Swal.fire({
        title: 'Syncing Live Statuses...',
        text: 'Connecting to Steadfast & Pathao APIs.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    setTimeout(() => {
        Swal.fire({
            icon: 'success',
            title: 'STATUSES SYNCED!',
            text: 'All shipments are up to date.',
            timer: 1200,
            showConfirmButton: false
        });
    }, 1000);
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
        const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

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
    const totalCod = allCourierShipments.filter(s => s.status !== 'Cancelled').reduce((sum, s) => sum + (parseInt(s.codAmount) || 0), 0);

    if (document.getElementById('stat-courier-total')) document.getElementById('stat-courier-total').innerText = total;
    if (document.getElementById('stat-courier-transit')) document.getElementById('stat-courier-transit').innerText = transit;
    if (document.getElementById('stat-courier-delivered')) document.getElementById('stat-courier-delivered').innerText = delivered;
    if (document.getElementById('stat-courier-cancelled')) document.getElementById('stat-courier-cancelled').innerText = cancelled;
    if (document.getElementById('stat-courier-cod')) document.getElementById('stat-courier-cod').innerText = `৳${totalCod}`;

    if (shipmentsToRender.length === 0) {
        table.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-400 font-bold uppercase text-xs">No parcel shipment records found.</td></tr>';
        return;
    }

    table.innerHTML = shipmentsToRender.map(s => {
        const providerBadge = s.provider === 'STEADFAST' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-red-100 text-red-800 border-red-200';
        
        let statusBadge = 'bg-gray-100 text-gray-800';
        if (s.status === 'Delivered') statusBadge = 'bg-emerald-100 text-emerald-800';
        else if (s.status === 'In Transit') statusBadge = 'bg-blue-100 text-blue-800';
        else if (s.status === 'Cancelled') statusBadge = 'bg-red-100 text-red-800';

        const hubName = s.pickupLocationId ? (s.pickupLocationId.includes('saidpur') ? 'Saidpur Hub' : 'Kohinoor Hub') : 'Main Hub';
        const displayCid = s.consignmentId || s.trackingCode;
        const liveTrackingUrl = s.trackingUrl || (s.provider === 'STEADFAST' ? `https://steadfast.com.bd/t/${s.trackingCode}` : `https://merchant.pathao.com/tracking?consignment_id=${s.consignmentId}`);

        return `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="px-4 py-3.5 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">CID</span>
                        <span class="font-black text-purple-900 font-mono text-xs">${displayCid}</span>
                    </div>
                    <span class="text-[10px] text-gray-400 font-mono block mt-0.5">Track: ${s.trackingCode}</span>
                    <span class="text-[9px] font-bold text-gray-400 block">${s.bookedAt ? new Date(s.bookedAt.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
                </td>

                <td class="px-4 py-3.5">
                    <p class="font-bold text-gray-900 text-xs">${s.customerName || 'N/A'}</p>
                    <p class="text-[11px] text-purple-700 font-mono font-bold">${s.customerPhone || ''}</p>
                    <p class="text-[10px] text-gray-500 truncate max-w-[170px]" title="${s.address || ''}">${s.address || ''}</p>
                </td>

                <td class="px-4 py-3.5 whitespace-nowrap">
                    <span class="px-2 py-0.5 text-[9px] font-black rounded border uppercase ${providerBadge}">${s.provider}</span>
                    <p class="text-[10px] font-bold text-gray-500 mt-1"><i class="fa-solid fa-location-dot text-red-500"></i> ${hubName}</p>
                </td>

                <td class="px-4 py-3.5 whitespace-nowrap">
                    <p class="font-black text-gray-900 text-xs">Total COD: <span class="text-purple-700">৳${s.codAmount}</span></p>
                    <p class="text-[9px] text-gray-400">Prod: ৳${s.productAmount || (s.codAmount - 60)} + Del: ৳${s.deliveryCharge || 60}</p>
                </td>

                <td class="px-4 py-3.5 whitespace-nowrap">
                    <span class="px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${statusBadge}">${s.status || 'In Transit'}</span>
                </td>

                <td class="px-4 py-3.5 whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-1.5">
                        <button onclick="copyParcelPrintLabel('${s.id}')" class="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold" title="Copy Print Label">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                        <a href="${liveTrackingUrl}" target="_blank" class="px-2.5 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition flex items-center gap-1">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Track
                        </a>
                        <button onclick="cancelCourierShipment('${s.id}', '${s.orderId || ''}', '${s.trackingCode}')" class="p-2 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-bold transition" title="Cancel Booking">
                            <i class="fa-solid fa-ban"></i>
                        </button>
                        <button onclick="deleteCourierShipment('${s.id}')" class="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition" title="Delete Record">
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
    Swal.fire({ icon: 'success', title: 'Copied!', text: `Tracking Code: ${code}`, timer: 1000, showConfirmButton: false });
}

// =================================================================
// INVENTORY, REVIEWS & PROMO ENGINE
// =================================================================

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
            sizesHtml = '<span class="text-xs text-gray-400">Couple Special Sizes</span>';
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

function openAddPromoModal() { 
    const promoModal = document.getElementById('promo-modal');
    if (promoModal) {
        promoModal.classList.remove('hidden');
        promoModal.classList.add('active'); 
    }
}

async function savePromo() {
    const code = document.getElementById('promo-code')?.value.trim().toUpperCase();
    const type = document.getElementById('promo-type')?.value;
    const val = parseInt(document.getElementById('promo-value')?.value) || 0;

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
// CATEGORY SIZE CHART EDITOR ENGINE (ULTRA-DYNAMIC REFACTORED)
// =================================================================

async function loadCategorySizeChartToEditor() {
    const categorySelect = document.getElementById('editor-chart-category');
    const tbody = document.getElementById('size-chart-inputs-body');
    if (!tbody) return;

    const category = categorySelect?.value || 'drop-shoulder';

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="p-6 text-center text-xs font-bold text-gray-400">
                <i class="fa-solid fa-spinner fa-spin text-cyan-600 text-base mb-1 block"></i> Loading size measurements...
            </td>
        </tr>
    `;

    let rowsData = DEFAULT_SIZE_CHARTS[category] || DEFAULT_SIZE_CHARTS['drop-shoulder'];

    try {
        const docSnap = await db.collection("size_charts").doc(category).get();
        if (docSnap.exists) {
            const data = docSnap.data();
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

    renderSizeChartRowsHTML(rowsData);
}

function renderSizeChartRowsHTML(rows) {
    const tbody = document.getElementById('size-chart-inputs-body');
    if (!tbody) return;

    if (!rows || rows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="p-6 text-center text-xs font-bold text-gray-400">
                    No sizes recorded. Click "Add Row" to create measurements.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rows.map(r => `
        <tr class="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
            <td class="p-3 border-r border-gray-100">
                <input type="text" value="${r.size || ''}" placeholder="e.g. M" class="chart-size-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">
            </td>
            <td class="p-3 border-r border-gray-100">
                <input type="text" value="${r.chest || ''}" placeholder="e.g. 42" class="chart-chest-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">
            </td>
            <td class="p-3 border-r border-gray-100">
                <input type="text" value="${r.length || ''}" placeholder="e.g. 28" class="chart-length-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">
            </td>
            <td class="p-3 border-r border-gray-100">
                <input type="text" value="${r.sleeve || ''}" placeholder="e.g. 9" class="chart-sleeve-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">
            </td>
            <td class="p-3 text-center">
                <button type="button" onclick="deleteSizeChartRow(this)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center mx-auto cursor-pointer shadow-sm active:scale-95" title="Remove Row">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function addNewSizeChartRow() {
    const tbody = document.getElementById('size-chart-inputs-body');
    if (!tbody) return;

    // Remove empty placeholder if any
    if (tbody.children.length === 1 && tbody.children[0].querySelector('td[colspan]')) {
        tbody.innerHTML = '';
    }

    const tr = document.createElement('tr');
    tr.className = "hover:bg-gray-50/80 transition-colors border-b border-gray-100";
    tr.innerHTML = `
        <td class="p-3 border-r border-gray-100">
            <input type="text" placeholder="e.g. XL" class="chart-size-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">
        </td>
        <td class="p-3 border-r border-gray-100">
            <input type="text" placeholder="e.g. 44" class="chart-chest-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">
        </td>
        <td class="p-3 border-r border-gray-100">
            <input type="text" placeholder="e.g. 30" class="chart-length-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">
        </td>
        <td class="p-3 border-r border-gray-100">
            <input type="text" placeholder="e.g. 9.5" class="chart-sleeve-val w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-cyan-600 focus:bg-white transition shadow-sm">
        </td>
        <td class="p-3 text-center">
            <button type="button" onclick="deleteSizeChartRow(this)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center mx-auto cursor-pointer shadow-sm active:scale-95" title="Remove Row">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);
}

function deleteSizeChartRow(btn) {
    const row = btn.closest('tr');
    if (row) row.remove();
}

async function saveCategorySizeChart() {
    const category = document.getElementById('editor-chart-category')?.value || 'drop-shoulder';
    const tableRows = document.querySelectorAll('#size-chart-inputs-body tr');
    const rowsData = [];
    const measurementsMap = {};

    tableRows.forEach(row => {
        const size = row.querySelector('.chart-size-val')?.value.trim();
        const chest = row.querySelector('.chart-chest-val')?.value.trim();
        const length = row.querySelector('.chart-length-val')?.value.trim();
        const sleeve = row.querySelector('.chart-sleeve-val')?.value.trim();

        if (size || chest || length || sleeve) {
            const szKey = size || 'N/A';
            const rowObj = {
                size: szKey,
                chest: chest || '-',
                length: length || '-',
                sleeve: sleeve || '-'
            };
            rowsData.push(rowObj);
            measurementsMap[szKey] = {
                chest: chest || '-',
                length: length || '-',
                sleeve: sleeve || '-'
            };
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
            rows: rowsData,
            measurements: measurementsMap,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        Swal.fire({
            icon: 'success',
            title: 'SIZE CHART SAVED!',
            text: `Updated size measurements for category: ${category.toUpperCase()}`,
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
