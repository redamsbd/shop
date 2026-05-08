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

    if (isPaidOverride !== null) isPaymentVerified = isPaidOverride;

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

    // --- নতুন লজিক আপডেট শুরু ---
    let finalDeliveryCharge = isPaymentVerified ? 0 : baseDeliveryCharge;
    
    // যদি ৩টি বা তার বেশি প্রোডাক্ট হয় এবং পেমেন্ট ভেরিফাইড হয়, তবে সাবটোটাল থেকে ১০০ টাকা কমবে
    let finalTotal = subtotal + finalDeliveryCharge;
    if (isPaymentVerified && itemCount >= 3) {
        finalTotal = subtotal - 100;
    }

    const deliveryDisplay = isPaymentVerified ? '<span class="text-green-600 font-black">PAID</span>' : (baseDeliveryCharge === 0 ? '<span class="text-green-600 font-black">FREE</span>' : '৳' + baseDeliveryCharge);
    // --- নতুন লজিক আপডেট শেষ ---

    if (totalElement) {
        totalElement.innerHTML = `
            <div class="space-y-1 mb-3 pt-4 border-t">
                <div class="flex justify-between text-[10px] text-gray-400 uppercase font-bold"><span>Subtotal</span><span>৳${subtotal}</span></div>
                <div class="flex justify-between text-[10px] uppercase font-bold"><span>Delivery Charge</span><span>${deliveryDisplay}</span></div>
                
                ${isPaymentVerified && itemCount >= 3 ? `
                <div class="flex justify-between text-[10px] uppercase font-bold text-red-600">
                    <span>Advance Discount</span><span>-৳100</span>
                </div>` : ''}

                <div class="flex justify-between items-center border-t pt-2 mt-2">
                    <span class="text-xs font-black uppercase">Total</span>
                    <span class="text-2xl font-black text-black">৳${finalTotal}</span>
                </div>
            </div>`;
    }

    const countEls = ['cart-count', 'cart-count-drawer', 'cart-count-float'];
    countEls.forEach(id => { if (document.getElementById(id)) document.getElementById(id).innerText = itemCount; });
}
// ৯. আপডেট করা পেমেন্ট ভ্যালিডেশন (বিকাশ ও নগদের আলাদা নম্বরসহ)
function updatePaymentUI(method) {
    const instructionBox = document.getElementById('payment-instruction');
    const methodHeader = document.getElementById('method-header');
    const methodName = document.getElementById('method-name');
    const displayNumber = document.getElementById('display-number');
    const trnxInput = document.getElementById('trnx-id');
    const instructionContent = document.getElementById('instruction-content'); // যদি আগে এই আইডি থাকে
    
    // কার্টে মোট আইটেম সংখ্যা বের করা
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    
    // ডেলিভারি চার্জ কত সিলেক্ট করা আছে
    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
    const areaCharge = deliveryRadio ? deliveryRadio.value : "80";
    
    // লজিক: ৩টি প্রোডাক্ট হলে ১০০ টাকা, নাহলে ফুল ডেলিভারি চার্জ
    const advanceAmount = totalQty >= 3 ? "100" : areaCharge;

    // আপনার বিকাশ ও নগদ নম্বর
    const bkashNumber = "01740550559"; 
    const nagadNumber = "01894357549"; 

    trnxInput.value = ''; 
    
    if (method === 'COD') {
        instructionBox.style.display = 'none';
    } else {
        instructionBox.style.display = 'flex';
        
        if (method === 'bKash') {
            methodName.innerText = "Payment via bKash";
            methodHeader.style.backgroundColor = "#e2136e";
            displayNumber.innerText = bkashNumber;
            
            // ইনস্ট্রাকশন টেক্সট আপডেট
            if (instructionContent) {
                instructionContent.innerHTML = `
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">নিচের নাম্বারে টাকা পাঠিয়ে দিন (Personal)</p>
                    <p class="text-[11px] font-bold text-black leading-tight mt-1">
                        ${totalQty >= 3 ? 'ফ্রি ডেলিভারি পেতে' : 'অর্ডার কনফার্ম করতে'} 
                        অগ্রিম <span class="text-[#e2136e]">৳${advanceAmount}</span> Send Money করে TRXID দিন।
                    </p>`;
            }
        } else if (method === 'Nagad') {
            methodName.innerText = "Payment via Nagad";
            methodHeader.style.backgroundColor = "#f7941d";
            displayNumber.innerText = nagadNumber;

            if (instructionContent) {
                instructionContent.innerHTML = `
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">নিচের নাম্বারে টাকা পাঠিয়ে দিন (Personal)</p>
                    <p class="text-[11px] font-bold text-black leading-tight mt-1">
                        ${totalQty >= 3 ? 'ফ্রি ডেলিভারি পেতে' : 'অর্ডার কনফার্ম করতে'} 
                        অগ্রিম <span class="text-[#f7941d]">৳${advanceAmount}</span> Send Money করে TRXID দিন।
                    </p>`;
            }
        }
    }
    validateOrder(); // বাটন চেক করা
}

