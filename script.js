// =================================================================
// REDAMS Master Engine (script.js) - Fixed Layout, Measurements & Category Routing
// =================================================================

window.allProducts = [];
window.localJsonProducts = [];
window.firebaseProducts = [];

let cart = JSON.parse(localStorage.getItem('redams_cart')) || [];

let selectedSize = '';
let selectedColor = '';
let selectedSizeP1 = '', selectedSizeP2 = '';
let selectedColorP1 = '', selectedColorP2 = '';

let modalQty = 1;
let isPaymentVerified = false;
let activePromo = null;
let selectedSubMethod = "";

const WHATSAPP_NUMBER = "8801894357549";

// ===== প্রোমো কোড লিস্ট =====
const promoList = {
    "": { type: "delivery", value: 0, applicableCategories: [] },
    "REDAMS10": { type: "percent", value: 10, applicableCategories: [] },
    "WELCOME20": { type: "percent", value: 20, applicableCategories: [] },
    "DROPDROP15": { type: "percent", value: 15, applicableCategories: ['drop-shoulder'] },
    "DROPOFF25": { type: "percent", value: 25, applicableCategories: ['drop-shoulder'] },
    "REGULAR10": { type: "percent", value: 10, applicableCategories: ['regular-tshirt'] },
    "WELCOME100": { type: "fixed", value: 100, applicableCategories: ['henley'] },
    "ACIDWASH12": { type: "percent", value: 12, applicableCategories: ['acid-wash'] }
};

// ===== কার্ট ডাটা লোকালস্টোরেজে সেভ =====
function saveCartToStorage() {
    localStorage.setItem('redams_cart', JSON.stringify(cart));
}

// ===== ইউনিভার্সাল আইডি ফাইন্ডার (String & Number ID Safety) =====
window.findProductById = function(id) {
    if (!window.allProducts || window.allProducts.length === 0) return null;
    return window.allProducts.find(p => String(p.id) === String(id));
};

// ===== URL থেকে ক্যাটাগরি বের করা =====
function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('cat');
}

// =================================================================
// 1. MASTER HYBRID DATA SYNC & CATEGORY ROUTING ENGINE
// =================================================================
window.syncAndRenderAllProducts = function() {
    // ফায়ারবেজ ও লোকাল জেসনের প্রোডাক্ট সিঙ্ক করা (ডুপ্লিকেট রিমুভ সহ)
    const combinedMap = new Map();
    
    [...window.firebaseProducts, ...window.localJsonProducts].forEach(item => {
        if (item && item.id && !combinedMap.has(String(item.id))) {
            combinedMap.set(String(item.id), item);
        }
    });

    window.allProducts = Array.from(combinedMap.values());
    
    const isShopPage = window.location.pathname.toLowerCase().includes('shop.html');
    const selectedCat = getCategoryFromURL();

    if (isShopPage) {
        if (selectedCat) {
            filterCategory(selectedCat);
        } else {
            renderProducts(window.allProducts);
        }
    } else {
        // index.html এর জন্য ৩ডি হ্যাঙ্গার স্লাইডার ও মেইন গ্রিড রেন্ডার
        renderNewArrivals(window.allProducts);
        renderProducts(window.allProducts);
    }
};

// ===== ক্যাটাগরি ফিল্টারিং ফাংশন =====
window.filterCategory = function(catName) {
    if (!catName || catName === 'all') {
        renderProducts(window.allProducts);
        updateCategoryHeading("ALL PRODUCTS");
        return;
    }

    const filtered = window.allProducts.filter(p => 
        p.category && p.category.trim().toLowerCase() === catName.trim().toLowerCase()
    );

    renderProducts(filtered);
    
    const formattedTitle = catName.replace(/-/g, ' ').toUpperCase() + ' COLLECTION';
    updateCategoryHeading(formattedTitle);
};

function updateCategoryHeading(titleText) {
    const headingEl = document.querySelector('h2.text-3xl, h2.text-2xl, #category-title');
    if (headingEl) {
        headingEl.innerText = titleText;
    }
}

