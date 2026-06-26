// ===== গ্লোবাল ভেরিয়েবল =====
let allProducts = [];
// রিলোড হলেও যেন লোকাল স্টোরেজ থেকে আগের কার্ট ডাটা লোড হয়
let cart = JSON.parse(localStorage.getItem('redams_cart')) || [];
let selectedSize = null;
let selectedColor = null;
let modalQty = 1;
let isPaymentVerified = false;
let activePromo = null;
let selectedSubMethod = "";

const WHATSAPP_NUMBER = "8801894357549";

// ===== প্রোমো কোড লিস্ট (সরাসরি কোডে ডিফাইন করা) =====
const promoList = {
    // সব প্রোডাক্টে কাজ করে
    "": { type: "delivery", value: 0, applicableCategories: [] },
    "REDAMS10": { type: "percent", value: 10, applicableCategories: [] },
    "SAVE50": { type: "fixed", value: 50, applicableCategories: [] },
    "WELCOME20": { type: "percent", value: 20, applicableCategories: [] },
    
    // শুধু drop-shoulder এ কাজ করে
    "DROPDROP15": { type: "percent", value: 15, applicableCategories: ['drop-shoulder'] },
    "DROPOFF25": { type: "percent", value: 25, applicableCategories: ['drop-shoulder'] },
    
    // শুধু regular-tshirt এ কাজ করে
    "REGULAR10": { type: "percent", value: 10, applicableCategories: ['regular-tshirt'] },
    "REGULAR30": { type: "fixed", value: 30, applicableCategories: ['regular-tshirt'] },
    
    // শুধু polo-tshirt এ কাজ করে
    "": { type: "delivery", value: 0, applicableCategories: ['polo-tshirt'] },
    "": { type: "percent", value: 15, applicableCategories: ['polo-tshirt'] },
     "ARG150": { type: "fixed", value: 150, applicableCategories: ['polo-tshirt'] },
    
    // শুধু acid-wash এ কাজ করে
    "ACIDWASH12": { type: "percent", value: 12, applicableCategories: ['acid-wash'] }
};

// কার্ট আপডেট হলেই যেন তা ব্রাউজারে সেভ হয়ে যায়
function saveCartToStorage() {
    localStorage.setItem('redams_cart', JSON.stringify(cart));
}
// ===== URL থেকে ক্যাটাগরি বের করা =====
function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('cat');
}

// ===== প্রোডাক্ট লোড এবং ফিল্টার =====
function loadProducts() {
    fetch('products.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load products.json');
            return res.json();
        })
        .then(data => {
            allProducts = data;
            const isShopPage = window.location.pathname.toLowerCase().includes('shop.html');
            const selectedCat = getCategoryFromURL();

            if (isShopPage) {
                if (selectedCat) {
                    const filtered = allProducts.filter(p =>
                        p.category.trim().toLowerCase() === selectedCat.trim().toLowerCase()
                    );
                    displayProducts(filtered, true);
                    const title = document.querySelector('h2');
                    if (title) title.innerText = selectedCat.replace(/-/g, ' ').toUpperCase() + ' COLLECTION';
                } else {
                    displayProducts(allProducts, true);
                }
            } else {
                displayProducts(allProducts, false);
                renderNewArrivals(allProducts);
            }
        })
        .catch(err => {
            console.error("Error loading products:", err);
            const grid = document.getElementById('product-grid');
            if (grid) grid.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load products</p>';
        });
}

// ===== মোবাইল মেনু টগল =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');

    if (menu.classList.contains('-translate-x-full')) {
        menu.classList.remove('-translate-x-full');
        menu.classList.add('translate-x-0');
        overlay.classList.add('active');
    } else {
        menu.classList.remove('translate-x-0');
        menu.classList.add('-translate-x-full');
        overlay.classList.remove('active');
    }
}

// ===== কালার এবং সাইজ সিলেকশন =====
function selectFeature(type, val, el) {
    const buttons = el.parentElement.getElementsByTagName('button');
    for (let btn of buttons) {
        btn.classList.remove('bg-black', 'text-white', 'border-black');
        btn.classList.add('border-gray-100');
    }
    el.classList.add('bg-black', 'text-white', 'border-black');
    el.classList.remove('border-gray-100');

    if (type === 'size') selectedSize = val;
    else selectedColor = val;
}

