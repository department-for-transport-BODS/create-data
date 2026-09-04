import { clickElementById, getElementByClass, getElementById, getHomePage } from './helpers';

export const deleteAllCards = (): void => {
    cy.get('body').then(($body) => {
        const length = Number($body.find('[data-card-count]').attr('data-card-count'));

        for (let i = length - 1; i >= 0; i--) {
            getElementByClass('card').eq(i).contains('Delete').click();
            getElementById('popup-delete-button').click();
        }
    });

    cy.get('body').should(($body) => {
        expect($body.find('.card')).to.have.length(0);
    });
};

export const startGlobalSettings = (): void => {
    getHomePage('GS');

    clickElementById('account-link');
};
