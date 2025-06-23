# Semi-joias da Glennys - Site Profissional

## 🌟 Sobre o Projeto

Site de e-commerce profissional para semi-joias, com design moderno, funcionalidades completas de carrinho de compras e integração com WhatsApp para atendimento personalizado.

## ✨ Principais Melhorias Implementadas

### 🎨 Design e Visual
- **Layout moderno e responsivo** - Compatível com desktop e mobile
- **Paleta de cores elegante** - Dourado (#d4af37) como cor principal
- **Tipografia profissional** - Playfair Display para títulos e Inter para textos
- **Imagens de alta qualidade** - Semi-joias elegantes e profissionais
- **Barra de promoção** - Destaque para frete grátis e desconto PIX

### 🛒 Funcionalidades de E-commerce
- **Catálogo de produtos** - Grid responsivo com filtros por categoria
- **Busca inteligente** - Pesquisa por nome e descrição
- **Carrinho de compras** - Adicionar, remover e alterar quantidades
- **Checkout profissional** - Formulário completo com dados do cliente
- **Cálculo automático** - Subtotal, frete e desconto PIX

### 💬 Integração WhatsApp
- **Botão flutuante** - Sempre visível para contato rápido
- **Mensagem automática** - Dados do pedido enviados automaticamente
- **Atendimento personalizado** - Link direto para consultas por produto

### 💳 Sistema de Pagamento
- **PIX com desconto** - 10% de desconto automático
- **Informações claras** - Chave PIX e instruções de pagamento
- **Processo simplificado** - Confirmação via WhatsApp

### 🔧 Painel Administrativo
- **Gerenciamento de produtos** - Adicionar, editar e excluir produtos
- **Interface intuitiva** - Formulários organizados e fáceis de usar
- **Armazenamento local** - Dados salvos no navegador

## 📁 Estrutura dos Arquivos

```
Site-Semi-J-ias/
├── index.html          # Página principal
├── style.css           # Estilos CSS
├── script.js           # Funcionalidades JavaScript
├── products.json       # Base de dados dos produtos
├── images/             # Pasta de imagens
│   ├── jewelry-set-1.jpg
│   ├── jewelry-rings.jpg
│   ├── jewelry-bracelets.jpg
│   └── jewelry-necklaces.jpg
└── README.md           # Este arquivo
```

## 🚀 Como Usar

### 1. Upload para o GitHub
1. Faça o download dos arquivos
2. Substitua os arquivos no seu repositório GitHub
3. Faça commit e push das alterações
4. O site será atualizado automaticamente no GitHub Pages

### 2. Personalização
- **Produtos**: Edite o arquivo `products.json` ou use o painel admin
- **Contato**: Altere o número do WhatsApp no arquivo `script.js` e `index.html`
- **Cores**: Modifique as variáveis CSS no início do arquivo `style.css`
- **Imagens**: Substitua as imagens na pasta `images/`

### 3. Gerenciamento de Produtos
1. Acesse a seção "Gerenciar" no site
2. Preencha o formulário com os dados do produto
3. Clique em "Salvar Produto"
4. Os produtos ficam salvos no navegador

## 📱 Funcionalidades Principais

### Para Clientes:
- Navegar pelo catálogo de produtos
- Buscar produtos por nome ou categoria
- Adicionar produtos ao carrinho
- Finalizar compra com dados pessoais
- Contato direto via WhatsApp
- Visualizar desconto PIX automaticamente

### Para Administrador:
- Adicionar novos produtos
- Editar produtos existentes
- Excluir produtos
- Visualizar lista de produtos cadastrados

## 🎯 Destaques Técnicos

- **Responsivo**: Funciona perfeitamente em celulares e tablets
- **Performance**: Carregamento rápido e otimizado
- **SEO**: Estrutura HTML semântica
- **Acessibilidade**: Navegação por teclado e leitores de tela
- **Compatibilidade**: Funciona em todos os navegadores modernos

## 📞 Configuração do WhatsApp

Para alterar o número do WhatsApp, edite as seguintes linhas:

**No arquivo `index.html`** (linha ~280):
```html
<a href="https://wa.me/5511964338381?text=..." target="_blank">
```

**No arquivo `script.js`** (função `createWhatsAppMessage`):
```javascript
const whatsappUrl = `https://wa.me/5511964338381?text=${encodeURIComponent(whatsappMessage)}`;
```

Substitua `5511964338381` pelo seu número no formato internacional.

## 🎨 Personalização de Cores

No arquivo `style.css`, altere as variáveis CSS:

```css
:root {
    --primary-color: #d4af37;      /* Cor principal (dourado) */
    --primary-dark: #b8941f;       /* Dourado escuro */
    --secondary-color: #2c2c2c;    /* Cinza escuro */
    --success-color: #25d366;      /* Verde WhatsApp */
}
```

## 📈 Próximos Passos Sugeridos

1. **Analytics**: Adicionar Google Analytics para acompanhar visitantes
2. **SEO**: Otimizar meta tags e descrições
3. **Blog**: Criar seção de blog para conteúdo sobre semi-joias
4. **Newsletter**: Implementar cadastro de e-mail
5. **Avaliações**: Sistema de avaliações de produtos

## 🆘 Suporte

Para dúvidas ou problemas:
- Verifique se todos os arquivos foram enviados corretamente
- Teste o site localmente antes de fazer upload
- Certifique-se de que o GitHub Pages está ativado
- Verifique se não há erros no console do navegador

---

**Desenvolvido com ❤️ para Semi-joias da Glennys**

