import { ReactElement } from 'react';
import {
    FARE_TYPE_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    FULL_TIME_RESTRICTIONS_ATTRIBUTE,
    SCHOOL_FARE_TYPE_ATTRIBUTE,
    TERM_TIME_ATTRIBUTE,
    GROUP_PASSENGER_INFO_ATTRIBUTE,
    CARNET_FARE_TYPE_ATTRIBUTE,
} from '../constants/attributes';
import {
    NextPageContextWithSession,
    FullTimeRestrictionAttribute,
    ConfirmationElement,
    SchoolFareType,
} from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import CsrfForm from '../components/CsrfForm';
import ConfirmationTable from '../components/ConfirmationTable';
import { getSessionAttribute } from '../utils/sessions';
import { isPassengerTypeAttributeWithErrors, isFareType } from '../interfaces/typeGuards';
import { getCsrfToken, sentenceCaseString, getAndValidateNoc } from '../utils';
import { getPassengerTypeNameByIdAndNoc } from '../data/auroradb';
import { PassengerType } from '../interfaces/dbTypes';
import { CompanionInfo, FullTimeRestriction } from '../interfaces/matchingJsonTypes';
import { fareTypes } from '../constants';

const title = 'Fare Confirmation - Create Fares Data Service';
const description = 'Fare Confirmation page of the Create Fares Data Service';

interface FareConfirmationProps {
    fareType: string;
    carnet: boolean;
    passengerType: PassengerType;
    passengerTypeName: string;
    groupPassengerInfo: CompanionInfo[];
    schoolFareType: SchoolFareType;
    termTime: string;
    fullTimeRestrictions: FullTimeRestriction[];
    csrfToken: string;
}

export const buildFareConfirmationElements = (
    fareType: string,
    carnet: boolean,
    passengerType: PassengerType,
    passengerTypeName: string,
    groupPassengerInfo: CompanionInfo[],
    schoolFareType: SchoolFareType,
    termTime: string,
    fullTimeRestrictions: FullTimeRestriction[],
): ConfirmationElement[] => {
    const confirmationElements: ConfirmationElement[] = [
        {
            name: 'Fare type',
            content: carnet ? 'Carnet' : fareTypes[fareType],
            href: 'fareType',
        },
        {
            name: 'Passenger type',
            content: passengerTypeName,
            href: 'selectPassengerType',
        },
    ];

    if (carnet) {
        confirmationElements.splice(1, 0, {
            name: 'Carnet type',
            content: fareTypes[fareType],
            href: 'carnetFareType',
        });
    }

    if (passengerType.passengerType === 'group' && groupPassengerInfo.length > 0) {
        groupPassengerInfo.forEach((passenger) => {
            const href = 'selectPassengerType';
            if (passenger.ageRangeMin || passenger.ageRangeMax) {
                confirmationElements.push({
                    name: `${passenger.name} - age range`,
                    content: `Minimum age: ${passenger.ageRangeMin ? passenger.ageRangeMin : 'N/A'} Maximum age: ${
                        passenger.ageRangeMax ? passenger.ageRangeMax : 'N/A'
                    }`,
                    href,
                });
            } else {
                confirmationElements.push({
                    name: `${passenger.name} - age range`,
                    content: 'N/A',
                    href,
                });
            }
            if (passenger.proofDocuments && passenger.proofDocuments.length > 0) {
                confirmationElements.push({
                    name: `${passenger.name} - proof documents`,
                    content: passenger.proofDocuments
                        .map((proofDoc: string) => sentenceCaseString(proofDoc))
                        .join(', '),
                    href,
                });
            } else {
                confirmationElements.push({
                    name: `${passenger.name} - proof documents`,
                    content: 'N/A',
                    href,
                });
            }
        });
    } else {
        const href = 'selectPassengerType';
        if (passengerType.ageRangeMin || passengerType.ageRangeMax) {
            confirmationElements.push({
                name: 'Passenger information - age range',
                content: `Minimum age: ${passengerType.ageRangeMin ? passengerType.ageRangeMin : 'N/A'} Maximum age: ${
                    passengerType.ageRangeMax ? passengerType.ageRangeMax : 'N/A'
                }`,
                href,
            });
        } else {
            confirmationElements.push({
                name: 'Passenger information - age range',
                content: 'N/A',
                href,
            });
        }

        if (passengerType.proofDocuments && passengerType.proofDocuments.length > 0) {
            confirmationElements.push({
                name: 'Passenger information - proof documents',
                content: passengerType.proofDocuments.map((proofDoc) => sentenceCaseString(proofDoc)).join(', '),
                href,
            });
        } else {
            confirmationElements.push({
                name: 'Passenger information - proof documents',
                content: 'N/A',
                href,
            });
        }
    }

    if (fareType === 'schoolService') {
        if (termTime !== '') {
            confirmationElements.push({
                name: 'Only valid during term times',
                content: termTime === 'true' ? 'Yes' : 'No',
                href: carnet === true ? 'termTime' : '',
            });
        }

        if (schoolFareType !== '') {
            confirmationElements.push({
                name: 'School ticket fare type',
                content: sentenceCaseString(schoolFareType),
                href: carnet === true ? 'schoolFareType' : '',
            });
        }
    }

    if (fullTimeRestrictions.length > 0) {
        fullTimeRestrictions.forEach((fullTimeRestriction) => {
            fullTimeRestriction.timeBands.forEach((timeBand) => {
                confirmationElements.push({
                    name: `Time restrictions - ${sentenceCaseString(fullTimeRestriction.day)}`,
                    content: `Start time: ${timeBand.startTime || 'N/A'} End time: ${timeBand.endTime || 'N/A'}`,
                    href: 'selectTimeRestrictions',
                });
            });
            if (!fullTimeRestriction.timeBands || fullTimeRestriction.timeBands.length === 0) {
                confirmationElements.push({
                    name: `Time restrictions - ${sentenceCaseString(fullTimeRestriction.day)}`,
                    content: 'Valid all day',
                    href: 'selectTimeRestrictions',
                });
            }
        });
    } else {
        confirmationElements.push({
            name: 'Time restrictions',
            content: 'N/A',
            href: 'selectTimeRestrictions',
        });
    }

    return confirmationElements;
};

