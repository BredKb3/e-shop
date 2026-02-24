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
        function openMenu() {
            mobileMenu.classList.add('active');
            burgerBtn.classList.add('active');
            requestAnimationFrame(function() {
                const menuHeight = mobileMenu.offsetHeight;
                document.body.style.paddingTop = (64 + menuHeight) + 'px';
            });
        }

        function closeMenu() {
            mobileMenu.classList.remove('active');
            burgerBtn.classList.remove('active');
            document.body.style.paddingTop = '64px';
        }

        burgerBtn.addEventListener('click', function() {
            if (mobileMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        const mobileLinks = document.querySelectorAll('.mobile-menu__link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
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