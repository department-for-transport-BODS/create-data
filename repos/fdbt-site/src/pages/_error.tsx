import { ReactElement } from 'react';
import { NextPageContext } from 'next';
import TwoThirdsLayout from '../layout/Layout';
import { FEEDBACK_LINK } from '../constants';

const title = 'Error - Create Fares Data Service';
const description = 'Error page of the Create Fares Data Service';

interface ErrorProps {
    statusCode: number;
}

const Error = ({ statusCode }: ErrorProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        {statusCode === 404 ? (
            <div>
                <h1 className="govuk-heading-l">Page not found</h1>
                <p className="govuk-body">If you typed the web address, check it is correct.</p>
                <p className="govuk-body">If you pasted the web address, check you copied the entire address.</p>
                <p className="govuk-body">
                    If the web address is correct or you selected a link or button,{' '}
                    <a className="govuk-link" id="feedback-link" href={FEEDBACK_LINK}>
                        contact
                    </a>{' '}
                    us about your fares data.
                </p>
            </div>
        ) : (
            <div>
                <h1 className="govuk-heading-l">Sorry, there is a problem with the service.</h1>
                <p className="govuk-body">Try again later.</p>
                <p className="govuk-body">Your answers have not been saved, use the button below to start again.</p>
                <p className="govuk-body">
                    {' '}
                    <a className="govuk-link" id="feedback-link" href={'/contact'}>
                        Contact
                    </a>{' '}
                    us for assistance.
                </p>
            </div>
        )}

        <br />
        <a href="/" role="button" draggable="false" className="govuk-button" data-module="govuk-button">
            Start again
        </a>
    </TwoThirdsLayout>
);

export const getStaticProps = (ctx: NextPageContext): object => {
    return { props: { statusCode: ctx.res?.statusCode ?? 500 } };
};

export default Error;
