import { clearAndTypeByName, clickElementById, clickElementByText } from './helpers';

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

export const createEditPurchaseMethod = (
    nameOrIsCapped: string | boolean = 'Onboard',
    editedName = 'Online',
    capped = false,
): void => {
    const isCapped = typeof nameOrIsCapped === 'boolean' ? nameOrIsCapped : capped;
    const name = typeof nameOrIsCapped === 'string' ? nameOrIsCapped : 'Onboard';
    const purchaseMethod = {
        purchaseLocations: ['checkbox-0-on-board'],
        paymentMethods: isCapped
            ? ['checkbox-0-debit-card', 'checkbox-1-credit-card']
            : ['checkbox-0-cash', 'checkbox-1-debit-card'],
        ticketFormats: isCapped ? ['checkbox-0-mobile-app'] : ['checkbox-3-electronic-document'],
        name,
    };

    addPurchaseMethod(purchaseMethod, isCapped);

    // Click on edit and back button
    cy.contains('.card', purchaseMethod.name).contains('Edit').click();
    clickElementByText('Back');

    cy.contains('.card', purchaseMethod.name).should('include.text', purchaseMethod.name);
    cy.contains('.card', purchaseMethod.name).should('include.text', 'Purchase locations: On board');
    if (isCapped) {
        cy.contains('.card', purchaseMethod.name).should('include.text', 'Payment methods: Debit card, Credit card');
    } else {
        cy.contains('.card', purchaseMethod.name).should('include.text', 'Payment methods: Cash, Debit card');
    }
    if (isCapped) {
        cy.contains('.card', purchaseMethod.name).should('include.text', 'Ticket formats: Mobile app');
    } else {
        cy.contains('.card', purchaseMethod.name).should('include.text', 'Ticket formats: Digital');
    }

    cy.contains('.card', purchaseMethod.name).contains('Edit').click();

    const editedPurchaseMethod = {
        purchaseLocations: isCapped
            ? ['checkbox-0-on-board', 'checkbox-1-mobile-device']
            : ['checkbox-0-on-board', 'checkbox-1-online'],
        paymentMethods: isCapped ? ['checkbox-2-mobile-phone'] : ['checkbox-2-credit-card'],
        ticketFormats: isCapped ? ['checkbox-1-smart-card'] : ['checkbox-0-paper-ticket'],
        name: editedName,
    };

    enterPurchaseMethodDetails(editedPurchaseMethod);

    cy.contains('Update purchase method').click();

    cy.contains('.card', editedPurchaseMethod.name).should('include.text', editedPurchaseMethod.name);
    if (isCapped) {
        cy.contains('.card', editedPurchaseMethod.name).should('include.text', 'Purchase locations: Mobile device');
    } else {
        cy.contains('.card', editedPurchaseMethod.name).should('include.text', 'Purchase locations: Online');
    }
    if (isCapped) {
        cy.contains('.card', editedPurchaseMethod.name).should(
            'include.text',
            'Payment methods: Debit card, Credit card, Mobile phone',
        );
    } else {
        cy.contains('.card', editedPurchaseMethod.name).should(
            'include.text',
            'Payment methods: Cash, Debit card, Credit card',
        );
    }
    if (isCapped) {
        cy.contains('.card', editedPurchaseMethod.name).should(
            'include.text',
            'Ticket formats: Mobile app, Smart card',
        );
    } else {
        cy.contains('.card', editedPurchaseMethod.name).should('include.text', 'Ticket formats: Paper ticket, Digital');
    }
};
