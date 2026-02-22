function waitForElement(selector, callback) {
    if (document.querySelector(selector)) {
        callback();
    } else {
        setTimeout(function() {
            waitForElement(selector, callback);
        }, 100);
    }
}

waitForElement('#burgerBtn', function() {    
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', function() {
            burgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        const mobileLinks = document.querySelectorAll('.mobile-menu__link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                burgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
});

waitForElement('#cartBadge', function() {
    const cartBadge = document.getElementById('cartBadge');
    function updateCartCounter() {
        const cart = localStorage.getItem('cart');
        
        if (cart && cartBadge) {
            const cartItems = JSON.parse(cart);
            let totalCount = 0;
            
            for (let i = 0; i < cartItems.length; i++) {
                totalCount += cartItems[i].quantity || 1;
            }
            
            if (totalCount === 0) {
                cartBadge.style.display = 'none';
            } else {
                cartBadge.style.display = 'flex';
                cartBadge.textContent = totalCount;
            }
        } else if (cartBadge) {
            cartBadge.style.display = 'none';
        }
    }
    
    updateCartCounter();
    
    window.addEventListener('cartUpdated', updateCartCounter);
    
    setInterval(updateCartCounter, 1000);
});
