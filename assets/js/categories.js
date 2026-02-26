const categoriesData = [
    { name: 'Audio',       image: 'images/2.jpg', count: 2 },
    { name: 'Computers',   image: 'images/4.jpg', count: 1 },
    { name: 'Wearables',   image: 'images/5.jpg', count: 1 },
    { name: 'Photography', image: 'images/3.jpg', count: 1 },
    { name: 'Tablets',     image: 'images/6.jpg', count: 1 }
];

function renderCategories(categories) {
    const grid = document.getElementById('categories-grid');

    categories.forEach(cat => {
        const productWord = cat.count === 1 ? 'product' : 'products';

        const card = document.createElement('a');
        card.classList.add('category-card');
        card.href = `index.html`;

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

renderCategories(categoriesData);