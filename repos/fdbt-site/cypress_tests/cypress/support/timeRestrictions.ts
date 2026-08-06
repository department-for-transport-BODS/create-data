import {
    clickElementById,
    clickElementByText,
    getElementByClass,
    getElementByDataTestId,
    getElementByName,
} from './helpers';

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

export const createEditTimeRestriction = (): void => {
    const timeRestriction = {
        days: ['time-restriction-day-5', 'time-restriction-day-6'],
        name: 'Weekends',
    };

    addTimeRestriction(timeRestriction);

    // Click on edit and back button
    getElementByClass('card').eq(0).contains('Edit').click();
    clickElementByText('Back');

    let timeRestrictionCard = getElementByClass('card').eq(0);
    timeRestrictionCard.should('include.text', timeRestriction.name);

    const saturday = getElementByDataTestId('day-restriction').eq(5);
    saturday.should('include.text', 'Sat Valid all day');

    const sunday = getElementByDataTestId('day-restriction').eq(6);
    sunday.should('include.text', 'Sun Valid all day');

    timeRestrictionCard = getElementByClass('card').eq(0);
    timeRestrictionCard.contains('Edit').click();

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
        name: 'Working Days',
    };

    enterTimeRestrictionDetails(editedTimeRestriction);

    cy.contains('Update time restriction').click();

    const monday = getElementByDataTestId('day-restriction').eq(0);
    monday.should('include.text', 'Mon Valid all day');

    const tuesday = getElementByDataTestId('day-restriction').eq(1);
    tuesday.should('include.text', 'Tue Valid all day');

    const wednesday = getElementByDataTestId('day-restriction').eq(2);
    wednesday.should('include.text', 'Wed Valid all day');

    const thursday = getElementByDataTestId('day-restriction').eq(3);
    thursday.should('include.text', 'Thu Valid all day');

    const friday = getElementByDataTestId('day-restriction').eq(4);
    friday.should('include.text', 'Fri Valid all day');

    const editedCard = getElementByClass('card').eq(0);
    editedCard.should('include.text', editedTimeRestriction.name);
};
