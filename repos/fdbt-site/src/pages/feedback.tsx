import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import { getCsrfToken } from '../utils';
import {
    contactFeedbackQuestion,
    solveFeedbackQuestion,
    hearAboutUsFeedbackQuestion,
    generalFeedbackQuestion,
} from '../constants';

const title = 'Feedback - Create Fares Data Service';
const description = 'Feedback page of the Create Fares Data Service';

interface FeedbackProps {
    csrfToken: string;
    feedbackSubmitted: 'submitted' | 'not submitted' | 'false';
}

const createFeedbackBox = (option: 'submitted' | 'not submitted'): ReactElement => (
    <div className={option === 'submitted' ? 'information_box__success' : 'information_box__warning'}>
        <h2 className="govuk-heading-m">Your feedback was {option}</h2>
        <p className="govuk-body">
            {option === 'submitted'
                ? 'Thank you for taking the time to improve the service'
                : 'The feedback form was empty, at least one question has to be answered'}
        </p>
        <p className="govuk-body">
            <a href="/home">Click here to return to the homepage</a>
        </p>
    </div>
);

const Feedback = ({ csrfToken, feedbackSubmitted }: FeedbackProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={[]}>
        <CsrfForm action="/api/feedback" method="post" csrfToken={csrfToken}>
            <>
                {feedbackSubmitted !== 'false' ? createFeedbackBox(feedbackSubmitted) : null}
                <h1 className="govuk-heading-l">Help us improve Create Fares Data</h1>
                <span className="govuk-hint">
                    Thank you for providing feedback and comments. Answer any questions which apply to your experience
                    using Create Fares Data, and be as specific as possible
                </span>

                <div className="govuk-!-padding-top-3">
                    <fieldset className="govuk-fieldset" aria-describedby="hear-about-service-header">
                        <legend
                            className="govuk-fieldset__legend govuk-fieldset__legend--m"
                            id="hear-about-service-header"
                        >
                            {hearAboutUsFeedbackQuestion}
                        </legend>
                        <textarea
                            className="govuk-textarea"
                            id="hear-about-service-question"
                            name="hearAboutServiceQuestion"
                            rows={3}
                            aria-labelledby="hear-about-service-header"
                        />
                    </fieldset>
                </div>

                <div>
                    <fieldset className="govuk-fieldset" aria-describedby="general-feedback-header">
                        <legend
                            className="govuk-fieldset__legend govuk-fieldset__legend--m"
                            id="general-feedback-header"
                        >
                            {generalFeedbackQuestion}
                        </legend>
                        <textarea
                            className="govuk-textarea"
                            id="general-feedback-question"
                            name="generalFeedbackQuestion"
                            rows={6}
                            aria-labelledby="general-feedback-header"
                        />
                    </fieldset>
                </div>

                <div className="govuk-!-padding-bottom-3">
                    <fieldset className="govuk-fieldset" aria-describedby="contact-header">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m" id="contact-header">
                            {contactFeedbackQuestion}
                        </legend>
                        <div className="govuk-radios" id="contact-radios">
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="contact-question-yes"
                                    name="contactQuestion"
                                    type="radio"
                                    value="Yes"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="contact-question-yes">
                                    Yes
                                </label>
                            </div>
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="contact-question-no"
                                    name="contactQuestion"
                                    type="radio"
                                    value="No"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="contact-question-no">
                                    No
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div className="govuk-!-padding-bottom-6">
                    <fieldset className="govuk-fieldset" aria-describedby="problem-header">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m" id="problem-header">
                            {solveFeedbackQuestion}
                        </legend>
                        <div className="govuk-radios" id="problem-radios">
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="problem-question-yes"
                                    name="problemQuestion"
                                    type="radio"
                                    value="Yes"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="problem-question-yes">
                                    Yes
                                </label>
                            </div>
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="problem-question-no"
                                    name="problemQuestion"
                                    type="radio"
                                    value="No"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="problem-question-no">
                                    No
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>

                <input type="submit" value="Submit" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: FeedbackProps } => {
    const csrfToken = getCsrfToken(ctx);
    const feedbackSubmittedQueryString = ctx.query?.feedbackSubmitted;
    let feedbackSubmitted: 'submitted' | 'not submitted' | 'false' = 'false';
    if (feedbackSubmittedQueryString) {
        feedbackSubmitted = feedbackSubmittedQueryString === 'true' ? 'submitted' : 'not submitted';
    }
    return { props: { feedbackSubmitted, csrfToken } };
};

export default Feedback;
