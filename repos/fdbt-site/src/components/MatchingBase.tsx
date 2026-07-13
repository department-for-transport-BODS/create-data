import React, { ReactElement, useState } from 'react';
import WarningSummary from './WarningSummary';
import FormElementWrapper from './FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
import { BasicService, ErrorInfo, FareStage, UserFareStages } from '../interfaces';
import CsrfForm from './CsrfForm';
import { formatStopName } from '../utils';
import ErrorSummary from './ErrorSummary';
import { Stop } from '../interfaces/matchingJsonTypes';

interface MatchingBaseProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    service: BasicService;
    error: string;
    warning?: boolean;
    selectedFareStages: string[][];
    title: string;
    description: string;
    hintText: string;
    dataSource: string;
    heading: string;
    apiEndpoint: string;
    unusedStage: boolean;
    csrfToken: string;
}

export interface StopItem {
    index: number;
    stopName: string;
    atcoCode: string;
    naptanCode: string;
    stopData: string;
    dropdownValue: string;
    dropdownOptions: string[];
}

export const getDefaultStopItems = (
    userFareStages: UserFareStages,
    stops: Stop[],
    selectedFareStages: string[][],
): Set<StopItem> => {
    const items = new Set(
        stops.map((stop, index) => {
            let dropdownValue = '';
            selectedFareStages.forEach((selectedObject) => {
                if (selectedObject[0].toString() !== '' && selectedObject[1] === JSON.stringify(stop)) {
                    dropdownValue = selectedObject[0].toString();
                }
            });

            return {
                index,
                stopName: formatStopName(stop),
                atcoCode: stop.atcoCode,
                naptanCode: stop.naptanCode,
                dropdownValue,
                stopData: JSON.stringify(stop),
                dropdownOptions: userFareStages.fareStages.map((stage: FareStage) => stage.stageName),
            };
        }),
    );
    return items;
};

export const renderResetAndAutoPopulateButtons = (
    handleResetButtonClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    handleAutoPopulateButtonClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    location: string,
): ReactElement => (
    <div className="reset-autopopulate-buttons">
        <button
            id={`${location}-reset-all-fare-stages-button`}
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={(e): void => handleResetButtonClick(e)}
        >
            Reset All Fare Stages
        </button>
        <button
            id={`${location}-auto-populate-fares-stages-button`}
            type="button"
            className="govuk-button govuk-button--secondary govuk-!-margin-left-3"
            onClick={(e): void => handleAutoPopulateButtonClick(e)}
        >
            Auto-populate Fare Stages
        </button>
    </div>
);

