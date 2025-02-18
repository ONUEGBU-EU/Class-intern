// cart.js - Shopping cart functionality for ShopEase

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    displayCart();
    
    // Event delegation for cart item actions
    document.getElementById('cart-items').addEventListener('click', function(e) {
        // Handle remove item button
        if (e.target.classList.contains('remove-item') || e.target.parentElement.classList.contains('remove-item')) {
            const itemId = e.target.closest('.cart-item').dataset.id;
            removeFromCart(itemId);
        }
        
        // Handle quantity increase button
        if (e.target.classList.contains('quantity-increase') || e.target.parentElement.classList.contains('quantity-increase')) {
            const itemId = e.target.closest('.cart-item').dataset.id;
            updateQuantity(itemId, 1);
        }
        
        // Handle quantity decrease button
        if (e.target.classList.contains('quantity-decrease') || e.target.parentElement.classList.contains('quantity-decrease')) {
            const itemId = e.target.closest('.cart-item').dataset.id;
            updateQuantity(itemId, -1);
        }
    });
    
    // Handle coupon application
    document.getElementById('apply-coupon').addEventListener('click', function() {
        applyCoupon();
    });
    
    // Setup checkout button
    setupCheckoutButton();
});

// Function to get cart items from local storage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
}

// Function to save cart items to local storage
function saveCartItems(cartItems) {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// Function to display cart items
function displayCart() {
    const cartItems = getCartItems();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const emptyCartMessage = document.getElementById('cart-empty-message');
    const cartItemsSection = document.getElementById('cart-items-container');
    
    // Update cart count
    cartCount.innerText = cartItems.length;
    
    // Show empty cart message if cart is empty
    if (cartItems.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartItemsSection.classList.add('hidden');
        return;
    } else {
        emptyCartMessage.classList.add('hidden');
        cartItemsSection.classList.remove('hidden');
    }
    
    // Clear cart items container
    cartItemsContainer.innerHTML = '';
    
    // Add cart items to the container
    cartItems.forEach(item => {
        const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
        
        const cartItemHTML = `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-product">
                    <img src="/api/placeholder/80/80" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p class="item-id">ID: ${item.id}</p>
                    </div>
                </div>
                <div class="item-price">$${parseFloat(item.price).toFixed(2)}</div>
                <div class="item-quantity">
                    <button class="quantity-decrease"><i class="fas fa-minus"></i></button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-increase"><i class="fas fa-plus"></i></button>
                </div>
                <div class="item-total">$${itemTotal}</div>
                <div class="item-action">
                    <button class="remove-item"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        cartItemsContainer.innerHTML += cartItemHTML;
    });
    
    // Update cart summary
    updateCartSummary();
}

// Function to update cart summary (subtotal, shipping, tax, total)
function updateCartSummary() {
    const cartItems = getCartItems();
    
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    
    // Calculate shipping (free over $100, otherwise $10)
    const shipping = subtotal > 100 ? 0 : 10;
    
    // Calculate tax (10% of subtotal)
    const tax = subtotal * 0.1;
    
    // Calculate total
    const total = subtotal + shipping + tax;
    
    // Update display
    document.getElementById('subtotal-amount').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping-amount').innerText = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.getElementById('tax-amount').innerText = `$${tax.toFixed(2)}`;
    
    // Check if total-amount element exists (might be missing in your HTML)
    const totalAmountElement = document.getElementById('total-amount');
    if (totalAmountElement) {
        totalAmountElement.innerText = `$${total.toFixed(2)}`;
    }
    
    // Enable/disable checkout button based on cart contents
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.disabled = cartItems.length === 0;
    }
}

// Function to remove item from cart
function removeFromCart(itemId) {
    const cartItems = getCartItems();
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    
    saveCartItems(updatedItems);
    displayCart();
}

// Function to update item quantity
function updateQuantity(itemId, change) {
    const cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    // Update quantity
    cartItems[itemIndex].quantity += change;
    
    // If quantity drops to 0 or below, remove the item
    if (cartItems[itemIndex].quantity <= 0) {
        cartItems.splice(itemIndex, 1);
    }
    
    saveCartItems(cartItems);
    displayCart();
}

// Function to apply coupon
function applyCoupon() {
    const couponInput = document.getElementById('coupon-code');
    const couponCode = couponInput.value.trim().toUpperCase();
    
    // Simulated coupon codes (in a real app, these would be validated server-side)
    const validCoupons = {
        'WELCOME10': 0.1,   // 10% off
        'SALE20': 0.2,      // 20% off
        'SPRING30': 0.3     // 30% off
    };
    
    if (couponCode in validCoupons) {
        const discount = validCoupons[couponCode];
        applyCouponDiscount(discount);
        
        // Show success message
        alert(`Coupon "${couponCode}" applied successfully! You've received a ${discount * 100}% discount.`);
        couponInput.value = '';
    } else if (couponCode === '') {
        alert('Please enter a coupon code.');
    } else {
        alert('Invalid coupon code. Please try again.');
    }
}

// Function to apply coupon discount
function applyCouponDiscount(discountRate) {
    const cartItems = getCartItems();
    const subtotalElement = document.getElementById('subtotal-amount');
    const subtotalText = subtotalElement.innerText;
    const subtotal = parseFloat(subtotalText.replace('$', ''));
    
    // Calculate discount
    const discountAmount = subtotal * discountRate;
    
    // Calculate new subtotal
    const newSubtotal = subtotal - discountAmount;
    
    // Update display
    subtotalElement.innerText = `$${newSubtotal.toFixed(2)} (${discountRate * 100}% off applied)`;
    
    // Recalculate tax, shipping, and total
    updateCartSummary();
}

// Function to setup checkout button
function setupCheckoutButton() {
    const checkoutButton = document.getElementById('checkout-button');
    
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            // In a real application, this would redirect to a checkout page
            // or initiate the checkout process
            
            const cartItems = getCartItems();
            
            if (cartItems.length === 0) {
                alert('Your cart is empty. Please add items before checking out.');
                return;
            }
            
            alert('Proceeding to checkout...\n\nIn a real application, you would be redirected to a secure checkout page to complete your purchase.');
            
            // Simulate successful checkout
            if (confirm('Simulate a successful purchase? This will clear your cart.')) {
                // Clear cart
                localStorage.removeItem('cartItems');
                
                // Show confirmation
                alert('Thank you for your purchase! Your order has been placed successfully.');
                
                // Redirect to home page (in a real app, this might go to an order confirmation page)
                window.location.href = 'home.html';
            }
        });
    }
}

// Additional utility functions for a more complete cart experience

// Calculate total items in cart (accounting for quantities)
function getTotalItemsCount() {
    const cartItems = getCartItems();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
}

// Function to add an item to cart (for use on product pages)
function addToCart(productId, productName, productPrice, quantity = 1) {
    const cartItems = getCartItems();
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += quantity;
    } else {
        // Add new item if it doesn't exist
        cartItems.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: quantity
        });
    }
    
    saveCartItems(cartItems);
    
    // Update cart count if on a non-cart page
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = cartItems.length;
    }
    
    return cartItems;
}

// Function to clear the entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        localStorage.removeItem('cartItems');
        displayCart();
    }
}