// =================================================================
// 2. MAIN CATALOG GRID RENDERER (Exact 4:5 Measurement Restored)
// =================================================================
window.renderProducts = function(productsToRender) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const items = productsToRender || window.allProducts || [];
    
    if (items.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-400 py-12 font-bold uppercase tracking-widest text-xs">এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি।</p>';
        return;
    }

    grid.innerHTML = items.map(p => {
        if (!p) return '';
        const hasDiscount = p.originalPrice && p.originalPrice > p.price;
        const discPer = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        const firstImage = (p.images && p.images[0]) ? p.images[0] : 'images/placeholder.jpg';
        const isOutOfStock = p.isOutOfStock === true;

        return `
            <div class="product-card group relative bg-white rounded-2xl p-3 border border-gray-100 shadow-sm transition hover:shadow-xl ${isOutOfStock ? 'product-card-out' : ''}">
                ${hasDiscount ? `<div class="absolute top-5 left-5 z-10 bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm">-${discPer}% OFF</div>` : ''}
                
                ${isOutOfStock ? `<div class="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-20 top-3 left-3 right-3 bottom-3 backdrop-blur-[2px]">
                    <span class="premium-out-badge">OUT OF STOCK</span>
                </div>` : ''}
                
                <div class="relative overflow-hidden rounded-xl aspect-[4/5] bg-gray-50 mb-3" onclick="${isOutOfStock ? 'return false;' : `openModal('${p.id}')`}">
                    <img src="${firstImage}" class="w-full h-full object-cover ${isOutOfStock ? 'product-img-blur' : 'group-hover:scale-105'} transition duration-700" alt="${p.altText || p.name}">
                    
                    ${!isOutOfStock ? `
                        <button onclick="openModal('${p.id}')" class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition duration-300 shadow-md hover:bg-black hover:text-white">
                            Quick View
                        </button>
                    ` : ''}
                </div>

                <div class="space-y-1 text-left">
                    <span class="text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">${p.category || 'Apparel'}</span>
                    <h3 class="font-bold text-gray-900 text-xs truncate mt-1">${p.name}</h3>
                    <div class="flex items-center gap-2">
                        <span class="font-black text-gray-900 text-xs">৳${p.price}</span>
                        ${hasDiscount ? `<span class="line-through text-gray-400 text-[10px]">৳${p.originalPrice}</span>` : ''}
                    </div>
                </div>
            </div>`;
    }).join('');
};

window.displayProducts = window.renderProducts;

// =================================================================
// 3. 3D BOUTIQUE HANGER RACK RENDERER
// =================================================================
let hangerSwiperInstance = null;

