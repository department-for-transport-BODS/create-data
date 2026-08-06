import {
    clearAndTypeById,
    clearAndTypeByName,
    clickElementById,
    clickElementByText,
    getElementByClass,
    getElementByDataTestId,
    getElementById,
} from './helpers';

interface PassengerType {
    type: string;
    minAge?: number;
    maxAge?: number;
    documents?: string[];
    name: string;
}

export const enterPassengerTypeDetails = ({ type, minAge, maxAge, documents, name }: PassengerType): void => {
    clickElementById(type);

    if (minAge) {
        clearAndTypeByName('ageRangeMin', minAge.toString());
    }
    if (maxAge) {
        clearAndTypeByName('ageRangeMax', maxAge.toString());
    }

    documents?.forEach((doc) => {
        clickElementById(doc);
    });

    clearAndTypeByName('name', name);
};

export const addSinglePassengerType = (passengerType: PassengerType): void => {
    cy.contains('Add a passenger type').click();
    enterPassengerTypeDetails(passengerType);
    cy.contains('Add passenger type').click();
};

export const addGroupPassengerType = (groupName: string): void => {
    clickElementByText('Add a passenger group');
    clearAndTypeById('max-group-size', '6');
    clickElementById('passenger-type-0');
    clickElementById('passenger-type-1');
    getElementByDataTestId('maximum-passengers').eq(0).clear();
    getElementByDataTestId('maximum-passengers').eq(0).type('4');

    getElementByDataTestId('maximum-passengers').eq(1).clear();
    getElementByDataTestId('maximum-passengers').eq(1).type('3');
    getElementByDataTestId('minimum-passengers').eq(1).clear();
    getElementByDataTestId('minimum-passengers').eq(1).type('2');

    clearAndTypeByName('passengerGroupName', groupName);

    clickElementByText('Add passenger group');
};

const editGroupPassengerType = () => {
    clearAndTypeById('max-group-size', '9');
    getElementById('passenger-type-1').click();
    getElementByDataTestId('minimum-passengers').eq(0).clear();
    getElementByDataTestId('minimum-passengers').eq(0).type('8');
    getElementByDataTestId('maximum-passengers').eq(0).clear();
    getElementByDataTestId('maximum-passengers').eq(0).type('9');

    clearAndTypeByName('passengerGroupName', 'my edited group');

    cy.contains('Update passenger group').click();
};

export const createEditSinglePassengerTypes = (): void => {
    const passengerType1 = {
        type: 'senior',
        minAge: 55,
        maxAge: 99,
        documents: ['membership_card', 'identity_document'],
        name: 'my Seniors',
    };
    const passengerType2 = {
        type: 'adult',
        name: 'Adults',
    };

    addSinglePassengerType(passengerType1);
    addSinglePassengerType(passengerType2);

    // Click on edit and back button
    getElementByClass('card').eq(0).contains('Edit').click();
    clickElementByText('Back');

    const firstCard = getElementByClass('card').eq(0);
    firstCard.should('include.text', passengerType1.name);
    firstCard.should('include.text', 'Proof document(s): Membership card, Identity document');

    const secondCard = getElementByClass('card').eq(1);
    secondCard.should('include.text', passengerType2.name);
    secondCard.should('include.text', 'Proof document(s): N/A');

    secondCard.contains('Edit').click();

    const editedPassengerType = {
        type: 'child',
        name: 'other child',
        maxAge: 18,
        documents: ['student_card'],
    };

    enterPassengerTypeDetails(editedPassengerType);
    cy.contains('Update passenger type').click();

    const editedCard = getElementByClass('card').eq(1);
    editedCard.should('include.text', editedPassengerType.name);
    editedCard.should('include.text', 'Proof document(s): Student card');
};

export const createEditGroupPassengerTypes = (): void => {
    addGroupPassengerType('my group');

    const group = getElementByClass('card').eq(2);
    group.should('include.text', 'my group');
    group.should('include.text', 'Max size: 6');
    group.should('include.text', 'my Seniors: Min: 0 - Max: 4');
    group.should('include.text', 'other child: Min: 2 - Max: 3');

    group.contains('Edit').click();
    editGroupPassengerType();

    const editedGroup = getElementByClass('card').eq(2);
    editedGroup.should('include.text', 'my edited');
    editedGroup.should('include.text', 'Max size: 9');
    editedGroup.should('include.text', 'my Seniors: Min: 8 - Max: 9');
    editedGroup.should('not.include.text', 'other child:');
};
