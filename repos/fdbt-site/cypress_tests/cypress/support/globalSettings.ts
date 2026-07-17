import { clickElementById, getElementByClass, getElementById, getHomePage } from './helpers';

export const deleteAllCards = (): void => {
    cy.get(`[data-card-count]`).then((element) => {
        const length = Number(element.attr('data-card-count'));

        // In reverse so we delete groups first before the individuals
        for (let i = length - 1; i >= 0; i--) {
            getElementByClass('card').eq(i).contains('Delete').click();
            getElementById('popup-delete-button').click();
        }
    });

    getElementByClass('card').should('not.exist');
};

export const startGlobalSettings = (): void => {
    getHomePage('GS');

    clickElementById('account-link');
};
