import { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';

const title = 'Request Access - Create Fares Data Service';
const description = 'Request Access page of the Create Fares Data Service';

const RequestAccess = (): ReactElement => (
    <BaseLayout title={title} description={description} errors={[]}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <h1 className="govuk-heading-l" id="request-access-page-heading">
                    Request Access
                </h1>
                <p className="govuk-body">The Create fares data service is not open to public registration.</p>
                <p className="govuk-body">
                    Please contact{' '}
                    <a className="govuk-link" id="access_link" href="/contact">
                        Create fares data support
                    </a>{' '}
                    to register.
                </p>
            </div>
            <div className="govuk-grid-column-one-third">
                <div>
                    <h2 className="govuk-heading-s">Already have an account?</h2>
                    <a href="/login" className="govuk-link">
                        Sign in
                    </a>
                </div>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = (): object => {
    return { props: {} };
};

export default RequestAccess;
