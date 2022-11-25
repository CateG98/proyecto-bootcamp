import productController from '/js/controllers/product.js';

console.warn('🆗: Módulo PageInicio cargado.');

class PageInicio {

    static async renderTemplateCards(products) {
        const textoToRender = await fetch('/templates/inicio.hbs').then(r => r.text());
        const template = Handlebars.compile(textoToRender);
        const html = template({ products });
        document.querySelector('.cards-container').innerHTML = html;
        PageInicio.buttonsAdd();
    }

    static async buttonsDelete () {
        const deleteButtons = document.querySelectorAll('.main-modal__remove-button');
        console.log(deleteButtons);
        deleteButtons.forEach(buttons => {
            buttons.addEventListener('click', async e => {
                console.log('click');
                PageInicio.deleteProductFromCart(e);
            });
        });
    }

    static async buttonsAdd () {
            const addToCartButtons = document.querySelectorAll('.card__link-add');
            console.log(addToCartButtons);
            addToCartButtons.forEach(buttons => {
                buttons.addEventListener('click', async e => {
                    console.log('click');
                    PageInicio.addToCartClicked(e);
                });
            });
    }


    static async renderTemplateCart (product, title) {
        let modalTitle = document.querySelectorAll('.main-modal__title');
        if (modalTitle != '') {
            for (let i = 0; i < modalTitle.length; i++) {
                if(modalTitle[i].innerText == title) {
                    console.log('producto repetido');
                    let row = modalTitle[i].closest('div');
                    console.log(row);
                    let price = row.getElementsByClassName('main-modal__price')[0];
                    let itemPrice = Number(price.innerHTML);
                    console.log(itemPrice);
                    let input = row.getElementsByClassName('main-modal__quantity')[0];
                    let inputValue = Number(input.value)
                    console.log(inputValue);
                    let total = input.value;
                    input.value = inputValue + 1;
                    total = inputValue + 1;
                    PageInicio.updateCartTotal();
                    // price.innerHTML = itemPrice * total;
                    return;
                }
            }
        }
        const textoToRender = await fetch('/templates/cart.hbs').then(r => r.text());
        const template = Handlebars.compile(textoToRender);
        const html = template({ product });
        let modalRow = document.createElement('div');
        modalRow.classList.add('main-modal__row');
        modalRow.setAttribute('id', 'row');
        modalRow.innerHTML = html;
        const modalItems = document.querySelector('.main-modal__items');
        modalItems.append(modalRow);
        PageInicio.updateCartTotal();
        PageInicio.buttonsDelete();
        PageInicio.inputChange();
        PageInicio.buttonPlus();
        PageInicio.buttonMinus();
    }

    static async buttonPlus() {
        let btnPlus = document.querySelectorAll('.main-modal__plus-button');
        btnPlus.forEach(plus => {
            plus.addEventListener('click', e => {
                console.log('plus')
                const row = e.target.closest('div');
                let input = row.getElementsByClassName('main-modal__quantity')[0];
                let inputValue = Number(input.value)
                console.log(inputValue);
                input.value = inputValue + 1;
                PageInicio.cartNumberItemPlus();
                PageInicio.updateCartTotal();
            })
        })
    }

    static async buttonMinus() {
        let btnMinus = document.querySelectorAll('.main-modal__minus-button');
        btnMinus.forEach(minus => {
            minus.addEventListener('click', e => {
                console.log('minus')
                const row = e.target.closest('div');
                let input = row.getElementsByClassName('main-modal__quantity')[0];
                let inputValue = Number(input.value);
                console.log(inputValue);
                if(inputValue > 1) {
                    input.value = inputValue - 1;
                    PageInicio.cartNumberItemMinus();
                    PageInicio.updateCartTotal();
                }
            })
        })
    }

    static async cartNumberItemPlus() {
        let cartNumber = document.querySelector('.main-header__cart-button-container-item-number');
        let cartItems = document.querySelector('.main-modal__total-items');
        let i = Number(cartNumber.innerHTML);
        i++;
        cartNumber.innerHTML = i;
        cartItems.innerHTML = i;
    }