window.renderNewArrivals = function(products) {
    const slider = document.getElementById('new-arrivals-slider');
    if (!slider || !products || products.length === 0) return;

    const availableProducts = products.filter(p => !p.isOutOfStock);
    const newItems = availableProducts.slice(0, 10);

    if (newItems.length === 0) return;

    slider.innerHTML = newItems.map(p => {
        const imgSrc = (p.images && p.images[0]) ? p.images[0] : 'images/placeholder.jpg';
        return `
            <div class="swiper-slide cursor-pointer" onclick="openModal('${p.id}')">
                <div class="hanger-card-item relative flex flex-col items-center group">
                    <div class="w-8 h-9 relative z-20 mb-[-3px]">
                        <svg viewBox="0 0 40 50" class="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                            <path d="M 20 48 L 20 22 C 20 10 32 10 32 20 C 32 26 24 26 24 20" stroke="url(#chromeMetalLight)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                            <defs>
                                <linearGradient id="chromeMetalLight" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#3f3f46"/>
                                    <stop offset="50%" stop-color="#a1a1aa"/>
                                    <stop offset="100%" stop-color="#27272a"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div class="w-44 md:w-50 aspect-[4/5] relative z-10 rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-[0_15px_30px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)] group-hover:border-red-500/40">
                        <img src="${imgSrc}" alt="${p.name}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-30"></div>
                        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-zinc-900 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            ${p.category || 'NEW'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    function updateHangerCardInfo(index) {
        const item = newItems[index];
        if (!item) return;

        const titleEl = document.getElementById('new-hanger-title');
        const priceEl = document.getElementById('new-hanger-price');
        const btnEl = document.getElementById('new-hanger-buy-btn');

        if (titleEl) titleEl.innerText = item.name;
        if (priceEl) {
            const oldPrice = item.originalPrice;
            const oldPriceHTML = oldPrice ? `<span class="text-xs text-zinc-400 line-through font-bold ml-1.5">৳${oldPrice}</span>` : '';
            priceEl.innerHTML = `৳${item.price} ${oldPriceHTML}`;
        }
        if (btnEl) btnEl.setAttribute('onclick', `openModal('${item.id}')`);
    }

    if (typeof Swiper !== 'undefined') {
        if (hangerSwiperInstance) {
            hangerSwiperInstance.destroy(true, true);
        }

        hangerSwiperInstance = new Swiper('.new-hanger-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: newItems.length > 3,
            speed: 500,
            coverflowEffect: { rotate: 0, stretch: 12, depth: 140, modifier: 1, slideShadows: false },
            navigation: { nextEl: '.new-hanger-next', prevEl: '.new-hanger-prev' },
            on: {
                init: function () { updateHangerCardInfo(this.realIndex); },
                slideChange: function () { updateHangerCardInfo(this.realIndex); },
                setTranslate: function () {
                    this.slides.forEach((slide) => {
                        const progress = slide.progress;
                        const absProgress = Math.abs(progress);
                        const translateY = - Math.pow(absProgress, 1.8) * 11; 
                        const rotateZ = progress * -3.5;
                        const cardItem = slide.querySelector('.hanger-card-item');
                        if (cardItem) cardItem.style.transform = `translate3d(0, ${translateY}px, 0) rotate(${rotateZ}deg)`;
                    });
                }
            }
        });
    }
};

// =================================================================
// 4. QUICK VIEW MODAL (Couple Options & Size Chart Support)
// =================================================================
function selectFeature(type, val, el) {
    const buttons = el.parentElement.getElementsByTagName('button');
    for (let btn of buttons) {
        btn.classList.remove('bg-black', 'text-white', 'border-black');
        btn.classList.add('border-gray-100');
    }
    el.classList.add('bg-black', 'text-white', 'border-black');
    el.classList.remove('border-gray-100');

    if (type === 'size') selectedSize = val;
    else if (type === 'color') selectedColor = val;
    else if (type === 'size-p1') selectedSizeP1 = val;
    else if (type === 'size-p2') selectedSizeP2 = val;
    else if (type === 'color-p1') selectedColorP1 = val;
    else if (type === 'color-p2') selectedColorP2 = val;
}

window.openModal = function(id) {
    const p = window.findProductById(id);
    if (!p) return;

    if (p.isOutOfStock === true) {
        Swal.fire({
            icon: 'warning',
            title: 'Out of Stock!',
            text: 'This product is currently out of stock.',
            confirmButtonColor: '#000'
        });
        return;
    }

    window.location.hash = `product-${id}`;
    const content = document.getElementById('modal-content');
    if (!content) return;

    selectedSize = ''; selectedColor = '';
    selectedSizeP1 = ''; selectedSizeP2 = '';
    selectedColorP1 = ''; selectedColorP2 = '';
    modalQty = 1;

    const hasDiscount = p.originalPrice && p.originalPrice > p.price;

    let sizesHTML = '';
    let colorsHTML = '';

    if (p.category === 'couple-tshirt') {
        sizesHTML += `
            <div class="space-y-3">
                <div>
                    <label class="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">Partner 1 Size</label>
                    <div class="flex flex-wrap gap-2">
        `;
        if (p.sizes && p.sizes.partner1) {
            p.sizes.partner1.forEach(size => {
                sizesHTML += size.available 
                    ? `<button onclick="selectFeature('size-p1','${size.name}',this)" class="w-12 h-12 border-2 border-gray-100 rounded-full text-[10px] font-black flex items-center justify-center hover:border-black transition">${size.name}</button>`
                    : `<button disabled class="w-12 h-12 border-2 border-gray-200 rounded-full text-[10px] font-black flex items-center justify-center bg-gray-50 text-gray-400 cursor-not-allowed">${size.name}</button>`;
            });
        }
        sizesHTML += `</div></div><div><label class="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">Partner 2 Size</label><div class="flex flex-wrap gap-2">`;
        if (p.sizes && p.sizes.partner2) {
            p.sizes.partner2.forEach(size => {
                sizesHTML += size.available 
                    ? `<button onclick="selectFeature('size-p2','${size.name}',this)" class="w-12 h-12 border-2 border-gray-100 rounded-full text-[10px] font-black flex items-center justify-center hover:border-black transition">${size.name}</button>`
                    : `<button disabled class="w-12 h-12 border-2 border-gray-200 rounded-full text-[10px] font-black flex items-center justify-center bg-gray-50 text-gray-400 cursor-not-allowed">${size.name}</button>`;
            });
        }
        sizesHTML += `</div></div></div>`;

        colorsHTML += `<div class="space-y-3"><div><label class="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">Partner 1 Color</label><div class="flex flex-wrap gap-2">`;
        if (p.colors && p.colors.partner1) {
            p.colors.partner1.forEach(color => {
                colorsHTML += `<button onclick="selectFeature('color-p1','${color}',this)" class="px-5 py-2.5 border-2 border-gray-100 rounded-full text-[10px] font-black hover:border-black transition">${color}</button>`;
            });
        }
        colorsHTML += `</div></div><div><label class="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">Partner 2 Color</label><div class="flex flex-wrap gap-2">`;
        if (p.colors && p.colors.partner2) {
            p.colors.partner2.forEach(color => {
                colorsHTML += `<button onclick="selectFeature('color-p2','${color}',this)" class="px-5 py-2.5 border-2 border-gray-100 rounded-full text-[10px] font-black hover:border-black transition">${color}</button>`;
            });
        }
        colorsHTML += `</div></div></div>`;
    } else {
        if (p.sizes && Array.isArray(p.sizes)) {
            sizesHTML += `<div class="flex flex-wrap gap-2">`;
            p.sizes.forEach(size => {
                const sizeStr = typeof size === 'string' ? size : (size.name || '');
                const isAvailable = typeof size === 'string' ? true : (size.available !== false);
                sizesHTML += isAvailable
                    ? `<button onclick="selectFeature('size','${sizeStr}',this)" class="w-12 h-12 border-2 border-gray-100 rounded-full text-[10px] font-black flex items-center justify-center hover:border-black transition">${sizeStr}</button>`
                    : `<button disabled class="w-12 h-12 border-2 border-gray-200 rounded-full text-[10px] font-black flex items-center justify-center bg-gray-50 text-gray-400 cursor-not-allowed">${sizeStr}</button>`;
            });
            sizesHTML += `</div>`;
        }

        if (p.colors && Array.isArray(p.colors)) {
            colorsHTML += `<div class="flex flex-wrap gap-2">`;
            p.colors.forEach(color => {
                colorsHTML += `<button onclick="selectFeature('color','${color}',this)" class="px-5 py-2.5 border-2 border-gray-100 rounded-full text-[10px] font-black hover:border-black transition">${color}</button>`;
            });
            colorsHTML += `</div>`;
        }
    }

    let imagesHTML = '';
    if (p.images && Array.isArray(p.images)) {
        imagesHTML = p.images.map((img) => `
            <img src="${img}" onclick="document.getElementById('main-view').src='${img}'" 
                 class="w-20 h-24 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-black transition">
        `).join('');
    }

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div class="space-y-4">
                <div class="relative overflow-hidden rounded-2xl bg-gray-50 aspect-[4/5]">
                    <img id="main-view" src="${p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg'}" class="w-full h-full object-cover transition duration-500">
                </div>
                <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">${imagesHTML}</div>
                <div class="mt-8 border-t pt-6 space-y-2">
                    <h3 class="text-xs font-black uppercase tracking-widest">Description</h3>
                    <div class="text-[11px] text-gray-600 leading-relaxed">${p.description || "Premium quality streetwear designed for style and comfort."}</div>
                </div>
            </div>
            <div class="flex flex-col">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pr-8 md:pr-0">
                    <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black">${p.name}</h2>
                    <button onclick="shareProductLink('${p.id}')" class="flex items-center gap-2 bg-gray-50 hover:bg-black text-black hover:text-white px-3.5 py-1.5 rounded-full border border-gray-200 transition">
                        <i class="fa-solid fa-share-nodes text-[11px]"></i>
                        <span class="text-[10px] font-black uppercase tracking-wider">Share</span>
                    </button>
                </div>

                <div class="flex items-center gap-3 mb-6">
                    <p class="text-2xl font-black text-red-600">৳ ${p.price}</p>
                    ${hasDiscount ? `<p class="text-sm font-bold text-gray-400 line-through">৳ ${p.originalPrice}</p>` : ''}
                </div>
                
                ${colorsHTML ? `<div class="mb-4"><p class="text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest">Color</p><div>${colorsHTML}</div></div>` : ''}
                ${sizesHTML ? `<div class="mb-6"><p class="text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest">Size</p><div>${sizesHTML}</div></div>` : ''}
                
                <div class="mb-8 flex items-center gap-5">
                    <div class="flex items-center border-2 border-gray-100 rounded-2xl bg-gray-50">
                        <button onclick="updateQty(-1)" class="px-5 py-3 font-bold">-</button>
                        <span id="modal-qty" class="px-6 font-black text-lg">1</span>
                        <button onclick="updateQty(1)" class="px-5 py-3 font-bold">+</button>
                    </div>
                </div>
                
                <button onclick="addToCart('${p.id}')" class="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all">
                    Add To Cart ↘
                </button>
            </div>
        </div>`;

    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeModal = function() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    history.pushState("", document.title, window.location.pathname + window.location.search);
};

// =================================================================
// 5. ADD TO CART & CHECKOUT ENGINE
// =================================================================
function addToCart(id) {
    const p = window.findProductById(id);
    if (!p) return;

    if (p.category === 'couple-tshirt') {
        if (!selectedSizeP1 || !selectedSizeP2 || !selectedColorP1 || !selectedColorP2) {
            Swal.fire({ title: 'Attention!', text: 'Please select Size and Color for BOTH Partners.', icon: 'warning', confirmButtonColor: '#000' });
            return;
        }
    } else {
        if (p.sizes && p.sizes.length > 0 && !selectedSize) {
            Swal.fire({ title: 'Attention!', text: 'Please select your Size.', icon: 'warning', confirmButtonColor: '#000' });
            return;
        }
    }

    let finalSize = p.category === 'couple-tshirt' ? `P1: ${selectedSizeP1} + P2: ${selectedSizeP2}` : selectedSize;
    let finalColor = p.category === 'couple-tshirt' ? `P1: ${selectedColorP1} + P2: ${selectedColorP2}` : (selectedColor || (Array.isArray(p.colors) ? p.colors[0] : 'Std'));

    cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category,
        selectedSize: finalSize,
        selectedColor: finalColor,
        qty: modalQty,
        image: (p.images && p.images[0]) ? p.images[0] : 'images/placeholder.jpg'
    });

    updateCartUI();
    closeModal();
    toggleCart(true);

    Swal.fire({ position: 'top-end', icon: 'success', title: 'Added to cart!', showConfirmButton: false, timer: 1500 });
    saveCartToStorage();
}