const FareConfirmation = ({
    fareType,
    carnet,
    passengerType,
    passengerTypeName,
    groupPassengerInfo,
    schoolFareType,
    termTime,
    fullTimeRestrictions,
    csrfToken,
}: FareConfirmationProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={[]}>
        <CsrfForm action="/api/fareConfirmation" method="post" csrfToken={csrfToken}>
            <>
                <h1 className="govuk-heading-l">Check your answers before submitting your fares information</h1>
                <ConfirmationTable
                    header="Fare Information"
                    confirmationElements={buildFareConfirmationElements(
                        fareType,
                        carnet,
                        passengerType,
                        passengerTypeName,
                        groupPassengerInfo,
                        schoolFareType,
                        termTime,
                        fullTimeRestrictions,
                    )}
                />
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: FareConfirmationProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const fareTypeAttribute = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);
    const carnetAttribute = getSessionAttribute(ctx.req, CARNET_FARE_TYPE_ATTRIBUTE);
    const carnet = !!carnetAttribute;
    const passengerTypeAttribute = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);
    const schoolFareTypeAttribute = getSessionAttribute(ctx.req, SCHOOL_FARE_TYPE_ATTRIBUTE);
    const termTimeAttribute = getSessionAttribute(ctx.req, TERM_TIME_ATTRIBUTE);
    const fullTimeRestrictionsAttribute = getSessionAttribute(
        ctx.req,
        FULL_TIME_RESTRICTIONS_ATTRIBUTE,
    ) as FullTimeRestrictionAttribute;

    if (
        !passengerTypeAttribute ||
        isPassengerTypeAttributeWithErrors(passengerTypeAttribute) ||
        !isFareType(fareTypeAttribute) ||
        (fareTypeAttribute.fareType === 'schoolService' && !schoolFareTypeAttribute)
    ) {
        throw new Error('Could not extract the correct attributes for the user journey.');
    }

    const groupPassengerInfo = getSessionAttribute(ctx.req, GROUP_PASSENGER_INFO_ATTRIBUTE) || [];

    const passengerTypeName = await getPassengerTypeNameByIdAndNoc(passengerTypeAttribute.id, getAndValidateNoc(ctx));

    return {
        props: {
            fareType: fareTypeAttribute.fareType,
            carnet,
            passengerType: passengerTypeAttribute,
            passengerTypeName,
            schoolFareType: schoolFareTypeAttribute?.schoolFareType || '',
            groupPassengerInfo,
            termTime: termTimeAttribute?.termTime.toString() || '',
            fullTimeRestrictions: fullTimeRestrictionsAttribute?.fullTimeRestrictions || [],
            csrfToken,
        },
    };
};

export default FareConfirmation;