// ===== কোয়ান্টিটি আপডেট =====
function updateQty(val) {
    modalQty = Math.max(1, modalQty + val);
    const qtyElement = document.getElementById('modal-qty');
    if (qtyElement) qtyElement.innerText = modalQty;
}

// ===== নতুন আগমন স্লাইডার রেন্ডার =====
function renderNewArrivals(products) {
    const slider = document.getElementById('new-arrivals-slider');
    if (!slider) return;

    // Stock out products exclude করা
    const availableProducts = products.filter(p => !p.isOutOfStock);
    const newItems = availableProducts.slice(-10).reverse();

    slider.innerHTML = newItems.map(p => `
        <div class="min-w-[280px] md:min-w-[340px] snap-center group cursor-pointer relative" onclick="openModal(${p.id})">
            <div class="relative overflow-hidden rounded-[2rem] aspect-[3/4] bg-[#f8f8f8]">
                <img src="${p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg'}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]"
                     alt="${p.name}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                    <p class="text-white/70 text-[10px] uppercase tracking-widest">${p.category}</p>
                    <h3 class="text-white text-lg font-black uppercase">${p.name}</h3>
                    <p class="text-white font-bold mt-2">৳ ${p.price}</p>
                </div>
                <div class="absolute top-6 right-6">
                    <div class="bg-white/10 backdrop-blur-xl text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-2">
                        <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span> New Drop
                    </div>
                </div>
            </div>
            <div class="mt-6 text-center">
                <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">${p.category}</h3>
                <h2 class="text-sm font-black uppercase text-gray-900">${p.name}</h2>
                <p class="text-lg font-black mt-1">৳ ${p.price}</p>
            </div>
        </div>
    `).join('');

    setupAutoScroll(slider);
}

// ===== প্রোডাক্ট গ্রিড ডিসপ্লে =====
function displayProducts(products, showAll = false) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (!products || !Array.isArray(products) || products.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">No products found</p>';
        return;
    }

    const productsToShow = showAll ? products : products.slice(0, 8);

    grid.innerHTML = productsToShow.map(p => {
        if (!p) return '';

        const hasDiscount = p.originalPrice && p.originalPrice > p.price;
        const discPer = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        const firstImage = p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg';
        const isOutOfStock = p.isOutOfStock === true;

        return `
            <div class="bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-2xl transition duration-500 cursor-pointer group relative ${isOutOfStock ? 'opacity-60' : ''}">
                ${hasDiscount ? `<div class="absolute top-5 left-5 z-10 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md">-${discPer}% OFF</div>` : ''}
                
                ${isOutOfStock ? `<div class="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center z-20 top-3 left-3 right-3 bottom-3">
                    <span class="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-full border border-white/20">Out of Stock</span>
                </div>` : ''}
                
                <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-50" onclick="${isOutOfStock ? 'return false;' : `openModal(${p.id})`}" style="${isOutOfStock ? 'cursor: not-allowed;' : ''}">
                    <img src="${firstImage}" 
                         class="w-full h-full object-cover ${isOutOfStock ? '' : 'group-hover:scale-110'} transition duration-700"
                         alt="${p.name}">
                </div>

                <div class="p-3 text-center">
                    <h3 class="font-bold text-gray-800 text-[11px] uppercase tracking-tighter mb-1 line-clamp-2">${p.name}</h3>
                    <div class="flex items-center justify-center gap-2 mb-3">
                        <span class="font-black text-black text-sm">৳ ${p.price}</span>
                        ${hasDiscount ? `<span class="text-gray-400 text-[10px] line-through">৳ ${p.originalPrice}</span>` : ''}
                    </div>
                    
                    <button onclick="${isOutOfStock ? 'alert(\"This product is out of stock\"); return false;' : `openModal(${p.id})`}" 
                            class="w-full ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-red-600'} text-white py-2 rounded-xl font-black uppercase text-[10px] mt-3 transition"
                            ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Out of Stock' : 'Order Now'}
                    </button>
                </div>
            </div>`;
    }).join('');

    const viewAllBtn = document.getElementById('view-all-container');
    if (viewAllBtn) viewAllBtn.style.display = (showAll || products.length <= 8) ? 'none' : 'block';
}

