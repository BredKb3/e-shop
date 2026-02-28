const DISCOUNT = 20;

function getRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += `<svg class="star-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
            </svg>`;
        } else {
            stars += `<svg class="star-empty" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
            </svg>`;
        }
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


function renderDeals(products) {
    const grid = document.getElementById('deals-grid');

    grid.innerHTML = products.map(product => {
        const imagePath = product.images[0].replace(/\\/g, '/');

        return `
            <div class="deal-card-wrapper">
                <div class="deal-badge">Save ${DISCOUNT}%</div>
                <a class="deal-card" href="product.html?id=${product.id}">
                    <div class="deal-card__image">
                        <img src="${imagePath}" alt="${product.name}" />
                    </div>
                    <div class="deal-card__content">
                        <h3 class="deal-card__title">${product.name}</h3>
                        <div class="deal-card__rating">
                            <div class="rating-stars">
                                ${getRatingStars(product.rating)}
                            </div>
                            <span class="rating-count">(${product.rating})</span>
                        </div>
                        <div class="deal-card__footer">
                            <span class="deal-card__price">$${product.price.toFixed(2)}</span>
                            <span class="deal-card__category">${product.category}</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');
}