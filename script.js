// --- গ্লোবাল ভেরিয়েবল ---
let allProducts = [];
let cart = [];
let selectedSize = null;
let selectedColor = null;
let modalQty = 1;
let isPaymentVerified = false; 
let selectedSubMethod = ""; 

const WHATSAPP_NUMBER = "8801894357549"; 

// --- ১. প্রোডাক্ট লোড এবং ফিল্টার ---
async function loadProducts() {
    try {
        const res = await fetch('products.json');
        const data = await res.json();
        allProducts = data;
        
        const isShopPage = window.location.pathname.toLowerCase().includes('shop.html');
        const params = new URLSearchParams(window.location.search);
        const selectedCat = params.get('cat');

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
    } catch (err) {
        console.error("Error loading products:", err);
    }
}

// --- ২. মেনু এবং ফিচার সিলেকশন ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');
    if (!menu || !overlay) return;

    if (menu.classList.contains('-translate-x-full')) {
        menu.classList.replace('-translate-x-full', 'translate-x-0');
        overlay.classList.add('active');
    } else {
        menu.classList.replace('translate-x-0', '-translate-x-full');
        overlay.classList.remove('active');
    }
}

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

function updateQty(val) {
    modalQty = Math.max(1, modalQty + val);
    const qtyElement = document.getElementById('modal-qty');
    if (qtyElement) qtyElement.innerText = modalQty;
}

// --- ৩. রেন্ডারিং ফাংশনস ---
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
            </div>
            <div class="mt-6 text-center">
                <h2 class="text-sm font-black uppercase text-gray-900">${p.name}</h2>
                <p class="text-lg font-black mt-1">৳ ${p.price}</p>
            </div>
        </div>
    `).join('');
    setupAutoScroll(slider);
}

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
                    <button onclick="openModal(${p.id})" class="w-full bg-black text-white py-2 rounded-xl font-black uppercase text-[10px] hover:bg-red-600 transition">
                        Order Now
                    </button>
                </div>
            </div>`;
    }).join('');

    const viewAllBtn = document.getElementById('view-all-container');
    if (viewAllBtn) viewAllBtn.style.display = (showAll || products.length <= 8) ? 'none' : 'block';
}