window.addToCartFromModal = addToCart;

function updateCartUI(isPaidOverride = null) {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const freeDeliveryMsg = document.getElementById('free-delivery-msg');

    if (isPaidOverride !== null) {
        isPaymentVerified = (isPaidOverride === true || isPaidOverride === "Full Paid");
    }

    if (!cartContainer) return;

    let subtotal = 0, itemCount = 0;

    cartContainer.innerHTML = cart.map((item, index) => {
        subtotal += item.price * item.qty;
        itemCount += item.qty;

        return `
            <div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 mb-2">
                <div class="flex items-center gap-3">
                    <img src="${item.image}" class="w-12 h-12 object-cover rounded shadow-sm" alt="${item.name}">
                    <div class="text-left">
                        <h4 class="text-[10px] font-bold uppercase text-gray-900">${item.name}</h4>
                        <p class="text-[9px] text-gray-500">${item.selectedSize} | ${item.selectedColor}</p>
                        <p class="text-xs font-black text-red-600">৳${item.price} x ${item.qty}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500 text-lg font-bold p-2">&times;</button>
            </div>`;
    }).join('');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-center text-gray-500 py-8 text-xs font-bold uppercase">Your cart is empty</p>';
    }

    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    let baseDeliveryCharge = parseInt(deliveryOption ? deliveryOption.value : 90);

    const eligibleItemCount = cart.filter(item => item.category !== 'henley').reduce((sum, item) => sum + item.qty, 0);

    if (eligibleItemCount >= 3) {
        baseDeliveryCharge = 0;
        if (freeDeliveryMsg) {
            freeDeliveryMsg.classList.add('text-green-600', 'opacity-100');
            freeDeliveryMsg.innerHTML = "✓ FREE DELIVERY UNLOCKED! 🚚";
        }
    } else {
        if (freeDeliveryMsg) {
            freeDeliveryMsg.classList.remove('text-green-600', 'opacity-100');
            freeDeliveryMsg.innerHTML = "Buy 3 or more items to get FREE DELIVERY 🚚 (Henley Excluded)";
        }
    }

    let discount = 0;
    if (activePromo) {
        const promo = promoList[activePromo];
        if (promo.applicableCategories && promo.applicableCategories.length > 0) {
            const applicableSubtotal = cart.filter(item => promo.applicableCategories.includes(item.category)).reduce((sum, item) => sum + (item.price * item.qty), 0);
            if (promo.type === "delivery") baseDeliveryCharge = 0;
            else if (promo.type === "percent") discount = (applicableSubtotal * promo.value) / 100;
            else if (promo.type === "fixed") discount = promo.value;
        } else {
            if (promo.type === "delivery") baseDeliveryCharge = 0;
            else if (promo.type === "percent") discount = (subtotal * promo.value) / 100;
            else if (promo.type === "fixed") discount = promo.value;
        }
    }

    let finalDeliveryCharge = isPaymentVerified ? 0 : baseDeliveryCharge;
    let finalTotal = subtotal + finalDeliveryCharge - discount;

    const deliveryDisplay = isPaymentVerified ? '<span class="text-green-600 font-black">PAID</span>' : (baseDeliveryCharge === 0 ? '<span class="text-green-600 font-black">FREE</span>' : '৳' + baseDeliveryCharge);

    if (totalElement) {
        totalElement.innerHTML = `
            <div class="space-y-1 mb-3 pt-4 border-t text-left">
                <div class="flex justify-between text-[10px] text-gray-400 uppercase font-bold"><span>Subtotal</span><span>৳${subtotal}</span></div>
                ${discount > 0 ? `<div class="flex justify-between text-[10px] text-red-600 uppercase font-bold italic"><span>Promo Discount</span><span>- ৳${discount.toFixed(0)}</span></div>` : ''}
                <div class="flex justify-between text-[10px] uppercase font-bold"><span>Delivery</span><span>${deliveryDisplay}</span></div>
                <div class="flex justify-between items-center border-t pt-2 mt-2">
                    <span class="text-xs font-black uppercase">Total</span>
                    <span class="text-2xl font-black ${isPaymentVerified ? 'text-green-600' : 'text-black'}">৳${finalTotal.toFixed(0)}</span>
                </div>
            </div>`;
    }

    ['cart-count', 'cart-count-drawer'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = itemCount;
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    saveCartToStorage();
    validateOrder();
}

