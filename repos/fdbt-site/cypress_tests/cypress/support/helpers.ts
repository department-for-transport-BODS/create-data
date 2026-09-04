import 'cypress-file-upload';
import {
    completeFlatFareCarnet,
    completeFlatFarePages,
    completeMultiOpGeoZonePages,
    completePeriodGeoZonePages,
    completeSalesPages,
    completeSinglePages,
    defineUserTypeAndTimeRestrictions,
    FareType,
    selectCarnetFareType,
    selectFareType,
} from './steps';
import { DateInput } from './types';

export const throwInvalidRandomSelectorError = (): never => {
    throw new Error('Invalid random selector');
};

export const getElementById = (id: string): Cypress.Chainable<JQuery> => cy.get(`[id=${id}]`);
export const getElementByText = (text: string): Cypress.Chainable<JQuery> =>
    cy.contains(text) as unknown as Cypress.Chainable<JQuery>;
export const getElementByName = (id: string): Cypress.Chainable<JQuery> => cy.get(`[name=${id}]`);
export const getElementByClass = (id: string): Cypress.Chainable<JQuery> => cy.get(`[class=${id}]`);
export const getElementByDataTestId = (id: string): Cypress.Chainable<JQuery> => cy.get(`[data-test-id=${id}]`);

export const clickElementById = (id: string): Cypress.Chainable<JQuery> => {
    // Wait for the page to hydrate before interacting. The app adds `js-enabled`
    // to <body> once React has mounted (_app.tsx). Clicking before hydration -
    // common on the slower deployed environment - can silently drop the
    // interaction (e.g. a radio selection is lost, so the form submits empty and
    // bounces back on validation). This resolves after hydration, so it avoids
    // acting too early.
    cy.get('body.js-enabled', { timeout: 30000 });
    return getElementById(id).click();
};
export const clickElementByText = (text: string): Cypress.Chainable<JQuery> => getElementByText(text).click();

export const clearAndTypeById = (id: string, text: string): void => {
    getElementById(id).click();
    getElementById(id).clear();
    getElementById(id).type(text);
};

export const clearAndTypeByName = (name: string, text: string): void => {
    getElementByName(name).click();
    getElementByName(name).clear();
    getElementByName(name).type(text);
};

export const getRandomNumber = (min: number, max: number): number => Cypress._.random(min, max);

export const getTestDataName = (name: string): string => (Cypress.env('preprod') ? `Preprod Cypress ${name}` : name);

// Deployed environments occasionally return the generic error page on a page load, and a
// failure inside a `before all` hook is never retried, so reload before reading the page.
export const reloadOnServiceError = (): void => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
        cy.get('body', { timeout: 30000 }).then(($body) => {
            if ($body.text().includes('Sorry, there is a problem with the service')) {
                cy.reload();
            }
        });
    }
};

const loginToPreprod = (isScheme: boolean): void => {
    const email = Cypress.env(isScheme ? 'PREPROD_SCHEME_EMAIL' : 'PREPROD_EMAIL') as string | undefined;
    const password = Cypress.env(isScheme ? 'PREPROD_SCHEME_PASSWORD' : 'PREPROD_PASSWORD') as string | undefined;

    if (!email || !password) {
        const prefix = isScheme ? 'CYPRESS_PREPROD_SCHEME' : 'CYPRESS_PREPROD';
        throw new Error(`${prefix}_EMAIL and ${prefix}_PASSWORD must be set to run preprod tests.`);
    }

    cy.clearCookies();
    cy.visit('/login');
    getElementById('email').type(email);
    getElementById('password').type(password, { log: false });
    clickElementById('sign-in-button');
    cy.location('pathname', { timeout: 30000 }).should('eq', '/home');
};

export const getHomePage = (noc = 'LNUD'): void => {
    if (Cypress.env('preprod')) {
        loginToPreprod(noc === 'scheme');
        return;
    }

    cy.clearCookies();
    cy.visit(`?disableAuth=${noc}`);
};

export const fareTypeToFareTypeIdMapper = (fareType: FareType): string => `radio-option-${fareType}`;

export const startPageLinkClick = (): Cypress.Chainable<JQuery> => clickElementById('faretype-link');