const MatchingBase = ({
    userFareStages,
    stops,
    service,
    error,
    warning,
    selectedFareStages,
    title,
    description,
    hintText,
    dataSource,
    heading,
    apiEndpoint,
    unusedStage,
    csrfToken,
}: MatchingBaseProps): ReactElement => {
    const errors: ErrorInfo[] = [];
    const warnings: ErrorInfo[] = [];

    const [selections, updateSelections] = useState<StopItem[]>([]);
    const [stopItems, updateStopItems] = useState(getDefaultStopItems(userFareStages, stops, selectedFareStages));

    const handleDropdownSelection = (dropdownIndex: number, dropdownValue: string): void => {
        const updatedItems = new Set(
            [...stopItems].map((item) => {
                if (item.index === dropdownIndex) {
                    const updatedItem = { ...item, dropdownValue };

                    if (updatedItem.dropdownValue !== '') {
                        updateSelections([...selections, updatedItem].sort((a, b) => a.index - b.index));
                    }

                    return updatedItem;
                }
                return item;
            }),
        );
        updateStopItems(updatedItems);
    };

    const handleResetButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        event.preventDefault();
        const updatedItems = new Set([...stopItems].map((item) => ({ ...item, dropdownValue: '' })));
        updateStopItems(updatedItems);
        updateSelections([]);
    };

    const handleAutoPopulateButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        event.preventDefault();
        const numberOfSelections = selections.length;

        if (numberOfSelections === 1) {
            const selection = selections[0];
            const updatedItems = new Set(
                [...stopItems].map((item) => {
                    if (item.index >= selection.index && item.dropdownValue === '') {
                        return {
                            ...item,
                            dropdownValue: selection.dropdownValue,
                        };
                    }
                    updateSelections([]);
                    return item;
                }),
            );
            updateStopItems(updatedItems);
        } else if (numberOfSelections > 1) {
            const collectedItems: StopItem[] = [...stopItems];
            for (let i = 0; i < numberOfSelections; i += 1) {
                const currentSelection = selections[i];
                const nextSelection = selections[i + 1];
                for (
                    let j = currentSelection.index;
                    j < (nextSelection ? nextSelection.index : stopItems.size);
                    j += 1
                ) {
                    if (collectedItems[j].dropdownValue === '') {
                        collectedItems[j] = {
                            ...collectedItems[j],
                            dropdownValue: currentSelection.dropdownValue,
                        };
                    }
                }
            }

            const updatedItems = new Set(collectedItems);
            updateStopItems(updatedItems);
            updateSelections([]);
        }
    };

    if (error) {
        errors.push({
            errorMessage: error,
            id: 'option-0',
        });
    } else if (warning) {
        warnings.push({
            errorMessage: 'One or more fare stages have not been assigned, assign each fare stage to a stop',
            id: 'option-0',
        });
    } else if (unusedStage) {
        errors.push({
            errorMessage:
                'One or more fare stages have not been used across either matching page - to correct this use the link below to navigate back to the previous matching page, or use the unused fare stage(s) on this page.',
            id: 'option-0',
        });
    }

    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            <CsrfForm action={apiEndpoint} method="post" className="matching-page" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    {unusedStage ? (
                        <a className="govuk-button govuk-button--secondary" href="/outboundMatching">
                            Redo my outbound matching
                        </a>
                    ) : null}
                    <WarningSummary
                        errors={warnings}
                        label="Check this box if you wish to proceed without assigning all fare stages, then click Continue"
                    />
                    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading">{heading}</h1>
                            </legend>
                            <span className="govuk-hint" id="match-fares-hint">
                                {hintText}
                            </span>
                            <span className="govuk-hint" id="auto-populate-hint">
                                To assist you with completing this section we have included an auto-complete feature.
                                Assign <b>each</b> fare stage to the <b>first</b> bus stop in the stage and then select
                                the auto-complete button to fill in the gaps. You can also manually match individual
                                stops to fare stages at any point.
                            </span>
                            <span className="govuk-hint" id="traveline-hint">
                                This data has been taken from the{' '}
                                {dataSource === 'tnds'
                                    ? 'Traveline National Dataset (TNDS)'
                                    : 'Bus Open Data Service (BODS)'}{' '}
                                and NaPTAN database.
                            </span>
                            {renderResetAndAutoPopulateButtons(
                                handleResetButtonClick,
                                handleAutoPopulateButtonClick,
                                'top',
                            )}
                            <FormElementWrapper errors={errors} errorId="option-0" errorClass="">
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th
                                                scope="col"
                                                className="govuk-table__header govuk-!-width-one-half"
                                                id="stop-name-header"
                                            >
                                                Stop name
                                            </th>
                                            <th
                                                scope="col"
                                                className="govuk-table__header govuk-!-width-one-quarter"
                                                id="naptan-code-header"
                                            >
                                                Naptan code
                                            </th>
                                            <th
                                                scope="col"
                                                className="govuk-table__header govuk-!-width-one-quarter"
                                                id="fare-stage-header"
                                            >
                                                Fare stage
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                        {[...stopItems].map((item) => (
                                            <tr key={item.atcoCode} className="govuk-table__row">
                                                <td className="govuk-table__cell stop-cell" id={`stop-${item.index}`}>
                                                    {item.stopName}
                                                </td>
                                                <td
                                                    className="govuk-table__cell naptan-cell"
                                                    id={`naptan-${item.index}`}
                                                >
                                                    {item.naptanCode}
                                                </td>
                                                <td className="govuk-table__cell stage-cell">
                                                    <select
                                                        className="govuk-select farestage-select"
                                                        id={`option-${item.index}`}
                                                        name={`option-${item.index}`}
                                                        value={item.dropdownValue}
                                                        aria-labelledby={`stop-name-header stop-${item.index} naptan-code-header naptan-${item.index}`}
                                                        onChange={(e): void =>
                                                            handleDropdownSelection(item.index, e.target.value)
                                                        }
                                                    >
                                                        <option value="" disabled>
                                                            Select a Fare Stage
                                                        </option>
                                                        {item.dropdownOptions.map((option) => {
                                                            return (
                                                                <option key={option} value={option}>
                                                                    {option}
                                                                </option>
                                                            );
                                                        })}
                                                        <option value="notApplicable">Not Applicable</option>
                                                    </select>
                                                    <input
                                                        type="hidden"
                                                        name={`option-${item.index}`}
                                                        value={item.stopData}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </FormElementWrapper>
                        </fieldset>
                    </div>
                    {renderResetAndAutoPopulateButtons(handleResetButtonClick, handleAutoPopulateButtonClick, 'bottom')}
                    <input type="hidden" name="service" value={JSON.stringify(service)} />
                    <input type="hidden" name="userfarestages" value={JSON.stringify(userFareStages)} />
                    <input type="submit" value="Continue" id="submit-button" className="govuk-button" />
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export default MatchingBase;
