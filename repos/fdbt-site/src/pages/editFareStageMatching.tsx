import React, { ReactElement, useState } from 'react';
import BackButton from '../components/BackButton';
import { renderResetAndAutoPopulateButtons, StopItem } from '../components/MatchingBase';
import { batchGetStopsByAtcoCodeWithErrorCheck, getServiceByIdAndDataSource } from '../data/auroradb';
import {
    removeDuplicateAdjacentStops,
    sortingWithoutSequenceNumbers,
    validateSequenceNumbers,
} from '../utils/apiUtils/matching';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import {
    DIRECTION_ATTRIBUTE,
    EDIT_FARE_STAGE_MATCHING_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MISSING_STOPS_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
} from '../constants/attributes';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { ReturnTicket, SingleTicket, Stop, WithIds } from '../interfaces/matchingJsonTypes';
import { FullColumnLayout } from '../layout/Layout';
import { formatStopName, getAndValidateNoc, getCsrfToken, isReturnTicket } from '../utils';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { isWithErrors } from '../interfaces/typeGuards';
import WarningSummary from '../components/WarningSummary';
import { upperFirst } from 'lodash';
import { redirectTo } from '../utils/apiUtils';

const description = 'Edit fare stages page of the Create Fares Data Service';
const errorId = 'option-0';

interface EditStagesProps {
    fareStages: string[];
    errors: ErrorInfo[];
    csrfToken: string;
    stops: Stop[];
    backHref: string;
    selectedFareStages: Record<string, string>;
    warning: boolean;
    showBackButtton: boolean;
    direction: string;
    dataSource: string;
}

export const getFareStagesFromTicket = (ticket: WithIds<SingleTicket> | WithIds<ReturnTicket>): string[] => {
    if (isReturnTicket(ticket)) {
        const fareZones = [...ticket.outboundFareZones, ...ticket.inboundFareZones];
        return Array.from(new Set(fareZones.map((fareZone) => fareZone.name)));
    }
    return (ticket as WithIds<SingleTicket>).fareZones.map((fareZone) => fareZone.name);
};

const getSelectedFareStagesFromTicket = (
    ticket: WithIds<SingleTicket> | WithIds<ReturnTicket>,
    direction: string,
): { [key: string]: string } => {
    const selectedFareStages: { [key: string]: string } = {}; // {stop.atcode: fareZoneName}

    if (isReturnTicket(ticket)) {
        if (direction === 'inbound') {
            ticket.inboundFareZones.forEach((fareZone) => {
                fareZone.stops.forEach((stop) => {
                    selectedFareStages[stop.atcoCode] = fareZone.name;
                });
            });
        } else {
            ticket.outboundFareZones.forEach((fareZone) => {
                fareZone.stops.forEach((stop) => {
                    selectedFareStages[stop.atcoCode] = fareZone.name;
                });
            });
        }
    } else {
        (ticket as WithIds<SingleTicket>).fareZones.forEach((fareZone) => {
            fareZone.stops.forEach((stop) => {
                selectedFareStages[stop.atcoCode] = fareZone.name;
            });
        });
    }
    return selectedFareStages;
};

const getStopItems = (
    fareStages: string[],
    stops: Stop[],
    selectedFareStages: { [key: string]: string },
): Set<StopItem> => {
    const items = new Set(
        stops.map((stop, index) => {
            let dropdownValue = '';

            if (stop.atcoCode in selectedFareStages) {
                dropdownValue = selectedFareStages[stop.atcoCode];
            }
            return {
                index,
                stopName: formatStopName(stop),
                atcoCode: stop.atcoCode,
                naptanCode: stop.naptanCode,
                dropdownValue,
                stopData: JSON.stringify(stop),
                dropdownOptions: fareStages,
            };
        }),
    );
    return items;
};

