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

    // --- FUNÇÕES: Definidas antes de serem chamadas ---

    // Utilitários de persistência
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const saveProducts = () => {
        localStorage.setItem('products', JSON.stringify(products));
    };

    // Notificações
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

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
                    animation: slideIn 0.3s ease forwards;
                }
                .notification-success { background: var(--success-color); }
                .notification-error { background: var(--error-color); }
                .notification-info { background: var(--primary-color); }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // Renderização de produtos (principal)
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
                        <button onclick="window.addToCart(${product.id})" class="btn-primary">
                            <i class="fas fa-shopping-cart"></i> Adicionar
                        </button>
                        <button onclick="window.showProductDetail(${product.id})" class="btn-secondary">
                            <i class="fas fa-eye"></i> Detalhes
                        </button>
                    </div>
                </div>
            `;
            productListDiv.appendChild(productCard);
        });
    };

    // Renderização de produtos (admin)
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
                    <button onclick="window.editProduct(${product.id})" class="edit-product">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="window.deleteProduct(${product.id})" class="delete-product">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            adminProductList.appendChild(productItem);
        });
    };

    // Atualização de categorias para filtro
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

    // Filtro de produtos
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

    // Carregamento de produtos
    const loadProducts = async () => {
        let loadedFromJSON = false;
        try {
            const response = await fetch('./products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            products = await response.json();
            loadedFromJSON = true;
            console.log("Produtos carregados do products.json");
        } catch (error) {
            console.error("Erro ao carregar produtos do products.json:", error);
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                products = JSON.parse(storedProducts);
                console.log("Produtos carregados do localStorage como fallback.");
            } else {
                console.log("Nenhum produto encontrado, usando dados padrão.");
                products = [
                    {
                        id: 1,
                        name: "Anel de Prata Elegante",
                        description: "Anel de prata legítima com design moderno e sofisticado, perfeito para ocasiões especiais",
                        price: 125.20,
                        image: "images/jewelry-rings.jpg",
                        category: "Anéis"
                    },
                    {
                        id: 2,
                        name: "Colar Dourado Delicado",
                        description: "Colar folheado a ouro com pingente em formato de coração, ideal para o dia a dia",
                        price: 89.90,
                        image: "images/jewelry-necklaces.jpg",
                        category: "Colares"
                    },
                    {
                        id: 3,
                        name: "Pulseira Charm Dourada",
                        description: "Pulseira com charms delicados, perfeita para compor looks elegantes",
                        price: 156.50,
                        image: "images/jewelry-bracelets.jpg",
                        category: "Pulseiras"
                    },
                    {
                        id: 4,
                        name: "Conjunto Completo Dourado",
                        description: "Conjunto com colar, brincos e pulseira em tom dourado, para ocasiões especiais",
                        price: 299.90,
                        image: "images/jewelry-set-1.jpg",
                        category: "Conjuntos"
                    },
                    {
                        id: 5,
                        name: "Brincos Argola Dourados",
                        description: "Brincos argola em tom dourado, clássicos e versáteis para qualquer ocasião",
                        price: 67.80,
                        image: "images/jewelry-rings.jpg",
                        category: "Brincos"
                    },
                    {
                        id: 6,
                        name: "Anel Solitário Prata",
                        description: "Anel solitário em prata com pedra cristal, elegante e sofisticado",
                        price: 198.00,
                        image: "images/jewelry-rings.jpg",
                        category: "Anéis"
                    },
                    {
                        id: 7,
                        name: "Colar Corrente Grossa",
                        description: "Colar corrente grossa dourada, tendência atual para looks modernos",
                        price: 134.90,
                        image: "images/jewelry-necklaces.jpg",
                        category: "Colares"
                    },
                    {
                        id: 8,
                        name: "Pulseira Tênis Dourada",
                        description: "Pulseira tênis com pedras cristal, brilho e elegância em uma só peça",
                        price: 245.00,
                        image: "images/jewelry-bracelets.jpg",
                        category: "Pulseiras"
                    }
                ];
                saveProducts();
            }
        }

        if (loadedFromJSON) {
            const adminModifiedProducts = localStorage.getItem('products');
            if (adminModifiedProducts) {
                const parsedAdminProducts = JSON.parse(adminModifiedProducts);
                const mergedProducts = new Map(products.map(p => [p.id, p]));
                parsedAdminProducts.forEach(p => mergedProducts.set(p.id, p));
                products = Array.from(mergedProducts.values());
                console.log("Produtos mesclados com alterações do localStorage.");
            }
        }

        renderProducts();
        renderAdminProducts();
        updateCategoryFilter();
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
                    <button onclick="window.addToCart(${product.id})" class="btn-primary btn-large">
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

    // Carrinho de compras: Adicionar
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

    // Carrinho de compras: Atualizar display
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
                        <button onclick="window.updateQuantity(${item.id}, -1)" class="quantity-btn">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button onclick="window.updateQuantity(${item.id}, 1)" class="quantity-btn">+</button>
                    </div>
                    <div class="cart-item-total">
                        R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </div>
                    <button onclick="window.removeFromCart(${item.id})" class="remove-item-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartItemsDiv.appendChild(cartItem);
            });
        }

        // Atualizar totais
        const subtotal = cart.reduce
