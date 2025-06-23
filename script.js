document.addEventListener("DOMContentLoaded", () => {
    // Elementos do DOM
    const productListDiv = document.getElementById("product-list");
    const productDetailSection = document.getElementById("product-detail");
    const detailContentDiv = document.getElementById("detail-content");
    const backToProductsButton = document.getElementById("back-to-products");
    const cartSection = document.getElementById("cart");
    const cartItemsDiv = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartSubtotalSpan = document.getElementById("cart-subtotal");
    const cartCountSpan = document.getElementById("cart-count");
    const checkoutButton = document.getElementById("checkout-button");
    const checkoutSection = document.getElementById("checkout");
    const checkoutForm = document.getElementById("checkout-form");
    const pixAmountSpan = document.getElementById("pix-amount");
    const adminSection = document.getElementById("admin");
    const productForm = document.getElementById("product-form");
    const adminProductList = document.getElementById("admin-product-list");
    const searchInput = document.getElementById("search-input");
    const categoryFilter = document.getElementById("category-filter");
    const checkoutItemsDiv = document.getElementById("checkout-items");
    const checkoutTotalSpan = document.getElementById("checkout-total");
    const clearCartButton = document.getElementById("clear-cart");

    // Variáveis globais
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Inicialização
    loadProducts();
    updateCartDisplay();
    setupEventListeners();

    // Carregamento de produtos
    const loadProducts = async () => {
        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            products = await response.json();
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            // Produtos padrão caso não consiga carregar
            products = [
                {
                    id: 1,
                    name: "Anel de Prata Elegante",
                    description: "Anel de prata legítima com design moderno e sofisticado",
                    price: 125.20,
                    image: "images/jewelry-rings.jpg",
                    category: "Anéis"
                },
                {
                    id: 2,
                    name: "Colar Dourado Delicado",
                    description: "Colar folheado a ouro com pingente em formato de coração",
                    price: 89.90,
                    image: "images/jewelry-necklaces.jpg",
                    category: "Colares"
                },
                {
                    id: 3,
                    name: "Pulseira Charm Dourada",
                    description: "Pulseira com charms delicados, perfeita para o dia a dia",
                    price: 156.50,
                    image: "images/jewelry-bracelets.jpg",
                    category: "Pulseiras"
                },
                {
                    id: 4,
                    name: "Conjunto Completo Dourado",
                    description: "Conjunto com colar, brincos e pulseira em tom dourado",
                    price: 299.90,
                    image: "images/jewelry-set-1.jpg",
                    category: "Conjuntos"
                }
            ];
        }
        renderProducts();
        renderAdminProducts();
        updateCategoryFilter();
    };

    // Renderização de produtos
    const renderProducts = (productsToRender = products) => {
        productListDiv.innerHTML = "";
        
        if (productsToRender.length === 0) {
            productListDiv.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p style="font-size: 1.2rem; color: var(--text-light);">Nenhum produto encontrado.</p>
                </div>
            `;
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.onerror=null;this.src='https://via.placeholder.com/300x300/d4af37/ffffff?text=Semi-joia';">
                <div class="product-card-content">
                    ${product.category ? `<div class="category">${product.category}</div>` : ''}
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                    <div class="product-actions">
                        <button onclick="addToCart(${product.id})" class="btn-primary">
                            <i class="fas fa-shopping-cart"></i> Adicionar
                        </button>
                        <button onclick="showProductDetail(${product.id})" class="btn-secondary">
                            <i class="fas fa-eye"></i> Detalhes
                        </button>
                    </div>
                </div>
            `;
            productListDiv.appendChild(productCard);
        });
    };

    // Detalhes do produto
    window.showProductDetail = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        detailContentDiv.innerHTML = `
            <div class="product-detail-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.onerror=null;this.src='https://via.placeholder.com/500x500/d4af37/ffffff?text=Semi-joia';">
            </div>
            <div class="product-detail-info">
                ${product.category ? `<div class="category">${product.category}</div>` : ''}
                <h2>${product.name}</h2>
                <p class="product-description">${product.description}</p>
                <div class="price-section">
                    <div class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                    <div class="payment-options">
                        <p><i class="fas fa-qrcode"></i> PIX: R$ ${(product.price * 0.9).toFixed(2).replace('.', ',')} (10% desconto)</p>
                        <p><i class="fas fa-credit-card"></i> Cartão: até 12x sem juros</p>
                    </div>
                </div>
                <div class="product-actions">
                    <button onclick="addToCart(${product.id})" class="btn-primary btn-large">
                        <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
                    </button>
                    <a href="https://wa.me/5511964338381?text=Olá! Tenho interesse no produto: ${encodeURIComponent(product.name)}" 
                       target="_blank" class="btn-secondary btn-large">
                        <i class="fab fa-whatsapp"></i> Consultar no WhatsApp
                    </a>
                </div>
            </div>
        `;

        showSection('product-detail');
    };

    // Carrinho de compras
    window.addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        updateCartDisplay();
        showNotification(`${product.name} adicionado ao carrinho!`, 'success');
    };

    const updateCartDisplay = () => {
        // Atualizar contador do carrinho
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;

        // Renderizar itens do carrinho
        cartItemsDiv.innerHTML = "";
        
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--text-light); margin-bottom: 20px;"></i>
                    <p style="font-size: 1.2rem; color: var(--text-light);">Seu carrinho está vazio</p>
                    <a href="#products" onclick="showSection('products')" class="btn-primary" style="margin-top: 20px;">
                        Continuar Comprando
                    </a>
                </div>
            `;
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement("div");
                cartItem.classList.add("cart-item");
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/80x80/d4af37/ffffff?text=Item';">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${item.id}, -1)" class="quantity-btn">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" class="quantity-btn">+</button>
                    </div>
                    <div class="cart-item-total">
                        R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="remove-item-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartItemsDiv.appendChild(cartItem);
            });
        }

        // Atualizar totais
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartSubtotalSpan.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        cartTotalSpan.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        
        // Atualizar checkout
        updateCheckoutDisplay();
    };

    window.updateQuantity = (productId, change) => {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartDisplay();
        }
    };

    window.removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
        showNotification('Item removido do carrinho', 'info');
    };

    // Checkout
    const updateCheckoutDisplay = () => {
        checkoutItemsDiv.innerHTML = "";
        
        cart.forEach(item => {
            const checkoutItem = document.createElement("div");
            checkoutItem.classList.add("checkout-item");
            checkoutItem.innerHTML = `
                <span>${item.name} (${item.quantity}x)</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            `;
            checkoutItemsDiv.appendChild(checkoutItem);
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const pixTotal = total * 0.9; // 10% desconto PIX
        
        checkoutTotalSpan.textContent = total.toFixed(2).replace('.', ',');
        pixAmountSpan.textContent = pixTotal.toFixed(2).replace('.', ',');
    };

    // Navegação
    const showSection = (sectionName) => {
        // Esconder todas as seções
        document.querySelectorAll('main > section').forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar seção específica
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Event Listeners
    const setupEventListeners = () => {
        // Navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                showSection(target);
            });
        });

        // Botões de navegação
        backToProductsButton.addEventListener('click', () => showSection('products'));
        
        // Busca e filtros
        searchInput.addEventListener('input', filterProducts);
        categoryFilter.addEventListener('change', filterProducts);

        // Carrinho
        clearCartButton.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                cart = [];
                saveCart();
                updateCartDisplay();
                showNotification('Carrinho limpo', 'info');
            }
        });

        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Seu carrinho está vazio!', 'error');
                return;
            }
            showSection('checkout');
        });

        // Checkout form
        checkoutForm.addEventListener('submit', handleCheckout);

        // Admin form
        productForm.addEventListener('submit', handleProductSubmit);
    };

    // Filtros
    const filterProducts = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filteredProducts = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });

        renderProducts(filteredProducts);
    };

    const updateCategoryFilter = () => {
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        
        categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    };

    // Checkout
    const handleCheckout = (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            showNotification('Seu carrinho está vazio!', 'error');
            return;
        }

        const formData = new FormData(checkoutForm);
        const orderData = {
            id: Date.now(),
            date: new Date().toISOString(),
            customer: {
                name: formData.get('name') || document.getElementById('name').value,
                email: formData.get('email') || document.getElementById('email').value,
                phone: formData.get('phone') || document.getElementById('phone').value,
                address: formData.get('address') || document.getElementById('address').value
            },
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending'
        };

        // Salvar pedido
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Criar mensagem para WhatsApp
        const whatsappMessage = createWhatsAppMessage(orderData);
        const whatsappUrl = `https://wa.me/5511964338381?text=${encodeURIComponent(whatsappMessage)}`;

        // Limpar carrinho
        cart = [];
        saveCart();
        updateCartDisplay();

        // Mostrar confirmação e redirecionar
        showNotification('Pedido confirmado! Redirecionando para WhatsApp...', 'success');
        
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            showSection('products');
        }, 2000);
    };

    const createWhatsAppMessage = (order) => {
        let message = `🛍️ *NOVO PEDIDO - Semi-joias da Glennys*\\n\\n`;
        message += `👤 *Cliente:* ${order.customer.name}\\n`;
        message += `📧 *Email:* ${order.customer.email}\\n`;
        message += `📱 *Telefone:* ${order.customer.phone}\\n`;
        message += `📍 *Endereço:* ${order.customer.address}\\n\\n`;
        
        message += `🛒 *Itens do Pedido:*\\n`;
        order.items.forEach(item => {
            message += `• ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\\n`;
        });
        
        message += `\\n💰 *Total:* R$ ${order.total.toFixed(2).replace('.', ',')}\\n`;
        message += `💳 *PIX (10% desc):* R$ ${(order.total * 0.9).toFixed(2).replace('.', ',')}\\n\\n`;
        message += `📅 *Data:* ${new Date(order.date).toLocaleString('pt-BR')}\\n`;
        message += `🆔 *Pedido:* #${order.id}`;

        return message;
    };

    // Administração
    const handleProductSubmit = (e) => {
        e.preventDefault();
        
        const productData = {
            id: document.getElementById('product-id').value || Date.now(),
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            image: document.getElementById('product-image').value,
            category: document.getElementById('product-category').value
        };

        const existingIndex = products.findIndex(p => p.id == productData.id);
        if (existingIndex >= 0) {
            products[existingIndex] = productData;
            showNotification('Produto atualizado com sucesso!', 'success');
        } else {
            products.push(productData);
            showNotification('Produto adicionado com sucesso!', 'success');
        }

        saveProducts();
        renderProducts();
        renderAdminProducts();
        updateCategoryFilter();
        productForm.reset();
    };

    const renderAdminProducts = () => {
        adminProductList.innerHTML = "";
        
        products.forEach(product => {
            const productItem = document.createElement("div");
            productItem.classList.add("admin-product-item");
            productItem.innerHTML = `
                <div class="product-info">
                    <strong>${product.name}</strong><br>
                    <small>${product.category} - R$ ${product.price.toFixed(2).replace('.', ',')}</small>
                </div>
                <div class="product-actions">
                    <button onclick="editProduct(${product.id})" class="edit-product">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="delete-product">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            adminProductList.appendChild(productItem);
        });
    };

    window.editProduct = (productId) => {
        const product = products.find(p => p.id == productId);
        if (!product) return;

        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-category').value = product.category;
    };

    window.deleteProduct = (productId) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            products = products.filter(p => p.id != productId);
            saveProducts();
            renderProducts();
            renderAdminProducts();
            updateCategoryFilter();
            showNotification('Produto excluído com sucesso!', 'success');
        }
    };

    // Utilitários
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const saveProducts = () => {
        localStorage.setItem('products', JSON.stringify(products));
    };

    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Adicionar estilos se não existirem
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: var(--shadow);
                    animation: slideIn 0.3s ease;
                }
                .notification-success { background: var(--success-color); }
                .notification-error { background: var(--error-color); }
                .notification-info { background: var(--primary-color); }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // Inicializar com seção de produtos
    showSection('products');
});

