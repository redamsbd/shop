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

// ৬. প্রোডাক্ট গ্রিড এবং ডিসকাউন্ট ক্যালকুলেশন
function displayProducts(products, showAll = false) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    const productsToShow = showAll ? products : products.slice(0, 8);

    grid.innerHTML = productsToShow.map(p => {
        const hasDiscount = p.originalPrice && p.originalPrice > p.price;
        const discPer = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        return `
            <div class="bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-2xl transition duration-500 cursor-pointer group relative" onclick="openModal(${p.id})">
                ${hasDiscount ? `<div class="absolute top-5 left-5 z-10 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md">-${discPer}% OFF</div>` : ''}
                <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-50">
                    <img src="${p.images[0]}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                </div>
                <div class="p-3 text-center">
                    <h3 class="font-bold text-gray-800 text-[11px] uppercase tracking-tighter mb-1">${p.name}</h3>
                    <div class="flex items-center justify-center gap-2 mb-3">
                        <span class="font-black text-black text-sm">৳ ${p.price}</span>
                        ${hasDiscount ? `<span class="text-gray-400 text-[10px] line-through">৳ ${p.originalPrice}</span>` : ''}
                    </div>
                    <button class="w-full bg-black text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-green-600 transition-colors">Order Now</button>
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
    let baseDeliveryCharge = parseInt(deliveryOption ? deliveryOption.value : 80);

    if (itemCount >= 3) {
        baseDeliveryCharge = 0;
        if (freeDeliveryMsg) { freeDeliveryMsg.classList.add('text-green-600', 'opacity-100'); freeDeliveryMsg.innerHTML = "FREE DELIVERY UNLOCKED! 🚚✅"; }
    } else {
        if (freeDeliveryMsg) { freeDeliveryMsg.classList.remove('text-green-600', 'opacity-100'); freeDeliveryMsg.innerHTML = "Buy 3 or more items to get FREE DELIVERY 🚚"; }
    }

    const finalDeliveryCharge = isPaymentVerified ? 0 : baseDeliveryCharge;
    const finalTotal = subtotal + finalDeliveryCharge;
    const deliveryDisplay = isPaymentVerified ? '<span class="text-green-600 font-black">PAID</span>' : (baseDeliveryCharge === 0 ? '<span class="text-green-600 font-black">FREE</span>' : '৳' + baseDeliveryCharge);

    if (totalElement) {
        totalElement.innerHTML = `
            <div class="space-y-1 mb-3 pt-4 border-t">
                <div class="flex justify-between text-[10px] text-gray-400 uppercase font-bold"><span>Subtotal</span><span>৳${subtotal}</span></div>
                <div class="flex justify-between text-[10px] uppercase font-bold"><span>Delivery Charge</span><span>${deliveryDisplay}</span></div>
                <div class="flex justify-between items-center border-t pt-2 mt-2">
                    <span class="text-xs font-black uppercase">Total</span>
                    <span class="text-2xl font-black text-black">৳${finalTotal}</span>
                </div>
            </div>`;
    }

    const countEls = ['cart-count', 'cart-count-drawer', 'cart-count-float'];
    countEls.forEach(id => { if (document.getElementById(id)) document.getElementById(id).innerText = itemCount; });
}

// ৯. পেমেন্ট ভ্যালিডেশন (bKash/Nagad Theme)
function updatePaymentUI(method) {
    const instructionBox = document.getElementById('payment-instruction');
    const instructionContent = document.getElementById('instruction-content');
    const trnxInput = document.getElementById('trnx-id');
    
    trnxInput.value = ''; validateOrder(); 

    if (method === 'bKash') {
        instructionBox.style.borderColor = '#e2136e';
        instructionContent.innerHTML = `<p class="text-[9px] font-black text-[#e2136e] uppercase mb-1">bKash (Personal): 01740550559</p><p class="text-[10px] font-bold text-black leading-tight">ডেলিভারি চার্জ Send Money করে TRXID দিন।</p>`;
    } else if (method === 'Nagad') {
        instructionBox.style.borderColor = '#f7941d';
        instructionContent.innerHTML = `<p class="text-[9px] font-black text-[#f7941d] uppercase mb-1">Nagad (Personal): 01740550559</p><p class="text-[10px] font-bold text-black leading-tight">ডেলিভারি চার্জ Send Money করে TRXID দিন।</p>`;
    } else {
        instructionBox.style.borderColor = '#eee';
        instructionContent.innerHTML = `<p class="text-[9px] font-bold text-gray-400 uppercase text-center">ডেলিভারি চার্জ অগ্রিম দিয়ে অর্ডার কনফার্ম করুন।</p>`;
    }
}

function validateOrder() {
    const trnxId = document.getElementById('trnx-id').value.trim();
    const btn = document.querySelector('button[onclick="confirmOrderWhatsApp()"]');
    if (!btn) return;

    if (trnxId.length >= 8) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'bg-gray-300', 'cursor-not-allowed');
        btn.classList.add('bg-[#25D366]');
        updateCartUI(true); 
    } else {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'bg-gray-300', 'cursor-not-allowed');
        btn.classList.remove('bg-[#25D366]');
        updateCartUI(false);
    }
}

// ১০. হোয়াটসঅ্যাপ অর্ডার (Final Output)
function confirmOrderWhatsApp() {
    const name = document.getElementById('final-name').value.trim();
    const phone = document.getElementById('final-phone').value.trim();
    const address = document.getElementById('final-address').value.trim();
    const trnxId = document.getElementById('trnx-id').value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    if (!name || !phone || !address || cart.length === 0) {
        Swal.fire({ icon: 'error', title: 'Wait!', text: 'Please fill all info and TRXID.' });
        return;
    }

    let itemsText = ""; let subtotal = 0;
    cart.forEach((item, index) => {
        itemsText += `${index + 1}. ${item.name} (${item.selectedSize}/${item.selectedColor}) x ${item.qty} = ৳${item.price * item.qty}%0A`;
        subtotal += item.price * item.qty;
    });

    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    const finalTotal = subtotal + (isPaymentVerified ? 0 : (cart.length >= 3 ? 0 : parseInt(deliveryOption.value)));

    let message = `*NEW ORDER - REDAMS*%0A---------------------------%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Address:* ${address}%0A*Payment:* ${paymentMethod}%0A*TRXID:* ${trnxId}%0A---------------------------%0A*Items:*%0A${itemsText}---------------------------%0A*Final Total: ৳${finalTotal}*%0A---------------------------%0A_Order via Redams Website_`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

// হেল্পার ফাংশন এবং ইভেন্ট লিসেনার
function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }
function toggleCart(open = false) { 
    const d = document.getElementById('cart-drawer'); 
    if(open) d.classList.remove('translate-x-full'); 
    else d.classList.toggle('translate-x-full'); 
}
function closeModal() { document.getElementById('product-modal').classList.replace('flex', 'hidden'); }

document.addEventListener('DOMContentLoaded', () => {
    const trnxInput = document.getElementById('trnx-id');
    if (trnxInput) trnxInput.addEventListener('input', validateOrder);
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
