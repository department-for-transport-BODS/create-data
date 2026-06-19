import React, { ReactElement } from 'react';
import Image from 'next/image';
import { TwoThirdsLayout } from '../layout/Layout';
import DACimage from '../assets/images/DAC_certification.png';

const title = 'Accessibility - Create Fares Data Service';
const description = 'Accessibility page for the Create Fares Data Service';

const Accessibility = (): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description}>
            <h1 className="govuk-heading-l">Accessibility statement for the Create Fares Data Service</h1>
            <p className="govuk-body">
                This service is part of the wider GOV.UK website. There’s a separate accessibility statement for the
                main GOV.UK website.
            </p>
            <p className="govuk-body">
                This page only contains information about the Create Fares Data Service, available at&nbsp;
                <a href="https://fares-data.dft.gov.uk">https://fares-data.dft.gov.uk</a>.
            </p>
            <h2 className="govuk-heading-m">Using this service</h2>
            <p className="govuk-body">
                This service is run by the Department for Transport. We want as many people as possible to be able to
                use this service. For example, that means you should be able to:
            </p>
            <ol className="govuk-list govuk-list--bullet">
                <li>change colours, contrast levels and fonts</li>
                <li>zoom in up to 300% without the text spilling off the screen</li>
                <li>get from the start of the service to the end using just a keyboard</li>
                <li>get from the start of the service to the end using speech recognition software</li>
                <li>
                    listen to the service using a screen reader (including the most recent versions of JAWS, NVDA and
                    VoiceOver)
                </li>
            </ol>
            <p className="govuk-body">We’ve also made the text in the service as simple as possible to understand.</p>

            <p className="govuk-body">
                <a href="https://mcmw.abilitynet.org.uk/" rel="external">
                    AbilityNet
                </a>
                &nbsp;has advice on making your device easier to use if you have a disability.
            </p>
            <h2 className="govuk-heading-m">How accessible this service is</h2>
            <p className="govuk-body">
                Some of the language and concepts used throughout this service are aimed at users within the transport
                industry.
            </p>
            <p className="govuk-body">Some documents are in PDF format and are not accessible.</p>
            <h2 className="govuk-heading-m">Feedback and contact information</h2>
            <p className="govuk-body">
                If you have difficulty using this service, <a href="/contact">contact us</a>.
            </p>
            <h2 className="govuk-heading-m">Reporting accessibility problems with this service</h2>
            <p className="govuk-body">
                We’re always looking to improve the accessibility of this service. If you find any problems that are not
                listed on this page or think we’re not meeting accessibility requirements,&nbsp;
                <a href="/contact">contact us</a>.
            </p>
            <h2 className="govuk-heading-m">Enforcement procedure</h2>
            <p className="govuk-body">
                The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies
                (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the ‘accessibility
                regulations’). If you’re not happy with how we respond to your complaint,&nbsp;
                <a href="https://www.equalityadvisoryservice.com/">
                    contact the Equality Advisory and Support Service (EASS)
                </a>
                .
            </p>
            <h2 className="govuk-heading-m">Contacting us</h2>
            <p className="govuk-body">
                Find out how to <a href="/contact">contact us</a>.
            </p>
            <h2 className="govuk-heading-m">Technical information about this website’s accessibility</h2>
            <p className="govuk-body">
                The Department for Transport is committed to making its websites accessible, in accordance with the
                Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.
            </p>
            <h2 className="govuk-heading-m">Compliance status</h2>
            <p className="govuk-body">
                This service is fully compliant with the&nbsp;
                <a href="https://www.w3.org/TR/WCAG21/">Web Content Accessibility Guidelines version 2.1 AA standard</a>
                .
            </p>
            <h2 className="govuk-heading-m"> Preparation of this accessibility statement</h2>
            <p className="govuk-body">
                This statement was prepared on 20 October 2020. It was last reviewed on 20 October 2020.
            </p>
            <p className="govuk-body">
                This website was last tested on 7 October 2020. The test was carried out by the Digital Accessibility
                Centre.
            </p>
            <div>
                <Image width="150" src={DACimage} alt="DAC AA certification" />
            </div>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (): {} => {
    return { props: {} };
};

export default Accessibility;
