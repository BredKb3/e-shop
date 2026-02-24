const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');
const priceFill = document.getElementById('priceFill');
const minRangeDrawer = document.getElementById('minRangeDrawer');
const maxRangeDrawer = document.getElementById('maxRangeDrawer');
const minPriceDrawer = document.getElementById('minPriceDrawer');
const maxPriceDrawer = document.getElementById('maxPriceDrawer');
const priceFillDrawer = document.getElementById('priceFillDrawer');
const filterBtn = document.getElementById('filterBtn');
const filterDrawer = document.getElementById('filterDrawer');
const filterOverlay = document.getElementById('filterOverlay');
const closeFilterBtn = document.getElementById('closeFilterBtn');
const sliderTrack = document.getElementById('priceRangeSlider');
const sliderTrackDrawer = document.getElementById('priceRangeSliderDrawer');

let allProducts = [];
let filteredProducts = [];

let currentFilters = {
    rating: null,
    minPrice: 0,
    maxPrice: 3000,
    sort: 'name-asc'
};

function syncUIFromFilters() {
    const { minPrice: min, maxPrice: max, rating } = currentFilters;

    minRange.value = min;
    maxRange.value = max;
    minRangeDrawer.value = min;
    maxRangeDrawer.value = max;

    minPrice.textContent = min;
    maxPrice.textContent = max;
    minPriceDrawer.textContent = min;
    maxPriceDrawer.textContent = max;

    const percentMin = (min / 3000) * 100;
    const percentMax = (max / 3000) * 100;
    const fillStyle = `left:${percentMin}%; width:${percentMax - percentMin}%`;
    priceFill.style.cssText = fillStyle;
    priceFillDrawer.style.cssText = fillStyle;

    document.querySelectorAll('[data-filter="rating"], [data-filter="ratingDrawer"]').forEach(cb => {
        cb.checked = rating !== null && Number(cb.value) === rating;
    });
}

async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;
        filteredProducts = [...allProducts];

        syncUIFromFilters();

        displayProducts();
        updateProductCount();
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function setupAddToCartButtons() {
    const buttons = document.querySelectorAll('.product-card__add-to-cart');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Останавливаем переход по ссылке
            const productId = this.getAttribute('data-product-id');
            addToCart(Number(productId), 1);
        });
    });
}

