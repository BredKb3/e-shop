import { addToCart, getRatingStars } from './utils.js';

const DISCOUNT = 20;


fetch('data/products.json')
    .then(response => response.json())
    .then(data => {
        const dealProducts = data.products.filter(p => p.onSale === true);
        renderDeals(dealProducts);
    })
    .catch(err => console.error('Ошибка загрузки products.json:', err));


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


function renderDeals(products) {
    const grid = document.getElementById('deals-grid');

    grid.innerHTML = products.map(product => {
        return `
            <div class="product-card" style="position: relative;">
                <span class="product-card__badge">Save ${DISCOUNT}%</span>
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
                        <button class="product-card__add-to-cart" data-product-id="${product.id}">Add to cart</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    setupAddToCartButtons();
}
