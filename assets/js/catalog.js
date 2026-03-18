import { addToCart, getRatingStars } from './utils.js';

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

let MAX_PRICE_LIMIT = 0;

let currentFilters = {
    rating: [],
    minPrice: 0,
    maxPrice: MAX_PRICE_LIMIT,
    sort: 'name-asc'
};

function getMaxPrice(products) {
    if (!products || products.length === 0) return 0;
    
    const prices = products.map(product => product.price);
    return Math.max(...prices);
}

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

    const percentMin = (min / MAX_PRICE_LIMIT) * 100;
    const percentMax = (max / MAX_PRICE_LIMIT) * 100;
    const fillStyle = `left:${percentMin}%; width:${percentMax - percentMin}%`;
    priceFill.style.cssText = fillStyle;
    priceFillDrawer.style.cssText = fillStyle;

    document.querySelectorAll('[data-filter="rating"], [data-filter="ratingDrawer"]').forEach(cb => {
        cb.checked = rating.includes(Number(cb.value));
    });
}

async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;
        filteredProducts = [...allProducts];
        
        const rawMax = getMaxPrice(allProducts);
        MAX_PRICE_LIMIT = Math.ceil(rawMax / 50) * 50;
        
        [minRange, maxRange, minRangeDrawer, maxRangeDrawer].forEach(input => {
            input.max = MAX_PRICE_LIMIT;
        });
        
        currentFilters.maxPrice = MAX_PRICE_LIMIT;
        
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
            e.preventDefault();
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

function applyFilters() {
    let filtered = [...allProducts];

    filtered = filtered.filter(p =>
        p.price >= currentFilters.minPrice &&
        p.price <= currentFilters.maxPrice
    );

    if (currentFilters.rating.length > 0) {
        filtered = filtered.filter(p => currentFilters.rating.some(r => p.rating >= r));
    }

    switch (currentFilters.sort) {
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
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
        if (!currentFilters.rating.includes(value)) {
            currentFilters.rating.push(value);
        }
    } else {
        currentFilters.rating = currentFilters.rating.filter(r => r !== value);
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
        rating: [],
        minPrice: 0,
        maxPrice: MAX_PRICE_LIMIT,
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
    const raw = (percent / 100) * MAX_PRICE_LIMIT;
    return Math.round(raw / 10) * 10;
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