// ===== মোডাল খোলা =====
function openModal(id) {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    // Stock Out check করা
    if (p.isOutOfStock === true) {
        Swal.fire({
            icon: 'warning',
            title: 'Out of Stock!',
            text: 'This product is currently out of stock. Please check back later.',
            confirmButtonColor: '#000'
        });
        return;
    }

    const content = document.getElementById('modal-content');
    selectedSize = null;
    selectedColor = null;
    modalQty = 1;

    const hasDiscount = p.originalPrice && p.originalPrice > p.price;

    // সাইজ বোতাম তৈরি (individual size availability check করা)
    let sizesHTML = '';
    if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach(size => {
            const sizeStr = typeof size === 'string' ? size : (size.name || '');
            const isAvailable = typeof size === 'string' ? true : (size.available !== false);
            
            if (isAvailable) {
                sizesHTML += `<button onclick="selectFeature('size','${sizeStr}',this)" class="w-12 h-12 border-2 border-gray-100 rounded-full text-[10px] font-black flex items-center justify-center hover:border-black transition">${sizeStr}</button>`;
            } else {
                sizesHTML += `<button disabled class="w-12 h-12 border-2 border-gray-200 rounded-full text-[10px] font-black flex items-center justify-center bg-gray-50 text-gray-400 cursor-not-allowed">${sizeStr}</button>`;
            }
        });
    }

    // রঙ বোতাম তৈরি
    let colorsHTML = '';
    if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach(color => {
            colorsHTML += `<button onclick="selectFeature('color','${color}',this)" class="px-5 py-2.5 border-2 border-gray-100 rounded-full text-[10px] font-black hover:border-black transition">${color}</button>`;
        });
    }

    // [SEO UPDATE] ইমেজ থাম্বনেইল তৈরি করার সময় dynamic alt এবং loading="lazy" যোগ করা হয়েছে
    let imagesHTML = '';
    if (p.images && Array.isArray(p.images)) {
        imagesHTML = p.images.map((img, index) => {
            const categoryText = p.category ? p.category.replace('-', ' ') : 'clothing';
            const altText = `${p.name} - Premium ${categoryText} by REDAMS Bangladesh - View ${index + 1}`;
            return `<img src="${img}" 
                         alt="${altText}" 
                         loading="lazy" 
                         onclick="document.getElementById('main-view').src='${img}'" 
                         class="w-20 h-24 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-black transition">`;
        }).join('');
    }

    // ক্যাটাগরি টেক্সট ফরম্যাট করা (যেমন: drop-shoulder থেকে drop shoulder)
    const formattedCategory = p.category ? p.category.replace('-', ' ') : 'apparel';
    const mainAltText = `${p.name} - Premium ${formattedCategory} T-Shirt by REDAMS`;

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
                <div class="relative overflow-hidden rounded-2xl bg-gray-50 aspect-[3/4]">
                    <!-- [SEO UPDATE] মূল ইমেজে মিনিংফুল alt টেক্সট দেওয়া হয়েছে -->
                    <img id="main-view" src="${p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg'}" 
                         class="w-full h-full object-cover transition duration-500"
                         alt="${mainAltText}">
                </div>
                <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    ${imagesHTML}
                </div>
                <div class="mt-8 border-t pt-6 space-y-4">
                    <h3 class="text-xs font-black uppercase tracking-widest">Description</h3>
                    <p class="text-[11px] text-gray-500 leading-relaxed">${p.description || "Premium quality streetwear designed for style and comfort."}</p>
                </div>
            </div>
            <div class="flex flex-col">
                <h2 class="text-3xl font-black mb-2 uppercase tracking-tighter">${p.name}</h2>
                <div class="flex items-center gap-3 mb-6">
                    <p class="text-2xl font-black">৳ ${p.price}</p>
                    ${hasDiscount ? `<p class="text-sm font-bold text-gray-400 line-through">৳ ${p.originalPrice}</p>` : ''}
                </div>
                <div class="mb-4">
                    <p class="text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest">Color</p>
                    <div class="flex gap-2 flex-wrap">${colorsHTML}</div>
                </div>
                <div class="mb-6">
                    <p class="text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest">Size</p>
                    <div class="flex gap-2 flex-wrap">${sizesHTML}</div>
                    <p class="text-[9px] text-gray-400 mt-2">Disabled sizes are out of stock</p>
                </div>
                <div class="mb-8 flex items-center gap-5">
                    <div class="flex items-center border-2 border-gray-100 rounded-2xl bg-gray-50">
                        <button onclick="updateQty(-1)" class="px-5 py-3 font-bold">-</button>
                        <span id="modal-qty" class="px-6 font-black text-lg">1</span>
                        <button onclick="updateQty(1)" class="px-5 py-3 font-bold">+</button>
                    </div>
                </div>
                <button onclick="addToCart(${p.id})" class="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all">
                    Add To Cart
                </button>
            </div>
        </div>`;

    document.getElementById('product-modal').classList.replace('hidden', 'flex');
}

// ===== কার্টে যোগ করা =====
function addToCart(id) {
    if (!selectedSize || !selectedColor) {
        Swal.fire({
            title: 'Attention!',
            text: 'Please select both Color and Size.',
            icon: 'warning',
            confirmButtonColor: '#000'
        });
        return;
    }

    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        qty: modalQty,
        image: p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg'
    });

    updateCartUI();
    closeModal();
    toggleCart(true);

    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Added to cart!',
        showConfirmButton: false,
        timer: 1500
    });
    saveCartToStorage(); // কার্ট ডাটা সেভ করো
}

// ===== প্রোমো কোড প্রয়োগ করা (ক্যাটাগরি চেক সহ) =====
function applyPromoCode() {
    const input = document.getElementById('promo-input');
    const msg = document.getElementById('promo-msg');

    if (!input) return;

    const code = input.value.toUpperCase().trim();

    if (promoList[code]) {
        const promo = promoList[code];
        
        // কার্টের সব পণ্যের ক্যাটাগরি চেক করুন
        if (promo.applicableCategories && promo.applicableCategories.length > 0) {
            const isApplicable = cart.some(item => 
                promo.applicableCategories.includes(item.category)
            );
            
            if (!isApplicable) {
                activePromo = null;
                msg.innerText = `✗ এই কোড শুধু ${promo.applicableCategories.join(', ')} এর জন্য কাজ করে`;
                msg.className = "mt-2 ml-2 text-[9px] font-bold uppercase text-red-600 block";
                input.value = '';
                return;
            }
        }
        
        activePromo = code;
        msg.innerText = `✓ Promo "${code}" Applied!`;
        msg.className = "mt-2 ml-2 text-[9px] font-bold uppercase text-green-600 block";
        input.value = '';
    } else {
        activePromo = null;
        msg.innerText = "✗ Invalid Promo Code";
        msg.className = "mt-2 ml-2 text-[9px] font-bold uppercase text-red-600 block";
    }

    updateCartUI();
}

// ===== কার্ট UI আপডেট =====
function updateCartUI(isPaidOverride = null) {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const freeDeliveryMsg = document.getElementById('free-delivery-msg');
    const paymentSection = document.getElementById('payment-options-wrapper');

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
                    <div>
                        <h4 class="text-[10px] font-bold uppercase">${item.name}</h4>
                        <p class="text-[9px] text-gray-500">${item.selectedSize} | ${item.selectedColor}</p>
                        <p class="text-xs font-black">৳${item.price} x ${item.qty}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500 text-lg font-bold">&times;</button>
            </div>`;
    }).join('');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
    }

    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    if (deliveryOption && paymentSection) {
        paymentSection.classList.remove('hidden');
    }

    let baseDeliveryCharge = parseInt(deliveryOption ? deliveryOption.value : 80);

    // অটো ফ্রি ডেলিভারি (৩ টি আইটেমে)
    if (itemCount >= 3) {
        baseDeliveryCharge = 0;
        if (freeDeliveryMsg) {
            freeDeliveryMsg.classList.add('text-green-600', 'opacity-100');
            freeDeliveryMsg.innerHTML = "✓ FREE DELIVERY UNLOCKED! 🚚";
        }
    } else {
        if (freeDeliveryMsg) {
            freeDeliveryMsg.classList.remove('text-green-600', 'opacity-100');
            freeDeliveryMsg.innerHTML = "Buy 3 or more items to get FREE DELIVERY 🚚";
        }
    }

    // প্রোমো কোড ডিসকাউন্ট (ক্যাটাগরি চেক সহ)
    let discount = 0;
    if (activePromo) {
        const promo = promoList[activePromo];
        
        // যদি ক্যাটাগরি নির্দিষ্ট হয়, শুধুমাত্র সেই ক্যাটাগরির পণ্যে ছাড় প্রয়োগ করুন
        if (promo.applicableCategories && promo.applicableCategories.length > 0) {
            const applicableSubtotal = cart
                .filter(item => promo.applicableCategories.includes(item.category))
                .reduce((sum, item) => sum + (item.price * item.qty), 0);
            
            if (promo.type === "delivery") {
                baseDeliveryCharge = 0;
            } else if (promo.type === "percent") {
                discount = (applicableSubtotal * promo.value) / 100;
            } else if (promo.type === "fixed") {
                discount = promo.value;
            }
        } else {
            // সব পণ্যে প্রয়োগ হয়
            if (promo.type === "delivery") {
                baseDeliveryCharge = 0;
            } else if (promo.type === "percent") {
                discount = (subtotal * promo.value) / 100;
            } else if (promo.type === "fixed") {
                discount = promo.value;
            }
        }
    }

    let finalDeliveryCharge = isPaymentVerified ? 0 : baseDeliveryCharge;
    let finalTotal = subtotal + finalDeliveryCharge - discount;

    const deliveryDisplay = isPaymentVerified ?
        '<span class="text-green-600 font-black">PAID</span>' :
        (baseDeliveryCharge === 0 ? '<span class="text-green-600 font-black">FREE</span>' : '৳' + baseDeliveryCharge);

    if (totalElement) {
        totalElement.innerHTML = `
            <div class="space-y-1 mb-3 pt-4 border-t">
                <div class="flex justify-between text-[10px] text-gray-400 uppercase font-bold"><span>Subtotal</span><span>৳${subtotal}</span></div>
                
                ${discount > 0 ? `
                <div class="flex justify-between text-[10px] text-red-600 uppercase font-bold italic">
                    <span>Promo Discount</span><span>- ৳${discount.toFixed(0)}</span>
                </div>` : ''}

                <div class="flex justify-between text-[10px] uppercase font-bold"><span>Delivery</span><span>${deliveryDisplay}</span></div>
                
                <div class="flex justify-between items-center border-t pt-2 mt-2">
                    <span class="text-xs font-black uppercase">Total</span>
                    <span class="text-2xl font-black ${isPaymentVerified ? 'text-green-600' : 'text-black'}">
                        ৳${finalTotal.toFixed(0)} ${isPaymentVerified ? '<span class="text-[10px] block text-right font-black">[ PAID ]</span>' : ''}
                    </span>
                </div>
            </div>`;
    }

    const countEls = ['cart-count', 'cart-count-drawer', 'cart-count-float'];
    countEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = itemCount;
    });
}

