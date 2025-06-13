document.addEventListener("DOMContentLoaded", () => {
    const productListDiv = document.getElementById("product-list");
    const productDetailSection = document.getElementById("product-detail");
    const detailContentDiv = document.getElementById("detail-content");
    const backToProductsButton = document.getElementById("back-to-products");
    const cartSection = document.getElementById("cart");
    const cartItemsDiv = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-button");
    const checkoutSection = document.getElementById("checkout");
    const checkoutForm = document.getElementById("checkout-form");
    const pixKeySpan = document.getElementById("pix-key");
    const pixAmountSpan = document.getElementById("pix-amount");
    const adminSection = document.getElementById("admin");
    const productForm = document.getElementById("product-form");
    const adminProductList = document.getElementById("admin-product-list");
    const searchInput = document.getElementById("search-input");
    const categoryFilter = document.getElementById("category-filter");

    const checkoutItemsDiv = document.getElementById("checkout-items");
    const checkoutTotalSpan = document.getElementById("checkout-total");

    let products = [];
    let cart = [];
    let orders = [];

    const saveProducts = () => {
        localStorage.setItem("products", JSON.stringify(products));
    };

    const loadProducts = async () => {
        try {
            // Primeiro tenta carregar do localStorage
            const storedProducts = localStorage.getItem("products");
            if (storedProducts) {
                products = JSON.parse(storedProducts);
                renderProducts();
                renderAdminProducts();
                updateCategoryFilter();
                return;
            }

            // Se não há produtos no localStorage, carrega do JSON
            const response = await fetch('products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            products = await response.json();
            saveProducts(); // Salva no localStorage para futuras edições
            renderProducts();
            renderAdminProducts();
            updateCategoryFilter();
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            productListDiv.innerHTML = "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
        }
    };

    const renderProducts = (productsToRender = products) => {
        productListDiv.innerHTML = "";
        productsToRender.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src=\'https://via.placeholder.com/300x300?text=Imagem+Nao+Disponivel\';">
                ${product.category ? `<div class="category">${product.category}</div>` : ''}
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
                <button data-id="${product.id}" class="add-to-cart">Adicionar ao Carrinho</button>
                <button data-id="${product.id}" class="view-details">Ver Detalhes</button>
            `;
            productListDiv.appendChild(productCard);

            productCard.querySelector(".add-to-cart").addEventListener("click", (e) => {
                addToCart(e.target.dataset.id);
            });

            productCard.querySelector(".view-details").addEventListener("click", (e) => {
                showProductDetails(e.target.dataset.id);
            });
        });
    };

    const updateCategoryFilter = () => {
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    };

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

    // Event listeners para busca e filtro
    searchInput.addEventListener("input", filterProducts);
    categoryFilter.addEventListener("change", filterProducts);

    // Remove a função loadStaticProducts, pois os produtos serão carregados do JSON
    // e renderizados dinamicamente.

    const loadCart = () => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            cart = JSON.parse(storedCart);
            renderCart();
        }
    };

    const saveCart = () => {
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    };

    const loadOrders = () => {
        const storedOrders = localStorage.getItem("orders");
        if (storedOrders) {
            orders = JSON.parse(storedOrders);
        }
    };

    const saveOrders = () => {
        localStorage.setItem("orders", JSON.stringify(orders));
    };

    const showProductDetails = (productId) => {
        const product = products.find(p => p.id == productId);
        if (product) {
            detailContentDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x300?text=Imagem+Nao+Disponivel';">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
                <button data-id="${product.id}" class="add-to-cart">Adicionar ao Carrinho</button>
            `;
            document.querySelector("#product-detail .add-to-cart").addEventListener("click", (e) => {
                addToCart(e.target.dataset.id);
            });
            productDetailSection.classList.remove("hidden");
            document.getElementById("products").classList.add("hidden");
            cartSection.classList.add("hidden");
            checkoutSection.classList.add("hidden");
            adminSection.classList.add("hidden");
        }
    };

    backToProductsButton.addEventListener("click", () => {
        productDetailSection.classList.add("hidden");
        document.getElementById("products").classList.remove("hidden");
    });

    const addToCart = (productId) => {
        const product = products.find(p => p.id == productId);
        if (product) {
            const existingItem = cart.find(item => item.id == productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            saveCart();
            alert(`${product.name} adicionado ao carrinho!`);
        }
    };

    const renderCart = () => {
        cartItemsDiv.innerHTML = "";
        let total = 0;
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = "<p>Seu carrinho está vazio.</p>";
        } else {
            cart.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("cart-item");
                itemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">R$ ${item.price.toFixed(2)} cada</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-qty" data-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-qty" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-actions">
                        <span class="item-total">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                        <button data-id="${item.id}" class="remove-item-btn">Remover</button>
                    </div>
                `;
                cartItemsDiv.appendChild(itemDiv);
                total += item.price * item.quantity;
            });
        }
        cartTotalSpan.textContent = total.toFixed(2);

        // Event listeners para botões de quantidade
        document.querySelectorAll(".increase-qty").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.dataset.id;
                increaseQuantity(productId);
            });
        });

        document.querySelectorAll(".decrease-qty").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.dataset.id;
                decreaseQuantity(productId);
            });
        });

        // Event listeners para remover itens
        document.querySelectorAll(".remove-item-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.dataset.id;
                removeFromCart(productId);
            });
        });
    };

    const increaseQuantity = (productId) => {
        const item = cart.find(item => item.id == productId);
        if (item) {
            item.quantity++;
            saveCart();
        }
    };

    const decreaseQuantity = (productId) => {
        const item = cart.find(item => item.id == productId);
        if (item && item.quantity > 1) {
            item.quantity--;
            saveCart();
        }
    };

    const clearCart = () => {
        if (cart.length > 0 && confirm("Tem certeza que deseja limpar o carrinho?")) {
            cart = [];
            saveCart();
            alert("Carrinho limpo com sucesso!");
        }
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id != productId);
        saveCart();
    };

    const renderCheckoutSummary = () => {
        checkoutItemsDiv.innerHTML = "";
        let total = 0;
        
        cart.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("checkout-item");
            itemDiv.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
            `;
            checkoutItemsDiv.appendChild(itemDiv);
            total += item.price * item.quantity;
        });
        
        checkoutTotalSpan.textContent = total.toFixed(2);
        pixAmountSpan.textContent = total.toFixed(2);
    };

    const clearCartButton = document.getElementById("clear-cart");
    clearCartButton.addEventListener("click", clearCart);

    checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
            return;
        }
        document.getElementById("products").classList.add("hidden");
        productDetailSection.classList.add("hidden");
        cartSection.classList.add("hidden");
        adminSection.classList.add("hidden");
        checkoutSection.classList.remove("hidden");
        renderCheckoutSummary();
    });

    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const order = {
            id: Date.now().toString(),
            customerName: document.getElementById("name").value,
            deliveryAddress: document.getElementById("address").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            items: cart,
            total: parseFloat(checkoutTotalSpan.textContent),
            pixKey: "707.417.241-38",
            favorecido: "Glennys Garcia Moya",
            timestamp: new Date().toISOString()
        };
        orders.push(order);
        saveOrders();
        alert("Pedido realizado com sucesso! Envie o comprovante PIX para o WhatsApp (11) 96433-8381. Glennys entrará em contato em breve!");
        console.log("Novo Pedido:", order);
        cart = [];
        saveCart();
        checkoutForm.reset();
        document.getElementById("products").classList.remove("hidden");
        checkoutSection.classList.add("hidden");
    });

    const renderAdminProducts = () => {
        adminProductList.innerHTML = "";
        products.forEach(product => {
            const listItem = document.createElement("div");
            listItem.classList.add("admin-product-item");
            listItem.innerHTML = `
                <div class="product-info">
                    <strong>${product.name}</strong> - R$ ${product.price.toFixed(2)}
                    ${product.category ? `<br><small>Categoria: ${product.category}</small>` : ''}
                </div>
                <div class="product-actions">
                    <button data-id="${product.id}" class="edit-product">Editar</button>
                    <button data-id="${product.id}" class="delete-product">Excluir</button>
                </div>
            `;
            adminProductList.appendChild(listItem);
        });

        document.querySelectorAll(".edit-product").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.dataset.id;
                editProduct(productId);
            });
        });

        document.querySelectorAll(".delete-product").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.dataset.id;
                if (confirm("Tem certeza que deseja excluir este produto?")) {
                    products = products.filter(p => p.id != productId);
                    saveProducts();
                    renderProducts();
                    renderAdminProducts();
                    updateCategoryFilter();
                    alert("Produto removido com sucesso!");
                }
            });
        });
    };

    productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const productId = document.getElementById("product-id").value;
        const productCategory = document.getElementById("product-category").value;
        const productName = document.getElementById("product-name").value;
        const productDescription = document.getElementById("product-description").value;
        const productPrice = parseFloat(document.getElementById("product-price").value);
        const productImage = document.getElementById("product-image").value;

        // Validações
        if (!productCategory) {
            alert("Por favor, selecione uma categoria.");
            return;
        }
        if (!productName.trim()) {
            alert("Por favor, insira o nome do produto.");
            return;
        }
        if (!productDescription.trim()) {
            alert("Por favor, insira a descrição do produto.");
            return;
        }
        if (isNaN(productPrice) || productPrice <= 0) {
            alert("Por favor, insira um preço válido.");
            return;
        }
        if (!productImage.trim()) {
            alert("Por favor, insira a URL da imagem.");
            return;
        }

        const product = {
            id: productId || Date.now().toString(),
            category: productCategory,
            name: productName,
            description: productDescription,
            price: productPrice,
            image: productImage
        };

        const index = products.findIndex(p => p.id == product.id);
        if (index !== -1) {
            products[index] = product;
        } else {
            products.push(product);
        }

        saveProducts();
        renderProducts();
        renderAdminProducts();
        updateCategoryFilter();
        productForm.reset();
        document.getElementById("product-id").value = "";
        alert("Produto salvo com sucesso!");
    });

    const editProduct = (productId) => {
        const product = products.find(p => p.id == productId);
        if (product) {
            document.getElementById("product-id").value = product.id;
            document.getElementById("product-category").value = product.category || "";
            document.getElementById("product-name").value = product.name;
            document.getElementById("product-description").value = product.description;
            document.getElementById("product-price").value = product.price;
            document.getElementById("product-image").value = product.image;
        }
    };

    // Navegação
    document.querySelector("nav ul li a[href=\"#products\"]").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("products").classList.remove("hidden");
        productDetailSection.classList.add("hidden");
        cartSection.classList.add("hidden");
        checkoutSection.classList.add("hidden");
        adminSection.classList.add("hidden");
    });

    document.querySelector("nav ul li a[href=\"#cart\"]").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("products").classList.add("hidden");
        productDetailSection.classList.add("hidden");
        cartSection.classList.remove("hidden");
        checkoutSection.classList.add("hidden");
        adminSection.classList.add("hidden");
        renderCart();
    });

    document.querySelector("nav ul li a[href=\"#admin\"]").addEventListener("click", (e) => {
        e.preventDefault();
        const password = prompt("Digite a senha para acessar a área de administração:");
        if (password === "suasenha123") {
            document.getElementById("products").classList.add("hidden");
            productDetailSection.classList.add("hidden");
            cartSection.classList.add("hidden");
            checkoutSection.classList.add("hidden");
            adminSection.classList.remove("hidden");
            renderAdminProducts();
        } else {
            alert("Senha incorreta!");
        }
    });

    
    // Botão de exportação de produtos
    const exportButton = document.createElement("button");
    exportButton.textContent = "Exportar produtos (JSON)";
    exportButton.style.marginTop = "15px";
    exportButton.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "products.json");
        downloadAnchor.click();
    });
    adminSection.appendChild(exportButton);


    // Inicialização
    loadProducts();
    loadCart();
    loadOrders();
});