// Clicks the continue submit button and waits for the resulting navigation to
// commit (the URL changes) before returning. Consecutive continues (e.g. the two
// in defineUserTypeAndTimeRestrictions) would otherwise race: the second fires
// while the first's redirect is still in flight and re-submits the previous page.
export const continueButtonClick = (): void => {
    cy.url().then((before) => {
        clickElementById('continue-button');
        cy.url({ timeout: 30000 }).should('not.equal', before);
    });
};

export const submitButtonClick = (): Cypress.Chainable<JQuery> => clickElementById('submit-button');

export const assertElementNotVisibleById = (id: string): Cypress.Chainable<JQuery> =>
    getElementById(id).should('not.be.visible');

export const completeGroupSizePage = (): string => {
    const groupSize = getRandomNumber(1, 30).toString();
    getElementById('max-group-size').type(groupSize);
    continueButtonClick();
    return groupSize;
};

export const randomlyChooseAProof = (): void => {
    const randomSelector = getRandomNumber(1, 3);
    switch (randomSelector) {
        case 1:
            cy.log('Membership card');
            clickElementById('membership-card');
            break;
        case 2:
            cy.log('Student card');
            clickElementById('student-card');
            break;
        case 3:
            cy.log('Identity Document');
            clickElementById('identity-document');
            break;
        default:
            throwInvalidRandomSelectorError();
    }
};

export const randomlyChooseAgeLimits = (): void => {
    const randomSelector = getRandomNumber(1, 4);
    switch (randomSelector) {
        case 1:
            cy.log('Max age, no min age');
            getElementById('age-range-max').type('30');
            break;
        case 2:
            cy.log('Min age, no max age');
            getElementById('age-range-min').type('12');
            break;
        case 3:
            cy.log('Max and min age, diff values');
            getElementById('age-range-min').type('13');
            getElementById('age-range-max').type('18');
            break;
        case 4:
            cy.log('Max and min age, same values');
            getElementById('age-range-min').type('50');
            getElementById('age-range-max').type('50');
            break;
        default:
            throwInvalidRandomSelectorError();
    }
};

export const randomlyChooseSchoolAgeLimits = (): void => {
    const randomSelector = getRandomNumber(1, 2);
    switch (randomSelector) {
        case 1:
            cy.log('age-range-required');
            clickElementById('age-range-required');
            randomlyChooseAgeLimits();
            break;
        case 2:
            cy.log('age-range-not-required');
            clickElementById('age-range-not-required');
            break;
        default:
            throwInvalidRandomSelectorError();
    }
};
export const randomlyChooseASchoolProof = (): void => {
    const randomSelector = getRandomNumber(1, 2);
    switch (randomSelector) {
        case 1:
            cy.log('proof-not-required');
            clickElementById('proof-required');
            randomlyChooseAProof();
            break;
        case 2:
            cy.log('proof-not-required');
            clickElementById('proof-not-required');
            break;
        default:
            throwInvalidRandomSelectorError();
    }
};

export const randomlySelectMultiServices = (): void => {
    const randomSelector = getRandomNumber(1, 3);
    switch (randomSelector) {
        case 1:
            cy.log('Select All button clicked');
            selectAllServices();
            break;
        case 2:
            cy.log('Few checkbox are selected');
            cy.get('.govuk-checkboxes__item').each((checkbox, index, checkboxes) => {
                const numberOfCheckboxes = checkboxes.length;
                if (numberOfCheckboxes === 1 || index !== numberOfCheckboxes - 1) {
                    cy.wrap(checkbox).click();
                }
            });
            break;
        case 3:
            cy.log('All checkbox are selected');
            cy.get('.govuk-checkboxes__item').each((checkbox) => {
                cy.wrap(checkbox).click();
            });
            break;
        default:
            throwInvalidRandomSelectorError();
    }

    // Every branch toggles rather than selects, so when services are already checked
    // (editing an existing product) they can all end up cleared, which the form rejects.
    cy.get('.govuk-checkboxes__input').then(($checkboxes) => {
        if (![...$checkboxes].some((checkbox) => (checkbox as HTMLInputElement).checked)) {
            cy.wrap($checkboxes).first().check();
        }
    });
};

