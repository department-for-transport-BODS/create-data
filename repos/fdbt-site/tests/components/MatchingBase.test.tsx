import { fireEvent, render } from '@testing-library/react';
import MatchingBase, {
    getDefaultStopItems,
    StopItem,
    renderResetAndAutoPopulateButtons,
} from '../../src/components/MatchingBase';
import { userFareStages, selectedFareStages, zoneStops, service } from '../testData/mockData';

describe('MatchingBase', () => {
    const baseProps = {
        title: 'Matching - Create Fares Data Service',
        description: 'Matching page of the Create Fares Data Service',
        hintText: 'Select a fare stage for each stop.',
        travelineHintText: 'This data has been taken from the Traveline National Dataset and NaPTAN database.',
        heading: 'Match stops to fares stages',
        apiEndpoint: '/api/matching',
    };

    describe('getDefaultStopItems', () => {
        it('should return an array of stop items each with a default dropdown value when there are no selectedFareStages', () => {
            const defaultStopItems = getDefaultStopItems(userFareStages, zoneStops, []);
            [...defaultStopItems].forEach((stopItem) => {
                expect(stopItem.dropdownValue).toBe('');
            });
        });

        it('should return an array of stop items with dropdown values matching those in selectedFareStages', () => {
            const expectedStopItems: StopItem = {
                index: expect.any(Number),
                stopName: expect.any(String),
                atcoCode: expect.any(String),
                naptanCode: expect.any(String),
                stopData: expect.any(String),
                dropdownValue: expect.stringContaining('Acomb Green Lane'),
                dropdownOptions: expect.any(Array),
            };
            const defaultStopItems = getDefaultStopItems(userFareStages, zoneStops, selectedFareStages);
            expect([...defaultStopItems]).toContainEqual(expectedStopItems);
        });

        describe('renderResetAndAutoPopulateButtons', () => {
            it('should render the reset and auto populate buttons on the page', () => {
                const mockFn = jest.fn();
                const { asFragment } = render(renderResetAndAutoPopulateButtons(mockFn, mockFn, 'bottom'));
                expect(asFragment()).toMatchSnapshot();
            });
            it('should render with warning', () => {
                const { asFragment } = render(
                    <MatchingBase
                        userFareStages={userFareStages}
                        stops={zoneStops}
                        service={service}
                        error=""
                        warning={true}
                        selectedFareStages={selectedFareStages}
                        csrfToken=""
                        {...baseProps}
                        unusedStage={false}
                        dataSource="bods"
                    />,
                );
                expect(asFragment()).toMatchSnapshot();
            });

            it('should render with error', () => {
                const { asFragment } = render(
                    <MatchingBase
                        userFareStages={userFareStages}
                        stops={zoneStops}
                        service={service}
                        error=""
                        warning={false}
                        selectedFareStages={selectedFareStages}
                        csrfToken=""
                        {...baseProps}
                        unusedStage={false}
                        dataSource="bods"
                    />,
                );
                expect(asFragment()).toMatchSnapshot();
            });
        });
    });

    describe('javascript functionality', () => {
        describe('dropdownSelection', () => {
            it('should update the state such that the dropdown that has been clicked has its value updated to the selected value', () => {
                const { container } = render(
                    <MatchingBase
                        userFareStages={userFareStages}
                        stops={zoneStops}
                        service={service}
                        warning={false}
                        error=""
                        selectedFareStages={[]}
                        csrfToken=""

                        {...baseProps}
                        unusedStage={false}
                        dataSource="bods"
                    />,
                );

                const mockDropdownInfo = {
                    index: 5,
                    value: 'Acomb Green Lane',
                };
                fireEvent.change(container.querySelector(`#option-${mockDropdownInfo.index}`) as HTMLSelectElement, {
                    target: { value: mockDropdownInfo.value },
                });
                expect(
                    (container.querySelector(`#option-${mockDropdownInfo.index}`) as HTMLSelectElement).value,
                ).toEqual(mockDropdownInfo.value);
            });
        });

        describe('resetButtonClick', () => {
            it('should update the state such that each dropdown on the page has its value reset to an empty string', () => {
                const { container } = render(
                    <MatchingBase
                        userFareStages={userFareStages}
                        stops={zoneStops}
                        service={service}
                        warning={false}
                        error=""
                        selectedFareStages={selectedFareStages}
                        csrfToken=""

                        {...baseProps}
                        unusedStage={false}
                        dataSource="bods"
                    />,
                );

                const dropdownValues = Array.from(container.querySelectorAll('select')).map((item) => item.value);
                expect(dropdownValues).toContainEqual(expect.stringMatching('Acomb Green Lane'));
                fireEvent.click(container.querySelector('#bottom-reset-all-fare-stages-button') as HTMLButtonElement);
                container.querySelectorAll('select').forEach((item) => {
                    expect(item.value).toEqual('');
                });
            });
        });

        describe('autoPopulateButtonClick', () => {
            it('should update the state such that each dropdown below the one selected has its value updated to the selected value', () => {
                const { container } = render(
                    <MatchingBase
                        userFareStages={userFareStages}
                        stops={zoneStops}
                        service={service}
                        error=""
                        warning={false}
                        selectedFareStages={[]}
                        csrfToken=""

                        {...baseProps}
                        unusedStage={false}
                        dataSource="bods"
                    />,
                );

                const optionIndex = 5;
                fireEvent.change(container.querySelector(`#option-${optionIndex}`) as HTMLSelectElement, {
                    target: { value: 'Acomb Green Lane' },
                });
                fireEvent.click(
                    container.querySelector('#bottom-auto-populate-fares-stages-button') as HTMLButtonElement,
                );
                container.querySelectorAll('select').forEach((item) => {
                    const itemIndex = Number(item.id.split('-')[1]);
                    const expectedValue = itemIndex < optionIndex ? '' : 'Acomb Green Lane';
                    expect(item.value).toEqual(expectedValue);
                });
            });

            it('should update the state such that the dropdowns below the selected values have their value updated correctly for >1 selections', () => {
                const { container } = render(
                    <MatchingBase
                        userFareStages={userFareStages}
                        stops={zoneStops}
                        service={service}
                        error=""
                        warning={false}
                        selectedFareStages={[]}
                        csrfToken=""

                        {...baseProps}
                        unusedStage={false}
                        dataSource="bods"
                    />,
                );

                const mockDropdownInfo = [
                    {
                        index: 5,
                        value: 'Acomb Green Lane',
                    },
                    {
                        index: 9,
                        value: 'Holl Bank/Beech Ave',
                    },
                ];
                mockDropdownInfo.forEach((selection) => {
                    fireEvent.change(container.querySelector(`#option-${selection.index}`) as HTMLSelectElement, {
                        target: { value: selection.value },
                    });
                });
                fireEvent.click(
                    container.querySelector('#bottom-auto-populate-fares-stages-button') as HTMLButtonElement,
                );
                container.querySelectorAll('select').forEach((item) => {
                    const firstSelectionIndex = mockDropdownInfo[0].index;
                    const secondSelectionIndex = mockDropdownInfo[1].index;
                    const itemIndex = Number(item.id.split('-')[1]);
                    let expectedValue = '';
                    if (itemIndex >= firstSelectionIndex && itemIndex < secondSelectionIndex) {
                        expectedValue = 'Acomb Green Lane';
                    } else if (itemIndex >= secondSelectionIndex) {
                        expectedValue = 'Holl Bank/Beech Ave';
                    }
                    expect(item.value).toEqual(expectedValue);
                });
            });
        });
    });
});
