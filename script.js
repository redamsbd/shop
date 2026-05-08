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

// ২. প্রোডাক্ট লোড এবং ফিল্টার (Original Logic)
function loadProducts() {
    fetch('products.json')
        .then(res => res.json())
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

// ৭. মোডাল লজিক (Details under Thumbnails)
function openModal(id) {
    const p = allProducts.find(item => item.id === id);
    const content = document.getElementById('modal-content');
    selectedSize = null; selectedColor = null; modalQty = 1;
    const hasDiscount = p.originalPrice && p.originalPrice > p.price;

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
                    <div class="flex gap-2">${p.sizes.map(s => `<button onclick="selectFeature('size','${s}',this)" class="w-12 h-12 border-2 border-gray-100 rounded-full text-[10px] font-black flex items-center justify-center hover:border-black">${s}</button>`).join('')}</div>
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

function updateCartUI(isPaidOverride = null) {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const freeDeliveryMsg = document.getElementById('free-delivery-msg');
    const paymentSection = document.getElementById('payment-options-wrapper');

    // "Full Paid" অথবা Boolean ভ্যালু হ্যান্ডেল করা
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

    // ৩টি বা তার বেশি আইটেম হলে ডেলিভারি চার্জ ০ (ফ্রি)
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

    // পেমেন্ট ভেরিফাইড (Online Payment) হলে ডেলিভারি চার্জ PAID দেখাবে
    let finalDeliveryCharge = isPaymentVerified ? 0 : baseDeliveryCharge;
    let finalTotal = subtotal + finalDeliveryCharge;

    // ডেলিভারি ডিসপ্লে লজিক
    const deliveryDisplay = isPaymentVerified ? '<span class="text-green-600 font-black">PAID</span>' : (baseDeliveryCharge === 0 ? '<span class="text-green-600 font-black">FREE</span>' : '৳' + baseDeliveryCharge);

    if (totalElement) {
        totalElement.innerHTML = `
            <div class="space-y-1 mb-3 pt-4 border-t">
                <div class="flex justify-between text-[10px] text-gray-400 uppercase font-bold"><span>Subtotal</span><span>৳${subtotal}</span></div>
                <div class="flex justify-between text-[10px] uppercase font-bold"><span>Delivery Charge</span><span>${deliveryDisplay}</span></div>
                
                <div class="flex justify-between items-center border-t pt-2 mt-2">
                    <span class="text-xs font-black uppercase">Total</span>
                    <span class="text-2xl font-black ${isPaymentVerified ? 'text-green-600' : 'text-black'}">
                        ৳${finalTotal} ${isPaymentVerified ? '<span class="text-[10px] block text-right font-black">[ FULL PAID ]</span>' : ''}
                    </span>
                </div>
            </div>`;
    }

    const countEls = ['cart-count', 'cart-count-drawer', 'cart-count-float'];
    countEls.forEach(id => { if (document.getElementById(id)) document.getElementById(id).innerText = itemCount; });
}
let selectedSubMethod = ""; // ইউজার বিকাশ না নগদ সিলেক্ট করল তা মনে রাখার জন্য

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

    // কার্ট লজিক (আপনার আগের কোড অনুযায়ী)
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
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">নিচের নাম্বারে টাকা পাঠিয়ে দিন (Personal)</p>
            <p class="text-[11px] font-bold text-black leading-tight mt-1">
                ${totalQty >= 3 ? 'ফ্রি ডেলিভারি পেতে' : 'অর্ডার কনফার্ম করতে'} 
                অগ্রিম <span class="text-[#e2136e]">৳${advanceAmount}</span> Send Money করে TRXID দিন।
            </p>`;
    } else if (method === 'Nagad') {
        methodName.innerText = "Payment with Nagad";
        methodHeader.style.backgroundColor = "#f7941d";
        displayNumber.innerText = nagadNumber;
        instructionContent.innerHTML = `
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">নিচের নাম্বারে টাকা পাঠিয়ে দিন (Personal)</p>
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
        // ক্যাশ অন ডেলিভারি হলে পেমেন্ট সবসময় ভ্যালিড
        isPaymentValid = true; 
    } else {
        // অনলাইন পেমেন্ট হলে ট্রানজেকশন আইডি অন্তত ৮ ডিজিট হতে হবে
        isPaymentValid = trnxId.length >= 8; 
    }

    // বাটন একটিভ বা ডিঅ্যাক্টিভ করা
    if (isInfoValid && isPaymentValid) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'bg-gray-300', 'cursor-not-allowed', 'pointer-events-none');
        btn.classList.add('bg-[#25D366]'); // হোয়াটসঅ্যাপ সবুজ রঙ
        btn.style.opacity = "1";

        // কার্টে ফুল পেইড স্ট্যাটাস আপডেট
        if (typeof updateCartUI === "function") {
            // যদি অনলাইন পেমেন্ট হয় তবে "Full Paid" স্ট্যাটাস যাবে
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
// ১০. হোয়াটসঅ্যাপ অর্ডার (Final Output - Fixed)
function confirmOrderWhatsApp() {
    // ১. ডাটা সংগ্রহ (একবারই ডিক্লেয়ার করা হয়েছে)
    const name = document.getElementById('final-name').value.trim();
    const phone = document.getElementById('final-phone').value.trim();
    const address = document.getElementById('final-address').value.trim();
    
    const trnxIdInput = document.getElementById('trnx-id');
    const trnxId = trnxIdInput ? trnxIdInput.value.trim() : "N/A";

    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = selectedMethod ? selectedMethod.value : "COD";
    
    // ২. কার্টে মোট আইটেম সংখ্যা
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    // ৩. বেসিক ভ্যালিডেশন
    if (!name || !phone || !address || cart.length === 0) {
        Swal.fire({ icon: 'warning', title: 'অসম্পূর্ণ তথ্য!', text: 'দয়া করে আপনার নাম, মোবাইল নম্বর এবং ঠিকানা প্রদান করুন।' });
        return;
    }

    // ৪. অনলাইন পেমেন্ট হলে TRXID বাধ্যতামূলক
    if (paymentMethod !== 'COD' && (!trnxId || trnxId.length < 8)) {
        Swal.fire({ icon: 'warning', title: 'TRXID প্রয়োজন!', text: 'অনলাইন পেমেন্টের জন্য সঠিক Transaction ID প্রদান করুন।' });
        return;
    }

    // ৫. প্রোডাক্ট টেক্সট জেনারেশন (ডুপ্লিকেট লাইন রিমুভ করা হয়েছে)
    let itemsText = ""; 
    let subtotal = 0;

    cart.forEach((item, index) => {
        itemsText += `${index + 1}. ${item.name} (${item.selectedSize}/${item.selectedColor}) x ${item.qty} = ৳${item.price * item.qty}%0A`;
        subtotal += item.price * item.qty;
    });

    // ৬. ডেলিভারি চার্জ লজিক
    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    const baseCharge = deliveryOption ? parseInt(deliveryOption.value) : 80;
    const deliveryCharge = totalQty >= 3 ? 0 : baseCharge;
    const totalBill = subtotal + deliveryCharge;

    // ৭. পেমেন্ট স্ট্যাটাস নির্ধারণ
    let paymentStatus = "";
    let finalPayable = 0;

    if (paymentMethod === 'COD') {
        paymentStatus = "CASH ON DELIVERY (UNPAID)";
        finalPayable = totalBill; 
    } else {
        paymentStatus = "ONLINE PAID (FULL AMOUNT)";
        finalPayable = 0; 
    }

    // ৮. ফাইনাল মেসেজ ফরম্যাট
    let message = `*NEW ORDER - REDAMS*%0A` +
                  `---------------------------%0A` +
                  `*CUSTOMER DETAILS*%0A` +
                  `*Name:* ${name}%0A` +
                  `*Phone:* ${phone}%0A` +
                  `*Address:* ${address}%0A` +
                  `---------------------------%0A` +
                  `*ITEMS:*%0A${itemsText}` +
                  `---------------------------%0A` +
                  `*ORDER SUMMARY*%0A` +
                  `*Subtotal:* ৳${subtotal}%0A` +
                  `*Delivery:* ${deliveryCharge === 0 ? "FREE" : "৳" + deliveryCharge}%0A` +
                  `*Total Bill:* ৳${totalBill}%0A` +
                  `---------------------------%0A` +
                  `*PAYMENT INFO*%0A` +
                  `*Method:* ${paymentMethod}%0A` +
                  `*Status:* ${paymentStatus}%0A` +
                  `*TRXID:* ${trnxId}%0A` +
                  `*Due Amount:* ৳${finalPayable}%0A` +
                  `---------------------------%0A` +
                  `_Order confirmed via Redams Website_`;

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

// পেজ লোড হওয়ার সময় ইভেন্ট লিসেনার সেট করা
document.addEventListener('DOMContentLoaded', () => {
    // সব ইনপুট ফিল্ডে লিসেনার অ্যাড করা যাতে টাইপ করলেই বাটন চেক হয়
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
    const step = () => {
        slider.scrollLeft += scrollSpeed;
        if (slider.scrollLeft >= (slider.scrollWidth - slider.offsetWidth - 1)) slider.scrollLeft = 0;
        requestAnimationFrame(step);
    }; 
    requestAnimationFrame(step);
}
~