function displayProducts() {
    const grid = document.getElementById('productsGrid');

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="catalog__empty">
                <p class="catalog__empty-title">No products found</p>
                <p class="catalog__empty-text">Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-card__image">
                <a href="product.html?id=${product.id}">
                    <img src="${product.images[0]}" alt="${product.name}">
                </a>
            </div>
            <div class="product-card__content">
                <a href="product.html?id=${product.id}">
                    <h3 class="product-card__title">${product.name}</h3>
                </a>
            <div class="product-card__rating">
                    <div class="rating__stars">
                        ${getRatingStars(product.rating)}
                    </div>
                    <span class="rating__count">(${product.rating})</span>
                </div>
                <div class="product-card__footer">
                    <span class="product-card__price">$${product.price.toFixed(2)}</span>
                    <span class="product-card__category">${product.category}</span>
                </div>
                <div class="product-card__button">
                <button class="product-card__add-to-cart" id="addToCart" data-product-id="${product.id}" >Add to cart</button>
                </div>
            </div>
        </div>
    `).join('');
    setupAddToCartButtons();
}

window.addToCart = function(productId, quantity = 1) {
    // Получаем текущую корзину
    let cart = localStorage.getItem('cart');
    cart = cart ? JSON.parse(cart) : [];
    
    // Ищем товар в корзине
    let found = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
            cart[i].quantity += quantity;
            found = true;
            break;
        }
    }
    
    // Если товара нет - добавляем новый
    if (!found) {
        cart.push({
            id: productId,
            quantity: quantity
        });
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Отправляем событие для обновления бейджа в хедере
    window.dispatchEvent(new Event('cartUpdated'));
}


function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += `<svg class="rating__star" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`;
    }

    if (hasHalfStar) {
        stars += `<svg class="rating__star" viewBox="0 0 24 24">
            <path d="M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2"></path>
        </svg>`;
    }

    for (let i = 0; i < emptyStars; i++) {
        stars += `<svg class="rating__star empty" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`;
    }

    return stars;
}

function applyFilters() {
    let filtered = [...allProducts];

    filtered = filtered.filter(p =>
        p.price >= currentFilters.minPrice &&
        p.price <= currentFilters.maxPrice
    );

    if (currentFilters.rating) {
        filtered = filtered.filter(p => p.rating >= currentFilters.rating);
    }

    switch (currentFilters.sort) {
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
    }

    filteredProducts = filtered;
    displayProducts();
    updateProductCount();
}

function updateProductCount() {
    const countElement = document.getElementById('productCount');
    countElement.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
}

function initDropdown() {
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const selectedSpan = document.getElementById('selectedSort');
    const dropdownItems = document.querySelectorAll('.dropdown__item');

    if (!dropdownBtn || !dropdownMenu) return;

    dropdownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownBtn.classList.toggle('active');
        dropdownMenu.classList.toggle('show');
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', function () {
            dropdownItems.forEach(i => {
                i.classList.remove('selected');
                const svg = i.querySelector('svg');
                if (svg) svg.remove();
            });
            this.classList.add('selected');
            selectedSpan.textContent = this.textContent;

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.innerHTML = '<use href="#check-icon"></use>';
            this.appendChild(svg);

            currentFilters.sort = this.getAttribute('data-sort');
            applyFilters();
            dropdownBtn.classList.remove('active');
            dropdownMenu.classList.remove('show');
        });
    });

    document.addEventListener('click', function (e) {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownBtn.classList.remove('active');
            dropdownMenu.classList.remove('show');
        }
    });
}

function handleRatingChange(changedCheckbox) {
    const value = Number(changedCheckbox.value);

    if (changedCheckbox.checked) {
        currentFilters.rating = value;
    } else {
        if (currentFilters.rating === value) {
            currentFilters.rating = null;
        }
    }
    syncUIFromFilters();
    applyFilters();
}

function applyPriceSlider(minVal, maxVal) {
    let min = minVal;
    let max = maxVal;

    if (min > max - 50 && min >= 50) min = max - 50;

    currentFilters.minPrice = min;
    currentFilters.maxPrice = max;

    syncUIFromFilters();
    applyFilters();
}

document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    initDropdown();
    document.querySelectorAll('[data-filter="rating"]').forEach(cb => {
        cb.addEventListener('change', () => handleRatingChange(cb));
    });
    document.querySelectorAll('[data-filter="ratingDrawer"]').forEach(cb => {
        cb.addEventListener('change', () => handleRatingChange(cb));
    });

    const clearBtn = document.getElementById('clearFilters');
    const clearBtnDrawer = document.getElementById('clearFiltersDrawer');
    clearBtn.addEventListener('click', clearAllFilters);
    clearBtnDrawer.addEventListener('click', clearAllFilters);
});

window.clearAllFilters = function () {
    currentFilters = {
        rating: null,
        minPrice: 0,
        maxPrice: 3000,
        sort: 'name-asc'
    };

    syncUIFromFilters();
    applyFilters();
};

minRange.addEventListener('input', () => {
    applyPriceSlider(parseInt(minRange.value), parseInt(maxRange.value));
});
maxRange.addEventListener('input', () => {
    applyPriceSlider(parseInt(minRange.value), parseInt(maxRange.value));
});

let wasDragging = false;
document.addEventListener('mousemove', (e) => { if (e.buttons === 1) wasDragging = true; });
document.addEventListener('mousedown', () => { wasDragging = false; });

function getSnappedTrackValue(e, trackEl) {
    const rect = trackEl.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const raw = (percent / 100) * 3000;
    return Math.round(raw / 10) * 10; // кратно 10
}

sliderTrack.addEventListener('click', function (e) {
    if (wasDragging) return;
    const value = getSnappedTrackValue(e, this);
    const minVal = parseInt(minRange.value);
    const maxVal = parseInt(maxRange.value);

    if (Math.abs(value - minVal) <= Math.abs(value - maxVal)) {
        applyPriceSlider(Math.min(value, maxVal - 10), maxVal);
    } else {
        applyPriceSlider(minVal, Math.max(value, minVal + 10));
    }
});

minRangeDrawer.addEventListener('input', () => {
    applyPriceSlider(parseInt(minRangeDrawer.value), parseInt(maxRangeDrawer.value));
});
maxRangeDrawer.addEventListener('input', () => {
    applyPriceSlider(parseInt(minRangeDrawer.value), parseInt(maxRangeDrawer.value));
});


sliderTrackDrawer.addEventListener('click', function (e) {
    if (wasDragging) return;
    const value = getSnappedTrackValue(e, this);
    const minVal = parseInt(minRangeDrawer.value);
    const maxVal = parseInt(maxRangeDrawer.value);

    if (Math.abs(value - minVal) <= Math.abs(value - maxVal)) {
        applyPriceSlider(Math.min(value, maxVal - 10), maxVal);
    } else {
        applyPriceSlider(minVal, Math.max(value, minVal + 10));
    }
});

function openFilter() {
    filterDrawer.classList.add('active');
    filterOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFilter() {
    filterDrawer.classList.remove('active');
    filterOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

filterBtn.addEventListener('click', openFilter);
closeFilterBtn.addEventListener('click', closeFilter);
filterOverlay.addEventListener('click', closeFilter);

syncUIFromFilters();