import {
    addMultiOperatorProductIfNotPresent,
    addOtherProductsIfNotPresent,
    addSingleProductIfNotPresent,
    clickElementByText,
    clickRandomElementInTable,
    getElementByClass,
    getElementById,
    getHomePage,
    openAccountSettings,
} from '../../../support/helpers';
import {
    deleteMultiOperatorProduct,
    editCarnetExpiry,
    editEndDateOtherProductsPage,
    editEndDatePointToPointPage,
    editExemptedServices,
    editFareTrianglePointToPointPage,
    editFareZone,
    editFareZoneStops,
    editOperatorGroupMultiOperatorProductsPage,
    editPassengerTypeOtherProductsPage,
    editPassengerTypePointToPointPage,
    editProductDuration,
    editProductExpiry,
    editProductName,
    editProductNamePointToPointPage,
    editPurchaseMethodOtherProductsPage,
    editPurchaseMethodPointToPointPage,
    editQuantityInBundle,
    editServicesOtherProductsPage,
    editStartDate,
    editStartDatePointToPointPage,
    editTimeRestriction,
    editTimeRestrictionMultiOperatorProductsPage,
    editTimeRestrictionPointToPointPage,
} from '../../../support/steps';

describe('The my fares point to point products pages', () => {
    before(() => {
        addSingleProductIfNotPresent();
    });
    it("allows the user to edit a point to point product's passenger type", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Services');
        editPassengerTypePointToPointPage();
    });
    it("allows the user to edit a point to point product's start date", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Services');
        editStartDatePointToPointPage();
    });
    it("allows the user to edit a point to point product's end date", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Services');
        editEndDatePointToPointPage();
    });
    it("allows the user to edit a point to point product's time restriction", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Services');
        editTimeRestrictionPointToPointPage();
    });
    it("allows the user to edit a point to point product's fare triangle", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Services');
        editFareTrianglePointToPointPage();
        getElementById('fare-triangle')
            .invoke('text')
            .then((text) => {
                const dateTextNew = text.split(' ')[1];
                const [dayNew, monthNew, yearNew] = dateTextNew.split('/');
                const newDate = new Date(Number(yearNew), Number(monthNew) - 1, Number(dayNew));
                expect(newDate).to.be.lte(new Date());
            });
    });
    it("allows the user to edit a point to point product's name", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Services');
        editProductNamePointToPointPage();
    });
    it("allows the user to edit a point to point product's purchase method", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Services');
        editPurchaseMethodPointToPointPage();
    });
});

describe('The my fares products pages', () => {
    before(() => {
        addOtherProductsIfNotPresent();
    });
    it("allows the user to edit a product's services", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body').contains('[class=govuk-table__row]', 'Flat fare').find('td a').click();
        editServicesOtherProductsPage();
    });
    it("allows the user to edit a product's passenger type", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        editPassengerTypeOtherProductsPage();
    });
    it("allows the user to edit a product's start date", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        clickRandomElementInTable('govuk-table__body', 'product-link');
        editStartDate();
    });
    it("allows the user to edit a product's end date", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        editEndDateOtherProductsPage();
    });
    it("allows the user to edit a product's purchase method", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        editPurchaseMethodOtherProductsPage();
    });
    it("allows the user to edit a product's time restriction", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body').contains('[class=govuk-table__row]', 'Flat fare').find('td a').click();
        editTimeRestriction();
    });
    it("allows the user to edit a product's period duration", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body').contains('[class=govuk-table__row]', 'Period').find('td a').click();
        editProductDuration();
    });
    it("allows the user to edit a product's carnet product quantity", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat fare carnet')
            .find('td a')
            .click();
        editQuantityInBundle();
    });
    it("allows the user to edit a product's carnet product expiry", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat fare carnet')
            .find('td a')
            .click();
        editCarnetExpiry();
    });
    it("allows the user to edit a product's name", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        clickRandomElementInTable('govuk-table__body', 'product-link');
        editProductName();
    });
    it("allows the user to edit a product's validity", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body').contains('[class=govuk-table__row]', 'Period').find('td a').click();
        editProductExpiry();
    });
    it("allows the user to edit a product's zone name", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat Fare Exemptions Test Product')
            .find('td a')
            .click();
        editFareZone();
        clickElementByText('Back');
    });
    it("allows the user to edit a product's exempted services", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat Fare Exemptions Test Product')
            .find('td a')
            .click();
        editExemptedServices();
    });
    it("allows the user to edit a product's stops", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat Fare Exemptions Test Product')
            .find('td a')
            .click();
        editFareZoneStops();
        clickElementByText('Back');
    });
});

describe('my fares multi-operator products (internal) pages', () => {
    before(() => {
        addMultiOperatorProductIfNotPresent();
    });
    it("allows the user to edit a multi-operator product's passenger type", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Multi-operator products (internal)');
        editPassengerTypeOtherProductsPage();
    });

    it("allows the user to edit a multi-operator product's time restriction", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Multi-operator products (internal)');
        editTimeRestrictionMultiOperatorProductsPage();
    });
    it("allows the user to edit a multi-operator product's purchase method", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Multi-operator products (internal)');
        editPurchaseMethodOtherProductsPage();
    });
    it("allows the user to edit a multi-operator product's start date", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Multi-operator products (internal)');
        clickRandomElementInTable('govuk-table__body', 'product-link');
        editStartDate();
    });
    it("allows the user to edit a multi-operator product's end date", () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Multi-operator products (internal)');
        editEndDateOtherProductsPage();
    });
    it('allows the user to edit multi-operator groups for geozone multi-operator tickets', () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Multi-operator products (internal)');
        editOperatorGroupMultiOperatorProductsPage();
    });
    it('allows the user to delete the multi-operator product', () => {
        getHomePage();
        openAccountSettings();
        clickElementByText('Multi-operator products (internal)');
        deleteMultiOperatorProduct();
    });
});