// ===== পেমেন্ট পদ্ধতি আপডেট =====
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

// ===== অনলাইন পেমেন্ট পদ্ধতি সেট করা =====
function setOnlineMethod(method) {
    selectedSubMethod = method;
    const instructionBox = document.getElementById('payment-instruction');
    const methodHeader = document.getElementById('method-header');
    const methodName = document.getElementById('method-name');
    const displayNumber = document.getElementById('display-number');
    const instructionContent = document.getElementById('instruction-content');

    if (!instructionBox) return;

    const bkashNumber = "01740550559";
    const nagadNumber = "01894357549";

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
    const areaCharge = deliveryRadio ? deliveryRadio.value : "80";
    const advanceAmount = totalQty >= 3 ? "100" : areaCharge;

    instructionBox.classList.remove('hidden');
    instructionBox.style.display = 'flex';

    if (method === 'bKash') {
        if (methodName) methodName.innerText = "Payment with bKash";
        if (methodHeader) methodHeader.style.backgroundColor = "#e2136e";
        if (displayNumber) displayNumber.innerText = bkashNumber;
        if (instructionContent) instructionContent.innerHTML = `
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">নিচের নাম্বারে টাকা পাঠান (Personal)</p>
            <p class="text-[11px] font-bold text-black leading-tight mt-1">
                অগ্রিম <span class="text-[#e2136e]">৳${advanceAmount}</span> Send Money করে TRXID দিন।
            </p>`;
    } else if (method === 'Nagad') {
        if (methodName) methodName.innerText = "Payment with Nagad";
        if (methodHeader) methodHeader.style.backgroundColor = "#f7941d";
        if (displayNumber) displayNumber.innerText = nagadNumber;
        if (instructionContent) instructionContent.innerHTML = `
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">নিচের নাম্বারে টাকা পাঠান (Personal)</p>
            <p class="text-[11px] font-bold text-black leading-tight mt-1">
                অগ্রিম <span class="text-[#f7941d]">৳${advanceAmount}</span> Send Money করে TRXID দিন।
            </p>`;
    }

    validateOrder();
}