function toggleCart(open = false) {
    const d = document.getElementById('cart-drawer');
    if (!d) return;
    if (open) d.classList.remove('translate-x-full');
    else d.classList.toggle('translate-x-full');
}

function updatePaymentUI(method) {
    const onlineSubOptions = document.getElementById('online-sub-options');
    const instructionBox = document.getElementById('payment-instruction');
    const trnxInput = document.getElementById('trnx-id');

    if (method === 'COD') {
        if (onlineSubOptions) onlineSubOptions.classList.add('hidden');
        if (instructionBox) instructionBox.classList.add('hidden');
        if (trnxInput) trnxInput.value = '';
        selectedSubMethod = "";
    } else {
        if (onlineSubOptions) onlineSubOptions.classList.remove('hidden');
    }

    validateOrder();
}

function setOnlineMethod(method) {
    selectedSubMethod = method;
    const instructionBox = document.getElementById('payment-instruction');
    const methodHeader = document.getElementById('method-header');
    const methodName = document.getElementById('method-name');
    const displayNumber = document.getElementById('display-number');

    if (!instructionBox) return;

    instructionBox.classList.remove('hidden');
    instructionBox.style.display = 'flex';

    if (method === 'bKash') {
        if (methodName) methodName.innerText = "Payment with bKash";
        if (methodHeader) methodHeader.style.backgroundColor = "#e2136e";
        if (displayNumber) displayNumber.innerText = "01740550559";
    } else if (method === 'Nagad') {
        if (methodName) methodName.innerText = "Payment with Nagad";
        if (methodHeader) methodHeader.style.backgroundColor = "#f7941d";
        if (displayNumber) displayNumber.innerText = "01894357549";
    }

    validateOrder();
}

