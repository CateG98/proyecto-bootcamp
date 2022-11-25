import productController from '/js/controllers/product.js';

console.warn('🆗: Módulo PageAlta cargado.');

class PageAlta {

    static productsTableContainer;
    static productForm;
    static fields;
    static btnCreate;
    static btnUpdate;
    static btnCancel;

    static validators = {
        'id': /^[\da-f]{24}$/,
        'title': /^([\w\-\s\.\b:;,"'\b/]{2,28}){0,1}$/,
        'price': /^[1-9]{0,1}[0-9]{1,5}.[0-9]{0,2}$/,
        'stock': /^[1-9]{0,1}[0-9]{0,5}.[0-9]{0,2}$/,
        'brand': /^(?:[\b\w\-\b;:,'"/\.]+[\s\r\n ZÁÉÍÓÚÑa-záéíóúüñ]*){0,40}$/i,
        'category': /^(?:[\b\w\-\b;:,'"/\.]+[\s\r\n ZÁÉÍÓÚÑa-záéíóúüñ]*){0,50}$/,
        'short-description': /^(?:[\b\w\b;:,\.]+[\s\r\n]*){0,80}$/,
        // 'long-description': /^(?:[\b\w\b;:,\.]+[\s\r\n]*){0,2000}$/,
        'age-from': /^(3|[1-9][0-9]?|100)$/,
        'age-up-to': /^(5|[1-9][0-9]?|100)$/,
        // 'img': /^(([a-zA-Z]:)|(\\{2}\w+)\$?)(\\(\w[\w].*))+(.png|.jpg|.pdf)$/,
    };

    static async deleteProduct(e) {
        if (!confirm('¿Estás seguro de querer eliminar el producto?')) {
            return false;
        }
        const row = e.target.closest('tr');
        const id = row.querySelector('td[data-product-property="id"]').innerHTML;
        const deletedProduct = await productController.deleteProduct(id);
        PageAlta.loadTable();
        return deletedProduct;
    }

    static getProductFromRow(row) {
        const rowCells = row.children;
        const product = {};
        for (const cell of rowCells) {
            if (cell.dataset.productProperty) {
                product[cell.dataset.productProperty] = cell.innerHTML;
            }
        }
        return product;
    }

    static emptyForm() {
        PageAlta.fields.forEach(field => field.value = '');
    }

    static async completeForm(e) {
        const row = e.target.closest('tr');
        console.log(row)
        const productToEdit = PageAlta.getProductFromRow(row);
        console.log('productToEdit:', productToEdit);

        PageAlta.fields.forEach(field => {
            field.value = productToEdit[field.name];
        });
    }

    static async addTableEvents() {
        PageAlta.productsTableContainer.addEventListener('click', async e => {
            if (e.target.classList.contains('btn-delete')) {
                const deletedProduct = await PageAlta.deleteProduct(e);
                console.log('deletedProduct:', deletedProduct);
                if (PageAlta.objectIsEmpty(deletedProduct)) {
                    console.error('No se pudo eliminar el producto');
                }
                return;
            }
            if (e.target.classList.contains('btn-edit')) {
                PageAlta.prepareFormForEditing();
                PageAlta.completeForm(e);
                return;
            }
        });
    }

    static async renderTemplateTable(products) {
        const hbsFile = await fetch('templates/products-table.hbs').then(r => r.text());
        const template = Handlebars.compile(hbsFile);
        const html = template({ products });
        PageAlta.productsTableContainer.innerHTML = html;
    }

    
    static async loadTable() {
        const products = await productController.getProducts();
        console.log(`Se encontraron ${products.length} productos.`);
        PageAlta.renderTemplateTable(products);
    }

    static async prepareTable() {
        PageAlta.productsTableContainer = document.querySelector('.products-table-container');
        await PageAlta.loadTable();
        PageAlta.addTableEvents();
    }

    static prepareFormForEditing() {
        PageAlta.productForm.querySelector('[name="title"]').focus();
        PageAlta.btnCreate.disabled = true;
        PageAlta.btnUpdate.disabled = false;
        PageAlta.btnCancel.disabled = false;
    }

    static prepareFormForCreating() {
        PageAlta.btnCreate.disabled = false;
        PageAlta.btnUpdate.disabled = true;
        PageAlta.btnCancel.disabled = true;
    }

    static validate(value, validator) {
        return validator.test(value);
    }

    static validateForm(validators) {
        let allValidated = true;
        const productToSave = {};
        console.log('\n\n');

        for (const field of PageAlta.fields) {
            if (!validators[field.name]) {
                continue;
            }
            const validated = PageAlta.validate(field.value, validators[field.name]);
            console.warn(field.name);
            console.log(`value: ${field.value}\nvalidator: ${validators[field.name]}\nvalidated: ${validated}`);
            if (!validated) {
                field.focus();
                allValidated = false;
                break;
            } else {
                productToSave[field.name] = field.value;
            }
        }
        console.log('allValidated:', allValidated);
        if (!allValidated) {
            return false;
        }
        console.log(productToSave);
        return productToSave;
    }

    static async saveProduct(product) {
        const savedProduct = await productController.saveProduct(product);
        return savedProduct;
    }

    static async updateProduct(product) {
        console.log(product.id, product);
        const updatedProduct = await productController.updateProduct(product.id, product);
        return updatedProduct;
    }

    static async addFormEvents() {
        PageAlta.btnCreate.addEventListener('click', async e => {
            console.error('btn-create');
            const validators = {...PageAlta.validators};
            delete validators.id;
            const productToSave = PageAlta.validateForm(validators);
            console.log('productToSave:', productToSave);
            if (productToSave) {
                const savedProduct = await PageAlta.saveProduct(productToSave);
                console.log('savedProduct:', savedProduct);
                if (PageAlta.objectIsEmpty(savedProduct)) {
                    console.error('No se pudo crear el producto');
                    return;
                }
                const products = await productController.getProducts();
                console.log(`Ahora hay ${products.length} productos`);    
                PageAlta.renderTemplateTable(products);
        
                PageAlta.emptyForm();
            }
        });

        PageAlta.btnUpdate.addEventListener('click', async e => {
            console.error('btn-update');
            const productToSave = PageAlta.validateForm(PageAlta.validators);
            console.log(productToSave);
            if (productToSave) {
                console.log(productToSave);
                const updatedProduct = await PageAlta.updateProduct(productToSave);
                console.log('updatedProduct:', updatedProduct);
                if (PageAlta.objectIsEmpty(updatedProduct)) {
                    console.error('No se pudo guardar el producto');
                    return;
                }
                const products = await productController.getProducts();
                console.log(`Ahora hay ${products.length} productos`);    
                PageAlta.renderTemplateTable(products);        
                PageAlta.emptyForm();
                PageAlta.prepareFormForCreating();
            }
        });
        
        PageAlta.btnCancel.addEventListener('click', e => {
            console.error('btn-cancel');
            PageAlta.emptyForm();
            PageAlta.prepareFormForCreating();
        });
    }

    static objectIsEmpty(object) {
        return Object.entries(object).length === 0;
    }

    static prepareForm() {
        PageAlta.productForm = document.querySelector('.alta-form');
        PageAlta.fields = PageAlta.productForm.querySelectorAll('[name]');
        PageAlta.btnCreate = PageAlta.productForm.querySelector('.alta-form__submit');
        PageAlta.btnUpdate = PageAlta.productForm.querySelector('.alta-form__update');
        PageAlta.btnCancel = PageAlta.productForm.querySelector('.alta-form__reset');
        PageAlta.addFormEvents();
    }

    static async init () {
        console.log('PageAlta.init()');
        console.log('*');
        console.log('**');
        console.log('***');

        PageAlta.prepareTable();
        PageAlta.prepareForm();

        const _form = document.querySelector('form');
        const _name = document.querySelectorAll('.alta-form__input')[0];
        const _price = document.querySelectorAll('.alta-form__input')[1];
        const _stock = document.querySelector('.alta-form__input-stock');
        const _brand = document.querySelector('.alta-form__input-brand');
        const _category = document.querySelector('.alta-form__input-category');
        const _shortDescription = document.querySelector('.alta-form__textarea-short-description');
        const _longDescription = document.querySelector('.alta-form__textarea-long-description');
        const _ageFrom = document.querySelector('.alta-form__input-age-from');
        const _ageUpTo = document.querySelector('.alta-form__input-age-up-to');
        const _photo = document.querySelector('.alta-form__input-photo');
        const _elements = [_name, _price, _brand, _category, _shortDescription, _longDescription, _ageFrom, _ageUpTo, _photo]


        const _errorName = document.querySelector('.alta-form__error-name');
        const _errorPrice = document.querySelector('.alta-form__error-price');
        const _errorStock = document.querySelector('.alta-form__error-stock');
        const _errorBrand = document.querySelector('.alta-form__error-brand');
        const _errorCategory = document.querySelector('.alta-form__error-category');
        const _errorShortDescription = document.querySelector('.alta-form__error-short-description');
        const _errorLongDescription = document.querySelector('.alta-form__error-long-description');
        const _errorAgeFrom = document.querySelector('.alta-form__error-age-from');
        const _errorAgeUpTo = document.querySelector('.alta-form__error-age-up-to');
        const _errorPhoto = document.querySelector('.alta-form__error-photo');
        const _errors = [_errorName, _errorPrice, _errorBrand, _errorCategory, _errorShortDescription, _errorLongDescription, _errorAgeFrom, _errorAgeUpTo, _errorPhoto];


        const regExpName = /^([\w\-\s\.\b:;,"'\b/]{2,28}){0,1}$/;
        const regExpPrice = /^[1-9]{0,1}[0-9]{1,5}.[0-9]{0,2}$/;
        const regExpStock = /^[1-9]{0,1}[0-9]{0,5}.[0-9]{0,2}$/;
        const regExpBrand = /^\b(mattel|hasbro|fisher.price|bandai|lego|playmobil|barbie|chicco|nenuco)\b$/i;
        const regExpCategory = /^(?:[\b\w\-\b;:,'"/\.]+[\s\r\n ZÁÉÍÓÚÑa-záéíóúüñ]*){0,50}$/;
        const regExpShortDescription = /^(?:[\b\w\b;:,\.]+[\s\r\n]*){0,80}$/;
        const regExpLongDescription = /^(?:[\b\w\b;:,\.]+[\s\r\n]*){0,2000}$/;
        const regExpAgeFrom = /^(3|[1-9][0-9]?|100)$/ ;
        const regExpAgeUpTo = /^(5|[1-9][0-9]?|100)$/ ;
        const regExpPhoto = /^(([a-zA-Z]:)|(\\{2}\w+)\$?)(\\(\w[\w].*))+(.png|.jpg|.pdf)$/;

        function validateInput(label, errorName, input, regExpText, required, minLen, maxLen) {
            let message ='';
            let value = input.value;
            value = value.trim();
            let error = input;
            let valueLength = value.length;
            let minLength = minLen;
            let maxLength = maxLen;
        
            if (valueLength === 0 && required && window.event.type === 'submit') {     
                message = `${label} es obligatorio`;
            } else if ((minLen && valueLength) && (valueLength < minLength)) {          
                message = `${label} debe tener al menos ${minLength} caracteres.`;
            } else if (maxLen && (valueLength > maxLength)) {
                message = `${label} debe tener ${maxLength} caracteres como máximo.`; 
        
            } else {
                let textValidator = new RegExp(regExpText);                            
                if (valueLength && !textValidator.test(value)) {
                    message = `${label} no se ajusta al formato.`;
                }
            }
            if (message) {
                errorName.innerHTML = `${message}`;
                errorName.style.display = 'block';
                error.classList.add('error');
                return false;
            } else {
                errorName.innerHTML = '';
                errorName.style.display = 'none';
                error.classList.remove('error');
                return true;
            }
        }
        
        _name.addEventListener('input', e => {
            validateInput('Nombre',_errorName, _name, regExpName, true, 3, 30); 
        });
        
        _price.addEventListener('input', e => {
            validateInput('Precio', _errorPrice, _price, regExpPrice, true, 2, 6);
        });

        _stock.addEventListener('input', e => {
            validateInput('Precio', _errorStock, _stock, regExpStock, true, 1, 6);
        });
        
        _brand.addEventListener('input', e => {
            validateInput('Marca', _errorBrand, _brand, regExpBrand, false, 4, 40);
        });
        
        _category.addEventListener('input', e => {
            validateInput('Marca', _errorCategory, _category, regExpCategory, true, 5, 50);
        });
        
        
        _ageFrom.addEventListener('input',e => {
            e.preventDefault();
            validateInput('Edad desde', _errorAgeFrom, _ageFrom, regExpAgeFrom, false, 1, 3);
        });
        
        _ageUpTo.addEventListener('input',e => {
            validateInput('Edad hasta', _errorAgeUpTo, _ageUpTo, regExpAgeUpTo, false, 1, 3);
        });
        
        // _photo.addEventListener('input',e => {
        //     validateInput('Foto', _errorPhoto, _photo, regExpPhoto, false, 1, 100);
        // });
        
        _shortDescription.addEventListener('input', e => {
            validateInput('La descripción corta', _errorShortDescription, _shortDescription, regExpShortDescription, true, 1, 80);
        });
        
        _longDescription.addEventListener('input', e => {
            validateInput('La descripción larga', _errorLongDescription, _longDescription, regExpLongDescription, false, 1, 2000);
        });
        
        
        _form.addEventListener('submit', e => {
        
            e.preventDefault();
            let nameValid = false;
            let brandValid = false;
            let categoryValid = false;
            let shortDescriptionValid = false;
            let priceValid = false;
        
            nameValid = validateInput('Nombre',_errorName, _name, regExpName, true, 3, 30); 
            categoryValid = validateInput('Marca', _errorCategory, _category, regExpCategory, true, 5, 50);
            shortDescriptionValid = validateInput('La descripción corta', _errorShortDescription, _shortDescription, regExpShortDescription, true, 1, 80);
            priceValid = validateInput('Precio', _errorPrice, _price, regExpPrice, true, 2, 6);
            if ( nameValid && shortDescriptionValid && categoryValid && priceValid){
                _form.submit();
            }
        });
        
        _form.addEventListener('reset', e => {
        
            _elements.forEach( (element) => {
                element.classList.remove('error');
            });
            _errors.forEach( (error) => {
                error.style.display = 'none';
                error.innerHTML = '';
            });
        });
        
    }

}

export default PageAlta;