export const completeUserDetailsPage = (group: boolean, maxGroupNumber: string, passengerType: string): void => {
    // Once we leave the passenger types page,
    // check if we have skipped the defining passenger types page due to a saved config
    cy.url()
        .should('not.match', /\/passengerType/) // This is bassicly a wait to ensure we're on the correct page
        .then((url: string) => {
            if (!url.includes('definePassengerType')) {
                cy.log(`Skipped defining passenger types as probably reusing a saved one ${url}`);
                return;
            }

            if (group) {
                getElementById('min-number-of-passengers').type('1');
                getElementById('max-number-of-passengers').type(maxGroupNumber);
                if (passengerType === 'anyone') {
                    continueButtonClick();
                    return;
                }
            }

            assertElementNotVisibleById('age-range-required-conditional');

            const firstRandomSelector = getRandomNumber(1, 2);
            const secondRandomSelector = getRandomNumber(1, 4);

            if (passengerType === 'adult') {
                switch (firstRandomSelector) {
                    case 1:
                        cy.log('No to age range');
                        clickElementById('age-range-not-required');
                        continueButtonClick();
                        break;
                    case 2:
                        cy.log('Yes to age range');
                        clickElementById('age-range-required');
                        randomlyChooseAgeLimits();
                        continueButtonClick();
                        break;
                    default:
                        throwInvalidRandomSelectorError();
                }
            } else {
                switch (secondRandomSelector) {
                    case 1:
                        cy.log('No to both questions');
                        clickElementById('age-range-not-required');
                        clickElementById('proof-not-required');
                        continueButtonClick();
                        break;
                    case 2:
                        cy.log('No to age limit, Yes to Proof');
                        clickElementById('age-range-not-required');
                        clickElementById('proof-required');
                        randomlyChooseAProof();
                        continueButtonClick();
                        break;
                    case 3:
                        cy.log('Yes to age limit, Yes to Proof');
                        clickElementById('age-range-required');
                        randomlyChooseAgeLimits();
                        clickElementById('proof-required');
                        randomlyChooseAProof();
                        continueButtonClick();
                        break;
                    case 4:
                        cy.log('Yes to age limit, No to Proof');
                        clickElementById('age-range-required');
                        randomlyChooseAgeLimits();
                        clickElementById('proof-not-required');
                        continueButtonClick();
                        break;
                    default:
                        throwInvalidRandomSelectorError();
                }
            }
        });
};

export const completeDefineGroupPassengersPages = (groupSize: string): void => {
    const firstPassengerTypeId = `passenger-type-${getRandomNumber(0, 6)}`;
    clickElementById(firstPassengerTypeId);

    let secondPassengerTypeId = `passenger-type-${getRandomNumber(0, 6)}`;
    while (firstPassengerTypeId === secondPassengerTypeId) {
        secondPassengerTypeId = `passenger-type-${getRandomNumber(0, 6)}`;
    }
    clickElementById(secondPassengerTypeId);

    const sortedPassengerTypeIds = [firstPassengerTypeId, secondPassengerTypeId].sort();
    const sortedPassengerTypes: string[] = [];

    getElementById(sortedPassengerTypeIds[0]).then(($elm0) => {
        sortedPassengerTypes.push($elm0.attr('value') ?? '');
        getElementById(sortedPassengerTypeIds[1]).then(($elm1) => {
            sortedPassengerTypes.push($elm1.attr('value') ?? '');
            continueButtonClick();
            sortedPassengerTypes.forEach((passengerType) => {
                completeUserDetailsPage(true, groupSize, passengerType);
            });
        });
    });
};

export const randomlyChooseProductPeriodValidity = (): void => {
    assertElementNotVisibleById('period-validity-end-of-service-required-conditional');

    const randomSelector = getRandomNumber(1, 3);
    switch (randomSelector) {
        case 1:
            cy.log('End of calendar day');
            clickElementById('period-end-calendar');
            break;
        case 2:
            cy.log('End of 24hr period');
            clickElementById('period-twenty-four-hours');
            break;
        case 3:
            cy.log('End of service day');
            clickElementById('period-end-of-service');
            break;
        default:
            throwInvalidRandomSelectorError();
    }
};

