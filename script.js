document.addEventListener('DOMContentLoaded', () => {

    // --- CONSTANTS AND STATE ---
    const API_URL = 'http://localhost:5000/api';
    let token = localStorage.getItem('token');
    let currentUser = JSON.parse(localStorage.getItem('user'));
    let allProducts = [];
    let cart = [];
    let currentFarmerForPayment = null; // To store farmer info for confirmation

    // --- ELEMENT SELECTORS ---
    const loginNavBtn = document.getElementById('login-nav-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModalBtn = document.getElementById('close-payment-modal');
    const customerView = document.getElementById('customer-view');
    const farmerView = document.getElementById('farmer-view');
    const productGrid = document.getElementById('product-grid');
    const farmerProductList = document.getElementById('farmer-product-list');
    const customerTabBtn = document.getElementById('customer-tab-btn');
    const farmerTabBtn = document.getElementById('farmer-tab-btn');
    const customerForms = document.getElementById('customer-forms');
    const farmerForms = document.getElementById('farmer-forms');
    const customerLoginForm = document.getElementById('customer-login-form');
    const farmerLoginForm = document.getElementById('farmer-login-form');
    const customerSignupForm = document.getElementById('customer-signup-form');
    const farmerSignupForm = document.getElementById('farmer-signup-form');
    const showCustomerSignup = document.getElementById('show-customer-signup');
    const showCustomerLogin = document.getElementById('show-customer-login');
    const showFarmerSignup = document.getElementById('show-farmer-signup');
    const showFarmerLogin = document.getElementById('show-farmer-login');
    const showAddProductBtn = document.getElementById('show-add-product-btn');
    const addProductForm = document.getElementById('add-product-form');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const vegImageUpload = document.getElementById('veg-image-upload');
    const imagePreview = document.getElementById('image-preview');

    // --- GOOGLE OAUTH HANDLER ---
    const checkUrlForToken = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedToken = urlParams.get('token');
        const receivedUser = urlParams.get('user');
        if (receivedToken && receivedUser) {
            localStorage.setItem('token', receivedToken);
            localStorage.setItem('user', decodeURIComponent(receivedUser));
            window.history.replaceState({}, document.title, window.location.pathname);
            token = receivedToken;
            currentUser = JSON.parse(decodeURIComponent(receivedUser));
        }
    };

    // --- RENDER & UI FUNCTIONS ---
    const updateUIForUser = () => {
        if (currentUser && currentUser.name) {
            loginNavBtn.textContent = `Logout (${currentUser.name})`;
            loginModal.classList.add('hidden');
            if (currentUser.role === 'farmer') {
                customerView.classList.add('hidden');
                farmerView.classList.remove('hidden');
                document.getElementById('cart-view').classList.add('hidden');
            } else {
                customerView.classList.remove('hidden');
                farmerView.classList.add('hidden');
                document.getElementById('cart-view').classList.remove('hidden');
            }
        } else {
            loginNavBtn.textContent = 'Login / Sign Up';
            customerView.classList.remove('hidden');
            farmerView.classList.add('hidden');
            document.getElementById('cart-view').classList.remove('hidden');
        }
    };

    const renderProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            const products = await res.json();
            allProducts = products;
            productGrid.innerHTML = '';
            if (products.length === 0) {
                productGrid.innerHTML = '<p>No fresh produce listed yet. Check back soon!</p>';
                return;
            }
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${API_URL.replace('/api', '')}/${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>From: ${product.farmer.farmName || product.farmer.name}</p>
                    <p class="price">₹${product.price.toFixed(2)} / ${product.unit}</p>
                    <a href="#" class="compare-link" data-veg-name="${product.name}" data-farmer-price="${product.price}">Compare National Price</a>
                    <p class="harvest-time">Harvested: ${new Date(product.harvestDate).toLocaleDateString()}</p>
                    <button class="add-to-cart-btn" data-id="${product._id}">Add to Cart</button>
                `;
                productGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<p>Could not load products. Is the backend server running?</p>';
        }
    };

    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalContainer.classList.add('hidden');
            return;
        }
        const groupedByFarmer = cart.reduce((acc, cartItem) => {
            const farmerId = cartItem.product.farmer._id;
            if (!acc[farmerId]) {
                acc[farmerId] = {
                    farmerDetails: cartItem.product.farmer,
                    items: [],
                    subtotal: 0
                };
            }
            acc[farmerId].items.push(cartItem);
            acc[farmerId].subtotal += cartItem.product.price;
            return acc;
        }, {});
        for (const farmerId in groupedByFarmer) {
            const group = groupedByFarmer[farmerId];
            const farmerCartGroup = document.createElement('div');
            farmerCartGroup.className = 'farmer-cart-group';
            let itemsHtml = group.items.map(cartItem => `
                <div class="cart-item">
                    <span>${cartItem.product.name}</span>
                    <div class="cart-item-details" style="display:flex; align-items:center;">
                        <span style="margin-right:10px;">₹${cartItem.product.price.toFixed(2)}</span>
                        <button class="remove-from-cart-btn" data-cart-item-id="${cartItem.cartItemId}" title="Remove item">×</button>
                    </div>
                </div>
            `).join('');
            farmerCartGroup.innerHTML = `
                <h4>From: ${group.farmerDetails.farmName || group.farmerDetails.name}</h4>
                ${itemsHtml}
                <div class="cart-subtotal">
                    <strong>Subtotal: ₹${group.subtotal.toFixed(2)}</strong>
                </div>
                <button class="pay-farmer-btn" data-farmer-id="${farmerId}">Pay this Farmer</button>
            `;
            cartItemsContainer.appendChild(farmerCartGroup);
        }
        cartTotalContainer.classList.add('hidden');
    };

    const handleLogin = async (e, role) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Login failed');
            if (data.user.role !== role) {
                throw new Error(`This account is not a ${role} account.`);
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            token = data.token;
            currentUser = data.user;
            loginModal.classList.add('hidden');
            updateUIForUser();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    };

    // --- EVENT LISTENERS ---
    loginNavBtn.addEventListener('click', () => {
        if (currentUser) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            token = null;
            currentUser = null;
            cart = [];
            renderCart();
            updateUIForUser();
        } else {
            loginModal.classList.remove('hidden');
        }
    });

    closeModalBtn.addEventListener('click', () => loginModal.classList.add('hidden'));

    customerTabBtn.addEventListener('click', () => {
        customerTabBtn.classList.add('active');
        farmerTabBtn.classList.remove('active');
        customerForms.classList.remove('hidden');
        farmerForms.classList.add('hidden');
    });

    farmerTabBtn.addEventListener('click', () => {
        farmerTabBtn.classList.add('active');
        customerTabBtn.classList.remove('active');
        farmerForms.classList.remove('hidden');
        customerForms.classList.add('hidden');
    });

    showCustomerSignup.addEventListener('click', (e) => { e.preventDefault(); customerLoginForm.classList.add('hidden'); customerSignupForm.classList.remove('hidden'); });
    showCustomerLogin.addEventListener('click', (e) => { e.preventDefault(); customerSignupForm.classList.add('hidden'); customerLoginForm.classList.remove('hidden'); });
    showFarmerSignup.addEventListener('click', (e) => { e.preventDefault(); farmerLoginForm.classList.add('hidden'); farmerSignupForm.classList.remove('hidden'); });
    showFarmerLogin.addEventListener('click', (e) => { e.preventDefault(); farmerSignupForm.classList.add('hidden'); farmerLoginForm.classList.remove('hidden'); });

    customerLoginForm.addEventListener('submit', (e) => handleLogin(e, 'customer'));
    farmerLoginForm.addEventListener('submit', (e) => handleLogin(e, 'farmer'));

    customerSignupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = e.target.elements.name.value;
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        try {
            const res = await fetch(`${API_URL}/auth/register/customer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Signup failed');
            alert('Customer account created! Please sign in.');
            e.target.reset();
            showCustomerLogin.click();
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    });

    farmerSignupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = e.target.elements.name.value;
        const farmName = e.target.elements.farmName.value;
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        const contactNumber = e.target.elements.contactNumber.value;
        try {
            const res = await fetch(`${API_URL}/auth/register/farmer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, farmName, email, password, contactNumber })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Signup failed');
            alert('Farmer account created! Please sign in.');
            e.target.reset();
            showFarmerLogin.click();
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    });

    showAddProductBtn.addEventListener('click', () => addProductForm.classList.toggle('hidden'));

    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addProductForm);
        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || 'Failed to add product.');
            }
            addProductForm.reset();
            imagePreview.classList.add('hidden');
            addProductForm.classList.add('hidden');
            renderProducts();
            alert('Product listed successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    document.getElementById('payment-details-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const upiId = e.target.elements.upiId.value;
        try {
            const res = await fetch(`${API_URL}/users/payment-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ upiId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Failed to update details.');
            alert('Payment details saved successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    productGrid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            if (!token || !currentUser) {
                alert("Please log in or sign up to add products to your cart.");
                loginModal.classList.remove('hidden');
                return;
            }
            const productId = e.target.dataset.id;
            const productToAdd = allProducts.find(p => p._id === productId);
            if (productToAdd) {
                const newCartItem = { cartItemId: Date.now(), product: productToAdd };
                cart.push(newCartItem);
                renderCart();
                alert(`Added "${productToAdd.name}" to your cart!`);
            }
        }
        if (e.target.classList.contains('compare-link')) {
            e.preventDefault();
            if (!token) {
                alert("Please log in to compare prices.");
                return;
            }
            const vegetableName = e.target.dataset.vegName;
            const farmerPrice = parseFloat(e.target.dataset.farmerPrice);
            const originalText = e.target.textContent;
            e.target.textContent = 'Comparing...';
            try {
                const res = await fetch(`${API_URL}/prices/compare/${vegetableName}`, {
                    headers: { 'x-auth-token': token }
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.msg || 'Could not get data.');
                }
                const data = await res.json();
                const nationalAverage = parseFloat(data.nationalAverage);
                let message = `National average for ${vegetableName} is approx. ₹${nationalAverage.toFixed(2)}/kg.`;
                message += `\nThis farmer's price is ₹${farmerPrice.toFixed(2)}/kg.`;
                if (farmerPrice < nationalAverage) {
                    message += `\nThis is a great deal!`;
                } else if (farmerPrice > nationalAverage) {
                    message += `\nYou are paying a premium for fresh, local produce.`;
                }
                alert(message);
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                e.target.textContent = originalText;
            }
        }
    });

    cartItemsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('pay-farmer-btn')) {
            if (!token || !currentUser) {
                alert("Please log in or sign up to proceed with payment.");
                loginModal.classList.remove('hidden');
                return;
            }
            const farmerId = e.target.dataset.farmerId;
            const cartItemFromFarmer = cart.find(item => item.product.farmer._id === farmerId);
            if (!cartItemFromFarmer) return;
            const farmer = cartItemFromFarmer.product.farmer;
            currentFarmerForPayment = farmer;
            document.getElementById('payment-farmer-name').textContent = `Pay ${farmer.farmName || farmer.name}`;
            const upiEl = document.getElementById('payment-upi-id');
            const qrContainer = document.getElementById('qrcode-container');
            qrContainer.innerHTML = '';
            if (farmer.upiId) {
                upiEl.textContent = farmer.upiId;
                const upiUrl = `upi://pay?pa=${farmer.upiId}&pn=${encodeURIComponent(farmer.farmName || farmer.name)}`;
                new QRCode(qrContainer, { text: upiUrl, width: 200, height: 200 });
            } else {
                upiEl.textContent = 'Not provided by farmer.';
                qrContainer.innerHTML = '<p>QR Code not available as UPI ID is not set.</p>';
            }
            paymentModal.classList.remove('hidden');
        }
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const cartItemIdToRemove = parseInt(e.target.dataset.cartItemId);
            cart = cart.filter(item => item.cartItemId !== cartItemIdToRemove);
            renderCart();
        }
    });

    closePaymentModalBtn.addEventListener('click', () => paymentModal.classList.add('hidden'));

    document.getElementById('payment-complete-btn').addEventListener('click', () => {
        let confirmationMessage = 'Thank you! Your order is being processed.';
        if (currentFarmerForPayment && currentFarmerForPayment.contactNumber) {
            confirmationMessage += `\n\nIf you have any queries, you can contact the farmer directly at: ${currentFarmerForPayment.contactNumber}`;
        }
        alert(confirmationMessage);
        paymentModal.classList.add('hidden');
        currentFarmerForPayment = null;
    });

    vegImageUpload.addEventListener('change', () => {
        const file = vegImageUpload.files[0];
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.classList.remove('hidden');
        }
    });

    // --- INITIAL PAGE LOAD ---
    checkUrlForToken();
    updateUIForUser();
    renderProducts();
    renderCart();
});