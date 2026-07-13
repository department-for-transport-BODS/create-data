import {
    startPageLinkClick,
    clickElementById,
    clearAndTypeById,
    continueButtonClick,
    randomlyDetermineUserType,
    randomlyDecideTimeRestrictions,
    randomlyChooseAndSelectServices,
    getElementById,
    getHomePage,
    fareTypeToFareTypeIdMapper,
    selectRandomOptionFromDropDown,
    uploadFile,
    submitButtonClick,
    completeProductDateInformationPage,
    getRandomNumber,
    completeSalesOfferPackagesForMultipleProducts,
    completeMultipleProducts,
    completeOperatorSearch,
    clickSomeCheckboxes,
    randomlyDecideTermRestrictions,
    randomlyChooseProductPeriodValidity,
    clickRandomElementInTable,
    clickElementByText,
    retryRouteChoiceOnReturnProductError,
    clearDates,
    randomlyDeterminePurchaseType,
    completeMultiServicePages,
    getElementByClass,
    completePricingPerDistancePage,
} from './helpers';

const stringify = (item: unknown) => JSON.stringify(item).replace(/"/g, '');

export const defineUserTypeAndTimeRestrictions = (isEditing?: boolean): void => {
    randomlyDetermineUserType();
    randomlyDecideTimeRestrictions(isEditing);

    continueButtonClick();
};

export type FareType =
    | 'single'
    | 'period'
    | 'return'
    | 'flatFare'
    | 'multiOperator'
    | 'multiOperatorExt'
    | 'schoolService'
    | 'carnet'
    | 'carnetFlatFare'
    | 'carnetPeriod';

export const defineSchoolUserAndTimeRestrictions = (): void => {
    randomlyDetermineUserType();
    randomlyDecideTermRestrictions();
};

export const selectFareType = (fareType: FareType, isScheme: boolean): void => {
    getHomePage(isScheme ? 'scheme' : 'LNUD');
    startPageLinkClick();
    clickElementById(fareTypeToFareTypeIdMapper(fareType));
    continueButtonClick();
};

export const selectCarnetFareType = (fareType: FareType): void => {
    selectFareType('carnet', false);
    // Wait for the carnet fare type page to load before selecting, otherwise we
    // can click the radio on the still-present fareType page mid-navigation and
    // submit an empty selection (which redirects back to /carnetFareType).
    cy.url().should('include', 'carnetFareType');
    clickElementById(fareTypeToFareTypeIdMapper(fareType));
    continueButtonClick();
};

export const completeFlatFarePages = (
    productName: string,
    isScheme: boolean,
    isCarnet = false,
    isGeoZone = false,
    isByDistance = false,
): void => {
    if (isScheme) {
        completeOperatorSearch();
        // Scheme operators are routed to the multi-operator service list to select
        // services for each operator in the group before entering product details
        clickElementById('select-all-button');
        getElementById('operator-1').click();
        clickElementById('select-all-button');
        continueButtonClick();
    } else if (isGeoZone) {
        uploadFile('csv-upload', 'fareZone.csv');
        submitButtonClick();
    } else {
        randomlyChooseAndSelectServices();
        continueButtonClick();
    }

    if (isByDistance) {
        completePricingPerDistancePage(productName);
    } else {
        getElementById('multiple-product-name-0').type(productName);
        getElementById('multiple-product-price-0').type('50.50');
    }

    if (isCarnet) {
        getElementById('product-details-carnet-quantity-0').type('20');
        getElementById('product-details-carnet-expiry-quantity-0').type('6');
        selectRandomOptionFromDropDown('product-details-carnet-expiry-unit-0');
    }

    continueButtonClick();
    continueButtonClick();
};

export const completeFlatFareCarnet = (): void => {
    clickElementById('radio-option-multipleServices');
    continueButtonClick();
    randomlyChooseAndSelectServices();
    continueButtonClick();

    for (let i = 0; i < 3; i += 1) {
        getElementById(`multiple-product-name-${i}`).type(`Flat fare carnet ${i + 1}`);
        getElementById(`multiple-product-price-${i}`).type((9.5 + i).toString());
        getElementById(`product-details-carnet-quantity-${i}`).type((2 + i).toString());
        getElementById(`product-details-carnet-expiry-quantity-${i}`).type('7');
        selectRandomOptionFromDropDown(`product-details-carnet-expiry-unit-${i}`);
        clickElementById('add-another-button');
    }

    clickElementById('remove-button');

    continueButtonClick();
    continueButtonClick();
};

export const completeServicePage = (): void => {
    selectRandomOptionFromDropDown('service');
    continueButtonClick();

    // CFD-638 We see an issue here when a bus route is chosen that cannot be used for a return fare.
    //   The difficulty is in the feedback being returned after clicking the continue button, as we may go to a new page
    //   or we may stay on the current page with an error dialog, this means it's difficult to place the checking code.
    //   Cypress also advises against conditional testing, but we are server side rendered so we can use it if needed
    //   see https://docs.cypress.io/guides/core-concepts/conditional-testing
    //   however support is not great, as it's a minimally used feature.
    //   We don't want to change the page flow or remove the route options, as they are this way to meet the GDS specifications.
    //   So here we just retry the random choice twice more, which will almost always result in a test passing.
    //   Due to Cypress' implementation, it's not possible to loop these or continually retry until success, so we just
    //   do the naive approach of calling the retry twice
    retryRouteChoiceOnReturnProductError();
    retryRouteChoiceOnReturnProductError();
};

export const completeDirectionPageIfReached = (): void => {
    cy.url()
        .should('not.match', /\/service/) // This ensures we're on the correct page
        .then((url: string) => {
            if (url.includes('direction')) {
                selectRandomOptionFromDropDown('select-direction');
                continueButtonClick();
            }
        });
};

const completeFareTrianglePages = (csvUpload: boolean, isIndividualTest: boolean): void => {
    clickElementById(csvUpload ? 'csv-upload' : 'manual-entry');
    if (!isIndividualTest) continueButtonClick();
    if (csvUpload) {
        clickElementById('pence');
        uploadFile('csv-upload', 'fareTriangle.csv');
        submitButtonClick();
    } else {
        clickElementById('less-than-20-fare-stages');
        continueButtonClick();
        getElementById('fare-stages').type('3');
        continueButtonClick();
        getElementById('fare-stage-name-1').type('Shott Drive');
        getElementById('fare-stage-name-2').type('The Stag pub');
        getElementById('fare-stage-name-3').type('Frederick Drive');
        continueButtonClick();
        continueButtonClick();
        getElementById('TheStagpub-ShottDrive').type('100');
        getElementById('FrederickDrive-TheStagpub').type('150');
        continueButtonClick();
    }
};

const completeMatchingPage = (): void => {
    // A circular (single-direction) return only has one matching page, whereas a
    // two-direction return has separate outbound and inbound matching pages. Only
    // fill the matching form if we are actually on a matching page (/matching or
    // /inboundMatching); otherwise we've already advanced past matching.
    cy.url().then((url) => {
        if (!url.toLowerCase().includes('matching')) {
            return;
        }
        for (let i = 0; i < 4; i += 1) {
            cy.get(`[id=option-${i}]`)
                .find('option')
                .then(($elm) => {
                    $elm.get(i + 1).setAttribute('selected', 'selected');
                })
                .parent()
                .trigger('change');
        }
        submitButtonClick();
    });
};

const completePointToPointProductDetail = (): void => {
    getElementById('product-details-name').type('Product Test');
    getElementById('product-details-carnet-quantity').type('5');
    getElementById('product-details-carnet-expiry-quantity').type('10');
    getElementById('product-details-carnet-expiry-unit').select('Days');
    continueButtonClick();
};

const completePointToPointPeriodProductDetail = (): void => {
    getElementById('point-to-point-period-product-name').type('Product Test');
    getElementById('product-details-expiry-quantity').type('5');
    getElementById('product-details-expiry-unit').select('Days');
    continueButtonClick();
    randomlyChooseProductPeriodValidity();
};

export const completeSinglePages = (csvUpload: boolean, isCarnet: boolean): void => {
    completeServicePage();
    completeDirectionPageIfReached();
    completeFareTrianglePages(csvUpload, false);
    completeMatchingPage();

    if (isCarnet) {
        completePointToPointProductDetail();
    }

    continueButtonClick();
};

export const completeReturnPages = (csvUpload: boolean, isCarnet: boolean, isPeriod: boolean): void => {
    completeServicePage();
    completeFareTrianglePages(csvUpload, false);
    completeMatchingPage();
    completeMatchingPage();

    if (isCarnet) {
        // A single-direction (circular) return skips the carnet product details page and
        // goes straight to returnValidity, so only fill it in if we actually reached it.
        cy.url().then((url) => {
            if (url.includes('carnetProductDetails')) {
                completePointToPointProductDetail();
            }
        });
    }

    if (isPeriod) {
        completePointToPointPeriodProductDetail();
    } else {
        if (getRandomNumber(0, 1) === 0) {
            clickElementById('return-validity-not-defined');
        } else {
            clickElementById('return-validity-defined');
            getElementById('return-validity-amount').type(getRandomNumber(1, 100).toString());
            selectRandomOptionFromDropDown('return-validity-units');
        }

        continueButtonClick();
    }

    continueButtonClick();
};

export const completeAcademicMultiServicePage = (numberOfProducts: number, multiProductNamePrefix: string): void => {
    randomlyDetermineUserType();
    continueButtonClick();
    clickElementById('radio-option-multipleServices');
    continueButtonClick();
    randomlyChooseAndSelectServices();
    continueButtonClick();
    completeMultipleProducts(numberOfProducts, multiProductNamePrefix);
};

export const completeAcademicPointToPointPage = (): void => {
    randomlyDetermineUserType();
    continueButtonClick();
    completePointToPointPeriodPages();
};

export const completeSalesPages = (numberOfProducts?: number, multiProductNamePrefix?: string): void => {
    if (numberOfProducts && multiProductNamePrefix) {
        completeSalesOfferPackagesForMultipleProducts(numberOfProducts, multiProductNamePrefix);
    } else {
        clickSomeCheckboxes();
    }
    continueButtonClick();
    completeProductDateInformationPage();
    continueButtonClick();
};

export const completePeriodGeoZonePages = (numberOfProducts: number, multiProductNamePrefix?: string): void => {
    clickElementById('radio-option-geoZone');
    continueButtonClick();
    uploadFile('csv-upload', 'fareZone.csv');
    submitButtonClick();
    completeMultipleProducts(numberOfProducts, multiProductNamePrefix);
};

export const completePeriodMultiServicePages = (
    numberOfProducts?: number,
    multiProductNamePrefix?: string,
    isCarnet?: boolean,
): void => {
    clickElementById('radio-option-multipleServices');
    continueButtonClick();
    randomlyChooseAndSelectServices();
    continueButtonClick();
    completeMultipleProducts(numberOfProducts, multiProductNamePrefix, isCarnet);
};

export const completeHybridPages = (
    numberOfProducts?: number,
    multiProductNamePrefix?: string,
    isCarnet?: boolean,
): void => {
    clickElementById('radio-option-hybrid');
    continueButtonClick();
    uploadFile('csv-upload', 'fareZone.csv');
    submitButtonClick();
    randomlyChooseAndSelectServices();
    continueButtonClick();
    completeMultipleProducts(numberOfProducts, multiProductNamePrefix, isCarnet);
};

export const completePointToPointPeriodPages = (): void => {
    clickElementById('radio-option-pointToPointPeriod');
    continueButtonClick();
    completeReturnPages(false, false, true);
    continueButtonClick();
};

export const completeSchoolPeriodMultiServicePages = (
    numberOfProducts?: number,
    multiProductNamePrefix?: string,
    isCarnet?: boolean,
): void => {
    randomlyChooseAndSelectServices();
    continueButtonClick();
    completeMultipleProducts(numberOfProducts, multiProductNamePrefix, isCarnet);
};

export const completeMultiOpGeoZonePages = (
    isCarnet = false,
    numberOfProducts?: number,
    multiProductNamePrefix?: string,
): void => {
    clickElementById('radio-option-geoZone');
    continueButtonClick();

    uploadFile('csv-upload', 'fareZone.csv');
    submitButtonClick();

    completeOperatorSearch();

    completeMultipleProducts(numberOfProducts, multiProductNamePrefix, isCarnet);
};

export const completeMultiOpMultiServicePages = (numberOfProducts?: number, multiProductNamePrefix?: string): void => {
    clickElementById('radio-option-multipleServices');
    continueButtonClick();
    randomlyChooseAndSelectServices();
    continueButtonClick();

    completeOperatorSearch();
    completeMultiServicePages();

    completeMultipleProducts(numberOfProducts, multiProductNamePrefix);
};

export const completeMyFaresPointToPointProductsPages = (): void => {
    for (let i = 0; i < 3; i++) {
        clickRandomElementInTable('govuk-table__body', 'service-link');
        getElementById('service-name').should('not.be.empty');
        getElementById('service-status').should('not.be.empty');
        clickElementByText('Back');
    }
};

export const completeMyFaresOtherProductsPages = (): void => {
    for (let i = 0; i < 3; i++) {
        clickRandomElementInTable('govuk-table__body', 'product-link');
        getElementById('product-name').should('not.be.empty');
        getElementById('product-status').should('not.be.empty');
        getElementById('fare-type').should('not.be.empty');
        clickElementByText('Back');
    }
};

export const completeMyFaresMultiOperatorProductsPages = (): void => {
    for (let i = 0; i < 3; i++) {
        clickRandomElementInTable('govuk-table__body', 'product-link');
        getElementById('product-name').should('not.be.empty');
        getElementById('product-status').should('not.be.empty');
        getElementById('fare-type').should('not.be.empty').should('have.text', 'Multi-operator');
        clickElementByText('Back');
    }
};

export const editServicesOtherProductsPage = (): void => {
    getElementById('product-name').should('not.be.empty');
    getElementById('product-status').should('not.be.empty');
    getElementById('fare-type').should('not.be.empty');
    cy.get('.govuk-grid-column-two-thirds')
        .find('[id=selected-services-link]')
        .then(() => {
            clickElementById('selected-services-link');
            randomlyChooseAndSelectServices();
            cy.get('@input').then((input) => {
                continueButtonClick();
                getElementById('selected-services').should(
                    'have.text',
                    JSON.stringify(input)
                        .split(',')
                        .join(', ')
                        .replace(/"|\[|\]/g, ''),
                );
            });
        });

    clickElementByText('Back');
};

export const editProductName = (): void => {
    clickElementById('edit-product-name');
    const newProductName = `Product ${getRandomNumber(1, 200)}${getRandomNumber(1, 200)}${getRandomNumber(1, 200)}`;
    clearAndTypeById('product-name', newProductName);
    clickElementByText('Save');
    getElementById('product-name-header').should('have.text', newProductName);
    clickElementByText('Back');
};

export const editProductExpiry = (): void => {
    clickElementById('product-expiry-link');
    randomlyChooseProductPeriodValidity();
    continueButtonClick();
    clickElementByText('Back');
};

export const editProductDuration = (): void => {
    clickElementById('period-duration-link');
    const productDuration = getRandomNumber(1, 10);
    clearAndTypeById('edit-period-duration-quantity', productDuration.toString());
    selectRandomOptionFromDropDown('edit-period-duration-unit');
    continueButtonClick();
    cy.get('@dropdownValue').then((input) => {
        const productDurationUnit = stringify(input);
        const value = `${productDuration} ${productDurationUnit.toLowerCase()}`;
        getElementById('period-duration').should('have.text', value);
    });
    clickElementByText('Back');
};

export const editQuantityInBundle = (): void => {
    clickElementById('quantity-in-bundle-link');
    const productDuration = getRandomNumber(2, 10);
    clearAndTypeById('edit-carnet-quantity', productDuration.toString());
    continueButtonClick();
    getElementById('quantity-in-bundle').should('have.text', productDuration.toString());
    clickElementByText('Back');
};

export const editCarnetExpiry = (): void => {
    clickElementById('carnet-expiry-link');
    const productDuration = getRandomNumber(2, 10);
    clearAndTypeById('edit-carnet-expiry-duration', productDuration.toString());
    selectRandomOptionFromDropDown('edit-carnet-expiry-unit');
    continueButtonClick();
    cy.get('@dropdownValue').then((input) => {
        const productDurationUnit = stringify(input);
        const value =
            productDurationUnit === 'No expiry'
                ? 'No expiry'
                : `${productDuration} ${productDurationUnit.slice(0, productDurationUnit.length - 1).toLowerCase()}(s)`;
        getElementById('carnet-expiry').should('have.text', value);
    });
    clickElementByText('Back');
};

export const editProductNamePointToPointPage = (): void => {
    getServiceLinkToClick();
    cy.get('@serviceToClick').then((serviceToClick) => {
        clickElementById(stringify(serviceToClick));
        getElementByClass('govuk-table__body').find('a').eq(0).click();
        getElementById('service-name').should('not.be.empty');
        getElementById('service-status').should('not.be.empty');
        editProductName();
    });
};

export const editPassengerType = (): void => {
    clickElementById('passenger-type-link');
    randomlyDetermineUserType();
    cy.get('@passengerType').then((passengerType) => {
        getElementById('passenger-type').should('have.text', stringify(passengerType));
    });
    clickElementByText('Back');
};

export const editPassengerTypeOtherProductsPage = (): void => {
    clickRandomElementInTable('govuk-table__body', 'product-link');
    getElementById('product-name').should('not.be.empty');
    getElementById('product-status').should('not.be.empty');
    getElementById('fare-type').should('not.be.empty');
    editPassengerType();
};

export const editPassengerTypePointToPointPage = (): void => {
    getServiceLinkToClick();
    cy.get('@serviceToClick').then((serviceToClick) => {
        clickElementById(stringify(serviceToClick));
        getElementByClass('govuk-table__body').find('a').eq(0).click();
        getElementById('service-name').should('not.be.empty');
        getElementById('service-status').should('not.be.empty');
        editPassengerType();
    });
};

export const editStartDate = (): void => {
    clickElementById('start-date-link');
    clearDates();
    const dateInput = completeProductDateInformationPage();
    getElementById('start-date').should('have.text', dateInput.startDate);
    clickElementByText('Back');
};

export const editStartDatePointToPointPage = (): void => {
    getServiceLinkToClick();
    cy.get('@serviceToClick').then((serviceToClick) => {
        clickElementById(stringify(serviceToClick));
        getElementByClass('govuk-table__body').find('a').eq(0).click();
        getElementById('service-name').should('not.be.empty');
        getElementById('service-status').should('not.be.empty');
        editStartDate();
    });
};

const editEndDate = (): void => {
    clickElementById('end-date-link');
    clearDates();
    const dateInput = completeProductDateInformationPage();
    getElementById('end-date').should('have.text', dateInput.endDate || '-');
    clickElementByText('Back');
};

export const editEndDateOtherProductsPage = (): void => {
    clickRandomElementInTable('govuk-table__body', 'product-link');
    getElementById('product-name').should('not.be.empty');
    getElementById('product-status').should('not.be.empty');
    getElementById('fare-type').should('not.be.empty');
    editEndDate();
};

export const editEndDatePointToPointPage = (): void => {
    getServiceLinkToClick();
    cy.get('@serviceToClick').then((serviceToClick) => {
        clickElementById(stringify(serviceToClick));
        getElementByClass('govuk-table__body').find('a').eq(0).click();
        getElementById('service-name').should('not.be.empty');
        getElementById('service-status').should('not.be.empty');
        editEndDate();
    });
};

export const editTimeRestriction = (): void => {
    const isSchoolTicket = false;
    cy.wrap(isSchoolTicket).as('isSchoolTicket');

    cy.get('main').then(($main) => {
        if ($main.text().includes('Only valid during term time')) {
            cy.wrap(true).as('isSchoolTicket');
        }
    });

    cy.get('@isSchoolTicket').then((isSchoolTicket) => {
        if (!isSchoolTicket) {
            clickElementById('time-restriction-link');
            randomlyDecideTimeRestrictions(true);
            cy.get('@timeRestriction').then((timeRestriction) => {
                getElementById('time-restriction').should('have.text', stringify(timeRestriction).replace(/"/g, ''));
            });
        }
    });

    clickElementByText('Back');
};

export const editTimeRestrictionMultiOperatorProductsPage = (): void => {
    clickRandomElementInTable('govuk-table__body', 'product-link');
    getElementById('product-name').should('not.be.empty');
    getElementById('product-status').should('not.be.empty');
    getElementById('fare-type').should('not.be.empty');
    editTimeRestriction();
};

export const editTimeRestrictionPointToPointPage = (): void => {
    getServiceLinkToClick();
    cy.get('@serviceToClick').then((serviceToClick) => {
        clickElementById(stringify(serviceToClick));
        getElementByClass('govuk-table__body').find('a').eq(0).click();
        getElementById('service-name').should('not.be.empty');
        getElementById('service-status').should('not.be.empty');
        editTimeRestriction();
    });
};

export const editPurchaseMethod = (isOtherProduct?: boolean): void => {
    clickElementById('purchase-methods-link');
    cy.get('.govuk-checkboxes__input').each((checkbox) => {
        if (checkbox.prop('checked')) {
            cy.wrap(checkbox).uncheck();
        }
    });
    randomlyDeterminePurchaseType(isOtherProduct);
    cy.get('@purchaseType').then((purchaseType) => {
        getElementById('purchase-methods').should('have.text', stringify(purchaseType));
    });
    clickElementByText('Back');
};

export const editPurchaseMethodOtherProductsPage = (): void => {
    clickRandomElementInTable('govuk-table__body', 'product-link');
    getElementById('product-name').should('not.be.empty');
    getElementById('product-status').should('not.be.empty');
    getElementById('fare-type').should('not.be.empty');
    editPurchaseMethod(true);
};
export const getServiceLinkToClick = (): void => {
    cy.get(`[id^="active-products-"]`).each(($element) => {
        if (parseInt($element.text()) > 0) {
            // The element ids use the service's database id, not the array index
            const serviceId = $element.attr('id')?.replace('active-products-', '');
            cy.wrap(`service-link-${serviceId}`).as('serviceToClick');
            return false;
        }
    });
};
export const editPurchaseMethodPointToPointPage = (): void => {
    getServiceLinkToClick();
    cy.get('@serviceToClick').then((serviceToClick) => {
        clickElementById(stringify(serviceToClick));
        getElementByClass('govuk-table__body').find('a').eq(0).click();
        getElementById('service-name').should('not.be.empty');
        getElementById('service-status').should('not.be.empty');
        editPurchaseMethod();
    });
};

export const editFareTrianglePointToPointPage = (): void => {
    getServiceLinkToClick();
    cy.get('@serviceToClick').then((serviceToClick) => {
        clickElementById(stringify(serviceToClick));
        getElementByClass('govuk-table__body').find('a').eq(0).click();
        getElementById('service-name').should('not.be.empty');
        getElementById('service-status').should('not.be.empty');
        clickElementById('fare-triangle-link');
        completeFareTrianglePages(true, true);
    });
};

export const editFareZone = (): void => {
    getElementById('zone').then((element) => {
        cy.wrap(element.text()).as('oldZone');
        if (element.text() === 'Test Town Centre') {
            clickElementById('zone-link');
            uploadFile('csv-upload', 'fareZoneEdited.csv');
        } else {
            clickElementById('zone-link');
            uploadFile('csv-upload', 'fareZone.csv');
        }
        submitButtonClick();
        cy.get('@oldZone').then((zone) => {
            getElementById('zone')
                .invoke('text')
                .then((text) => {
                    expect(text.toString()).to.not.equal(stringify(zone));
                });
        });
    });
};

export const editFareZoneStops = (): void => {
    getElementById('stops').then((element) => {
        cy.wrap(element.text()).as('oldStops');
        editFareZone();
        cy.get('@oldStops').then((stops) => {
            getElementById('stops')
                .invoke('text')
                .then((text) => {
                    expect(text.toString()).to.not.equal(stringify(stops));
                });
        });
    });
};

export const editExemptedServices = (): void => {
    clickElementById('exempted-services-link');
    const randomSelector = getRandomNumber(1, 2);
    if (randomSelector === 1) {
        clickElementById('yes');
        randomlyChooseAndSelectServices();
    } else {
        clickElementById('no');
        cy.wrap('N/A').as('input');
    }
    uploadFile('csv-upload', 'fareZoneEdited.csv');
    submitButtonClick();
    cy.get('@input').then((input) => {
        const inputText = stringify(input);
        const result = inputText === 'N/A' ? 'None' : inputText.replace(/[[\]]/g, '').split(',').join(', ');
        getElementById('exempted-services').should('have.text', result);
    });
    clickElementByText('Back');
};

export const deleteMultiOperatorProduct = (): void => {
    let numberOfProducts = 0;
    cy.get(`[data-card-count]`).then((element) => {
        numberOfProducts = Number(element.attr('data-card-count'));
        if (numberOfProducts > 0) {
            getElementById('delete-0').click();
            getElementById('popup-delete-button').click();
        }
    });

    cy.get(`[data-card-count]`).then((element) => {
        const numberOfProductsAfterDelete = Number(element.attr('data-card-count'));
        assert.equal(numberOfProducts, numberOfProductsAfterDelete + 1, 'Product is deleted');
    });
};

const editOperatorGroup = (): void => {
    clickElementById('multi-operator-group-link');
    // Select the operator group named exactly 'test2' on the reuseOperatorGroup page
    cy.contains('h4', /^test2$/)
        .parents('.card')
        .find('.govuk-radios__input')
        .click();
    continueButtonClick();
    getElementById('multi-operator-group').should('have.text', 'NWBT');
};

export const editOperatorGroupMultiOperatorProductsPage = (): void => {
    let foundGeoZone = false;
    cy.wrap(foundGeoZone).as('foundGeoZone');
    clickRandomElementInTable('govuk-table__body', 'product-link');
    cy.get('.govuk-summary-list__key').each(($element) => {
        if ($element.text() === 'Multi Operator Group') {
            foundGeoZone = true;
            cy.wrap(foundGeoZone).as('foundGeoZone');
            getElementById('product-name').should('not.be.empty');
            getElementById('product-status').should('not.be.empty');
            getElementById('fare-type').should('not.be.empty');
            getElementById('zone').should('not.be.empty');
            getElementById('multi-operator-group').should('not.be.empty');
            editOperatorGroup();
        }
    });
    cy.get('@foundGeoZone').then((foundGeoZone) => {
        if (!foundGeoZone) {
            clickElementByText('Back');
            editOperatorGroupMultiOperatorProductsPage();
        }
    });
};