export const selectRandomOptionFromDropDown = (dropDownId: string): void => {
    cy.get(`[id=${dropDownId}]`)
        .find('option')
        .then(($elm) => {
            const numberOfOptions = $elm.length;
            const randomSelector = getRandomNumber(1, numberOfOptions - 1);
            $elm.get(randomSelector).setAttribute('selected', 'selected');
        })
        .parent()
        .trigger('change');
    cy.get(`[id=${dropDownId}] option:selected`).then(($selected) => {
        cy.wrap($selected.text()).as('dropdownValue');
    });
};

export const completePricingPerDistancePage = (productName: string): void => {
    getElementById('product-name').type(productName);
    getElementById('minimum-price').type('1.0');
    getElementById('maximum-price').type('2.6');

    const randomSelector = getRandomNumber(1, 4);
    cy.log(`Random Selector ${randomSelector}`);
    for (let i = 0; i < randomSelector; i++) {
        if (i !== randomSelector - 1) {
            getElementById('add-another-button').click();
        }
        cy.log(`Checking for ${i}`);
        const fromDistance = (i * 2).toString();
        const toDistance = ((i + 1) * 2).toString();
        const pricePerKm = ((i + 1) * 3).toString();

        cy.log(`Row(${i}): ${fromDistance}, ${toDistance}, Price: ${pricePerKm}`);
        getElementById(`price-per-km-${i}`).type(pricePerKm);

        if (i !== 0) {
            clearAndTypeById(`distance-from-${i}`, fromDistance);
        }

        if (i !== randomSelector - 1) {
            clearAndTypeById(`distance-to-${i}`, toDistance);
        }
    }
};

export const completeGroupPassengerDetailsPages = (): void => {
    const groupSize = completeGroupSizePage();
    completeDefineGroupPassengersPages(groupSize);
};

export const randomlyDetermineUserType = (): void => {
    let passengerType;
    // Scope to the passenger type radios (name="passengerTypeId") rather than any
    // `.govuk-radios__input`, so Cypress waits for the select passenger type page
    // to render instead of grabbing radios from the previous page mid-navigation
    // (e.g. the fareType page's `radio-option-*` radios).
    cy.get('[name="passengerTypeId"]')
        .its('length')
        .then((length) => {
            const randomNumber = getRandomNumber(0, length - 1);
            cy.get('[name="passengerTypeId"]').eq(randomNumber).click();
            cy.get('[name="passengerTypeId"]')
                .eq(randomNumber)
                .then(($radio) => {
                    // The radio id is `${name}-radio`; derive the passenger type name from it
                    passengerType = $radio.attr('id')?.replace(/-radio$/, '');
                    cy.wrap(passengerType).as('passengerType');
                });
        });

    continueButtonClick();
};

export const randomlyDeterminePurchaseType = (isOtherProduct?: boolean): void => {
    let purchaseType: string;
    getElementByClass('govuk-checkboxes__input')
        .its('length')
        .then((length) => {
            const randomNumber = getRandomNumber(0, length - 1);
            getElementByClass('govuk-checkboxes__input').eq(randomNumber).click();
            getElementByClass('govuk-checkboxes__input')
                .eq(randomNumber)
                .then(($radio) => {
                    const radioPurchaseType = $radio.attr('value') ?? '';
                    purchaseType = (JSON.parse(radioPurchaseType) as { name: string }).name;
                    cy.wrap(purchaseType).as('purchaseType');
                    if (isOtherProduct) {
                        cy.get(`[id$=price-${randomNumber}]`).then(($radio) => {
                            purchaseType = `${purchaseType} - £${$radio.attr('value')}`;
                            cy.wrap(purchaseType).as('purchaseType');
                        });
                    }
                });
        });
    continueButtonClick();
};

export const selectTimeRestriction = (): void => {
    // randomly pick a time restriction
    getElementById('conditional-time-restriction')
        .find('[class=govuk-radios__input]')
        .its('length')
        .then((length) => {
            const randomNumber = getRandomNumber(0, length - 1);
            getElementById('conditional-time-restriction').find('[class=govuk-radios__input]').eq(randomNumber).click();
            getElementById('conditional-time-restriction')
                .find('[class=govuk-radios__input]')
                .eq(randomNumber)
                .then(($radio) => {
                    const timeRestriction = $radio.attr('value');
                    cy.wrap(timeRestriction).as('timeRestriction');
                });
        });
};

