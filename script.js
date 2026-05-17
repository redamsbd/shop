let allProducts = [];
let cart = [];
let selectedSize = null;
let selectedColor = null;
let modalQty = 1;
let isPaymentVerified = false; // পেমেন্ট স্ট্যাটাস ট্র্যাক করার জন্য

const WHATSAPP_NUMBER = "8801894357549"; 

// ১. ইউআরএল থেকে ক্যাটাগরি বের করা
function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('cat'); 
}
// আপনার স্ক্রিপ্ট ফাইলের একদম উপরে এই গ্লোবাল ভেরিয়েবল দুটি রাখুন
let activePromo = null;
const promoList = {
    "FREESHIP": { type: "delivery", value: 0 },
    "REDAMS10": { type: "percent", value: 10 },
    "SAVE50": { type: "fixed", value: 50 }
};
// ২. প্রোডাক্ট লোড এবং ফিল্টার (Original Logic)
function loadProducts() {
    fetch('products.json')
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            const isShopPage = window.location.pathname.toLowerCase().includes('shop.html');
            const selectedCat = getCategoryFromURL();
            // লুপের ভেতরে চেক করবেন প্রোডাক্ট স্টক আউট কি না
const isCardOut = product.isOutOfStock;
const cardClass = isCardOut ? "relative overflow-hidden group product-card-out" : "relative overflow-hidden group";

// আপনার প্রোডাক্ট কার্ডের HTML স্ট্রাকচারে নিচের মতো ক্লাস বসান:
`
<div class="${cardClass}">
    <!-- ইমেজের ট্যাগে 'product-img-blur' ক্লাস দিন -->
    <img src="${product.image}" class="w-full h-full object-cover product-img-blur transition duration-500">
    
    <!-- যদি স্টক আউট হয় তবে ওপরে সুন্দর একটি ব্যাজ দেখাবে -->
    ${isCardOut ? `<div class="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
        <span class="bg-red-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 shadow-lg">Out of Stock</span>
    </div>` : ''}
</div>
`

            if (isShopPage) {
                if (selectedCat) {
                    const filtered = allProducts.filter(p => 
                        p.category.trim().toLowerCase() === selectedCat.trim().toLowerCase()
                    );
                    displayProducts(filtered, true); 
                    const title = document.querySelector('h2');
                    if(title) title.innerText = selectedCat.replace('-', ' ').toUpperCase();
                } else {
                    displayProducts(allProducts, true);
                }
            } else {
                displayProducts(allProducts, false); 
                renderNewArrivals(allProducts);      
            }
        })
        .catch(err => console.error("Error loading products:", err));
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');

    // মেনু স্লাইড ইন/আউট করার জন্য
    if (menu.classList.contains('-translate-x-full')) {
        menu.classList.remove('-translate-x-full');
        menu.classList.add('translate-x-0');
        overlay.classList.add('active'); // আমাদের নতুন CSS ক্লাস
    } else {
        menu.classList.remove('translate-x-0');
        menu.classList.add('-translate-x-full');
        overlay.classList.remove('active');
    }
}

// ৩. কালার ও সাইজ সিলেকশন
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

// ৪. কোয়ান্টিটি আপডেট
function updateQty(val) {
    modalQty = Math.max(1, modalQty + val);
    const qtyElement = document.getElementById('modal-qty');
    if (qtyElement) qtyElement.innerText = modalQty;
}

