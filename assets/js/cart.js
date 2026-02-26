const PROMO_CODE = 'SAVE10';       
const DISCOUNT_PERCENT = 0.10;     
const TAX_RATE = 0.08;             

let products = [];        
let cartItems = [];       
let promoApplied = false; 

document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
});

function loadProducts() {
    fetch('data/products.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            products = data.products;
            loadCart();
        })
        .catch(function (error) {
            console.error('Не удалось загрузить товары:', error);
        });
}

function loadCart() {
    const saved = localStorage.getItem('cart');

    if (saved) {
        cartItems = JSON.parse(saved);
    } else {
        cartItems = [];
    }

    renderPage();
}

function renderPage() {
    const cartEmpty = document.getElementById('cartEmpty');
    const cartContent = document.getElementById('cartContent');
    const cartTitle = document.getElementById('cartTitle');

    if (cartItems.length === 0) {
        cartEmpty.classList.remove('hidden');
        cartContent.classList.add('hidden');
        cartTitle.classList.add('hidden');
    } else {
        cartEmpty.classList.add('hidden');
        cartContent.classList.remove('hidden');

        renderCartItems();
        updateSummary();
        updateHeaderBadge();
        setupPromoCode();
    }
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    cartItems.forEach(function (cartItem) {
        const product = products.find(function (p) {
            return p.id === cartItem.id;
        });

        if (!product) return;

        const itemTotal = product.price * cartItem.quantity;
        const card = document.createElement('div');
        card.className = 'cart-item';
        card.innerHTML = `
            <div class="cart-item__image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <div class="cart-item__info">
                <div>
                    <div class="cart-item__header">
                        <div>
                            <a href="product.html?id=${product.id}" class="cart-item__name">${product.name}</a>
                            <p class="cart-item__category">${product.category}</p>
                        </div>
                        <button class="cart-item__remove" data-id="${product.id}" aria-label="Remove item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" x2="10" y1="11" y2="17"></line>
                                <line x1="14" x2="14" y1="11" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="cart-item__footer">
                    <div class="quantity-control">
                        <button class="quantity-btn" data-id="${product.id}" data-action="decrease" ${cartItem.quantity <= 1 ? 'disabled' : ''} aria-label="Decrease quantity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14"></path>
                            </svg>
                        </button>
                        <span class="quantity-value">${cartItem.quantity}</span>
                        <button class="quantity-btn" data-id="${product.id}" data-action="increase" aria-label="Increase quantity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14"></path>
                                <path d="M12 5v14"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="cart-item__price">
                        <p class="cart-item__price-total">$${itemTotal.toFixed(2)}</p>
                        <p class="cart-item__price-each">$${product.price.toFixed(2)} each</p>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    attachCartListeners();
}

function attachCartListeners() {
    document.querySelectorAll('.cart-item__remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = parseInt(btn.dataset.id);
            removeFromCart(id);
        });
    });

    document.querySelectorAll('.quantity-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = parseInt(btn.dataset.id);
            const action = btn.dataset.action;
            changeQuantity(id, action);
        });
    });
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(function (item) {
        return item.id !== productId;
    });
    saveCart();
    renderPage();
}

function changeQuantity(productId, action) {
    const item = cartItems.find(function (i) {
        return i.id === productId;
    });

    if (!item) return;

    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
    }

    saveCart();
    renderPage();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

function updateSummary() {
    let subtotal = 0;
    cartItems.forEach(function (cartItem) {
        const product = products.find(function (p) {
            return p.id === cartItem.id;
        });
        if (product) {
            subtotal += product.price * cartItem.quantity;
        }
    });

    const discount = promoApplied ? subtotal * DISCOUNT_PERCENT : 0;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * TAX_RATE;
    const total = afterDiscount + tax;

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('taxAmount').textContent = '$' + tax.toFixed(2);
    document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);

    const discountRow = document.getElementById('discountRow');
    if (promoApplied) {
        document.getElementById('discountAmount').textContent = '-$' + discount.toFixed(2);
        discountRow.classList.remove('hidden');
    } else {
        discountRow.classList.add('hidden');
    }
}

function updateHeaderBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;

    const total = cartItems.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    badge.textContent = total;

    if (total > 0) {
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function setupPromoCode() {
    const promoBtn = document.getElementById('promoBtn');
    const promoInput = document.getElementById('promoInput');
    const promoHint = document.getElementById('promoHint');

    promoBtn.replaceWith(promoBtn.cloneNode(true));
    const newPromoBtn = document.getElementById('promoBtn');

    newPromoBtn.addEventListener('click', function () {
        const code = promoInput.value.trim().toUpperCase(); 

        if (code === PROMO_CODE) {
            promoApplied = true;
            promoInput.disabled = true;
            newPromoBtn.disabled = true;
            showPromoMessage('Promo code applied successfully!', true);
            promoHint.innerHTML = "Неверный промокод";
            updateSummary();
        }
        else{
            showPromoMessage("Неверный промокод", false);
        }
    });
}

function showPromoMessage(text, isSuccess) {
    const msg = document.getElementById('promoMessage');
    msg.textContent = text;
    msg.classList.remove('hidden', 'promo-message--success', 'promo-message--error');
    if (isSuccess) {
        msg.classList.add('promo-message--success');
    } else {
        msg.classList.add('promo-message--error');
    }
}