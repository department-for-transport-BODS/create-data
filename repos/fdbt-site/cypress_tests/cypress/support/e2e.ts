import {
    addOtherProductsIfNotPresent,
    addSingleProductIfNotPresent,
    clearAndTypeById,
    clickElementById,
    clickElementByText,
    getHomePage,
    getTestDataName,
    reloadOnServiceError,
} from './helpers';
import { addSingleMultiOperatorGroup } from './multiOperatorGroups';
import { enterPassengerTypeDetails, addGroupPassengerType } from './passengerTypes';
import { addPurchaseMethod } from './purchaseMethods';
import { addTimeRestriction } from './timeRestrictions';

const isPreprod = Cypress.env('preprod');
const isSchemeSpec = Cypress.spec.relative.endsWith('scheme.cy.ts');
const skipsNormalBootstrap = isPreprod && (Cypress.spec.relative.includes('globalSettings/') || isSchemeSpec);

const setUpSchemeGlobalSettings = (): void => {
    getHomePage('scheme');
    clickElementById('account-link');
    clickElementByText('Passenger types');
    addTestPassengerTypes();
    clickElementByText('Purchase methods');
    addTestPurchaseMethods();
    clickElementByText('Time restrictions');
    addTestTimeRestrictions();
    clickElementByText('Fare day end');
    addTestFareDayEnd();
    // Ensure the fare day end save popup has closed before navigating away
    cy.get('.popup').should('not.exist');
    clickElementByText('Operator groups');
    addTestOperatorGroups();
    clickElementByText('Operator details');
    addTestOperatorDetails();
    cy.log('Global Settings set up for scheme');
};

if (isPreprod && isSchemeSpec) {
    // The scheme operator needs its own settings and operator details, otherwise the
    // fare type page redirects to /manageOperatorDetails before any journey can start.
    before(() => {
        setUpSchemeGlobalSettings();
    });
}

if (!skipsNormalBootstrap) {
    before(() => {
        cy.log('index.ts was run');
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Passenger types');
        addTestPassengerTypes();
        clickElementByText('Purchase methods');
        addTestPurchaseMethods();
        clickElementByText('Time restrictions');
        addTestTimeRestrictions();
        clickElementByText('Fare day end');
        addTestFareDayEnd();
        // Ensure the fare day end save popup has closed before navigating away
        cy.get('.popup').should('not.exist');
        clickElementByText('Operator groups');
        addTestOperatorGroups();

        addSingleProductIfNotPresent();
        addOtherProductsIfNotPresent();
        cy.log('Global Settings set up for LNUD');

        setUpSchemeGlobalSettings();
    });
}

const addTestOperatorDetails = (): void => {
    clearAndTypeById('operatorName', 'Easy A to B');
    clearAndTypeById('contactNumber', '01492 451 652');
    clearAndTypeById('email', 'info@easyab.co.uk');
    clearAndTypeById('url', 'www.easyab.co.uk');
    clearAndTypeById('street', '123 Some Road');
    clearAndTypeById('town', 'Awesomeville');
    clearAndTypeById('county', 'Home County');
    clearAndTypeById('postcode', 'AW23 8LE');
    clickElementByText('Save');
};

const addTestOperatorGroups = (): void => {
    reloadOnServiceError();
    cy.get(`[data-card-count]`).then((element) => {
        const numberofOperatorGroups = Number(element.attr('data-card-count'));
        cy.log(`There are ${numberofOperatorGroups} operator groups`);
        cy.get(`[operator-groups]`).then((element) => {
            const operatorGroups = element.attr('operator-groups')?.toString();
            const operatorGroupsValue = operatorGroups?.split(',') ?? [];
            const testGroupName = getTestDataName('test');
            const testGroupTwoName = getTestDataName('test2');
            if (!operatorGroupsValue.includes(testGroupName)) {
                addSingleMultiOperatorGroup(testGroupName, false, true);
            }
            if (!operatorGroupsValue.includes(testGroupTwoName)) {
                addSingleMultiOperatorGroup(testGroupTwoName, false, false);
            }
        });
    });
};

const addTestFareDayEnd = (): void => {
    clearAndTypeById('fare-day-end-input', '2323');
    clickElementByText('Save');
    clickElementByText('Ok');
};