export const randomlyDecideTimeRestrictions = (isEditing?: boolean): void => {
    const timeRestriction = 'N/A';
    const randomNumber = getRandomNumber(0, 1);
    cy.log('Is yes chosen?', randomNumber === 1);
    cy.wrap(timeRestriction).as('timeRestriction');
    let noSelected = true;
    cy.wrap(noSelected).as('noSelected');
    if (isEditing) {
        cy.get('.govuk-radios__input').each(($radio) => {
            if ($radio.attr('value') === 'Premade' && $radio.prop('checked')) {
                noSelected = false;
                cy.wrap(noSelected).as('noSelected');
            }
        });
        cy.get('@noSelected').then((noSelected) => {
            if (!noSelected) {
                if (randomNumber === 0) {
                    // if yes is selected and the random number says to select no
                    clickElementById('valid-days-not-required');
                } else {
                    // if yes is selected and the random number says to select yes change time restriction
                    selectTimeRestriction();
                }
            }
        });
    }
    cy.get('@noSelected').then((noSelected) => {
        if (noSelected) {
            if (randomNumber === 1) {
                // choose "Yes" and pick a time restriction
                clickElementById('valid-days-required');
                selectTimeRestriction();
            } else {
                // Explicitly choose "No" rather than relying on the radio's default
                // checked state, so the form always submits a valid selection and
                // doesn't bounce back on validation.
                clickElementById('valid-days-not-required');
            }
        }
    });
    continueButtonClick();
};

export const randomlyDecideTermRestrictions = (): void => {
    if (getRandomNumber(0, 1) === 0) {
        clickElementById('term-time-no');
    } else {
        clickElementById('term-time-yes');
    }
    continueButtonClick();
};

export const clickAllCheckboxes = (): string[] => {
    const input: string[] = [];
    getElementByClass('govuk-checkboxes__input').each((checkbox, index) => {
        cy.wrap(checkbox).check({ force: true });
        const name = checkbox.attr('name');
        input[index] = name?.split('#')[0] ?? '';
        cy.wrap(input).as('input');
    });
    return input;
};

export const getAllCheckboxesData = (): void => {
    const input: string[] = [];
    getElementByClass('govuk-checkboxes__input').each((checkbox, index) => {
        cy.wrap(checkbox);
        const name = checkbox.attr('name');
        input[index] = name?.split('#')[0] ?? '';
        cy.wrap(input).as('input');
    });
};

export const getAllButFirstCheckbox = (): void => {
    const input: string[] = [];
    getElementByClass('govuk-checkboxes__input').each((checkbox, index) => {
        const name = checkbox.attr('name');
        input[index] = name?.split('#')[0] || '';
        cy.wrap(input).as('input');
    });
    cy.get('@input').then((input) => {
        const newInputWithoutFirstItem = JSON.stringify(input).split(',').slice(1);
        cy.wrap(newInputWithoutFirstItem).as('input');
    });
};

export const clickSomeCheckboxes = (): void => {
    const input: string[] = [];
    getElementByClass('govuk-checkboxes__input').each((checkbox, index, checkboxes) => {
        const numberOfCheckboxes = checkboxes.length;
        if (numberOfCheckboxes === 1 || index !== numberOfCheckboxes - 1) {
            cy.wrap(checkbox).check({ force: true });
            const name = checkbox.attr('name');
            input[index] = name?.split('#')[0] ?? '';
            cy.wrap(input).as('input');
        }
    });
};

export const clickFirstCheckboxIfMultiple = (): void => {
    getElementByClass('govuk-checkboxes__input').each((checkbox, index, checkboxes) => {
        if (checkboxes.length > 1 && index === 0) {
            cy.wrap(checkbox).uncheck({ force: true });
        }
    });
};

const encodeId = (str: string): string =>
    str
        .replace(/ /g, '')
        .replace(/([()])/g, '\\$1')
        .trim();