function validateOrder() {
    // সব ইনপুট ফিল্ডের ভ্যালু নেওয়া
    const name = document.getElementById('final-name').value.trim();
    const phone = document.getElementById('final-phone').value.trim();
    const address = document.getElementById('final-address').value.trim();
    const trnxId = document.getElementById('trnx-id').value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // কনফার্ম বাটনটি খুঁজে বের করা
    const btn = document.getElementById('confirm-order-btn'); 
    if (!btn) return;

    // বেসিক ইনফরমেশন ভ্যালিডেশন
    let isInfoValid = name !== "" && phone.length >= 11 && address !== "";
    
    // পেমেন্ট মেথড অনুযায়ী লজিক
    let isPaymentValid = false;
    if (paymentMethod === 'COD') {
        isPaymentValid = true; // COD এর জন্য TRXID লাগবে না
    } else {
        isPaymentValid = trnxId.length >= 8; // অনলাইন পেমেন্টে TRXID অন্তত ৮ ডিজিট
    }

    if (isInfoValid && isPaymentValid) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'bg-gray-300', 'cursor-not-allowed', 'pointer-events-none');
        btn.classList.add('bg-[#25D366]'); // হোয়াটসঅ্যাপ গ্রিন কালার
        
        // ডেলিভারি চার্জ আপডেট করা (True মানে পেড হিসেবে দেখাবে)
        if (typeof updateCartUI === "function") updateCartUI(paymentMethod !== 'COD'); 
    } else {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'bg-gray-300', 'cursor-not-allowed', 'pointer-events-none');
        btn.classList.remove('bg-[#25D366]');
        
        if (typeof updateCartUI === "function") updateCartUI(false);
    }
}

// ১০. হোয়াটসঅ্যাপ অর্ডার (Final Output)
function confirmOrderWhatsApp() {
    const name = document.getElementById('final-name').value.trim();
    const phone = document.getElementById('final-phone').value.trim();
    const address = document.getElementById('final-address').value.trim();
    const trnxId = document.getElementById('trnx-id').value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // কার্টে মোট কয়টি আইটেম আছে (কোয়ান্টিটিসহ)
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    if (!name || !phone || !address || !trnxId || cart.length === 0) {
        Swal.fire({ icon: 'warning', title: 'অসম্পূর্ণ তথ্য!', text: 'দয়া করে নাম, ঠিকানা এবং TRXID প্রদান করুন।' });
        return;
    }

    let itemsText = ""; 
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        itemsText += `${index + 1}. ${item.name} (${item.selectedSize}) x ${item.qty} = ৳${item.price * item.qty}%0A`;
        subtotal += item.price * item.qty;
    });

    // ডেলিভারি চার্জ লজিক (৩টি বা তার বেশি হলে ০)
    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    const deliveryCharge = totalQty >= 3 ? 0 : parseInt(deliveryOption.value);
    
    // যেহেতু কাস্টমার ডেলিভারি চার্জ আগে দিয়ে দিচ্ছে, তাই টোটাল থেকে সেটা বাদ যাবে
    // ফাইনাল টোটাল হবে শুধু সাবটোটাল
    const finalTotal = subtotal;

    let message = `*NEW ORDER - REDAMS*%0A` +
                  `---------------------------%0A` +
                  `*Name:* ${name}%0A` +
                  `*Phone:* ${phone}%0A` +
                  `*Address:* ${address}%0A` +
                  `*Payment:* ${paymentMethod}%0A` +
                  `*TRXID:* ${trnxId}%0A` +
                  `---------------------------%0A` +
                  `*Items:*%0A${itemsText}` +
                  `---------------------------%0A` +
                  `*Subtotal:* ৳${subtotal}%0A` +
                  `*Delivery:* ${deliveryCharge === 0 ? "FREE" : "Paid Advance"}%0A` +
                  `*Total Payable:* ৳${finalTotal}%0A` +
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

