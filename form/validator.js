function Validator(options) {

    var selectorRules = {}

    function validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector)
        var errorMessage;

        var rules = selectorRules[rule.selector]

        for (var i = 0; i < rules.length; ++i) {
            var errorMessage = rules[i](inputElement.value)
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            inputElement.parentElement.classList.add('invalid')
        } else {
            errorElement.innerText = ''
            inputElement.parentElement.classList.remove('invalid')
        }
        return !errorMessage
    }

    var formElement = document.querySelector(options.form)

    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        return (values[input.name] = input.value) && values
                    }, {})
                    options.onSubmit(formValues)
                }
            }
        }

        options.rules.forEach(function (rule) {

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)

            if (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid')
                }
            }

        })
    }

}

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || " Vui lòng nhập trường này! "
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return regex.test(value) ? undefined : message || " Vui lòng nhập Email! "
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || ` Vui lòng tối thiểu ${min} ký tự! `
        }
    }
}

Validator.isConfirmed = function (selector, getCofirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getCofirmValue() ? undefined : message || ' Giá trị nhập vào không chính xác! '
        }
    }
}