function validateOrder() {
    const nameInput = document.getElementById('final-name');
    const phoneInput = document.getElementById('final-phone');
    const addressInput = document.getElementById('final-address');
    const trnxInput = document.getElementById('trnx-id');

    const confirmBtn = document.getElementById('confirm-order-btn');
    const whatsappBtn = document.getElementById('whatsapp-order-btn');

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const trnxId = trnxInput ? trnxInput.value.trim() : "";

    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = selectedMethod ? selectedMethod.value : "COD";

    let isInfoValid = name !== "" && phone.length >= 11 && address !== "";
    let isPaymentValid = paymentMethod === 'COD' ? true : trnxId.length >= 8;
    const isValid = isInfoValid && isPaymentValid;

    [confirmBtn, whatsappBtn].forEach(btn => {
        if (btn) btn.disabled = !isValid;
    });
}

function clearCheckoutInputs() {
    ['final-name', 'final-phone', 'final-address', 'trnx-id'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
    validateOrder();
}

function confirmOrder() {
    const name = document.getElementById('final-name')?.value.trim();
    const phone = document.getElementById('final-phone')?.value.trim();
    const address = document.getElementById('final-address')?.value.trim();
    const trnxId = document.getElementById('trnx-id')?.value.trim() || "N/A";
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = selectedMethod ? selectedMethod.value : "COD";

    if (!name || phone.length < 11 || !address || cart.length === 0) return;

    let itemsText = "";
    let subtotal = 0;
    cart.forEach((item) => {
        itemsText += `${item.name} (${item.selectedSize}/${item.selectedColor}) x ${item.qty} = ৳${item.price * item.qty}\n`;
        subtotal += item.price * item.qty;
    });

    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    let baseCharge = deliveryOption ? parseInt(deliveryOption.value) : 80;

    const formData = {
        access_key: "3322838f-d959-4aab-a68b-baf4d18b5dcb",
        subject: `🚨 NEW ORDER - ${name}`,
        Customer_Name: name,
        Customer_Phone: phone,
        Delivery_Address: address,
        Ordered_Items: itemsText,
        Subtotal: `৳${subtotal}`,
        Payment_Method: paymentMethod,
        Transaction_ID: trnxId
    };

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            cart = [];
            localStorage.removeItem('redams_cart');
            clearCheckoutInputs();
            updateCartUI();
            toggleCart(false);
            Swal.fire({ icon: 'success', title: 'Order Confirmed!', text: 'Thank you for shopping with REDAMS.' });
        }
    });
}

