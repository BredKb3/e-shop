import { addToCart, getRatingStars } from './utils.js';


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
            <li><p class="product__highlights-list-key">${key}:</p>  <p class="product__highlights-list-val">${val}</p></li>
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