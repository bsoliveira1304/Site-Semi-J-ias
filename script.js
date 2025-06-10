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

    // URL base da API
    const API_BASE_URL = window.location.origin + '/api';

    // Funções de Carregamento e Salvamento
    const loadProducts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (response.ok) {
                products = await response.json();
            } else {
                console.error('Erro ao carregar produtos da API');
                products = [];
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
            // Fallback para localStorage se a API não estiver disponível
            const storedProducts = localStorage.getItem("products");
            if (storedProducts) {
                products = JSON.parse(storedProducts);
            } else {
                products = [];
            }
        }
        renderProducts();
        renderAdminProducts();
    };

    const saveProduct = async (product) => {
        try {
            const method = product.id && products.find(p => p.id === product.id) ? 'PUT' : 'POST';
            const url = method === 'PUT' ? `${API_BASE_URL}/products/${product.id}` : `${API_BASE_URL}/products`;
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product)
            });

            if (response.ok) {
                await loadProducts(); // Recarrega a lista de produtos
                return true;
            } else {
                console.error('Erro ao salvar produto na API');
                return false;
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
            // Fallback para localStorage
            if (product.id && products.find(p => p.id === product.id)) {
                const index = products.findIndex(p => p.id === product.id);
                products[index] = product;
            } else {
                products.push(product);
            }
            localStorage.setItem("products", JSON.stringify(products));
            renderProducts();
            renderAdminProducts();
            return true;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await loadProducts(); // Recarrega a lista de produtos
                return true;
            } else {
                console.error('Erro ao excluir produto da API');
                return false;
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
            // Fallback para localStorage
            products = products.filter(p => p.id !== productId);
            localStorage.setItem("products", JSON.stringify(products));
            renderProducts();
            renderAdminProducts();
            return true;
        }
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

    // Renderização de Produtos
    const renderProducts = () => {
        productListDiv.innerHTML = "";
        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x300?text=Imagem+Nao+Disponivel';">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
                <button data-id="${product.id}" class="add-to-cart">Adicionar ao Carrinho</button>
                <button data-id="${product.id}" class="view-details">Ver Detalhes</button>
            `;
            productListDiv.appendChild(productCard);
        });

        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.dataset.id;
                addToCart(productId);
            });
        });

        document.querySelectorAll(".view-details").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.dataset.id;
                showProductDetails(productId);
            });
        });
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

    // Funções do Carrinho
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

    // Funções de Checkout
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
        // A chave PIX deve ser configurada aqui ou carregada de um arquivo de configuração
        pixKeySpan.textContent = "sua.chave.pix@email.com"; // Substitua pela chave PIX real
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
        console.log("Novo Pedido:", order); // Em um ambiente real, isso seria enviado para um backend ou email
        cart = [];
        saveCart();
        checkoutForm.reset();
        document.getElementById("products").classList.remove("hidden");
        checkoutSection.classList.add("hidden");
    });

    // Funções de Administração de Produtos
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
                deleteProductHandler(productId);
            });
        });
    };

    productForm.addEventListener("submit", async (e) => {
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

        const success = await saveProduct(product);
        if (success) {
            productForm.reset();
            document.getElementById("product-id").value = ""; // Limpa o ID para nova adição
            alert("Produto salvo com sucesso!");
        } else {
            alert("Erro ao salvar produto. Tente novamente.");
        }
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

    const deleteProductHandler = async (productId) => {
        if (confirm("Tem certeza que deseja excluir este produto?")) {
            const success = await deleteProduct(productId);
            if (success) {
                alert("Produto excluído com sucesso!");
            } else {
                alert("Erro ao excluir produto. Tente novamente.");
            }
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
        // Implementação de controle de acesso
        const password = prompt("Digite a senha para acessar a área de administração:\\n\\nATENÇÃO: A senha está definida no código JavaScript (script.js) como \\"suasenha123\\". Por favor, altere-a para uma senha forte e segura diretamente no arquivo para proteger seu acesso.\\n\\nPara o upload de fotos, o site atualmente aceita apenas URLs de imagens. Isso ocorre porque o upload direto de arquivos requer funcionalidades adicionais de servidor, que podem ser implementadas futuramente. Você pode usar serviços de hospedagem de imagens como Imgur, Google Fotos (com link compartilhável) ou Dropbox para obter URLs de suas imagens.");
        if (password === "suasenha123") { // Substitua "suasenha123" por uma senha forte
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
    loadProducts();
    loadCart();
    loadOrders();
});

