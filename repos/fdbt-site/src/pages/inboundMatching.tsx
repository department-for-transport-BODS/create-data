import { ReactElement } from 'react';
import { INBOUND_MATCHING_ATTRIBUTE } from '../constants/attributes';
import MatchingBase from '../components/MatchingBase';
import { BasicService, NextPageContextWithSession, UserFareStages } from '../interfaces';
import { getSessionAttribute } from '../utils/sessions';
import { getMatchingProps } from '../utils/apiUtils/matching';
import { Stop } from '../interfaces/matchingJsonTypes';

const heading = 'Inbound - Match stops to fare stages';
const title = 'Inbound Matching - Create Fares Data Service';
const description = 'Inbound Matching page of the Create Fares Data Service';
const hintText = 'Select a fare stage for each stop on the inbound journey.';
const apiEndpoint = '/api/inboundMatching';

interface InboundMatchingProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    service: BasicService;
    error: string;
    warning?: boolean;
    selectedFareStages: string[][];
    unusedStage: boolean;
    csrfToken: string;
    dataSource: string;
}

const InboundMatching = ({
    userFareStages,
    stops,
    service,
    error,
    warning,
    csrfToken,
    selectedFareStages,
    unusedStage,
    dataSource,
}: InboundMatchingProps): ReactElement => (
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
        unusedStage={unusedStage}
        csrfToken={csrfToken}
    />
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: InboundMatchingProps }> => {
    const matchingAttribute = getSessionAttribute(ctx.req, INBOUND_MATCHING_ATTRIBUTE);
    const unusedStage = !!ctx.query.unusedStage;
    return { props: { ...(await getMatchingProps(ctx, matchingAttribute, true)).props, unusedStage } };
};

export default InboundMatching;