// ===== অর্ডার ভ্যালিডেশন =====
function validateOrder() {
    const nameInput = document.getElementById('final-name');
    const phoneInput = document.getElementById('final-phone');
    const addressInput = document.getElementById('final-address');
    const trnxInput = document.getElementById('trnx-id');
    const btn = document.getElementById('confirm-order-btn');

    if (!btn) return;

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const trnxId = trnxInput ? trnxInput.value.trim() : "";

    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = selectedMethod ? selectedMethod.value : "COD";

    let isInfoValid = name !== "" && phone.length >= 11 && address !== "";
    let isPaymentValid = false;

    if (paymentMethod === 'COD') {
        isPaymentValid = true;
    } else {
        isPaymentValid = trnxId.length >= 8;
    }

    if (isInfoValid && isPaymentValid) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'bg-gray-300', 'cursor-not-allowed', 'pointer-events-none');
        btn.classList.add('bg-[#25D366]');
        btn.style.opacity = "1";

        if (typeof updateCartUI === "function") {
            updateCartUI(paymentMethod !== 'COD' ? "Full Paid" : "Unpaid");
        }
    } else {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'bg-gray-300', 'cursor-not-allowed', 'pointer-events-none');
        btn.classList.remove('bg-[#25D366]');
        btn.style.opacity = "0.5";

        if (typeof updateCartUI === "function") updateCartUI("Unpaid");
    }
}

