import { ReactElement } from 'react';
import { MATCHING_ATTRIBUTE } from '../constants/attributes';
import MatchingBase from '../components/MatchingBase';
import { NextPageContextWithSession } from '../interfaces';
import { getSessionAttribute } from '../utils/sessions';
import { MatchingProps } from './matching';
import { getMatchingProps } from '../utils/apiUtils/matching';

const heading = 'Outbound - Match stops to fare stages';
const title = 'Outbound Matching - Create Fares Data Service';
const description = 'Outbound Matching page of the Create Fares Data Service';
const hintText = 'Select a fare stage for each stop on the outbound journey.';
const apiEndpoint = '/api/outboundMatching';

const OutboundMatching = ({
    userFareStages,
    stops,
    service,
    error,
    warning,
    csrfToken,
    selectedFareStages,
    dataSource,
}: MatchingProps): ReactElement => (
    <MatchingBase
        userFareStages={userFareStages}
        stops={stops}
        service={service}
        error={error}
        warning={warning}
        selectedFareStages={selectedFareStages}
        heading={heading}
        title={title}
        description={description}
        hintText={hintText}
        dataSource={dataSource}
        apiEndpoint={apiEndpoint}
        csrfToken={csrfToken}
        unusedStage={false}
    />
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: MatchingProps }> => {
    const matchingAttribute = getSessionAttribute(ctx.req, MATCHING_ATTRIBUTE);

    return await getMatchingProps(ctx, matchingAttribute);
};

export default OutboundMatching;