export const completeSalesOfferPackagesForMultipleProducts = (
    numberOfProducts: number,
    multiProductNamePrefix: string,
): void => {
    for (let i = 0; i < numberOfProducts; i += 1) {
        const productName = `${encodeId(multiProductNamePrefix)}${i + 1}`;
        const idPrefix = `product-${productName}-checkbox-`;

        cy.get('.govuk-checkboxes__input').then(($elements) => {
            const numberOfSalesOfferPackages = $elements.length / numberOfProducts;
            const randomSalesOfferPackageIndex = getRandomNumber(0, numberOfSalesOfferPackages - 1);

            getElementById(`${idPrefix}${randomSalesOfferPackageIndex}`).click();
            getElementById(`${idPrefix}${randomSalesOfferPackageIndex}`).should('be.checked');
            if (getRandomNumber(0, 1) === 1 && numberOfSalesOfferPackages > 1) {
                const otherIndex =
                    randomSalesOfferPackageIndex === numberOfSalesOfferPackages - 1
                        ? randomSalesOfferPackageIndex - 1
                        : randomSalesOfferPackageIndex + 1;

                // Wait for the checkbox state to settle (it re-renders the price input) before typing
                getElementById(`${idPrefix}${otherIndex}`).click();
                getElementById(`${idPrefix}${otherIndex}`).should('be.checked');
                getElementById(`${productName}-price-${otherIndex}`).should('be.enabled');
                clearAndTypeById(`${productName}-price-${otherIndex}`, '9.99');
            }
        });
    }
};

// The select all button is a toggle whose label starts as "Unselect All Services" when the
// product already had every service, so a single click can clear the list instead of filling it.
const selectAllServices = (): void => {
    clickElementById('select-all-button');
    cy.get('.govuk-checkboxes__input').then(($checkboxes) => {
        if (![...$checkboxes].some((checkbox) => (checkbox as HTMLInputElement).checked)) {
            clickElementById('select-all-button');
        }
    });
};

export const randomlyChooseAndSelectServices = (): void => {
    // to unselect all boxes when editing
    cy.get('.govuk-checkboxes__input').each((checkbox) => {
        if (checkbox.prop('checked')) {
            cy.wrap(checkbox).uncheck({ force: true });
        }
    });

    const randomSelector = getRandomNumber(1, 4);
    switch (randomSelector) {
        case 1: {
            cy.log('Click Select All button and continue');
            selectAllServices();
            getAllCheckboxesData();
            break;
        }
        case 2: {
            cy.log('Loop through checkboxes and click all, then continue');
            clickAllCheckboxes();
            break;
        }
        case 3: {
            cy.log('Loop through checkboxes and click random ones, then continue');
            clickSomeCheckboxes();
            break;
        }
        case 4: {
            cy.log('Click Select All button and then click first checkbox to deselect, then continue');
            selectAllServices();
            getAllButFirstCheckbox();
            clickFirstCheckboxIfMultiple();
            break;
        }
        default: {
            throwInvalidRandomSelectorError();
        }
    }
};

export const completeProductDateInformationPage = (): DateInput => {
    const randomSelector = getRandomNumber(1, 2);
    let input;
    switch (randomSelector) {
        case 1: {
            getElementById('start-day-input').type('13');
            getElementById('start-month-input').type('10');
            getElementById('start-year-input').type('2010');
            input = { startDate: '13/10/2010' };
            break;
        }
        case 2: {
            getElementById('start-day-input').type('13');
            getElementById('start-month-input').type('10');
            getElementById('start-year-input').type('2010');
            getElementById('end-day-input').type('7');
            getElementById('end-month-input').type('12');
            getElementById('end-year-input').type('2025');
            input = {
                startDate: '13/10/2010',
                endDate: '07/12/2025',
            };
            break;
        }
        default: {
            throwInvalidRandomSelectorError();
        }
    }
    continueButtonClick();
    return input as DateInput;
};

export const isFinished = (): void => {
    getElementByDataTestId('final-page-banner').should('exist');
};

export const uploadFile = (elementId: string, fileName: string): void => {
    const preprodFileName = fileName.replace(/\.csv$/, '.preprod.csv');
    const fixture = Cypress.env('preprod') && fileName.startsWith('fareZone') ? preprodFileName : fileName;
    getElementById(elementId).attachFile(fixture);
};