// ===== প্রফেশনাল উপায়ে ই-মেইলে অর্ডার কনফার্ম করা (Web3Forms) =====
function confirmOrder() {
    const name = document.getElementById('final-name')?.value.trim();
    const phone = document.getElementById('final-phone')?.value.trim();
    const address = document.getElementById('final-address')?.value.trim();
    const trnxIdInput = document.getElementById('trnx-id');
    const trnxId = trnxIdInput ? trnxIdInput.value.trim() : "N/A";

    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = selectedMethod ? selectedMethod.value : "COD";
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    if (!name || !phone || !address || cart.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'অসম্পূর্ণ তথ্য!',
            text: 'নাম, মোবাইল নম্বর এবং ঠিকানা দিন।'
        });
        return;
    }

    if (paymentMethod !== 'COD' && trnxId.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'TRXID প্রয়োজন!',
            text: 'সঠিক Transaction ID দিন।'
        });
        return;
    }

    // আইটেম এবং সাবটোটাল (মেইলের জন্য টেক্সট ফরম্যাট করা হলো)
    let itemsText = "";
    let subtotal = 0;
    cart.forEach((item) => {
        itemsText += `${item.name} (${item.selectedSize}/${item.selectedColor}) x ${item.qty} = ৳${item.price * item.qty}\n`;
        subtotal += item.price * item.qty;
    });

    // ডেলিভারি চার্জ
    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    let baseCharge = deliveryOption ? parseInt(deliveryOption.value) : 80;

    if (totalQty >= 3) baseCharge = 0;

    // প্রোমো ডিসকাউন্ট
    let discount = 0;
    let promoInfo = "NONE";

    if (activePromo) {
        const promo = promoList[activePromo];
        promoInfo = activePromo;

        if (promo.applicableCategories && promo.applicableCategories.length > 0) {
            const applicableSubtotal = cart
                .filter(item => promo.applicableCategories.includes(item.category))
                .reduce((sum, item) => sum + (item.price * item.qty), 0);
            
            if (promo.type === "delivery") {
                baseCharge = 0;
            } else if (promo.type === "percent") {
                discount = (applicableSubtotal * promo.value) / 100;
            } else if (promo.type === "fixed") {
                discount = promo.value;
            }
        } else {
            if (promo.type === "delivery") {
                baseCharge = 0;
            } else if (promo.type === "percent") {
                discount = (subtotal * promo.value) / 100;
            } else if (promo.type === "fixed") {
                discount = promo.value;
            }
        }
    }

    const totalBill = subtotal + baseCharge - discount;
    let paymentStatus = paymentMethod === 'COD' ? "CASH ON DELIVERY (UNPAID)" : "ONLINE PAID (FULL AMOUNT)";
    let finalPayable = paymentMethod === 'COD' ? totalBill : 0;

    // অর্ডার কনফার্ম করার বাটনটি লোডিং মোডে নেওয়া (যাতে বারবার কাস্টমার ক্লিক না করতে পারে)
    Swal.fire({
        title: 'Processing Order...',
        text: 'Please wait while we secure your order.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Web3Forms এ পাঠানোর জন্য ডাটা অবজেক্ট তৈরি
   const formData = {
        access_key: "3322838f-d959-4aab-a68b-baf4d18b5dcb",
        subject: `🚨 NEW ORDER - ${name} (৳${totalBill.toFixed(0)})`,
        from_name: "REDAMS Website",
        
        // বাকি ২টি মেইলে কার্বন কপি (CC) পাঠানোর জন্য
        cc: "shamimaackerman@gmail.com,anmridwanulhassan@gmail.com",
        
        // কাস্টমার ইনফো
        Customer_Name: name,
        Customer_Phone: phone,
        Delivery_Address: address,
        
        // অর্ডার ইনফো
        Ordered_Items: itemsText,
        
        // বিলিং ইনফো
        Subtotal: `৳${subtotal}`,
        Promo_Used: promoInfo,
        Discount: `৳${discount.toFixed(0)}`,
        Delivery_Charge: baseCharge === 0 ? "FREE" : `৳${baseCharge}`,
        TOTAL_BILL: `৳${totalBill.toFixed(0)}`,
        
        // পেমেন্ট ইনফো
        Payment_Method: paymentMethod,
        Payment_Status: paymentStatus,
        Transaction_ID: trnxId,
        Due_Amount: `৳${finalPayable.toFixed(0)}`
    };

    // Web3Forms API-তে ডাটা পুশ করা
    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
            // সফলভাবে মেইল চলে গেলে কার্ট ও স্টেট ক্লিয়ার করা
            cart = [];
localStorage.removeItem('redams_cart'); // অর্ডার শেষ, তাই স্টোরেজ খালি
if (typeof updateCartUI === "function") updateCartUI();
            activePromo = null;
            if (typeof updateCartUI === "function") updateCartUI();
            if (typeof toggleCart === "function") toggleCart(false);

            // সফলতার প্রফেশনাল পপআপ
            Swal.fire({
                icon: 'success',
                title: 'Order Confirmed!',
                text: 'Thank you for shopping with REDAMS. We will review your order and contact you soon!',
                confirmButtonColor: '#000'
            });
            
            // চেকআউট ফর্ম বা ইনপুট ফিল্ডগুলো খালি করতে চাইলে এখানে কোড লিখতে পারেন
        } else {
            console.log(json);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: 'Something went wrong on our server. Please try again.'
            });
        }
    })
    .catch(error => {
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Please check your internet connection and try again.'
        });
    });
}
// ===== কার্ট থেকে আইটেম রিমুভ করা =====
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    saveCartToStorage(); // কার্ট ডাটা আপডেট করে সেভ করো
    validateOrder();
}

