import { ReactElement } from 'react';
import { TwoThirdsLayout } from '../layout/Layout';

const title = 'Privacy - Create Fares Data Service';
const description = 'Privacy policy page for the Create Fares Data Service';

const Privacy = (): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description}>
            <h1 className="govuk-heading-l">Privacy policy for the Create Fares Data Service</h1>
            <p className="govuk-body">Last updated: 03/12/2020</p>
            <h2 className="govuk-heading-m">Who we are</h2>
            <p className="govuk-body">
                The Create Fares Data service allows users to convert their fares information into a format called
                NeTEx, which is an XML-based data standard. The service provides an easy-to-use webflow that takes the
                user through a series of questions, allowing them to define their fare prices and structures. In order
                to make the process as simple as possible, we utilise data from Traveline National Dataset (TNDS),
                NaPTAN dataset and National Operator Code (NOC) database to represent bus operator routes and services
                to the user. The aim of the tool is to integrate closely with the Bus Open Data Service (BODS) in the
                publication of fares data.
            </p>
            <h2 className="govuk-heading-m">What data we collect from you</h2>
            <p className="govuk-body">
                Our main purpose is ensuring data about local bus services across England is in the public domain. This
                data is provided by bus operators and anybody can sign up to use it. The personal data we collect from
                you includes:
            </p>
            <ol className="govuk-list govuk-list--bullet">
                <li>your questions, queries or feedback, and email address if you contact GOV.UK</li>
                <li>your email address and subscription preferences when you sign up to our email alerts</li>
                <li>your Internet Protocol (IP) address, and web browser version</li>
                <li>information on how you use the site, using cookies and page tagging</li>
            </ol>
            <h2 className="govuk-heading-m">Why we need your data</h2>
            <p className="govuk-body">
                We want data consumers to be able to use fares for bus services across England, for the benefit of the
                general public. We collect information through Google Analytics to see how you use this service so that
                we can make it better. We also collect data in order to:
            </p>
            <ol className="govuk-list govuk-list--bullet">
                <li>reply to any feedback you send us, if you’ve asked us to</li>
                <li>monitor use of the site to identify security threats</li>
            </ol>
            <h2 className="govuk-heading-m">What we do with your data</h2>
            <p className="govuk-body">
                We use your data to occasionally check your activity when using the service. We will not:
            </p>
            <ol className="govuk-list govuk-list--bullet">
                <li>sell or rent your data to third parties</li>
                <li>share your data with third parties for marketing purposes</li>
            </ol>
            <p className="govuk-body">
                We will share your data if we are required to do so by law – for example, by court order, or to prevent
                fraud or other crime. We use your data to calculate performance metrics to support continuous
                improvement of the service. When you sign up, you can also opt in to be contacted to participate in user
                research. If you change your mind later about this, please let us know by emailing us.
            </p>
            <p className="govuk-body">
                We use Google Analytics software to collect information about how you use GOV.UK. This includes IP
                addresses. The data is anonymised before being used for analytics processing. Google Analytics processes
                anonymised information about:
            </p>
            <ol className="govuk-list govuk-list--bullet">
                <li>the pages you visit on GOV.UK</li>
                <li>how long you spend on each GOV.UK page</li>
                <li>how you got to the site</li>
                <li>what you click on while you’re visiting the site</li>
            </ol>
            <p className="govuk-body">
                We do not store your personal information through Google Analytics (for example your name or address).
                We will not identify you through analytics information, and we will not combine analytics information
                with other data sets in a way that would identify who you are. We continuously test and monitor our data
                protection controls to make sure they’re effective and to detect any weaknesses.
            </p>
            <h2 className="govuk-heading-m">How long we keep your data for</h2>
            <p className="govuk-body">
                We will retain your data for as long as you have a Create Fares Data account. However, if you use an
                institutional email account and depending on what you choose for your account name, this may not include
                any personally identifiable information.
            </p>
            <h2 className="govuk-heading-m">Where your data is processed and stored</h2>
            <p className="govuk-body">
                We design, build and run our systems to make sure that your data is as safe as possible at any stage,
                both while it’s processed and when it’s stored. Your personal data will not be transferred outside of
                the European Economic Area (EEA).
            </p>
            <h2 className="govuk-heading-m">How we protect your data and keep it secure</h2>
            <p className="govuk-body">
                We are committed to doing all that we can to keep your data secure. To prevent unauthorised access or
                disclosure we have put in place technical and organisational procedures to secure the data we collect
                about you – for example, we protect your data using varying levels of encryption. We also make sure that
                any third parties that we deal with have an obligation to keep all personal data they process on our
                behalf secure.
            </p>
            <h2 className="govuk-heading-m">Children’s privacy protection</h2>
            <p className="govuk-body">
                We understand the importance of protecting children’s privacy online. Our services are not designed for,
                or intentionally targeted at, children 13 years of age or younger. It is not our policy to intentionally
                collect or maintain data about anyone under the age of 13.
            </p>
            <h2 className="govuk-heading-m">What are your rights</h2>
            <p className="govuk-body">You have the right to request:</p>
            <ol className="govuk-list govuk-list--bullet">
                <li>information about how your personal data is processed</li>
                <li>
                    a copy of that personal data - this copy will be provided in a structured, commonly used and
                    machine-readable format
                </li>
                <li>that anything inaccurate in your personal data is corrected immediately</li>
            </ol>
            <p className="govuk-body">You can also:</p>
            <ol className="govuk-list govuk-list--bullet">
                <li>raise an objection about how your personal data is processed</li>
                <li>request that your personal data is erased if there is no longer justification for it</li>
                <li>ask that the processing of your personal data is restricted in certain circumstances</li>
            </ol>
            <p className="govuk-body">
                If you have any of these requests, get in contact with our Data Protection Officer - you can find their
                contact details below.
            </p>
            <h2 className="govuk-heading-m">Changes to this notice</h2>
            <p className="govuk-body">
                We may modify or amend this privacy notice at our discretion at any time. When we make changes to this
                notice, we will amend the last modified date at the top of this page. Any modification or amendment to
                this privacy notice will be applied to you and your data as of that revision date. We encourage you to
                periodically review this privacy notice to be informed about how we are protecting your data.
            </p>
            <h2 className="govuk-heading-m">Contact us or make a complaint</h2>
            <p className="govuk-body">Contact the GDS Privacy Team if you either:</p>
            <ol className="govuk-list govuk-list--bullet">
                <li>have any questions about anything in this document</li>
                <li>think your personal data has been misused or mishandled</li>
            </ol>
            <p className="govuk-body">GDS Privacy Team</p>
            <p className="govuk-body">
                <a className="govuk-link" href="mailto:gds-privacy-office@digital.cabinet-office.gov.uk">
                    gds-privacy-office@digital.cabinet-office.gov.uk
                </a>{' '}
            </p>
            <p className="govuk-body">
                You can also contact the Cabinet Office Data Protection Officer by email or post.
            </p>
            <div>
                <p className="govuk-body govuk-!-margin-bottom-0">Data Protection Officer</p>
                <p className="govuk-body">
                    <a className="govuk-link" href="mailto:DPO@cabinetoffice.gov.uk">
                        DPO@cabinetoffice.gov.uk
                    </a>
                </p>
            </div>
            <div>
                <p className="govuk-body govuk-!-margin-bottom-0">Data Protection Officer</p>
                <p className="govuk-body govuk-!-margin-bottom-0">Cabinet Office</p>
                <p className="govuk-body govuk-!-margin-bottom-0">70 Whitehall</p>
                <p className="govuk-body">London SW1A 2AS</p>
            </div>
            <p className="govuk-body">
                If you have a complaint, you can also contact the Information Commissioner&apos;s Office (ICO). The ICO
                is an independent regulator set up to uphold information rights.
            </p>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (): {} => {
    return { props: {} };
};

export default Privacy;
