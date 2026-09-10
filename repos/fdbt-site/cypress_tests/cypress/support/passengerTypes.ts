import { clearAndTypeById, clearAndTypeByName, clickElementById, clickElementByText } from './helpers';

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

const setPassengerGroupInput = (passengerName: string, inputName: string, value: string): void => {
    cy.contains('label', passengerName, { matchCase: false })
        .parent()
        .parent()
        .find(`[data-test-id="${inputName}"]`)
        .clear();
    cy.contains('label', passengerName, { matchCase: false })
        .parent()
        .parent()
        .find(`[data-test-id="${inputName}"]`)
        .type(value);
};

export const addGroupPassengerType = (groupName: string, passengerNames = ['senior', 'adult']): void => {
    clickElementByText('Add a passenger group');
    clearAndTypeById('max-group-size', '6');

    cy.contains('label', passengerNames[0], { matchCase: false })
        .invoke('attr', 'for')
        .then((inputId) => {
            cy.get(`#${inputId}`).check();
        });
    setPassengerGroupInput(passengerNames[0], 'maximum-passengers', '4');

    cy.contains('label', passengerNames[1], { matchCase: false })
        .invoke('attr', 'for')
        .then((inputId) => {
            cy.get(`#${inputId}`).check();
        });
    setPassengerGroupInput(passengerNames[1], 'maximum-passengers', '3');
    setPassengerGroupInput(passengerNames[1], 'minimum-passengers', '2');

    clearAndTypeByName('passengerGroupName', groupName);

    clickElementByText('Add passenger group');
};

const editGroupPassengerType = (editedGroupName: string, seniorName: string): void => {
    clearAndTypeById('max-group-size', '9');
    setPassengerGroupInput(seniorName, 'minimum-passengers', '8');
    setPassengerGroupInput(seniorName, 'maximum-passengers', '9');

    clearAndTypeByName('passengerGroupName', editedGroupName);

    cy.contains('Update passenger group').click();
};

export const createEditSinglePassengerTypes = (namePrefix = 'my'): void => {
    const passengerType1 = {
        type: 'senior',
        minAge: 55,
        maxAge: 99,
        documents: ['membership_card', 'identity_document'],
        name: `${namePrefix} Seniors`,
    };
    const passengerType2 = {
        type: 'adult',
        name: `${namePrefix} Adults`,
    };

    addSinglePassengerType(passengerType1);
    addSinglePassengerType(passengerType2);

    // Click on edit and back button
    cy.contains('.card', passengerType1.name).contains('Edit').click();
    clickElementByText('Back');

    cy.contains('.card', passengerType1.name).should('include.text', passengerType1.name);
    cy.contains('.card', passengerType1.name).should(
        'include.text',
        'Proof document(s): Membership card, Identity document',
    );

    cy.contains('.card', passengerType2.name).should('include.text', passengerType2.name);
    cy.contains('.card', passengerType2.name).should('include.text', 'Proof document(s): N/A');

    cy.contains('.card', passengerType2.name).contains('Edit').click();

    const editedPassengerType = {
        type: 'child',
        name: `${namePrefix} Child`,
        maxAge: 18,
        documents: ['student_card'],
    };

    enterPassengerTypeDetails(editedPassengerType);
    cy.contains('Update passenger type').click();

    cy.contains('.card', editedPassengerType.name).should('include.text', editedPassengerType.name);
    cy.contains('.card', editedPassengerType.name).should('include.text', 'Proof document(s): Student card');
};

export const createEditGroupPassengerTypes = (
    groupName = 'my group',
    editedGroupName = 'my edited group',
    seniorName = 'my Seniors',
    childName = 'my Child',
): void => {
    addGroupPassengerType(groupName, [seniorName, childName]);

    cy.contains('.card', groupName).should('include.text', groupName);
    cy.contains('.card', groupName).should('include.text', 'Max size: 6');
    cy.contains('.card', groupName).should('include.text', `${seniorName}: Min: 0 - Max: 4`);
    cy.contains('.card', groupName).should('include.text', `${childName}: Min: 2 - Max: 3`);

    cy.contains('.card', groupName).contains('Edit').click();
    editGroupPassengerType(editedGroupName, seniorName);

    cy.contains('.card', editedGroupName).should('include.text', editedGroupName);
    cy.contains('.card', editedGroupName).should('include.text', 'Max size: 9');
    cy.contains('.card', editedGroupName).should('include.text', `${seniorName}: Min: 8 - Max: 9`);
    cy.contains('.card', editedGroupName).should('include.text', `${childName}:`);
};
