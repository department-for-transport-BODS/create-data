import { clearAndTypeById, clickElementById, clickElementByText, continueButtonClick } from './helpers';

const addExtraOperator = (): void => {
    clearAndTypeById('search-input', 'Pil');
    clickElementById('search-button');
    clickElementByText('Pilkingtonbus - NWBT');
};

export const addSingleMultiOperatorGroup = (name: string, addExtra: boolean, addMulti: boolean): void => {
    clickElementByText('Add an operator group');
    if (addMulti) {
        clearAndTypeById('search-input', 'bus');
        clickElementById('search-button');
        clickElementByText('Preston Bus - PBLT');
        clearAndTypeById('search-input', 'bus');
        clickElementById('search-button');
        clickElementByText('The Blackburn Bus Company - LNUD');
    }
    if (addExtra || !addMulti) {
        addExtraOperator();
    }
    clearAndTypeById('operator-group-name', name);
    continueButtonClick();
};

const checkCardBody = (card: Cypress.Chainable<JQuery<HTMLElement>>, valuesToCompare: string[]): void => {
    for (const value of valuesToCompare) {
        card.should('contain.text', value);
    }
};

export const createEditMultiOperatorGroups = (namePrefix = 'MultiOperator Group'): void => {
    const multiOperatorGroup1 = `${namePrefix} Group 1`;
    const multiOperatorGroup2 = `${namePrefix} Group 2`;

    addSingleMultiOperatorGroup(multiOperatorGroup1, false, true);

    // Click on edit and back button
    cy.contains('.card', multiOperatorGroup1).contains('Edit').click();
    clickElementByText('Back');

    const valuesToCompareFirst = ['Preston Bus - PBLT', 'The Blackburn Bus Company - LNUD'];
    cy.contains('.card', multiOperatorGroup1).should('contain.text', multiOperatorGroup1);
    checkCardBody(cy.contains('.card', multiOperatorGroup1), valuesToCompareFirst);
    cy.contains('.card', multiOperatorGroup1).contains('Edit').click();
    clearAndTypeById('search-input', 'Pil');
    clickElementById('search-button');
    clickElementByText('Pilkingtonbus - NWBT');
    continueButtonClick();
    valuesToCompareFirst.push('Pilkingtonbus - NWBT');
    checkCardBody(cy.contains('.card', multiOperatorGroup1), valuesToCompareFirst);

    const valuesToCompareSecond = ['Preston Bus - PBLT', 'The Blackburn Bus Company - LNUD', 'Pilkingtonbus - NWBT'];
    addSingleMultiOperatorGroup(multiOperatorGroup2, true, true);
    cy.contains('.card', multiOperatorGroup2).should('contain.text', multiOperatorGroup2);
    checkCardBody(cy.contains('.card', multiOperatorGroup2), valuesToCompareSecond);
    cy.contains('.card', multiOperatorGroup2).contains('Edit').click();
    clickElementById('remove-0');
    continueButtonClick();
    valuesToCompareSecond.shift();
    checkCardBody(cy.contains('.card', multiOperatorGroup2), valuesToCompareSecond);
};