const addTestPassengerTypes = (): void => {
    cy.get(`[data-card-count]`).then((element) => {
        const numberOfPassengers = Number(element.attr('data-card-count'));
        cy.log(`There are ${numberOfPassengers} individuals/groups`);
        if (numberOfPassengers > 1) {
            cy.log('There is at least two passenger types');
        } else {
            const passengerType1 = {
                type: 'child',
                maxAge: 18,
                name: getTestDataName('Small People'),
            };
            const passengerType2 = {
                type: 'student',
                documents: ['student_card'],
                name: getTestDataName('Test Students'),
            };
            const passengerType3 = {
                type: 'adult',
                name: getTestDataName('Big People'),
            };
            cy.log('Add three Individuals, one Groups');
            clickElementByText('Add a passenger type');
            enterPassengerTypeDetails(passengerType1);
            clickElementByText('Add passenger type');

            clickElementByText('Add a passenger type');
            enterPassengerTypeDetails(passengerType2);
            clickElementByText('Add passenger type');

            clickElementByText('Add a passenger type');
            enterPassengerTypeDetails(passengerType3);
            clickElementByText('Add passenger type');
            addGroupPassengerType(getTestDataName('Test Group'));
        }
    });
};

const addTestPurchaseMethods = (): void => {
    const purchaseMethods = [
        {
            purchaseLocations: ['checkbox-0-on-board'],
            paymentMethods: ['checkbox-0-cash', 'checkbox-1-debit-card'],
            ticketFormats: ['checkbox-3-electronic-document'],
            name: getTestDataName('Test Onboard'),
        },
        {
            purchaseLocations: ['checkbox-2-mobile-device'],
            paymentMethods: ['checkbox-0-cash', 'checkbox-1-debit-card'],
            ticketFormats: ['checkbox-3-electronic-document'],
            name: getTestDataName('Test Mobile'),
        },
        {
            purchaseLocations: ['checkbox-1-online'],
            paymentMethods: ['checkbox-1-debit-card'],
            ticketFormats: ['checkbox-3-electronic-document'],
            name: getTestDataName('Test Online'),
        },
    ];
    const cappedPurchaseMethods = [
        {
            purchaseLocations: ['checkbox-0-on-board'],
            paymentMethods: ['checkbox-0-debit-card', 'checkbox-1-credit-card'],
            ticketFormats: ['checkbox-0-mobile-app'],
            name: getTestDataName('Test capped onboard'),
        },
        {
            purchaseLocations: ['checkbox-0-on-board', 'checkbox-1-mobile-device'],
            paymentMethods: ['checkbox-2-mobile-phone'],
            ticketFormats: ['checkbox-0-mobile-app'],
            name: getTestDataName('Test capped mobile'),
        },
    ];

    // These are client-side (Next Link) navigations and the previous settings
    // page also has [data-card-count]/.card, so explicitly wait until the
    // purchase methods page itself has rendered (URL + its unique "Add a purchase
    // method" button) before reading existing names. Then only add the methods
    // that aren't already present (matched by name) so the setup is idempotent
    // and can be re-run without failing on duplicates.
    cy.url().should('include', 'viewPurchaseMethods');
    cy.contains('a', 'Add a purchase method').should('be.visible');

    cy.then(() => {
        const existingNames = Cypress.$('.card h4')
            .map((_, element) => element.textContent?.trim())
            .get();

        purchaseMethods.forEach((purchaseMethod) => {
            if (!existingNames.includes(purchaseMethod.name)) {
                addPurchaseMethod(purchaseMethod);
            }
        });

        cappedPurchaseMethods.forEach((cappedPurchaseMethod) => {
            if (!existingNames.includes(cappedPurchaseMethod.name)) {
                addPurchaseMethod(cappedPurchaseMethod, true);
            }
        });
    });
};

export const addTestTimeRestrictions = (): void => {
    cy.get(`[data-card-count]`).then((element) => {
        const numberOfTimeRestrictions = Number(element.attr('data-card-count'));
        cy.log(`There are ${numberOfTimeRestrictions} time restrictions`);
        if (numberOfTimeRestrictions > 0) {
            cy.log('There is at least one time restriction');
        } else {
            const timeRestriction1 = {
                days: [
                    'time-restriction-day-0',
                    'time-restriction-day-1',
                    'time-restriction-day-2',
                    'time-restriction-day-3',
                    'time-restriction-day-4',
                ],
                name: getTestDataName('Test Weekdays'),
            };
            const timeRestriction2 = {
                days: ['time-restriction-day-5', 'time-restriction-day-6'],
                name: getTestDataName('Test Weekends'),
            };
            const timeRestriction3 = {
                days: ['time-restriction-day-6', 'time-restriction-day-7'],
                name: getTestDataName('Test Bank Holidays'),
            };
            cy.log('Add three time restrictions');
            addTimeRestriction(timeRestriction1);
            addTimeRestriction(timeRestriction2);
            addTimeRestriction(timeRestriction3);
        }
    });
};