// ===== কার্ট ড্রয়ার টগল করা =====
function toggleCart(open = false) {
    const d = document.getElementById('cart-drawer');
    if (!d) return;

    if (open) {
        d.classList.remove('translate-x-full');
    } else {
        d.classList.toggle('translate-x-full');
    }
}

// ===== মোডাল বন্ধ করা =====
function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.replace('flex', 'hidden');
}

// ===== স্বয়ংক্রিয় স্ক্রল সেটআপ =====
function setupAutoScroll(slider) {
    if (!slider) return;

    let scrollSpeed = 0.6;
    let isPaused = false;
    let animationId;

    const step = () => {
        if (!isPaused) {
            slider.scrollLeft += scrollSpeed;

            if (slider.scrollLeft >= (slider.scrollWidth - slider.offsetWidth - 1)) {
                slider.scrollLeft = 0;
            }
        }
        animationId = requestAnimationFrame(step);
    };

    slider.addEventListener('mouseenter', () => isPaused = true);
    slider.addEventListener('mouseleave', () => isPaused = false);
    slider.addEventListener('touchstart', () => isPaused = true);
    slider.addEventListener('touchend', () => isPaused = false);

    animationId = requestAnimationFrame(step);
}

// ===== রিভিউ লোড করা =====
async function loadReviews() {
    try {
        const response = await fetch('reviews.json');
        if (!response.ok) throw new Error('Failed to load reviews');

        const reviews = await response.json();
        const wrapper = document.getElementById('reviews-wrapper');
        if (!wrapper) return;

        const createCard = (r) => `
            <div class="review-card bg-white border border-gray-100 p-10 transition-all duration-700 hover:border-black flex flex-col justify-between min-h-[250px] rounded-xl">
                <div>
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex text-yellow-400 text-[9px] gap-1">
                            ${'<i class="fa-solid fa-star"></i>'.repeat(r.rating)}
                        </div>
                        <span class="text-[9px] font-black text-gray-200 uppercase tracking-widest">${r.date || 'Recent'}</span>
                    </div>
                    <p class="text-gray-800 text-[13px] leading-[1.8] font-medium mb-10 italic">"${r.text}"</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 ${r.color || 'bg-black'} text-white flex items-center justify-center font-black text-[10px] rounded-full shadow-inner">
                        ${r.initials}
                    </div>
                    <div>
                        <h4 class="text-[10px] font-black uppercase text-black tracking-widest">${r.name}</h4>
                        <div class="flex items-center gap-1.5 text-[8px] text-green-600 font-black uppercase mt-0.5">
                            <i class="fa-solid fa-shield-check"></i> Verified
                        </div>
                    </div>
                </div>
            </div>`;

        wrapper.innerHTML = reviews.map(r => createCard(r)).join('');

        // স্মার্ট স্ক্রলিং
        let isDown = false;
        let startX;
        let scrollLeft;
        let timer;

        const startAuto = () => {
            timer = setInterval(() => {
                if (wrapper.scrollLeft + wrapper.offsetWidth >= wrapper.scrollWidth) {
                    wrapper.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    wrapper.scrollBy({ left: 380, behavior: 'smooth' });
                }
            }, 5000);
        };

        const stopAuto = () => clearInterval(timer);

        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            stopAuto();
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
        });

        wrapper.addEventListener('mouseup', () => { isDown = false; startAuto(); });
        wrapper.addEventListener('mouseleave', () => { isDown = false; startAuto(); });

        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            wrapper.scrollLeft = scrollLeft - walk;
        });

        wrapper.addEventListener('touchstart', stopAuto);
        wrapper.addEventListener('touchend', startAuto);

        startAuto();
    } catch (e) {
        console.error("Review Loading Error:", e);
    }
}