// ৫. New Arrivals স্লাইডার (Auto Scroll & Loop Fixed)
function renderNewArrivals(products) {
    const slider = document.getElementById('new-arrivals-slider');
    if (!slider) return;
    const newItems = products.slice(-10).reverse(); 

    slider.innerHTML = newItems.map(p => `
        <div class="min-w-[280px] md:min-w-[340px] snap-center group cursor-pointer" onclick="openModal(${p.id})">
            <div class="relative overflow-hidden rounded-[2rem] aspect-[3/4] bg-[#f8f8f8]">
                <img src="${p.images[0]}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]">
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

// ৬. প্রোডাক্ট গ্রিড এবং ডিসকাউন্ট ক্যালকুলেশন (Fixed)
function displayProducts(products, showAll = false) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const productsToShow = showAll ? products : products.slice(0, 8);

    grid.innerHTML = productsToShow.map(p => {
        const hasDiscount = p.originalPrice && p.originalPrice > p.price;
        const discPer = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

        return `
            <div class="bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-2xl transition duration-500 cursor-pointer group relative">
                ${hasDiscount ? `<div class="absolute top-5 left-5 z-10 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md">-${discPer}% OFF</div>` : ''}
                
                <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-50" onclick="openModal(${p.id})">
                    <img src="${p.images[0]}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                </div>

                <div class="p-3 text-center">
                    <h3 class="font-bold text-gray-800 text-[11px] uppercase tracking-tighter mb-1">${p.name}</h3>
                    <div class="flex items-center justify-center gap-2 mb-3">
                        <span class="font-black text-black text-sm">৳ ${p.price}</span>
                        ${hasDiscount ? `<span class="text-gray-400 text-[10px] line-through">৳ ${p.originalPrice}</span>` : ''}
                    </div>
                    
                    <button onclick="openModal(${p.id})" class="w-full bg-black text-white py-2 rounded-xl font-black uppercase text-[10px] mt-3 hover:bg-red-600 transition">
                        Order Now
                    </button>
                </div>
            </div>`;
    }).join('');

    const viewAllBtn = document.getElementById('view-all-container');
    if (viewAllBtn) viewAllBtn.style.display = (showAll || products.length <= 8) ? 'none' : 'block';
}

function openModal(id) {
    const p = allProducts.find(item => item.id === id);
    const content = document.getElementById('modal-content');
    selectedSize = null; selectedColor = null; modalQty = 1;
    const hasDiscount = p.originalPrice && p.originalPrice > p.price;

    // --- সাইজ স্টক আউট লজিক (অরিজিনাল ডিজাইন অক্ষুণ্ণ রেখে) ---
    let sizesHTML = '';
    p.sizes.forEach(size => {
        // যদি সাইজ উপলব্ধ না থাকে অথবা পুরো প্রোডাক্টই আউট অব স্টক থাকে
        const isSizeOut = !size.available || p.isOutOfStock;
        
        if (isSizeOut) {
            // স্টক আউট সাইজের ডিজাইন (ক্লিক করা যাবে না, আবছা দেখাবে এবং কার্সার নট-অ্যালাউড হবে)
            sizesHTML += `<button disabled class="w-12 h-12 border-2 border-gray-100 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black flex items-center justify-center cursor-not-allowed line-through opacity-50">${size.name}</button>`;
        } else {
            // আপনার অরিজিনাল সচল সাইজের বাটন কোড
            sizesHTML += `<button onclick="selectFeature('size','${size.name}',this)" class="w-12 h-12 border-2 border-gray-100 rounded-full text-[10px] font-black flex items-center justify-center hover:border-black">${size.name}</button>`;
        }
    });

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
                <div class="relative overflow-hidden rounded-2xl bg-gray-50 aspect-[3/4]">
                    <img id="main-view" src="${p.images[0]}" class="w-full h-full object-cover transition duration-500">
                </div>
                <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    ${p.images.map(img => `<img src="${img}" onclick="document.getElementById('main-view').src='${img}'" class="w-20 h-24 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-black transition-all">`).join('')}
                </div>
                <div class="mt-8 border-t pt-6 space-y-4">
                    <h3 class="text-xs font-black uppercase tracking-widest">Description</h3>
                    <p class="text-[11px] text-gray-500 leading-relaxed">${p.description || "Premium quality streetwear designed for style and comfort."}</p>
                    <img src="images/size-chart.png" class="w-full rounded-2xl border border-gray-100">
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
                    <div class="flex gap-2">${p.colors.map(c => `<button onclick="selectFeature('color','${c}',this)" class="px-5 py-2.5 border-2 border-gray-100 rounded-full text-[10px] font-black uppercase hover:border-black">${c}</button>`).join('')}</div>
                </div>
                <div class="mb-6">
                    <p class="text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest">Size</p>
                    <div class="flex gap-2">${sizesHTML}</div>
                </div>
                <div class="mb-8 flex items-center gap-5">
                    <div class="flex items-center border-2 border-gray-100 rounded-2xl bg-gray-50">
                        <button onclick="updateQty(-1)" class="px-5 py-3 font-bold">-</button>
                        <span id="modal-qty" class="px-6 font-black text-lg">1</span>
                        <button onclick="updateQty(1)" class="px-5 py-3 font-bold">+</button>
                    </div>
                </div>
                <button onclick="addToCart(${p.id})" class="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all">Add To Cart</button>
            </div>
        </div>`;
    document.getElementById('product-modal').classList.replace('hidden', 'flex');
}
// ৮. কার্ট ও পেমেন্ট লজিক
function addToCart(id) {
    if (!selectedSize || !selectedColor) {
        Swal.fire({ title: 'Attention!', text: 'Please select both Color and Size.', icon: 'warning', confirmButtonColor: '#000' });
        return;
    }
    const p = allProducts.find(item => item.id === id);
    cart.push({ ...p, selectedSize, selectedColor, qty: modalQty, image: p.images[0] });
    updateCartUI(); closeModal(); toggleCart(true);
}

function applyPromoCode() {
    const input = document.getElementById('promo-input').value.toUpperCase().trim();
    const msg = document.getElementById('promo-msg');

    if (promoList[input]) {
        activePromo = input;
        msg.innerText = `Promo "${input}" Applied!`;
        msg.className = "mt-2 ml-2 text-[9px] font-bold uppercase text-green-600 block";
    } else {
        activePromo = null;
        msg.innerText = "Invalid Promo Code";
        msg.className = "mt-2 ml-2 text-[9px] font-bold uppercase text-red-600 block";
    }
    updateCartUI(); 
}

function updateCartUI(isPaidOverride = null) {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const freeDeliveryMsg = document.getElementById('free-delivery-msg');
    const paymentSection = document.getElementById('payment-options-wrapper');

    if (isPaidOverride !== null) {
        isPaymentVerified = (isPaidOverride === true || isPaidOverride === "Full Paid");
    }

    let subtotal = 0, itemCount = 0;
    cartContainer.innerHTML = cart.map((item, index) => {
        subtotal += item.price * item.qty; itemCount += item.qty;
        return `
            <div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 mb-2">
                <div class="flex items-center gap-3">
                    <img src="${item.image}" class="w-12 h-12 object-cover rounded shadow-sm">
                    <div>
                        <h4 class="text-[10px] font-bold uppercase">${item.name}</h4>
                        <p class="text-[9px] text-gray-500">${item.selectedSize} | ${item.selectedColor}</p>
                        <p class="text-xs font-black">৳${item.price} x ${item.qty}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500 text-lg">&times;</button>
            </div>`;
    }).join('');

    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    if (deliveryOption && paymentSection) {
        paymentSection.classList.remove('hidden');
    }

    let baseDeliveryCharge = parseInt(deliveryOption ? deliveryOption.value : 80);

    // ১. অটো ফ্রি ডেলিভারি লজিক (৩টি আইটেমে)
    if (itemCount >= 3) {
        baseDeliveryCharge = 0;
        if (freeDeliveryMsg) { 
            freeDeliveryMsg.classList.add('text-green-600', 'opacity-100'); 
            freeDeliveryMsg.innerHTML = "FREE DELIVERY UNLOCKED! 🚚✅"; 
        }
    } else {
        if (freeDeliveryMsg) { 
            freeDeliveryMsg.classList.remove('text-green-600', 'opacity-100'); 
            freeDeliveryMsg.innerHTML = "Buy 3 or more items to get FREE DELIVERY 🚚"; 
        }
    }

    // ২. প্রোমো কোড ক্যালকুলেশন (নতুন অংশ)
    let discount = 0;
    if (activePromo) {
        const promo = promoList[activePromo];
        if (promo.type === "delivery") {
            baseDeliveryCharge = 0; // প্রোমো দিয়ে ডেলিভারি ফ্রি
        } else if (promo.type === "percent") {
            discount = (subtotal * promo.value) / 100;
        } else if (promo.type === "fixed") {
            discount = promo.value;
        }
    }

    // ৩. পেমেন্ট ভেরিফাইড এবং ফাইনাল ডেলিভারি ক্যালকুলেশন
    let finalDeliveryCharge = isPaymentVerified ? 0 : baseDeliveryCharge;
    let finalTotal = subtotal + finalDeliveryCharge - discount;

    // ৪. ডেলিভারি ডিসপ্লে টেক্সট
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

                <div class="flex justify-between text-[10px] uppercase font-bold"><span>Delivery Charge</span><span>${deliveryDisplay}</span></div>
                
                <div class="flex justify-between items-center border-t pt-2 mt-2">
                    <span class="text-xs font-black uppercase">Total</span>
                    <span class="text-2xl font-black ${isPaymentVerified ? 'text-green-600' : 'text-black'}">
                        ৳${finalTotal.toFixed(0)} ${isPaymentVerified ? '<span class="text-[10px] block text-right font-black">[ FULL PAID ]</span>' : ''}
                    </span>
                </div>
            </div>`;
    }

    const countEls = ['cart-count', 'cart-count-drawer', 'cart-count-float'];
    countEls.forEach(id => { if (document.getElementById(id)) document.getElementById(id).innerText = itemCount; });
}

// প্রধান পেমেন্ট অপশন পরিবর্তনের ফাংশন
function updatePaymentUI(method) {
    const onlineSubOptions = document.getElementById('online-sub-options');
    const instructionBox = document.getElementById('payment-instruction');
    const trnxInput = document.getElementById('trnx-id');

    if (method === 'COD') {
        onlineSubOptions.classList.add('hidden');
        instructionBox.classList.add('hidden');
        trnxInput.value = ''; 
        selectedSubMethod = "";
    } else {
        onlineSubOptions.classList.remove('hidden');
    }
    validateOrder();
}

// বিকাশ বা নগদ বাটন সিলেক্ট করার ফাংশন
function setOnlineMethod(method) {
    selectedSubMethod = method;
    const instructionBox = document.getElementById('payment-instruction');
    const methodHeader = document.getElementById('method-header');
    const methodName = document.getElementById('method-name');
    const displayNumber = document.getElementById('display-number');
    const instructionContent = document.getElementById('instruction-content');

    const bkashNumber = "01740550559"; 
    const nagadNumber = "01894357549"; 

    // কার্ট লজিক (আপনার আগের কোড অনুযায়ী)
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
    const areaCharge = deliveryRadio ? deliveryRadio.value : "80";
    const advanceAmount = totalQty >= 3 ? "100" : areaCharge;

    instructionBox.classList.remove('hidden');
    instructionBox.style.display = 'flex';

    if (method === 'bKash') {
        methodName.innerText = "Payment with bKash";
        methodHeader.style.backgroundColor = "#e2136e";
        displayNumber.innerText = bkashNumber;
        instructionContent.innerHTML = `
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">নিচের নাম্বারে টাকা পাঠিয়ে দিন (Personal)</p>
            <p class="text-[11px] font-bold text-black leading-tight mt-1">
                ${totalQty >= 3 ? 'ফ্রি ডেলিভারি পেতে' : 'অর্ডার কনফার্ম করতে'} 
                অগ্রিম <span class="text-[#e2136e]">৳${advanceAmount}</span> Send Money করে TRXID দিন।
            </p>`;
    } else if (method === 'Nagad') {
        methodName.innerText = "Payment with Nagad";
        methodHeader.style.backgroundColor = "#f7941d";
        displayNumber.innerText = nagadNumber;
        instructionContent.innerHTML = `
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">নিচের নাম্বারে টাকা পাঠিয়ে দিন (Personal)</p>
            <p class="text-[11px] font-bold text-black leading-tight mt-1">
                ${totalQty >= 3 ? 'ফ্রি ডেলিভারি পেতে' : 'অর্ডার কনফার্ম করতে'} 
                অগ্রিম <span class="text-[#f7941d]">৳${advanceAmount}</span> Send Money করে TRXID দিন।
            </p>`;
    }
    validateOrder();
}

function validateOrder() {
    // ইনপুট ফিল্ডগুলো খুঁজে বের করা
    const nameInput = document.getElementById('final-name');
    const phoneInput = document.getElementById('final-phone');
    const addressInput = document.getElementById('final-address');
    const trnxInput = document.getElementById('trnx-id');
    const btn = document.getElementById('confirm-order-btn');

    if (!btn) return;

    // মানগুলো সংগ্রহ করা
    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const trnxId = trnxInput ? trnxInput.value.trim() : "";

    // বর্তমান পেমেন্ট মেথড চেক করা
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = selectedMethod ? selectedMethod.value : "COD";

    // বেসিক ইনফরমেশন ভ্যালিডেশন (নাম, ফোন অন্তত ১১ ডিজিট, এবং ঠিকানা)
    let isInfoValid = name !== "" && phone.length >= 11 && address !== "";

    // পেমেন্ট ভ্যালিডেশন লজিক
    let isPaymentValid = false;
    if (paymentMethod === 'COD') {
        // ক্যাশ অন ডেলিভারি হলে পেমেন্ট সবসময় ভ্যালিড
        isPaymentValid = true; 
    } else {
        // অনলাইন পেমেন্ট হলে ট্রানজেকশন আইডি অন্তত ৮ ডিজিট হতে হবে
        isPaymentValid = trnxId.length >= 8; 
    }

    // বাটন একটিভ বা ডিঅ্যাক্টিভ করা
    if (isInfoValid && isPaymentValid) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'bg-gray-300', 'cursor-not-allowed', 'pointer-events-none');
        btn.classList.add('bg-[#25D366]'); // হোয়াটসঅ্যাপ সবুজ রঙ
        btn.style.opacity = "1";

        // কার্টে ফুল পেইড স্ট্যাটাস আপডেট
        if (typeof updateCartUI === "function") {
            // যদি অনলাইন পেমেন্ট হয় তবে "Full Paid" স্ট্যাটাস যাবে
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
function confirmOrderWhatsApp() {
    const name = document.getElementById('final-name')?.value.trim();
    const phone = document.getElementById('final-phone')?.value.trim();
    const address = document.getElementById('final-address')?.value.trim();
    const trnxIdInput = document.getElementById('trnx-id');
    const trnxId = trnxIdInput ? trnxIdInput.value.trim() : "N/A";

    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = selectedMethod ? selectedMethod.value : "COD";
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    if (!name || !phone || !address || cart.length === 0) {
        Swal.fire({ icon: 'warning', title: 'অসম্পূর্ণ তথ্য!', text: 'নাম, মোবাইল নম্বর এবং ঠিকানা দিন।' });
        return;
    }

    if (paymentMethod !== 'COD' && trnxId.length < 8) {
        Swal.fire({ icon: 'warning', title: 'TRXID প্রয়োজন!', text: 'সঠিক Transaction ID দিন।' });
        return;
    }

    // ১. আইটেম এবং সাবটোটাল ক্যালকুলেশন
    let itemsText = ""; 
    let subtotal = 0;
    cart.forEach((item) => {
        itemsText += `• ${item.name} (${item.selectedSize}/${item.selectedColor}) x ${item.qty} = ৳${item.price * item.qty}%0A`;
        subtotal += item.price * item.qty;
    });

    // ২. ডেলিভারি চার্জ ক্যালকুলেশন (প্রোমো কোড এবং অটো ফ্রি ডেলিভারি সহ)
    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    let baseCharge = deliveryOption ? parseInt(deliveryOption.value) : 80;
    
    // ৩টি বা তার বেশি হলে অটো ফ্রি
    if (totalQty >= 3) baseCharge = 0;

    // ৩. প্রোমো ডিসকাউন্ট ক্যালকুলেশন
    let discount = 0;
    let promoInfo = "NONE";
    
    if (activePromo) {
        const promo = promoList[activePromo];
        promoInfo = activePromo; // কোন কোড ইউজ করেছে
        
        if (promo.type === "delivery") {
            baseCharge = 0;
        } else if (promo.type === "percent") {
            discount = (subtotal * promo.value) / 100;
        } else if (promo.type === "fixed") {
            discount = promo.value;
        }
    }

    const totalBill = subtotal + baseCharge - discount;

    // ৪. পেমেন্ট স্ট্যাটাস নির্ধারণ
    // যদি পেমেন্ট মেথড Online হয়, তবে Due Amount হবে ০
    let paymentStatus = paymentMethod === 'COD' ? "CASH ON DELIVERY (UNPAID)" : "ONLINE PAID (FULL AMOUNT)";
    let finalPayable = paymentMethod === 'COD' ? totalBill : 0;

    // ৫. হোয়াটসঅ্যাপ মেসেজ ফরমেটিং (Premium Layout)
    let message = `*NEW ORDER - REDAMS*%0A`;
    message += `---------------------------%0A`;
    message += `*CUSTOMER DETAILS*%0A`;
    message += `*Name:* ${name}%0A`;
    message += `*Phone:* ${phone}%0A`;
    message += `*Address:* ${address}%0A`;
    message += `---------------------------%0A`;
    message += `*ORDER SUMMARY*%0A`;
    message += `${itemsText}`;
    message += `---------------------------%0A`;
    message += `*BILLING DETAILS*%0A`;
    message += `*Subtotal:* ৳${subtotal}%0A`;
    message += `*Promo Used:* ${promoInfo}%0A`;
    if (discount > 0) message += `*Discount:* - ৳${discount.toFixed(0)}%0A`;
    message += `*Delivery:* ${baseCharge === 0 ? "FREE" : "৳" + baseCharge}%0A`;
    message += `*TOTAL BILL:* ৳${totalBill.toFixed(0)}%0A`;
    message += `---------------------------%0A`;
    message += `*PAYMENT INFO*%0A`;
    message += `*Method:* ${paymentMethod}%0A`;
    message += `*Status:* ${paymentStatus}%0A`;
    message += `*TRXID:* ${trnxId}%0A`;
    message += `*DUE AMOUNT:* ৳${finalPayable.toFixed(0)}%0A`;
    message += `---------------------------%0A`;
    message += `_Order confirmed via Redams Website_`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}
// হেল্পার ফাংশন এবং ইভেন্ট লিসেনার
function removeFromCart(index) { 
    cart.splice(index, 1); 
    updateCartUI(); 
    validateOrder(); // আইটেম রিমুভ করলে বাটন চেক করবে
}

function toggleCart(open = false) { 
    const d = document.getElementById('cart-drawer'); 
    if(open) d.classList.remove('translate-x-full'); 
    else d.classList.toggle('translate-x-full'); 
}

function closeModal() { 
    document.getElementById('product-modal').classList.replace('flex', 'hidden'); 
}

// পেজ লোড হওয়ার সময় ইভেন্ট লিসেনার সেট করা
document.addEventListener('DOMContentLoaded', () => {
    // সব ইনপুট ফিল্ডে লিসেনার অ্যাড করা যাতে টাইপ করলেই বাটন চেক হয়
    const inputs = ['final-name', 'final-phone', 'final-address', 'trnx-id'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', validateOrder);
    });

    loadProducts();
});
function setupAutoScroll(slider) {
    if (!slider) return;

    let scrollSpeed = 0.6;
    let isPaused = false;
    let animationId;

    const step = () => {
        if (!isPaused) {
            slider.scrollLeft += scrollSpeed;
            
            // লুপ শেষ হলে শুরুতে ফিরে আসা
            if (slider.scrollLeft >= (slider.scrollWidth - slider.offsetWidth - 1)) {
                slider.scrollLeft = 0;
            }
        }
        animationId = requestAnimationFrame(step);
    };

    // ইউজার মাউস বা টাচ করলে স্ক্রল থামিয়ে দেওয়া (User Experience ভালো করার জন্য)
    slider.addEventListener('mouseenter', () => isPaused = true);
    slider.addEventListener('mouseleave', () => isPaused = false);
    slider.addEventListener('touchstart', () => isPaused = true);
    slider.addEventListener('touchend', () => isPaused = false);

    // প্রথমবার ফাংশনটি চালু করা
    animationId = requestAnimationFrame(step);  
}
async function loadReviews() {
    try {
        const response = await fetch('reviews.json');
        const reviews = await response.json();
        const wrapper = document.getElementById('reviews-wrapper');
        if (!wrapper) return;

        const createCard = (r) => `
            <div class="review-card bg-white border border-gray-100 p-10 transition-all duration-700 hover:border-black flex flex-col justify-between min-h-[250px]">
                <div>
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex text-yellow-400 text-[9px] gap-1">
                            ${'<i class="fa-solid fa-star"></i>'.repeat(r.rating)}
                        </div>
                        <span class="text-[9px] font-black text-gray-200 uppercase tracking-widest">${r.date}</span>
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
                            <i class="fa-solid fa-shield-check"></i> Verified Purchase
                        </div>
                    </div>
                </div>
            </div>`;

        // কন্টেন্ট লোড করা
        wrapper.innerHTML = reviews.map(r => createCard(r)).join('');

        // --- স্মার্ট স্ক্রলিং লজিক ---
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

        // মাউস ইভেন্ট
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

        // মোবাইল টাচ ইভেন্ট
        wrapper.addEventListener('touchstart', stopAuto);
        wrapper.addEventListener('touchend', startAuto);

        startAuto();

    } catch (e) { console.error("Review Loading Error:", e); }
}

document.addEventListener('DOMContentLoaded', loadReviews);

function showPopup() {
    const popup = document.getElementById('entry-popup');
    const box = document.getElementById('popup-box');
    
    popup.classList.remove('hidden');
    popup.classList.add('flex');
    
    // এনিমেশনের জন্য সামান্য ডিলে
    setTimeout(() => {
        box.classList.remove('scale-90', 'translate-y-10', 'opacity-0');
        box.classList.add('scale-100', 'translate-y-0', 'opacity-100');
    }, 100);
}

function closePopup() {
    const popup = document.getElementById('entry-popup');
    const box = document.getElementById('popup-box');
    
    box.classList.add('scale-90', 'translate-y-10', 'opacity-0');
    
    setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
    }, 500);
}

// সাইটে আসার ২ সেকেন্ড পর পপ-আপ দেখাবে
window.addEventListener('load', () => {
    setTimeout(showPopup, 2000); 
});
