import { clearAndTypeByName, clickElementByText, getElementByName } from './helpers';

const testData = {
    operatorName: 'Test Operator',
    contactNumber: '01234 567890',
    email: 'test@example.com',
    url: 'www.testoperator.com',
    street: 'Test Street',
    town: 'Test Town',
    county: 'Test County',
    postcode: 'AB1 2CD',
};

export const enterOperatorDetails = (): void => {
    clearAndTypeByName('operatorName', testData.operatorName);
    clearAndTypeByName('contactNumber', testData.contactNumber);
    clearAndTypeByName('email', testData.email);
    clearAndTypeByName('url', testData.url);
    clearAndTypeByName('street', testData.street);
    clearAndTypeByName('town', testData.town);
    clearAndTypeByName('county', testData.county);
    clearAndTypeByName('postcode', testData.postcode);

    clickElementByText('Save');

    getElementByName('operatorName').should('have.value', testData.operatorName);
    getElementByName('contactNumber').should('have.value', testData.contactNumber);
    getElementByName('email').should('have.value', testData.email);
    getElementByName('url').should('have.value', testData.url);
    getElementByName('street').should('have.value', testData.street);
    getElementByName('town').should('have.value', testData.town);
    getElementByName('county').should('have.value', testData.county);
    getElementByName('postcode').should('have.value', testData.postcode);
};