// ===== পপআপ শো করা =====
function showPopup() {
    const popup = document.getElementById('entry-popup');
    const box = document.getElementById('popup-box');

    if (!popup) return;

    popup.classList.remove('hidden');
    popup.classList.add('flex');

    setTimeout(() => {
        if (box) {
            box.classList.remove('scale-90', 'translate-y-10', 'opacity-0');
            box.classList.add('scale-100', 'translate-y-0', 'opacity-100');
        }
    }, 100);
}

// ===== পপআপ বন্ধ করা =====
function closePopup() {
    const popup = document.getElementById('entry-popup');
    const box = document.getElementById('popup-box');

    if (!popup) return;

    if (box) {
        box.classList.add('scale-90', 'translate-y-10', 'opacity-0');
    }

    setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
    }, 500);
}

// ===== ইভেন্ট লিসেনার এবং ইনিশিয়ালাইজেশন =====
document.addEventListener('DOMContentLoaded', () => {
    // ইনপুট ফিল্ডে লিসেনার
    const inputs = ['final-name', 'final-phone', 'final-address', 'trnx-id'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', validateOrder);
    });

    // প্রোডাক্ট এবং রিভিউ লোড
    loadProducts();
    loadReviews();
});

// পেজ লোড হওয়ার পর পপআপ দেখানো
window.addEventListener('load', () => {
    setTimeout(showPopup, 2000);
});
// পেজ লোড হলেই কার্ট UI আপডেট করো
document.addEventListener("DOMContentLoaded", () => {
    if (typeof updateCartUI === "function") updateCartUI();
});
