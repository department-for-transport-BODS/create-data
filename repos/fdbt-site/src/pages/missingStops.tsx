import { ReactElement } from 'react';
import { MISSING_STOPS_ATTRIBUTE } from '../constants/attributes';
import { NextPageContextWithSession } from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import { redirectToError } from '../utils/apiUtils';
import { getSessionAttribute } from '../utils/sessions';

const title = 'Missing Stops - Create Fares Data Service';
const description = 'Missing stops error page of the Create Fares Data Service';

interface NoServicesProps {
    missingStops: string[];
}

const MissingStops = ({ missingStops }: NoServicesProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">There is an issue with the TransXChange data for this service</h1>
        <p className="govuk-body-m">
            It appears there is one or more stops in your service which is not present in the NaPTAN Dataset.
        </p>
        <table className="govuk-table">
            <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">
                        Stop codes not in NaPTAN
                    </th>
                </tr>
            </thead>
            <tbody className="govuk-table__body">
                {missingStops.map((stop) => (
                    <tr className="govuk-table__row" key={stop}>
                        <td className="govuk-table__cell">{stop}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <p className="govuk-body-m">
            You will not be able to continue creating fares data for this service until this is rectified.
        </p>
        <p className="govuk-body-m">
            <a href="/contact">Contact</a> us if you have further questions.
        </p>
        <a
            href="/home"
            role="button"
            draggable="false"
            className="govuk-button"
            data-module="govuk-button"
            id="home-button"
        >
            Home
        </a>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): {} => {
    const missingStops = getSessionAttribute(ctx.req, MISSING_STOPS_ATTRIBUTE);

    if (!missingStops && ctx.res) {
        redirectToError(
            ctx.res,
            'No missing stops to render',
            'missingStops.tsx',
            new Error('No missing stops to render'),
        );
    }
    return {
        props: {
            missingStops,
        },
    };
};

export default MissingStops;
