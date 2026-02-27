function getRatingStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    let stars = '';

    for (let i = 0; i < full; i++) {
        stars += `<svg class="rating__star" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`;
    }
    if (half) {
        stars += `<svg class="rating__star" viewBox="0 0 24 24">
            <path d="M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2"/>
        </svg>`;
    }
    for (let i = 0; i < empty; i++) {
        stars += `<svg class="rating__star empty" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`;
    }
    return stars;
}

function addToCart(productId, quantity = 1) {
    let cart = localStorage.getItem('cart');
    cart = cart ? JSON.parse(cart) : [];
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
}

function initGallery(images) {
    const mainImg = document.getElementById('mainImage');
    const thumbsContainer = document.getElementById('thumbnails');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    let current = 0;

    if (images.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }

    function setActive(idx) {
        current = (idx + images.length) % images.length;
        mainImg.src = images[current];
        document.querySelectorAll('.product__thumb').forEach((t, i) => {
            t.classList.toggle('active', i === current);
        });
    }

    thumbsContainer.innerHTML = images.map((src, i) => `
        <button class="product__thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
            <img src="${src}" alt="Thumbnail ${i + 1}">
        </button>
    `).join('');

    thumbsContainer.addEventListener('click', e => {
        const btn = e.target.closest('.product__thumb');
        if (btn) setActive(Number(btn.dataset.idx));
    });

    prevBtn.addEventListener('click', () => setActive(current - 1));
    nextBtn.addEventListener('click', () => setActive(current + 1));

    setActive(0);
}

function initAccordion() {
    const btn = document.getElementById('specsToggle');
    const body = document.getElementById('specsBody');

    btn.addEventListener('click', () => {
        const open = body.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
    });
}


function renderProduct(product) {
    document.getElementById('breadcrumbCategory').textContent = product.category;
    document.getElementById('breadcrumbName').textContent = product.name;

    initGallery(product.images);

    document.getElementById('productName').textContent = product.name;
    document.getElementById('productStars').innerHTML = getRatingStars(product.rating);
    document.getElementById('productRating').textContent = `(${product.rating})`;
    document.getElementById('productReviews').textContent = `Based on ${product.reviews} reviews`;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productDescription').textContent = product.description;

    const specs = Object.entries(product.specifications || {});
    const highlightsList = document.getElementById('highlightsList');
    const highlights = specs.slice(0, 3);

    if (highlights.length === 0) {
        document.getElementById('highlights').style.display = 'none';
    } else {
        highlightsList.innerHTML = highlights.map(([key, val]) => `
            <li><strong>${key}:</strong> ${val}</li>
        `).join('');
    }

    const specsList = document.getElementById('specsList');
    if (specs.length === 0) {
        document.getElementById('specsAccordion').style.display = 'none';
    } else {
        specsList.innerHTML = specs.map(([key, val]) => `
            <div class="product__spec-row">
                <span class="product__spec-key">${key}</span>
                <span class="product__spec-val">${val}</span>
            </div>
        `).join('');
    }

    initAccordion();

    let qty = 1;
    const qtyValue = document.getElementById('qtyValue');
    document.getElementById('qtyMinus').addEventListener('click', () => {
        if (qty > 1) { qty--; qtyValue.textContent = qty; }
    });
    document.getElementById('qtyPlus').addEventListener('click', () => {
        qty++;
        qtyValue.textContent = qty;
    });

    document.getElementById('addToCartBtn').addEventListener('click', () => {
        addToCart(product.id, qty);
    });
}

function renderRelated(allProducts, currentProduct) {
    const related = allProducts.filter(p =>
        p.category === currentProduct.category && p.id !== currentProduct.id
    );

    const section = document.getElementById('relatedSection');
    const grid = document.getElementById('relatedGrid');

    if (related.length === 0) {
        section.style.display = 'none';
        return;
    }

    grid.innerHTML = related.map(product => `
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
                    <div class="rating__stars">${getRatingStars(product.rating)}</div>
                    <span class="rating__count">(${product.rating})</span>
                </div>
                <div class="product-card__footer">
                    <span class="product-card__price">$${product.price.toFixed(2)}</span>
                    <span class="product-card__category">${product.category}</span>
                </div>
                <div class="product-card__button">
                    <button class="product-card__add-to-cart" data-product-id="${product.id}">Add to cart</button>
                </div>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.product-card__add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            addToCart(Number(btn.dataset.productId), 1);
        });
    });
}

async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));

    if (!id) {
        document.querySelector('.product-page').innerHTML = '<p style="padding:40px;text-align:center;color:#6b7280">Product not found.</p>';
        return;
    }

    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        const allProducts = data.products;

        const product = allProducts.find(p => p.id === id);

        if (!product) {
            document.querySelector('.product-page').innerHTML = '<p style="padding:40px;text-align:center;color:#6b7280">Product not found.</p>';
            return;
        }

        renderProduct(product);
        renderRelated(allProducts, product);

    } catch (err) {
        console.error('Error loading product:', err);
    }
}

document.addEventListener('DOMContentLoaded', init);