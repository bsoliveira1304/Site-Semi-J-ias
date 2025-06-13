
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

    const loadProducts = async () => {
        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            products = await response.json();
            renderProducts();
            renderAdminProducts();
            updateCategoryFilter();
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            productListDiv.innerHTML = "<p>Erro ao carregar produtos.</p>";
        }
    };

    const renderProducts = (productsToRender = products) => {
        productListDiv.innerHTML = "";
        productsToRender.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x300?text=Imagem+Nao+Disponivel';">
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
        const filtered = products.filter(product =>
            (product.name.toLowerCase().includes(searchTerm) ||
             product.description.toLowerCase().includes(searchTerm)) &&
            (!selectedCategory || product.category === selectedCategory)
        );
        renderProducts(filtered);
    };

    searchInput.addEventListener("input", filterProducts);
    categoryFilter.addEventListener("change", filterProducts);

    const addToCart = (productId) => {
        const product = products.find(p => p.id == productId);
        if (product) {
            const item = cart.find(i => i.id == productId);
            if (item) item.quantity++;
            else cart.push({ ...product, quantity: 1 });
            renderCart();
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
        document.querySelectorAll(".increase-qty").forEach(btn => btn.addEventListener("click", e => changeQty(e, 1)));
        document.querySelectorAll(".decrease-qty").forEach(btn => btn.addEventListener("click", e => changeQty(e, -1)));
        document.querySelectorAll(".remove-item-btn").forEach(btn => btn.addEventListener("click", e => removeItem(e)));
    };

    const changeQty = (e, delta) => {
        const item = cart.find(i => i.id == e.target.dataset.id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) cart = cart.filter(i => i.id != item.id);
            renderCart();
        }
    };

    const removeItem = (e) => {
        cart = cart.filter(i => i.id != e.target.dataset.id);
        renderCart();
    };

    document.getElementById("clear-cart").addEventListener("click", () => {
        if (cart.length && confirm("Limpar o carrinho?")) {
            cart = [];
            renderCart();
        }
    });

    checkoutButton.addEventListener("click", () => {
        if (!cart.length) return alert("Seu carrinho está vazio.");
        document.getElementById("products").classList.add("hidden");
        cartSection.classList.add("hidden");
        checkoutSection.classList.remove("hidden");
        renderCheckoutSummary();
    });

    const renderCheckoutSummary = () => {
        checkoutItemsDiv.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            checkoutItemsDiv.innerHTML += `
                <div class="checkout-item">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
            total += item.price * item.quantity;
        });
        checkoutTotalSpan.textContent = total.toFixed(2);
        pixAmountSpan.textContent = total.toFixed(2);
    };

    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        cart = [];
        renderCart();
        checkoutForm.reset();
        alert("Pedido confirmado! Envie o comprovante do PIX.");
        checkoutSection.classList.add("hidden");
        document.getElementById("products").classList.remove("hidden");
    });

    const showProductDetails = (productId) => {
        const product = products.find(p => p.id == productId);
        if (product) {
            detailContentDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
                <button data-id="${product.id}" class="add-to-cart">Adicionar ao Carrinho</button>
            `;
            detailContentDiv.querySelector(".add-to-cart").addEventListener("click", (e) => {
                addToCart(e.target.dataset.id);
            });
            productDetailSection.classList.remove("hidden");
            document.getElementById("products").classList.add("hidden");
        }
    };

    backToProductsButton.addEventListener("click", () => {
        productDetailSection.classList.add("hidden");
        document.getElementById("products").classList.remove("hidden");
    });

    document.querySelector("nav ul li a[href='#products']").addEventListener("click", (e) => {
        e.preventDefault();
        productDetailSection.classList.add("hidden");
        cartSection.classList.add("hidden");
        checkoutSection.classList.add("hidden");
        adminSection.classList.add("hidden");
        document.getElementById("products").classList.remove("hidden");
    });

    document.querySelector("nav ul li a[href='#cart']").addEventListener("click", (e) => {
        e.preventDefault();
        renderCart();
        productDetailSection.classList.add("hidden");
        checkoutSection.classList.add("hidden");
        adminSection.classList.add("hidden");
        document.getElementById("products").classList.add("hidden");
        cartSection.classList.remove("hidden");
    });

    document.querySelector("nav ul li a[href='#admin']").addEventListener("click", (e) => {
        e.preventDefault();
        const password = prompt("Digite a senha para acessar a administração:");
        if (password === "suasenha123") {
            productDetailSection.classList.add("hidden");
            cartSection.classList.add("hidden");
            checkoutSection.classList.add("hidden");
            document.getElementById("products").classList.add("hidden");
            adminSection.classList.remove("hidden");
            renderAdminProducts();
        } else {
            alert("Senha incorreta!");
        }
    });

    const renderAdminProducts = () => {
        adminProductList.innerHTML = "";
        products.forEach(product => {
            const item = document.createElement("div");
            item.classList.add("admin-product-item");
            item.innerHTML = `
                <div class="product-info"><strong>${product.name}</strong> - R$ ${product.price.toFixed(2)}<br><small>Categoria: ${product.category}</small></div>
            `;
            adminProductList.appendChild(item);
        });

        // Botão de exportar produtos
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
};

    loadProducts();
});