// --- ৪. মোডাল এবং কার্ট ---
function openModal(id) {
    const p = allProducts.find(item => item.id === id);
    if(!p) return;
    const content = document.getElementById('modal-content');
    selectedSize = null; selectedColor = null; modalQty = 1;

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
                <div class="relative overflow-hidden rounded-2xl bg-gray-50 aspect-[3/4]">
                    <img id="main-view" src="${p.images[0]}" class="w-full h-full object-cover">
                </div>
                <div class="flex gap-2 overflow-x-auto pb-2">
                    ${p.images.map(img => `<img src="${img}" onclick="document.getElementById('main-view').src='${img}'" class="w-20 h-24 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-black">`).join('')}
                </div>
            </div>
            <div class="flex flex-col">
                <h2 class="text-3xl font-black mb-2 uppercase">${p.name}</h2>
                <p class="text-2xl font-black mb-6">৳ ${p.price}</p>
                <div class="mb-4">
                    <p class="text-[10px] font-black uppercase mb-3 text-gray-400">Color</p>
                    <div class="flex gap-2">${p.colors.map(c => `<button onclick="selectFeature('color','${c}',this)" class="px-5 py-2.5 border-2 border-gray-100 rounded-full text-[10px] font-black uppercase">${c}</button>`).join('')}</div>
                </div>
                <div class="mb-6">
                    <p class="text-[10px] font-black uppercase mb-3 text-gray-400">Size</p>
                    <div class="flex gap-2">${p.sizes.map(s => `<button onclick="selectFeature('size','${s}',this)" class="w-12 h-12 border-2 border-gray-100 rounded-full text-[10px] font-black flex items-center justify-center">${s}</button>`).join('')}</div>
                </div>
                <div class="mb-8 flex items-center gap-5">
                    <div class="flex items-center border-2 border-gray-100 rounded-2xl bg-gray-50">
                        <button onclick="updateQty(-1)" class="px-5 py-3">-</button>
                        <span id="modal-qty" class="px-6 font-black">1</span>
                        <button onclick="updateQty(1)" class="px-5 py-3">+</button>
                    </div>
                </div>
                <button onclick="addToCart(${p.id})" class="w-full bg-black text-white py-5 rounded-2xl font-black uppercase">Add To Cart</button>
            </div>
        </div>`;
    document.getElementById('product-modal').classList.replace('hidden', 'flex');
}

function addToCart(id) {
    if (!selectedSize || !selectedColor) {
        Swal.fire({ title: 'Attention!', text: 'Please select Color and Size.', icon: 'warning' });
        return;
    }
    const p = allProducts.find(item => item.id === id);
    cart.push({ ...p, selectedSize, selectedColor, qty: modalQty, image: p.images[0] });
    updateCartUI(); 
    closeModal(); 
    toggleCart(true);
}

function updateCartUI(isPaidOverride = null) {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const paymentSection = document.getElementById('payment-options-wrapper');

    if (isPaidOverride !== null) isPaymentVerified = (isPaidOverride === "Full Paid");

    let subtotal = 0, itemCount = 0;
    cartContainer.innerHTML = cart.map((item, index) => {
        subtotal += item.price * item.qty; 
        itemCount += item.qty;
        return `
            <div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 mb-2">
                <div class="flex items-center gap-3">
                    <img src="${item.image}" class="w-12 h-12 object-cover rounded">
                    <div>
                        <h4 class="text-[10px] font-bold">${item.name}</h4>
                        <p class="text-xs font-black">৳${item.price} x ${item.qty}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500">&times;</button>
            </div>`;
    }).join('');

    const deliveryOption = document.querySelector('input[name="delivery"]:checked');
    if (deliveryOption && paymentSection) paymentSection.classList.remove('hidden');

    let deliveryCharge = itemCount >= 3 ? 0 : parseInt(deliveryOption ? deliveryOption.value : 80);
    if (isPaymentVerified) deliveryCharge = 0;

    if (totalElement) {
        totalElement.innerHTML = `
            <div class="pt-4 border-t">
                <div class="flex justify-between text-xs font-bold"><span>Total Bill</span><span>৳${subtotal + deliveryCharge}</span></div>
            </div>`;
    }
}

// --- ৫. পেমেন্ট ভ্যালিডেশন ---
function updatePaymentUI(method) {
    const onlineSubOptions = document.getElementById('online-sub-options');
    const instructionBox = document.getElementById('payment-instruction');
    if (method === 'COD') {
        onlineSubOptions?.classList.add('hidden');
        instructionBox?.classList.add('hidden');
        selectedSubMethod = "";
    } else {
        onlineSubOptions?.classList.remove('hidden');
    }
    validateOrder();
}

function setOnlineMethod(method) {
    selectedSubMethod = method;
    document.getElementById('payment-instruction').classList.remove('hidden');
    document.getElementById('method-name').innerText = "Payment with " + method;
    validateOrder();
}

function validateOrder() {
    const name = document.getElementById('final-name')?.value.trim();
    const phone = document.getElementById('final-phone')?.value.trim();
    const address = document.getElementById('final-address')?.value.trim();
    const trnxId = document.getElementById('trnx-id')?.value.trim();
    const btn = document.getElementById('confirm-order-btn');

    const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value || "COD";
    
    let isInfoValid = name && phone.length >= 11 && address;
    let isPaymentValid = (selectedMethod === 'COD') ? true : (trnxId.length >= 8);

    if (isInfoValid && isPaymentValid) {
        btn.disabled = false;
        btn.classList.replace('bg-gray-300', 'bg-[#25D366]');
        btn.style.opacity = "1";
    } else {
        btn.disabled = true;
        btn.classList.replace('bg-[#25D366]', 'bg-gray-300');
        btn.style.opacity = "0.5";
    }
}

// --- ৬. অর্ডার কনফার্ম ---
function confirmOrderWhatsApp() {
    const name = document.getElementById('final-name').value;
    const phone = document.getElementById('final-phone').value;
    const address = document.getElementById('final-address').value;
    const delivery = document.querySelector('input[name="delivery"]:checked').parentElement.innerText.trim();
    const payment = document.querySelector('input[name="payment-method"]:checked').value;
    const trnxId = document.getElementById('trnx-id').value;

    let itemsText = cart.map(item => `- ${item.name} (${item.selectedSize}/${item.selectedColor}) x ${item.qty}`).join('%0A');
    let message = `*NEW ORDER FROM WEBSITE*%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Address:* ${address}%0A*Delivery:* ${delivery}%0A*Payment:* ${payment} ${selectedSubMethod ? '('+selectedSubMethod+')' : ''}%0A*TrnxID:* ${trnxId || 'N/A'}%0A%0A*Items:*%0A${itemsText}`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

// --- ৭. ইউটিলিটি ---
function setupAutoScroll(slider) {
    if (!slider) return;
    let scrollSpeed = 0.6;
    const step = () => {
        if (!slider) return;
        slider.scrollLeft += scrollSpeed;
        if (slider.scrollLeft >= (slider.scrollWidth - slider.offsetWidth - 1)) slider.scrollLeft = 0;
        requestAnimationFrame(step);
    }; 
    requestAnimationFrame(step);
}

function closeModal() { document.getElementById('product-modal').classList.replace('flex', 'hidden'); }
function toggleCart(open = false) { 
    const d = document.getElementById('cart-drawer');
    if(open) d.classList.remove('translate-x-full');
    else d.classList.toggle('translate-x-full');
}
function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); validateOrder(); }

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    ['final-name', 'final-phone', 'final-address', 'trnx-id'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', validateOrder);
    });
});