function orderByWhatsApp() {
    const name = document.getElementById('final-name')?.value.trim();
    const phone = document.getElementById('final-phone')?.value.trim();
    const address = document.getElementById('final-address')?.value.trim();
    if (!name || phone.length < 11 || !address || cart.length === 0) return;

    let itemsText = "";
    cart.forEach((item, index) => {
        itemsText += `${index + 1}. ${item.name} (${item.selectedSize}/${item.selectedColor}) x ${item.qty} = ৳${item.price * item.qty}\n`;
    });

    let message = `🚨 *NEW ORDER - REDAMS*\n\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📍 *Address:* ${address}\n\n🛒 *Items:*\n${itemsText}`;
    
    cart = [];
    localStorage.removeItem('redams_cart');
    clearCheckoutInputs();
    updateCartUI();
    toggleCart(false);

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

function shareProductLink(id) {
    const shareUrl = `${window.location.origin}${window.location.pathname}#product-${id}`;
    if (navigator.share) {
        navigator.share({ title: 'REDAMS Apparel', url: shareUrl }).catch(() => copyToClipboard(shareUrl));
    } else {
        copyToClipboard(shareUrl);
    }
}

function copyToClipboard(url) {
    navigator.clipboard.writeText(url).then(() => {
        Swal.fire({ icon: 'success', title: 'LINK COPIED!', timer: 1500, showConfirmButton: false });
    });
}

function checkUrlAndOpenModal() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#product-')) {
        const productId = hash.replace('#product-', '');
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.allProducts && window.allProducts.length > 0) {
                openModal(productId);
                clearInterval(checkInterval);
            } else if (attempts > 20) {
                clearInterval(checkInterval);
            }
        }, 100);
    }
}

window.addEventListener('DOMContentLoaded', checkUrlAndOpenModal);
window.addEventListener('hashchange', checkUrlAndOpenModal);

// =================================================================
// 6. INITIALIZATION & REVIEWS ENGINE
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    ['final-name', 'final-phone', 'final-address', 'trnx-id'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', validateOrder);
    });

    // জেসন ফাইল লোড করা
    fetch('products.json')
        .then(res => res.json())
        .then(data => {
            window.localJsonProducts = data || [];
            if (typeof syncAndRenderAllProducts === 'function') {
                syncAndRenderAllProducts();
            }
        })
        .catch(err => console.log("JSON Load Warning:", err));

    updateCartUI();
});
