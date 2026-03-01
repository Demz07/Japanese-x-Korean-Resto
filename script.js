document.addEventListener('DOMContentLoaded', function() {
    const landingPage = document.getElementById('landingPage');
    const menuPage = document.getElementById('menuPage');
    const orderBtn = document.getElementById('orderBtn');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const addBtns = document.querySelectorAll('.add-btn');

    const receiptModal = document.getElementById('receiptModal');
    const receiptPanel = document.getElementById('receiptPanel');
    const receiptItems = document.getElementById('receiptItems');
    const receiptTotal = document.getElementById('receiptTotal');
    const orderNumber = document.getElementById('orderNumber');
    const orderDate = document.getElementById('orderDate');
    const closeReceipt = document.getElementById('closeReceipt');

    const comboToggle = document.getElementById('comboToggle');
    const comboSection = document.getElementById('comboSection');
    const menuSections = document.querySelector('.menu-sections');
    
    const manageMenuBtn = document.getElementById('manageMenuBtn');
    const manageOptions = document.getElementById('manageOptions');

    const discountToggle = document.getElementById('discountToggle');
    const targetPriceInput = document.getElementById('targetPrice');
    const discountPercentInput = document.getElementById('discountPercent');

    const categoryDiscountToggle = document.getElementById('categoryDiscountToggle');
    const categoryDiscountPercent = document.getElementById('categoryDiscountPercent');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');

    let discountEnabled = false;
    let discountTarget = 0;
    let discountPercent = 0;

    let categoryDiscountEnabled = false;
    let categoryDiscountCats = [];
    let categoryDiscountPct = 0;

    let cart = [];

    updateDiscountBadges();

    orderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        landingPage.style.display = 'none';
        menuPage.style.display = 'block';
    });

    manageMenuBtn.addEventListener('click', function() {
        if (manageOptions.style.display === 'none') {
            manageOptions.style.display = 'block';
            manageMenuBtn.classList.add('active');
        } else {
            manageOptions.style.display = 'none';
            manageMenuBtn.classList.remove('active');
        }
    });

    discountToggle.addEventListener('change', function() {
        discountEnabled = this.checked;
        discountTarget = parseFloat(targetPriceInput.value) || 0;
        discountPercent = parseFloat(discountPercentInput.value) || 0;
        renderCart();
    });

    targetPriceInput.addEventListener('input', function() {
        discountTarget = parseFloat(this.value) || 0;
        renderCart();
    });

    discountPercentInput.addEventListener('input', function() {
        discountPercent = parseFloat(this.value) || 0;
        renderCart();
    });

    categoryDiscountToggle.addEventListener('change', function() {
        categoryDiscountEnabled = this.checked;
        categoryDiscountCats = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        categoryDiscountPct = parseFloat(categoryDiscountPercent.value) || 0;
        updateDiscountBadges();
        renderCart();
    });

    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            categoryDiscountCats = Array.from(categoryCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            updateDiscountBadges();
            renderCart();
        });
    });

    categoryDiscountPercent.addEventListener('input', function() {
        categoryDiscountPct = parseFloat(this.value) || 0;
        updateDiscountBadges();
        renderCart();
    });

    function updateDiscountBadges() {
        const titles = {
            japaneseTitle: document.getElementById('japaneseTitle'),
            koreanTitle: document.getElementById('koreanTitle'),
            japaneseFoodsTitle: document.getElementById('japaneseFoodsTitle'),
            japaneseBeveragesTitle: document.getElementById('japaneseBeveragesTitle'),
            koreanFoodsTitle: document.getElementById('koreanFoodsTitle'),
            koreanBeveragesTitle: document.getElementById('koreanBeveragesTitle')
        };

        Object.values(titles).forEach(title => {
            if (title) {
                title.classList.remove('has-discount');
                const badge = title.querySelector('.discount-badge');
                if (badge) badge.remove();
            }
        });

        const allMenuItems = document.querySelectorAll('.menu-item');
        allMenuItems.forEach(item => {
            const itemBadge = item.querySelector('.item-discount-badge');
            if (itemBadge) itemBadge.remove();
        });

        if (categoryDiscountEnabled && categoryDiscountPct > 0 && categoryDiscountCats.length > 0) {
            categoryDiscountCats.forEach(cat => {
                let titleId = '';
                if (cat === 'japanese') titleId = 'japaneseTitle';
                else if (cat === 'korean') titleId = 'koreanTitle';
                else if (cat === 'japaneseFoods') titleId = 'japaneseFoodsTitle';
                else if (cat === 'japaneseBeverages') titleId = 'japaneseBeveragesTitle';
                else if (cat === 'koreanFoods') titleId = 'koreanFoodsTitle';
                else if (cat === 'koreanBeverages') titleId = 'koreanBeveragesTitle';

                if (titleId && titles[titleId] && !titles[titleId].classList.contains('has-discount')) {
                    titles[titleId].classList.add('has-discount');
                    const badge = document.createElement('span');
                    badge.className = 'discount-badge';
                    badge.textContent = '🔥 ' + categoryDiscountPct + '% OFF';
                    titles[titleId].appendChild(badge);
                }
            });

            const allMenuItems = document.querySelectorAll('.menu-item');
            allMenuItems.forEach(item => {
                const itemBadge = item.querySelector('.item-discount-badge');
                if (itemBadge) itemBadge.remove();
                
                const footer = item.querySelector('.item-footer');
                if (footer) footer.classList.remove('has-discount');
                
                const priceContainer = item.querySelector('.item-footer .price');
                const originalSpan = priceContainer ? priceContainer.querySelector('.original-price') : null;
                if (originalSpan) {
                    originalSpan.remove();
                    priceContainer.classList.remove('has-discount');
                }
                
                const itemCategory = item.dataset.category;
                let qualifies = false;
                
                categoryDiscountCats.forEach(cat => {
                    if (cat === 'japanese' && (itemCategory === 'japaneseFoods' || itemCategory === 'japaneseBeverages')) {
                        qualifies = true;
                    } else if (cat === 'korean' && (itemCategory === 'koreanFoods' || itemCategory === 'koreanBeverages')) {
                        qualifies = true;
                    } else if (itemCategory === cat) {
                        qualifies = true;
                    }
                });
                
                if (qualifies) {
                    const badge = document.createElement('span');
                    badge.className = 'item-discount-badge';
                    badge.textContent = '-' + categoryDiscountPct + '%';
                    const imgContainer = item.querySelector('.item-image');
                    if (imgContainer) imgContainer.appendChild(badge);

                    const originalPrice = parseFloat(item.dataset.price);
                    const discountedPrice = originalPrice * (1 - categoryDiscountPct / 100);
                    
                    const footer = item.querySelector('.item-footer');
                    if (footer) footer.classList.add('has-discount');
                    
                    if (priceContainer) {
                        priceContainer.classList.add('has-discount');
                        const origSpan = document.createElement('span');
                        origSpan.className = 'original-price';
                        origSpan.textContent = '₱' + originalPrice.toFixed(2);
                        
                        const newSpan = document.createElement('span');
                        newSpan.className = 'discounted-price';
                        newSpan.textContent = ' ₱' + discountedPrice.toFixed(2);
                        
                        priceContainer.innerHTML = '';
                        priceContainer.appendChild(origSpan);
                        priceContainer.appendChild(newSpan);
                    }
                }
            });
        }
    }

    categoryDiscountPercent.addEventListener('input', function() {
        categoryDiscountPct = parseFloat(this.value) || 0;
        renderCart();
    });

    comboToggle.addEventListener('change', function() {
        if (this.checked) {
            comboSection.style.display = 'block';
            comboSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            comboSection.style.display = 'none';
        }
    });

    addBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.menu-item');
            const name = item.dataset.name;
            let price = parseFloat(item.dataset.price);
            const category = item.dataset.category;
            
            if (categoryDiscountEnabled && categoryDiscountPct > 0) {
                let qualifies = false;
                categoryDiscountCats.forEach(cat => {
                    if (cat === 'japanese' && (category === 'japaneseFoods' || category === 'japaneseBeverages')) {
                        qualifies = true;
                    } else if (cat === 'korean' && (category === 'koreanFoods' || category === 'koreanBeverages')) {
                        qualifies = true;
                    } else if (category === cat) {
                        qualifies = true;
                    }
                });
                if (qualifies) {
                    price = price * (1 - categoryDiscountPct / 100);
                }
            }
            
            addToCart(name, price);
        });
    });

    document.querySelectorAll('.combo-item .add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.combo-item');
            const name = item.dataset.name;
            const price = parseFloat(item.dataset.price);
            addToCart(name, price);
        });
    });

    const japaneseFoods = ['Sushi', 'Ramen', 'Tempura', 'Takoyaki', 'Chicken Katsu'];
    const japaneseBeverages = ['Mugicha', 'Matcha Latte', 'Ramune', 'Maesil-cha', 'Amazake'];
    const koreanFoods = ['Kimchi', 'Bibimbap', 'Bulgogi', 'Tteokbokki', 'Japchae'];
    const koreanBeverages = ['Sikhye', 'Banana Mat Uyu', 'Omija-cha', 'Bori-cha', 'Milkis'];

    function getItemCategory(name) {
        if (name.includes('Combo')) return null;
        if (japaneseFoods.includes(name)) return 'japaneseFoods';
        if (japaneseBeverages.includes(name)) return 'japaneseBeverages';
        if (koreanFoods.includes(name)) return 'koreanFoods';
        if (koreanBeverages.includes(name)) return 'koreanBeverages';
        if (japaneseFoods.concat(japaneseBeverages).some(item => name.includes(item))) return 'japanese';
        if (koreanFoods.concat(koreanBeverages).some(item => name.includes(item))) return 'korean';
        return null;
    }

    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.qty++;
        } else {
            const category = getItemCategory(name);
            cart.push({ name, price, qty: 1, category });
        }
        
        renderCart();
    }

    function updateQty(name, change) {
        const item = cart.find(i => i.name === name);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.name !== name);
            }
        }
        renderCart();
    }

    function removeItem(name) {
        cart = cart.filter(i => i.name !== name);
        renderCart();
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotal.textContent = '₱0.00';
            checkoutBtn.disabled = true;
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₱${item.price.toFixed(2)} x ${item.qty}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateQty('${item.name}', -1)">-</button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty('${item.name}', 1)">+</button>
                        <button class="remove-btn" onclick="removeItem('${item.name}')">&times;</button>
                    </div>
                </div>
            `;
        });

        let discountAmount = 0;
        let discountMessage = '';

        let categoryTotal = 0;
        if (categoryDiscountEnabled && categoryDiscountPct > 0 && categoryDiscountCats.length > 0) {
            cart.forEach(item => {
                categoryDiscountCats.forEach(cat => {
                    if (item.category === cat || 
                        (cat === 'japanese' && (item.category === 'japaneseFoods' || item.category === 'japaneseBeverages')) ||
                        (cat === 'korean' && (item.category === 'koreanFoods' || item.category === 'koreanBeverages'))) {
                        categoryTotal += item.price * item.qty;
                    }
                });
            });

            if (categoryTotal > 0) {
                const catDiscountAmount = categoryTotal * (categoryDiscountPct / 100);
                discountAmount = catDiscountAmount;
                const catNames = categoryDiscountCats.map(cat => {
                    return cat === 'japaneseFoods' ? 'Japanese Foods' : 
                           cat === 'japaneseBeverages' ? 'Japanese Beverages' :
                           cat === 'koreanFoods' ? 'Korean Foods' :
                           cat === 'koreanBeverages' ? 'Korean Beverages' :
                           cat === 'japanese' ? 'Japanese Menu' : 'Korean Menu';
                }).join(', ');
                discountMessage = `
                    <div class="cart-discount">
                        <span>🍱 ${catNames} Special!</span>
                        <span>-₱${catDiscountAmount.toFixed(2)} (${categoryDiscountPct}% off)</span>
                    </div>
                `;
            }
        }

        if (discountEnabled && discountTarget > 0 && discountPercent > 0 && discountAmount === 0) {
            if (total >= discountTarget) {
                discountAmount = total * (discountPercent / 100);
                const finalTotal = total - discountAmount;
                discountMessage = `
                    <div class="cart-discount">
                        <span>🎉 Target reached! (₱${discountTarget}+)</span>
                        <span>-₱${discountAmount.toFixed(2)} (${discountPercent}% off)</span>
                    </div>
                `;
                cartTotal.innerHTML = '<span>Total:</span><span>₱' + finalTotal.toFixed(2) + '</span>';
            } else if (!categoryDiscountEnabled) {
                const remaining = discountTarget - total;
                discountMessage = `
                    <div class="cart-progress">
                        <span>💰 Add ₱${remaining.toFixed(2)} more to get ${discountPercent}% off!</span>
                    </div>
                `;
                cartTotal.textContent = '₱' + total.toFixed(2);
            } else {
                cartTotal.textContent = '₱' + total.toFixed(2);
            }
        } else if (discountAmount > 0) {
            const finalTotal = total - discountAmount;
            cartTotal.innerHTML = '<span>Total:</span><span>₱' + finalTotal.toFixed(2) + '</span>';
        } else {
            cartTotal.textContent = '₱' + total.toFixed(2);
        }

        if (discountMessage) {
            html += discountMessage;
        }

        cartItems.innerHTML = html;
        checkoutBtn.disabled = false;
    }

    window.updateQty = updateQty;
    window.removeItem = removeItem;

    function generateOrderNumber() {
        return 'JAKOR-' + Math.floor(100000 + Math.random() * 900000);
    }

    function getCurrentDate() {
        const now = new Date();
        return now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    checkoutBtn.addEventListener('click', function() {
        if (cart.length > 0) {
            let total = 0;
            let receiptHtml = '';

            cart.forEach(item => {
                const itemTotal = item.price * item.qty;
                total += itemTotal;
                
                receiptHtml += `
                    <div class="receipt-item">
                        <span class="receipt-item-name">${item.name}</span>
                        <span class="receipt-item-qty">x${item.qty}</span>
                        <span class="receipt-item-price">₱${itemTotal.toFixed(2)}</span>
                    </div>
                `;
            });

            let discountAmount = 0;
            let finalTotal = total;
            let appliedDiscount = '';

            if (categoryDiscountEnabled && categoryDiscountPct > 0 && categoryDiscountCats.length > 0) {
                let categoryTotal = 0;
                cart.forEach(item => {
                    categoryDiscountCats.forEach(cat => {
                        if (item.category === cat || 
                            (cat === 'japanese' && (item.category === 'japaneseFoods' || item.category === 'japaneseBeverages')) ||
                            (cat === 'korean' && (item.category === 'koreanFoods' || item.category === 'koreanBeverages'))) {
                            categoryTotal += item.price * item.qty;
                        }
                    });
                });

                if (categoryTotal > 0) {
                    discountAmount = categoryTotal * (categoryDiscountPct / 100);
                    finalTotal = total - discountAmount;
                    const catNames = categoryDiscountCats.map(cat => {
                        return cat === 'japaneseFoods' ? 'Japanese Foods' : 
                               cat === 'japaneseBeverages' ? 'Japanese Beverages' :
                               cat === 'koreanFoods' ? 'Korean Foods' :
                               cat === 'koreanBeverages' ? 'Korean Beverages' :
                               cat === 'japanese' ? 'Japanese Menu' : 'Korean Menu';
                    }).join(', ');
                    appliedDiscount = catNames;
                }
            }

            if (discountAmount === 0 && discountEnabled && discountTarget > 0 && discountPercent > 0 && total >= discountTarget) {
                discountAmount = total * (discountPercent / 100);
                finalTotal = total - discountAmount;
                appliedDiscount = 'Volume Discount';
            }

            if (discountAmount > 0) {
                receiptHtml += `
                    <div class="receipt-discount">
                        <span>${appliedDiscount ? appliedDiscount + ' (' + categoryDiscountPct + '% off)' : 'Discount'}</span>
                        <span>-₱${discountAmount.toFixed(2)}</span>
                    </div>
                `;
            }

            orderNumber.textContent = generateOrderNumber();
            orderDate.textContent = getCurrentDate();
            receiptItems.innerHTML = receiptHtml;
            receiptTotal.textContent = '₱' + finalTotal.toFixed(2);
            
            receiptModal.classList.add('active');
        }
    });

    closeReceipt.addEventListener('click', function() {
        receiptModal.classList.remove('active');
        cart = [];
        renderCart();
    });

    receiptModal.addEventListener('click', function(e) {
        if (e.target === receiptModal) {
            receiptModal.classList.remove('active');
            cart = [];
            renderCart();
        }
    });

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const receiptHeader = receiptPanel;

    receiptHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    receiptHeader.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === receiptHeader || receiptHeader.contains(e.target)) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, receiptPanel);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
});
