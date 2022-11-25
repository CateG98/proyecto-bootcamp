console.warn('🆗: Módulo PageContacto cargado.');

class PageContacto {

    static async init () {
        console.log('PageContacto.init()');
        console.log('-');
        console.log('--');
        console.log('---');

        const _form = document.querySelector('form');
        const _name = document.querySelector('.contact-form__input-name');
        const _email = document.querySelector('.contact-form__input-email');
        const _comments = document.querySelector('.contact-form__textarea');
        const _elements = [_name, _email, _comments];


        const _errorName = document.querySelector('.contact-form__error-name');
        const _errorEmail = document.querySelector('.contact-form__error-email');
        const _errorComments = document.querySelector('.contact-form__error-comments');
        const _errors = [_errorName, _errorEmail, _errorComments];


        const regExpName = /^([A-ZÁÉÍÓÚÑa-záéíóúüñ][a-záéíóúüñ]{2,9}){0,1}$/;
        const regExpEmail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
        const regExpComments = /^(?:[\b\w\b;:,\.]+[\s\r\n]*){0,100}$/;



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
            validateInput('Nombre',_errorName, _name, regExpName, true, 3, 10); 
        });

        _email.addEventListener('input', e => {
            validateInput('E-mail', _errorEmail,_email, regExpEmail, true, 5, 64 );
        });

        _comments.addEventListener('input', e => {
            validateInput('Comentarios', _errorComments,_comments, regExpComments, true, 1, 100 );
        });

        _form.addEventListener('submit', e => {
            e.preventDefault();
            let nameValid = false;
            let emailValid = false;
            let commentsValid = false;

            nameValid = validateInput('Nombre',_errorName, _name, regExpName, true, 3, 10);
            emailValid = validateInput('E-mail', _errorEmail,_email, regExpEmail, true, 5, 64 );
            commentsValid = validateInput('Comentarios', _errorComments,_comments, regExpComments, true, 1, 100 );

            if ( nameValid && emailValid && commentsValid){
                _form.submit();
            }
        })


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

export default PageContacto;
