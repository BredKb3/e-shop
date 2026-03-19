const categoryImages = {
    'Audio':       'images/2.jpg',
    'Computers':   'images/4.jpg',
    'Wearables':   'images/5.jpg',
    'Photography': 'images/3.jpg',
    'Tablets':     'images/6.jpg'
};

function renderCategories(categories) {
    const grid = document.getElementById('categories-grid');

    categories.forEach(cat => {
        const productWord = cat.count === 1 ? 'product' : 'products';

        const card = document.createElement('a');
        card.classList.add('category-card');
        card.href = `index.html?category=${encodeURIComponent(cat.name)}`;

        card.innerHTML = `
            <img src="${cat.image}" alt="${cat.name}" />
            <div class="category-card-overlay">
                <div class="category-card-text">
                    <h3>${cat.name}</h3>
                    <p>${cat.count} ${productWord}</p>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

fetch('data/products.json')
    .then(response => response.json())
    .then(data => {
        const countMap = {};
        data.products.forEach(p => {
            countMap[p.category] = (countMap[p.category] || 0) + 1;
        });

        const categories = Object.entries(countMap).map(([name, count]) => ({
            name,
            count,
            image: categoryImages[name] || 'images/default.jpg'
        }));

        renderCategories(categories);
    })
    .catch(err => console.error('Ошибка загрузки products.json:', err));