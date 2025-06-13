
document.addEventListener("DOMContentLoaded", () => {
    const productListDiv = document.getElementById("product-list");
    const adminSection = document.getElementById("admin");
    const categoryFilter = document.getElementById("category-filter");

    let products = [];

    const renderProducts = () => {
        productListDiv.innerHTML = "";
        products.forEach(product => {
            const card = document.createElement("div");
            card.classList.add("product-card");
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
            `;
            productListDiv.appendChild(card);
        });
    };

    const renderAdminProducts = () => {};
    const updateCategoryFilter = () => {};

    
const loadProducts = async () => {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        renderProducts();
        renderAdminProducts();
        updateCategoryFilter();
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        productListDiv.innerHTML = "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
    }
};


    
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


    loadProducts();
});
