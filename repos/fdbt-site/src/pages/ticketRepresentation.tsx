import { ReactElement } from 'react';
import { TicketType } from '../interfaces/matchingJsonTypes';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import RadioButtons from '../components/RadioButtons';
import {
    CARNET_FARE_TYPE_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
} from '../constants/attributes';
import { ErrorInfo, FareType, NextPageContextWithSession } from '../interfaces';
import { isTicketRepresentationWithErrors } from '../interfaces/typeGuards';
import TwoThirdsLayout from '../layout/Layout';
import { getCsrfToken, isSchemeOperator } from '../utils';
import { getSessionAttribute } from '../utils/sessions';
import { fareTypes, STAGE } from '../constants';

const title = 'Ticket Representation - Create Fares Data Service';
const description = 'Ticket Representation selection page of the Create Fares Data Service';

interface TicketRepresentationProps {
    fareType: TicketType;
    errors: ErrorInfo[];
    csrfToken: string;
    showHybrid: boolean;
    showPointToPoint: boolean;
    showFlatFlare: boolean;
    showMultiOperator: boolean;
    showGeoZone: boolean;
    stage?: string;
}

const getFareTypeHint = (fareType: TicketType) => {
    switch (fareType) {
        case 'period':
            return {
                geoZone: 'Unlimited travel within a geographical zone',
                multipleServices: 'Unlimited travel on specific service or set of services',
            };
        case 'flatFare':
            return {
                geoZone: 'Single trip anywhere within a geographic zone',
                multipleServices: 'Single trip on a specific service or set of services',
            };
        default:
            return {
                geoZone: 'Travel within a geographical zone',
                multipleServices: 'Travel on specific service or set of services',
            };
    }
};

const TicketRepresentation = ({
    fareType,
    errors = [],
    csrfToken,
    showHybrid,
    showPointToPoint,
    showFlatFlare,
    showMultiOperator,
    showGeoZone,
    stage,
}: TicketRepresentationProps): ReactElement => {
    const fareTypeHint = getFareTypeHint(fareType);

    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/ticketRepresentation" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="ticket-representation-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="ticket-representation-page-heading">
                                    {`Select a type of ${fareTypes[fareType].toLowerCase()} ticket`}
                                </h1>
                            </legend>
                            <FormElementWrapper errors={errors} errorId="geo-zone" errorClass="govuk-radios--errors">
                                <RadioButtons
                                    inputName="ticketType"
                                    options={[
                                        ...(showGeoZone
                                            ? [
                                                  {
                                                      value: 'geoZone',
                                                      label: 'A ticket within a geographical zone',
                                                      hint: fareTypeHint.geoZone,
                                                  },
                                              ]
                                            : []),

                                        {
                                            value: 'multipleServices',
                                            label: 'A ticket for a set of services',
                                            hint: fareTypeHint.multipleServices,
                                        },

                                        ...(showMultiOperator
                                            ? [
                                                  {
                                                      value: 'multipleServicesFlatFareMultiOperator',
                                                      label: 'Flat fare, for a set of services',
                                                      hint: 'A flat fare multi operator ticket for travel on specific service or set of services',
                                                  },
                                                  {
                                                      value: 'geoZoneFlatFareMultiOperator',
                                                      label: 'Flat fare, within a geographical zone',
                                                      hint: 'A flat fare multi operator ticket for travel within a geographical zone',
                                                  },
                                              ]
                                            : []),
                                        ...(showPointToPoint
                                            ? [
                                                  {
                                                      value: 'pointToPointPeriod',
                                                      label: 'Point to point',
                                                      hint: 'Unlimited travel between two fixed points in both directions',
                                                  },
                                              ]
                                            : []),
                                        ...(showHybrid
                                            ? [
                                                  {
                                                      value: 'hybrid',
                                                      label: 'Hybrid period ticket',
                                                      hint: 'Unlimited travel within a geographic zone and certain additional services outside that zone',
                                                  },
                                              ]
                                            : []),
                                        ...(showFlatFlare
                                            ? [
                                                  {
                                                      value: 'multipleServicesReturn',
                                                      label: 'A return ticket for a set of services',
                                                      hint: 'Return trip on a specific service or set of services',
                                                  },
                                              ]
                                            : []),
                                        ...(showFlatFlare && stage === 'dev'
                                            ? [
                                                  {
                                                      value: 'multipleServicesPricedByDistance',
                                                      label: 'A ticket for a set of services, priced by distance',
                                                      hint: 'Single trip on a specific service or set of services, priced by distance',
                                                  },
                                              ]
                                            : []),
                                    ]}
                                />
                            </FormElementWrapper>
                        </fieldset>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: TicketRepresentationProps } => {
    const csrfToken = getCsrfToken(ctx);
    const { fareType } = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE) as FareType;
    const ticketType = getSessionAttribute(ctx.req, TICKET_REPRESENTATION_ATTRIBUTE);
    const isCarnet = getSessionAttribute(ctx.req, CARNET_FARE_TYPE_ATTRIBUTE);
    const isScheme = isSchemeOperator(ctx);

    return {
        props: {
            fareType,
            errors: ticketType && isTicketRepresentationWithErrors(ticketType) ? ticketType.errors : [],
            csrfToken,
            showHybrid: fareType === 'period' && !isScheme,
            showPointToPoint: (fareType === 'period' && !isCarnet && !isScheme) || fareType === 'schoolService',
            showFlatFlare: fareType === 'flatFare' && !isScheme && !isCarnet,
            showMultiOperator: fareType === 'multiOperator' || fareType === 'multiOperatorExt',
            showGeoZone: fareType !== 'schoolService',
            stage: STAGE || 'dev',
        },
    };
};

export default TicketRepresentation;
