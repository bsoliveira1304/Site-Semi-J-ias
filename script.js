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

    let products = [];
    let cart = [];
    let orders = [];

    // Carrega os produtos fixos do HTML
    const loadStaticProducts = () => {
        products = [];

        document.querySelectorAll(".product-card").forEach(card => {
            const name = card.querySelector("h3").textContent.trim();
            const description = card.querySelector("p").textContent.trim();
            const price = parseFloat(card.querySelector(".price").textContent.replace("R$", "").trim());
            const image = card.querySelector("img").src;
            const id = card.querySelector("button").dataset.id;

            const product = { id, name, description, price, image };
            products.push(product);

            card.querySelector(".add-to-cart").addEventListener("click", (e) => {
                addToCart(e.target.dataset.id);
            });

            card.querySelector(".view-details").addEventListener("click", (e) => {
                showProductDetails(e.target.dataset.id);
            });
        });

        renderAdminProducts();
    };

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
        const product = products.find(p => p.id === productId);
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
        const product = products.find(p => p.id === productId);
        if (product) {
            const existingItem = cart.find(item => item.id === productId);
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
                itemDiv.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
                    <button data-id="${item.id}" class="remove-from-cart">Remover</button>
                `;
                cartItemsDiv.appendChild(itemDiv);
                total += item.price * item.quantity;
            });
        }
        cartTotalSpan.textContent = total.toFixed(2);

        document.querySelectorAll(".remove-from-cart").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.dataset.id;
                removeFromCart(productId);
            });
        });
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    };

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
        pixAmountSpan.textContent = cartTotalSpan.textContent;
        pixKeySpan.textContent = "sua.chave.pix@email.com"; // Substitua pela sua chave real
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
            total: parseFloat(cartTotalSpan.textContent),
            paymentProof: document.getElementById("payment-proof").value,
            timestamp: new Date().toISOString()
        };
        orders.push(order);
        saveOrders();
        alert("Pedido realizado com sucesso! Sua noiva receberá as informações em breve.");
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
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                ${product.name} - R$ ${product.price.toFixed(2)}
                <button data-id="${product.id}" class="edit-product">Editar</button>
                <button data-id="${product.id}" class="delete-product">Excluir</button>
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
                products = products.filter(p => p.id !== productId);
                renderAdminProducts();
                alert("Produto removido da exibição. (Nota: essa remoção é temporária e não afeta o HTML fixo)");
            });
        });
    };

    productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const productId = document.getElementById("product-id").value;
        const productName = document.getElementById("product-name").value;
        const productDescription = document.getElementById("product-description").value;
        const productPrice = parseFloat(document.getElementById("product-price").value);
        const productImage = document.getElementById("product-image").value;

        const product = {
            id: productId || Date.now().toString(),
            name: productName,
            description: productDescription,
            price: productPrice,
            image: productImage
        };

        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
        } else {
            products.push(product);
        }

        renderAdminProducts();
        productForm.reset();
        document.getElementById("product-id").value = "";
        alert("Produto salvo (temporariamente) com sucesso!");
    });

    const editProduct = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById("product-id").value = product.id;
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

    // Inicialização
    loadStaticProducts();
    loadCart();
    loadOrders();
});