export const completeMultipleProducts = (
    numberOfProducts = 1,
    multiProductNamePrefix?: string,
    carnet?: boolean,
): void => {
    for (let i = 0; i < numberOfProducts; i += 1) {
        if (i !== 0) {
            clickElementById('add-another-button');
        }

        getElementById(`multiple-product-name-${i}`).type(`${multiProductNamePrefix ?? 'product '}${i + 1}`);
        getElementById(`multiple-product-price-${i}`).type(`1${i}`);
        getElementById(`product-details-period-duration-quantity-${i}`).type(`2${i}`);
        selectRandomOptionFromDropDown(`product-details-period-duration-unit-${i}`);
        if (carnet) {
            getElementById(`product-details-carnet-quantity-${i}`).type((2 + i).toString());
            getElementById(`product-details-carnet-expiry-quantity-${i}`).type('1');
            selectRandomOptionFromDropDown(`product-details-carnet-expiry-unit-${i}`);
        }
    }

    continueButtonClick();
    randomlyChooseProductPeriodValidity();
    continueButtonClick();
    continueButtonClick();
};

export const clickRandomElementInTable = (tableName: string, elementId: string): void => {
    getElementByClass(tableName)
        .find('tr')
        .then((elm) => {
            const randomSelector = getRandomNumber(0, elm.length - 1);
            clickElementById(`${elementId}-${randomSelector}`);
        });
};

export const completeOperatorSearch = (): void => {
    const operatorGroupName = getTestDataName('test');
    cy.contains('h4', operatorGroupName).parents('.card').find('.govuk-radios__input').click();

    continueButtonClick();
};

export const addOtherProductsIfNotPresent = (): void => {
    getHomePage();
    clickElementById('manage-fares-link');
    clickElementByText('Other products');

    let numberOfPeriodProducts = 0;
    cy.wrap(numberOfPeriodProducts).as('numberOfPeriodProducts');
    let numberOfFlatFareProducts = 0;
    cy.wrap(numberOfFlatFareProducts).as('numberOfFlatFareProducts');
    let numberOfFlatFareCarnetProducts = 0;
    cy.wrap(numberOfFlatFareCarnetProducts).as('numberOfFlatFareCarnetProducts');
    let flatFareWithExemptions = false;
    cy.wrap(flatFareWithExemptions).as('flatFareWithExemptions');

    // The other products page renders server-side and fetches matching JSON from
    // S3 (plus DB lookups) for every existing product, so it can take well over
    // Cypress's 4s default to load on the deployed environment. Allow more time.
    cy.get(`[data-card-count]`, { timeout: 30000 }).then((element) => {
        const totNumberOfProducts = Number(element.attr('data-card-count'));
        if (totNumberOfProducts > 0) {
            getElementByClass('govuk-table__body')
                .find('td')
                .each(($element) => {
                    const type = $element.text();
                    if (type === 'Period') {
                        numberOfPeriodProducts += 1;
                        cy.wrap(numberOfPeriodProducts).as('numberOfPeriodProducts');
                    }
                    if (type === 'Flat fare') {
                        numberOfFlatFareProducts += 1;
                        cy.wrap(numberOfFlatFareProducts).as('numberOfFlatFareProducts');
                    }
                    if (type === 'Flat fare carnet') {
                        numberOfFlatFareCarnetProducts += 1;
                        cy.wrap(numberOfFlatFareCarnetProducts).as('numberOfFlatFareCarnetProducts');
                    }
                });
        }
    });

    cy.get('@numberOfPeriodProducts').then((numberOfPeriodProducts) => {
        if (Number(numberOfPeriodProducts) === 0) {
            selectFareType('period', false);
            defineUserTypeAndTimeRestrictions();
            completePeriodGeoZonePages(1);
            completeSalesPages();
            isFinished();
            cy.log('Period product set up');
        }
    });

    cy.get('@numberOfFlatFareProducts').then((numberOfFlatFareProducts) => {
        if (Number(numberOfFlatFareProducts) === 0) {
            selectFareType('flatFare', false);
            defineUserTypeAndTimeRestrictions();
            clickElementById('radio-option-multipleServices');
            continueButtonClick();
            completeFlatFarePages(getTestDataName('Flat Fare Test Product'), false);
            completeSalesPages();
            isFinished();
            cy.log('Flat fare product set up');
        }
        getHomePage();
        clickElementById('manage-fares-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__row').each(($row) => {
            const rowText = $row.text();
            if (rowText.includes(getTestDataName('Flat Fare Exemptions Test Product'))) {
                flatFareWithExemptions = true;
                cy.wrap(flatFareWithExemptions).as('flatFareWithExemptions');
            }
        });
    });

    cy.get('@numberOfFlatFareCarnetProducts').then((numberOfFlatFareProducts) => {
        if (Number(numberOfFlatFareProducts) === 0) {
            selectCarnetFareType('flatFare');
            defineUserTypeAndTimeRestrictions();
            completeFlatFareCarnet();
            completeSalesPages(3, 'Flat fare carnet ');
            isFinished();
            cy.log('Flat fare carnet product set up');
        }
    });

    cy.get('@flatFareWithExemptions').then((flatFareWithExemptions) => {
        if (JSON.stringify(flatFareWithExemptions) === 'false') {
            selectFareType('flatFare', false);
            defineUserTypeAndTimeRestrictions();
            clickElementById('radio-option-geoZone');
            continueButtonClick();
            completeFlatFarePages(getTestDataName('Flat Fare Exemptions Test Product'), false, false, true, false);
            completeSalesPages();
            isFinished();
            cy.log('Flat fare with exemptions product set up');
        }
    });
};

