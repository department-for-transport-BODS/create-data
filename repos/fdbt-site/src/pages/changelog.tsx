import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';

const title = 'Changelog - Create Fares Data Service';
const description = 'Changelog page for the Create Fares Data Service';

const Changelog = (): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-xl">Service Changelog</h1>
        <p className="govuk-body">Last updated: 12 May 2025</p>
        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
        <h2 className="govuk-heading-l">May 2025 (1.90.0)</h2>
        <ul className="govuk-list govuk-list--bullet">
            <li>Add functionality to delete completed exports</li>
            <li>Add email alerts for completed multi-operator external products</li>
        </ul>
        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
        <h2 className="govuk-heading-l">March 2025 (1.89.0)</h2>
        <ul className="govuk-list govuk-list--bullet">
            <li>Add multi-operator external products</li>
        </ul>
        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
        <h2 className="govuk-heading-l">December 2024 (1.88.0)</h2>
        <ul className="govuk-list govuk-list--bullet">
            <li>Add service changelog</li>
            <li>Add missing caps selection option when creating products</li>
            <li>Hide expired and invalid products in the exporter tool</li>
            <li>Use proper casing for GOV.UK tags</li>
        </ul>
        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
        <h2 className="govuk-heading-l">December 2024 (1.87.0)</h2>
        <ul className="govuk-list govuk-list--bullet">
            <li>Add fares cap options for ticketing products</li>
            <li>Improve site password policy</li>
        </ul>
        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
        <h2 className="govuk-heading-l">October 2024 (1.86.0)</h2>
        <ul className="govuk-list govuk-list--bullet">
            <li>Remove flag pricing by distance on flat fare journeys</li>
            <li>Upgrade the GOV.UK frontend version to v5</li>
            <li>Change crown logo to His Majesty The King</li>
            <li>Improve accessibility compliance across the site</li>
        </ul>
        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
        <h2 className="govuk-heading-l">March 2024 (1.85.0)</h2>
        <ul className="govuk-list govuk-list--bullet">
            <li>Fix download template & guide links on several pages</li>
            <li>Prevent unexpected stops appearing in stop lists</li>
            <li>Use correct fare zone type for some fare frames</li>
        </ul>
    </TwoThirdsLayout>
);

export const getServerSideProps = (): { props: object } => ({
    props: {},
});

export default Changelog;
