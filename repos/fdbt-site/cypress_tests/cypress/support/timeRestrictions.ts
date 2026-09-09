import { clickElementById, clickElementByText, getElementByClass, getElementByName } from './helpers';

interface TimeRestriction {
    days: string[];
    name: string;
}

const enterTimeRestrictionDetails = ({ days, name }: TimeRestriction) => {
    days.map(clickElementById);

    getElementByName('timeRestrictionName').clear();
    getElementByName('timeRestrictionName').type(name);
};

export const addTimeRestriction = (timeRestriction: TimeRestriction): void => {
    let numberOfTimeRestrictions = 0;
    cy.get(`[data-card-count]`).then((element) => {
        numberOfTimeRestrictions = Number(element.attr('data-card-count'));
        if (numberOfTimeRestrictions > 0) {
            getElementByClass('card-row').then((body) => {
                const containsName = body.text().includes(timeRestriction.name);
                if (!containsName) {
                    clickElementByText('Add a time restriction');
                    enterTimeRestrictionDetails(timeRestriction);
                    clickElementByText('Add time restriction');
                }
            });
        } else {
            clickElementByText('Add a time restriction');
            enterTimeRestrictionDetails(timeRestriction);
            clickElementByText('Add time restriction');
        }
    });
};

export const createEditTimeRestriction = (name = 'Weekends', editedName = 'Working Days'): void => {
    const timeRestriction = {
        days: ['time-restriction-day-5', 'time-restriction-day-6'],
        name,
    };

    addTimeRestriction(timeRestriction);

    // Click on edit and back button
    cy.contains('.card', timeRestriction.name).contains('Edit').click();
    clickElementByText('Back');

    cy.contains('.card', timeRestriction.name).should('include.text', timeRestriction.name);

    cy.contains('.card', timeRestriction.name).contains('Edit').click();

    const editedTimeRestriction = {
        days: [
            'time-restriction-day-0',
            'time-restriction-day-1',
            'time-restriction-day-2',
            'time-restriction-day-3',
            'time-restriction-day-4',
            'time-restriction-day-5',
            'time-restriction-day-6',
            'time-restriction-day-7',
        ],
        name: editedName,
    };

    enterTimeRestrictionDetails(editedTimeRestriction);

    cy.contains('Update time restriction').click();

    cy.contains('.card', editedTimeRestriction.name).should('include.text', editedTimeRestriction.name);
};