const EditFareStageMatching = ({
    fareStages,
    stops,
    errors = [],
    csrfToken,
    backHref,
    selectedFareStages,
    warning,
    showBackButtton,
    direction,
    dataSource,
}: EditStagesProps): ReactElement => {
    const warnings: ErrorInfo[] = [];
    const [selections, updateSelections] = useState<StopItem[]>([]);
    const [stopItems, updateStopItems] = useState(getStopItems(fareStages, stops, selectedFareStages));

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

    if (errors.length === 0 && warning) {
        warnings.push({
            errorMessage: 'One or more fare stages have not been assigned, assign each fare stage to a stop',
            id: 'option-0',
        });
    }

    const title = `${upperFirst(direction)} fare stages - Create Fares Data Service`;

    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            {!!backHref && errors.length === 0 && !warning && showBackButtton ? <BackButton href={backHref} /> : null}
            <CsrfForm action="/api/editFareStageMatching" method="post" csrfToken={csrfToken} className="matching-page">
                <>
                    <ErrorSummary errors={errors} />
                    <WarningSummary
                        errors={warnings}
                        label="Check this box if you wish to proceed without assigning all fare stages, then click Continue"
                    />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="fare-type-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="fare-type-page-heading">
                                    {upperFirst(direction)} - Match stops to fares stages
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="fare-type-operator-hint">
                                Select a fare stage for each stop.
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
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
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
                                                    {}
                                                    <select
                                                        className="govuk-select farestage-select"
                                                        id={`option-${item.index}`}
                                                        name={`option-${item.index}`}
                                                        value={item.dropdownValue}
                                                        aria-labelledby={`stop-name-header stop-${item.index} naptan-code-header naptan-${item.index}`}
                                                        onChange={(e) =>
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
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: EditStagesProps } | void> => {
    const csrfToken = getCsrfToken(ctx);
    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE) as
        WithIds<SingleTicket> | WithIds<ReturnTicket> | undefined;

    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);
    const editFareStageMatchingAttribute = getSessionAttribute(ctx.req, EDIT_FARE_STAGE_MATCHING_ATTRIBUTE);
    const directionAttribute = getSessionAttribute(ctx.req, DIRECTION_ATTRIBUTE);

    if (!ticket || !matchingJsonMetaData) {
        throw new Error('Ticket not found in session.');
    }

    const nocCode = getAndValidateNoc(ctx);
    const dataSource = getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE) ? 'tnds' : 'bods';
    const serviceId = matchingJsonMetaData.serviceId;
    const service = await getServiceByIdAndDataSource(nocCode, Number(serviceId), dataSource);
    const lineName = service.lineName;

    let direction = 'outbound';
    let showBackButtton = true;
    if (ticket.type === 'single') {
        direction = ticket.journeyDirection;
    } else {
        if (directionAttribute && 'direction' in directionAttribute) {
            direction = directionAttribute.direction;
            showBackButtton = directionAttribute.direction !== 'inbound';
        }
    }
    const fareStages = getFareStagesFromTicket(ticket);
    // find journey patterns for direction (inbound or outbound)
    const journeyPatterns = service.journeyPatterns.filter((it) => it.direction === direction);

    // get an unordered list of stop points from journey patterns, then removing any duplicates on stopPointRef and sequence number
    const stops = journeyPatterns
        .flatMap((it) => it.orderedStopPoints)
        .filter(
            (stop, index, self) =>
                self.findIndex(
                    (other) => stop.stopPointRef === other.stopPointRef && stop.sequenceNumber === other.sequenceNumber,
                ) === index,
        );

    // building a sorted master stop list according to sequence numbers if they're there and valid
    const sortedStopList = validateSequenceNumbers(stops)
        ? stops.sort((stop, other) => stop.sequenceNumber - other.sequenceNumber).map((it) => it.stopPointRef)
        : sortingWithoutSequenceNumbers(journeyPatterns);

    const masterStopList = removeDuplicateAdjacentStops(sortedStopList);

    if (masterStopList.length === 0) {
        throw new Error(
            `No stops found for journey: nocCode ${nocCode}, lineName: ${lineName}, direction: ${direction}`,
        );
    }

    // filling out stop information from DB
    const dbResults = await batchGetStopsByAtcoCodeWithErrorCheck(
        masterStopList.filter((stop, index, self) => self.indexOf(stop) === index),
    );

    if (!dbResults.successful && ctx.res) {
        updateSessionAttribute(ctx.req, MISSING_STOPS_ATTRIBUTE, dbResults.missingStops);
        redirectTo(ctx.res, '/missingStops');
        return;
    }

    const naptanInfo = dbResults.results;

    // removing any stops that aren't fully fleshed out
    const orderedStops = masterStopList
        .map((atco) => naptanInfo.find((s) => s.atcoCode === atco))
        .filter((stop: Stop | undefined): stop is Stop => stop !== undefined);

    return {
        props: {
            stops: orderedStops,
            fareStages,
            errors: isWithErrors(editFareStageMatchingAttribute) ? editFareStageMatchingAttribute.errors : [],
            csrfToken,
            backHref: `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
                matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
            }`,
            selectedFareStages:
                editFareStageMatchingAttribute && editFareStageMatchingAttribute.selectedFareStages
                    ? editFareStageMatchingAttribute.selectedFareStages
                    : getSelectedFareStagesFromTicket(ticket, direction),
            warning:
                editFareStageMatchingAttribute &&
                'warning' in editFareStageMatchingAttribute &&
                editFareStageMatchingAttribute.warning
                    ? editFareStageMatchingAttribute.warning
                    : false,
            showBackButtton,
            direction,
            dataSource,
        },
    };
};

export default EditFareStageMatching;
