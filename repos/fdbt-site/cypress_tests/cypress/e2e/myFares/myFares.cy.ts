import {
    addMultiOperatorProductIfNotPresent,
    addOtherProductsIfNotPresent,
    addSingleProductIfNotPresent,
    clickElementById,
    clickElementByText,
    clickRandomElementInTable,
    getElementByClass,
    getElementById,
    getHomePage,
} from '../../support/helpers';
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
} from '../../support/steps';

describe('The my fares point to point products pages', () => {
    before(() => {
        addSingleProductIfNotPresent();
    });
    it("allows the user to edit a point to point product's passenger type", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Services');
        editPassengerTypePointToPointPage();
    });
    it("allows the user to edit a point to point product's start date", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Services');
        editStartDatePointToPointPage();
    });
    it("allows the user to edit a point to point product's end date", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Services');
        editEndDatePointToPointPage();
    });
    it("allows the user to edit a point to point product's time restriction", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Services');
        editTimeRestrictionPointToPointPage();
    });
    it("allows the user to edit a point to point product's fare triangle", () => {
        getHomePage();
        clickElementById('account-link');
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
        clickElementById('account-link');
        clickElementByText('Services');
        editProductNamePointToPointPage();
    });
    it("allows the user to edit a point to point product's purchase method", () => {
        getHomePage();
        clickElementById('account-link');
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
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat fare')
            .find('td a')
            .click()
            .then(() => {
                editServicesOtherProductsPage();
            });
    });
    it("allows the user to edit a product's passenger type", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        editPassengerTypeOtherProductsPage();
    });
    it("allows the user to edit a product's start date", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        clickRandomElementInTable('govuk-table__body', 'product-link');
        editStartDate();
    });
    it("allows the user to edit a product's end date", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        editEndDateOtherProductsPage();
    });
    it("allows the user to edit a product's purchase method", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        editPurchaseMethodOtherProductsPage();
    });
    it("allows the user to edit a product's time restriction", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat fare')
            .find('td a')
            .click()
            .then(() => {
                editTimeRestriction();
            });
    });
    it("allows the user to edit a product's period duration", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Period')
            .find('td a')
            .click()
            .then(() => {
                editProductDuration();
            });
    });
    it("allows the user to edit a product's carnet product quantity", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat fare carnet')
            .find('td a')
            .click()
            .then(() => {
                editQuantityInBundle();
            });
    });
    it("allows the user to edit a product's carnet product expiry", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat fare carnet')
            .find('td a')
            .click()
            .then(() => {
                editCarnetExpiry();
            });
    });
    it("allows the user to edit a product's name", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        clickRandomElementInTable('govuk-table__body', 'product-link');
        editProductName();
    });
    it("allows the user to edit a product's validity", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Period')
            .find('td a')
            .click()
            .then(() => {
                editProductExpiry();
            });
    });
    it("allows the user to edit a product's zone name", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat Fare Exemptions Test Product')
            .find('td a')
            .click()
            .then(() => {
                editFareZone();
                clickElementByText('Back');
            });
    });
    it("allows the user to edit a product's exempted services", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat Fare Exemptions Test Product')
            .find('td a')
            .click()
            .then(() => {
                editExemptedServices();
            });
    });
    it("allows the user to edit a product's stops", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Other products');
        getElementByClass('govuk-table__body')
            .contains('[class=govuk-table__row]', 'Flat Fare Exemptions Test Product')
            .find('td a')
            .click()
            .then(() => {
                editFareZoneStops();
                clickElementByText('Back');
            });
    });
});

describe('my fares multi-operator products (internal) pages', () => {
    before(() => {
        addMultiOperatorProductIfNotPresent();
    });
    it("allows the user to edit a multi-operator product's passenger type", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Multi-operator products (internal)');
        editPassengerTypeOtherProductsPage();
    });

    it("allows the user to edit a multi-operator product's time restriction", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Multi-operator products (internal)');
        editTimeRestrictionMultiOperatorProductsPage();
    });
    it("allows the user to edit a multi-operator product's purchase method", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Multi-operator products (internal)');
        editPurchaseMethodOtherProductsPage();
    });
    it("allows the user to edit a multi-operator product's start date", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Multi-operator products (internal)');
        clickRandomElementInTable('govuk-table__body', 'product-link');
        editStartDate();
    });
    it("allows the user to edit a multi-operator product's end date", () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Multi-operator products (internal)');
        editEndDateOtherProductsPage();
    });
    it('allows the user to edit multi-operator groups for geozone multi-operator tickets', () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Multi-operator products (internal)');
        editOperatorGroupMultiOperatorProductsPage();
    });
    it('allows the user to delete the multi-operator product', () => {
        getHomePage();
        clickElementById('account-link');
        clickElementByText('Multi-operator products (internal)');
        deleteMultiOperatorProduct();
    });
});