    static async cartNumberItemMinus() {
        // let modalPrices = document.querySelectorAll('.main-modal__price');
        // let totalItems = document.querySelector('.main-modal__total-items');
        // let cartNumber = document.querySelector('.main-header__cart-button-container-item-number');
        // cartNumber.innerHTML = modalPrices.length;
        // totalItems.innerHTML = modalPrices.length;
        let cartNumber = document.querySelector('.main-header__cart-button-container-item-number');
        let cartItems = document.querySelector('.main-modal__total-items');
        let i = Number(cartNumber.innerHTML);
        i = i - 1;
        if (i < 0) {
            i = 0;
        }
        cartNumber.innerHTML = i;
        cartItems.innerHTML = i;
        console.log(i);
    }

    static async productAdded (row) {
        let added = row.getElementsByClassName('card__product-add')[0];
        console.log(added);
        added.hidden = false;
        added.innerHTML = 'Producto agregado!'
        setTimeout(function(){
            added.innerHTML = ''
            added.hidden = true;
        }, 1000);
    }

    static async addToCartClicked (e) {
        e.preventDefault();
        let buttons = e.target;
        let shopItem = buttons.parentElement;
        let cardTitle = shopItem.getElementsByClassName('card__heading')[0].innerText
        let cardPrice = shopItem.getElementsByClassName('card__price-p')[0].innerText.slice(8)
        let cardImgSrc = shopItem.getElementsByClassName('card__image')[0].src
        console.log(cardTitle);
        let product = [{"cardTitle" : cardTitle, "cardPrice" : cardPrice, "cardImgSrc" : cardImgSrc}];
        console.log(product);
        PageInicio.renderTemplateCart(product, cardTitle);
        PageInicio.cartNumberItemPlus();
        PageInicio.productAdded(shopItem);
    }

    static async deleteProductFromCart(e) {
        let button = e.target;
        let row = button.closest("#row");
        row.remove();
        PageInicio.cartNumberItemMinus();
        PageInicio.updateCartTotal();
    }


    static async inputChange() {
        let input = document.querySelectorAll('.main-modal__quantity');
        input.forEach(inputs => {
            inputs.addEventListener('change', e => {
                PageInicio.updateCartTotal();
                let input = e.target;
                console.log(input);
                let modalRow = input.closest("div");
                PageInicio.updateInputTotal(modalRow);
            });
        });
    }
    
    static async updateInputTotal(modalRow) {
        console.log('click');
        let total = 0;
        let priceElement = modalRow.getElementsByClassName('main-modal__price')[0];
        let modalQuantity = modalRow.getElementsByClassName('main-modal__quantity')[0];
        let price = parseFloat(priceElement.innerText);
        let quantity1 = Number(modalQuantity.value);
        let quantity = quantity1;
        total = total + (price * quantity);
        console.log(priceElement.innerHTML);
    }



    static async updateCartTotal() {
        let modalRows = document.querySelectorAll('.main-modal__row');
        let total = 0;
        for (let i = 0; i < modalRows.length; i++) {
            let modalRow = modalRows[i];
            let priceElement = modalRow.getElementsByClassName('main-modal__price')[0];
            let modalQuantity = modalRow.getElementsByClassName('main-modal__quantity')[0];
            let price = parseFloat(priceElement.innerText.replace('$', ''));
            let quantity1 = modalQuantity.value;
            let quantity = quantity1;
            total = total + (price * quantity);
        }
        document.querySelector('.main-modal__total-price').innerHTML = `$${total}`;
    }
    
    static async init () {
        console.log('PageInicio.init()');

        const products = await productController.getProducts();
        PageInicio.renderTemplateCards(products);

        console.log(`Se encontraron ${products.length} productos.`);

        let slideIndex = 1;
        showDivs(slideIndex);

        function plusDivs(n) {
            showDivs(slideIndex += n);
        }

        function showDivs(n) {
            let i;
            let x = document.getElementsByClassName("carrousel__item");
            if (n > x.length) {slideIndex = 1}
            if (n < 1) {slideIndex = x.length} ;
            for (i = 0; i < x.length; i++) {
                x[i].style.display = "none";
            }
            x[slideIndex-1].style.display = "block";
        }

        const _buttonLeft = document.querySelector('.carrousel__button-left');

        _buttonLeft.addEventListener('click', () => {
            plusDivs(-1);
        });

        const _buttonRight = document.querySelector('.carrousel__button-right');

        _buttonRight.addEventListener('click', () => {
            plusDivs(+1);
        });
    }
}

export default PageInicio;