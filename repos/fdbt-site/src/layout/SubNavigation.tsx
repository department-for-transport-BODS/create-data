import { ReactElement } from 'react';
import { useRouter } from 'next/router';

const link = (pageLink: string, text: string) => (
    <li className={getNavLinkCSS(pageLink)}>
        <a
            className="app-subnav__link govuk-link govuk-link--no-visited-state govuk-link--no-underline"
            href={pageLink}
        >
            {text}
        </a>
    </li>
);

const SubNavigation = (): ReactElement => {
    return (
        <div className="app-pane__subnav">
            <nav className="app-subnav" aria-labelledby="app-subnav-heading">
                <h2 className="govuk-visually-hidden" id="app-subnav-heading">
                    Pages in this section
                </h2>

                <ul className="app-subnav__section">
                    {link('/globalSettings', 'Settings overview')}
                    {link('/viewPassengerTypes', 'Passenger types')}
                    {link('/viewPurchaseMethods', 'Purchase methods')}
                    {link('/viewTimeRestrictions', 'Time restrictions')}
                    {link('/manageFareDayEnd', 'Fare day end')}
                    {link('/viewOperatorGroups', 'Operator groups')}
                    {link('/manageOperatorDetails', 'Operator details')}
                    {link('/viewCaps', 'Caps')}
                </ul>
            </nav>
        </div>
    );
};

const getNavLinkCSS = (pageLink: string) => {
    const router = useRouter();

    const cssClassesForNonActiveItem = 'app-subnav__section-item';
    const cssClassesForActiveItem = 'app-subnav__section-item app-subnav__section-item--current';

    return router.pathname == pageLink ? cssClassesForActiveItem : cssClassesForNonActiveItem;
};

export default SubNavigation;
