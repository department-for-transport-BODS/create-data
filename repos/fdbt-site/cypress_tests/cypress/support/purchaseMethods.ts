import { clearAndTypeByName, clickElementById, clickElementByText, getElementByClass } from './helpers';

interface PurchaseMethod {
    purchaseLocations: string[];
    paymentMethods: string[];
    ticketFormats: string[];
    name: string;
}

const enterPurchaseMethodDetails = ({ purchaseLocations, paymentMethods, ticketFormats, name }: PurchaseMethod) => {
    purchaseLocations.map(clickElementById);
    paymentMethods.map(clickElementById);
    ticketFormats.map(clickElementById);

    clearAndTypeByName('name', name);
};

export const addPurchaseMethod = (purchaseMethod: PurchaseMethod, isCapped = false): void => {
    if (isCapped) {
        clickElementByText('Add a capped purchase method');
    } else {
        clickElementByText('Add a purchase method');
    }
    enterPurchaseMethodDetails(purchaseMethod);
    clickElementByText('Add purchase method');
};

export const createEditPurchaseMethod = (isCapped = false): void => {
    const purchaseMethod = {
        purchaseLocations: ['checkbox-0-on-board'],
        paymentMethods: isCapped
            ? ['checkbox-0-debit-card', 'checkbox-1-credit-card']
            : ['checkbox-0-cash', 'checkbox-1-debit-card'],
        ticketFormats: isCapped ? ['checkbox-0-mobile-app'] : ['checkbox-3-electronic-document'],
        name: 'Onboard',
    };

    addPurchaseMethod(purchaseMethod, isCapped);

    // Click on edit and back button
    getElementByClass('card').eq(0).contains('Edit').click();
    clickElementByText('Back');

    const purchaseMethodCard = getElementByClass('card').eq(0);
    purchaseMethodCard.should('include.text', purchaseMethod.name);
    purchaseMethodCard.should('include.text', 'Purchase locations: On board');
    if (isCapped) {
        purchaseMethodCard.should('include.text', 'Payment methods: Debit card, Credit card');
    } else {
        purchaseMethodCard.should('include.text', 'Payment methods: Cash, Debit card');
    }
    if (isCapped) {
        purchaseMethodCard.should('include.text', 'Ticket formats: Mobile app');
    } else {
        purchaseMethodCard.should('include.text', 'Ticket formats: Digital');
    }

    purchaseMethodCard.contains('Edit').click();

    const editedPurchaseMethod = {
        purchaseLocations: isCapped
            ? ['checkbox-0-on-board', 'checkbox-1-mobile-device']
            : ['checkbox-0-on-board', 'checkbox-1-online'],
        paymentMethods: isCapped ? ['checkbox-2-mobile-phone'] : ['checkbox-2-credit-card'],
        ticketFormats: isCapped ? ['checkbox-1-smart-card'] : ['checkbox-0-paper-ticket'],
        name: 'Online',
    };

    enterPurchaseMethodDetails(editedPurchaseMethod);

    cy.contains('Update purchase method').click();

    const editedCard = getElementByClass('card').eq(0);
    editedCard.should('include.text', editedPurchaseMethod.name);
    if (isCapped) {
        editedCard.should('include.text', 'Purchase locations: Mobile device');
    } else {
        editedCard.should('include.text', 'Purchase locations: Online');
    }
    if (isCapped) {
        editedCard.should('include.text', 'Payment methods: Debit card, Credit card, Mobile phone');
    } else {
        editedCard.should('include.text', 'Payment methods: Cash, Debit card, Credit card');
    }
    if (isCapped) {
        editedCard.should('include.text', 'Ticket formats: Mobile app, Smart card');
    } else {
        editedCard.should('include.text', 'Ticket formats: Paper ticket, Digital');
    }
};