export const addMultiOperatorProductIfNotPresent = (): void => {
    getHomePage();
    clickElementById('manage-fares-link');
    clickElementByText('Multi-operator products (internal)');

    cy.get(`[data-card-count]`).then((element) => {
        const numberOfProducts = Number(element.attr('data-card-count'));

        if (numberOfProducts === 0) {
            selectFareType('multiOperator', false);
            defineUserTypeAndTimeRestrictions();
            completeMultiOpGeoZonePages();
            completeSalesPages();
            isFinished();
        }
    });
};

export const addSingleProductIfNotPresent = (): void => {
    const hasProduct: string[] = [];
    cy.wrap(hasProduct).as('hasProduct');
    getHomePage();
    clickElementById('account-link');
    clickElementByText('Services');
    cy.get(`[id^="active-products-"]`).each(($element) => {
        if (parseInt($element.text()) > 0) {
            hasProduct.push($element.text());
            cy.wrap(hasProduct).as('hasProduct');
        }
    });
    cy.get('@hasProduct').then((hasProduct) => {
        if (hasProduct.length === 0) {
            const randomSelector = getRandomNumber(1, 2);
            if (randomSelector === 1) {
                cy.log('Making a single product with CSV upload');
                clickElementByText('Create new product');
                selectCarnetFareType('single');
                defineUserTypeAndTimeRestrictions();
                completeSinglePages(true, true);
                completeSalesPages();
                isFinished();
            } else {
                cy.log('Making a single product with manual upload');
                clickElementByText('Create new product');
                selectCarnetFareType('single');
                defineUserTypeAndTimeRestrictions();
                completeSinglePages(false, true);
                completeSalesPages();
                isFinished();
            }
        }
    });
};

export const retryRouteChoiceOnReturnProductError = (): void => {
    cy.get('main').then(($main) => {
        if ($main.text().includes('this service only operates in one direction')) {
            cy.log('Service only operates in one direction, continuing as a circular service');
            if (Cypress.env('preprod')) {
                clickElementById('continue-button');
            } else {
                continueButtonClick();
            }
        }
    });
};

export const clearDates = (): void => {
    getElementById('start-day-input').clear();
    getElementById('start-month-input').clear();
    getElementById('start-year-input').clear();
    getElementById('end-day-input').clear();
    getElementById('end-month-input').clear();
    getElementById('end-year-input').clear();
};

export const completeMultiServicePages = (): void => {
    randomlySelectMultiServices();
    getElementById('operator-1').click();
    randomlySelectMultiServices();
    continueButtonClick();
};
