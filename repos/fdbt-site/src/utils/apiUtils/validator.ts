import startCase from 'lodash/startCase';

export const removeExcessWhiteSpace = (input: undefined | string): string => {
    // this will remove all whitespace on the front and end of a string, and reduce internal whitespaces to one whitespace
    if (!input) {
        return '';
    }
    return input.trim().replace(/\s+/g, ' ');
};

export const removeAllWhiteSpace = (input: string): string => input.replace(/\s+/g, '');

export const isCurrency = (periodPriceInput: string): boolean => {
    const regex = /^\d+(\.\d{1,2})?$/;
    return regex.test(periodPriceInput);
};

export const isValidInputDuration = (durationInput: string, carnet: boolean, school = false): boolean => {
    const allowedUnits = ['day', 'week', 'month', 'year', 'hour'];
    if (carnet) {
        allowedUnits.push('no expiry');
    }
    if (school) {
        allowedUnits.push('term');
    }
    return allowedUnits.includes(durationInput);
};

export const invalidCharactersArePresent = (value: string): boolean => {
    // this regular expression checks to see if any of the characters
    // are not:
    //
    // alphanumeric (a to z, capitalised too and numbers)
    // parenthesis ()
    // slashes \ or /
    // plus sign +
    // dash -
    // underscore _
    // dot .
    // ampersand &
    // space
    // @ symbol
    // apostrophe and comma

    // anything not in the above is considered invalid
    const regularExpression = new RegExp("[^\\ssa-zA-Z()_0-9'@,&+.\\-\\/\\\\]+");

    return regularExpression.test(value);
};
export const invalidUrlInput = (value: string): boolean => {
    // this regular expression checks to see if any of the characters
    // are not:
    //
    // alphanumeric (a to z, capitalised too and numbers);
    // parenthesis ()
    // backslash \
    // plus sign +
    // dash -
    // underscore _
    // dot .
    // ampersand &
    // space
    // @ symbol
    // apostrophe and comma

    // anything not in the above is considered invalid
    const regularExpression = new RegExp("[^\\ssa-zA-Z()_0-9'\\:@,&+.\\-\\/]+");
    // URL has at least one dot
    const hasDot = /[A-Za-z0-9_-]\.[A-Za-z0-9_-]/.exec(value) ? true : false;
    // URL has no spaces
    const hasSpace = !/^[^ ]+$/.exec(value) ? true : false;
    return regularExpression.test(value) || !hasDot || hasSpace;
};

export const checkProductOrCapNameIsValid = (inputtedProductName: string, inputType: 'cap' | 'product'): string => {
    let productNameError;

    if (inputtedProductName.length > 50) {
        productNameError = `${startCase(inputType)} name cannot have more than 50 characters`;
    } else if (inputtedProductName.length < 2) {
        productNameError = `${startCase(inputType)} name cannot have less than 2 characters`;
    }

    const nameHasInvalidCharacters = invalidCharactersArePresent(inputtedProductName);

    if (nameHasInvalidCharacters) {
        productNameError = `${startCase(inputType)} name has an invalid character`;
    }

    if (productNameError) {
        return productNameError;
    }

    return '';
};

export const checkPriceIsValid = (inputtedPrice: string | undefined, inputType: 'cap' | 'product' | 'tap'): string => {
    let productPriceError;

    if (!inputtedPrice) {
        productPriceError = `${startCase(inputType)} price cannot be empty`;
    } else if (Math.sign(Number(inputtedPrice)) === -1) {
        productPriceError = 'This must be a positive number';
    } else if (!isCurrency(inputtedPrice)) {
        productPriceError = 'This must be a valid price in pounds and pence';
    } else if (inputType === 'cap' && Number(inputtedPrice) === 0) {
        productPriceError = 'Cap prices cannot be zero';
    }

    if (productPriceError) {
        return productPriceError;
    }

    return '';
};

export const checkDurationIsValid = (inputtedDuration: string, inputType: 'cap' | 'product'): string => {
    let productDurationError;

    if (inputtedDuration === '') {
        productDurationError = `${startCase(inputType)} duration cannot be empty`;
    } else if (Number.isNaN(Number(inputtedDuration))) {
        productDurationError = `${startCase(inputType)} duration must be a whole, positive number`;
    } else if (Number(inputtedDuration) <= 0) {
        productDurationError = `${startCase(inputType)} duration cannot be zero or a negative number`;
    }

    if (productDurationError) {
        return productDurationError;
    }

    return '';
};

export const checkIntegerIsValid = (input: string, inputName: string, min: number, max: number): string => {
    if (input === '') {
        return `${inputName} cannot be empty`;
    }

    const numberInput = Number(input);

    if (!Number.isInteger(numberInput) || numberInput < 0) {
        return `${inputName} must be a whole, positive number`;
    }

    if (numberInput < min) {
        return `${inputName} cannot be less than ${min}`;
    }

    if (numberInput > max) {
        return `${inputName} cannot be greater than ${max}`;
    }

    return '';
};

// checkPassengerCountLimits is a duplicate of checkIntegerIsValid but with better error messaging which is returned to end users
export const checkPassengerCountLimits = (input: string, inputName: string, min: number, max: number): string => {
    if (input === '') {
        return `${inputName} cannot be empty`;
    }

    const numberInput = Number(input);

    if (!Number.isInteger(numberInput) || numberInput < 0) {
        return `${inputName} must be a whole, positive number`;
    }

    if (numberInput < min) {
        return `${inputName} passengers cannot be less than ${min}`;
    }

    if (numberInput > max) {
        return `${inputName} passengers cannot be greater than ${max}`;
    }

    return '';
};

export const isValidNumber = (input: number): boolean => {
    if (Number.isNaN(input)) {
        return false;
    }

    if (!Number.isInteger(Number(input))) {
        return false;
    }

    if (input > 1000 || input < 1) {
        return false;
    }

    return true;
};

export const isValidInput = (validityInput: string): boolean => {
    if (!validityInput || validityInput === '0' || !isValidNumber(Number(validityInput))) {
        return false;
    }
    return true;
};

export const isValid24hrTimeFormat = (time: string): boolean => RegExp('^([2][0-3]|[0-1][0-9])[0-5][0-9]$').test(time);
