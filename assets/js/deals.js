const DISCOUNT = 20;

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

fetch('data/products.json')
    .then(response => response.json())
    .then(data => {
        const DEAL_IDS = [2, 4, 5, 3];
        const dealProducts = DEAL_IDS.map(id => data.products.find(p => p.id === id)).filter(Boolean);
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



window.addToCart = function(productId, quantity = 1) {
    let cart = localStorage.getItem('cart');
    cart = cart ? JSON.parse(cart) : [];
    let found = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
            cart[i].quantity += quantity;
            found = true;
            break;
        }
    }
    if (!found) {
        cart.push({
            id: productId,
            quantity: quantity
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
}


function renderDeals(products) {
    const grid = document.getElementById('deals-grid');

    grid.innerHTML = products.map(product => {
        const imagePath = product.images[0].replace(/\\/g, '/');

        return `
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
        `;
    }).join('');
    setupAddToCartButtons();
}