import { ReactElement } from 'react';
import { useRouter } from 'next/router';

const Navigation = (): ReactElement => (
    <div className="govuk-service-navigation" data-module="govuk-service-navigation">
        <div className="govuk-width-container">
            <div className="govuk-service-navigation__container">
                <nav className="govuk-service-navigation__wrapper">
                    <ul className="govuk-service-navigation__list">
                        <li
                            className={`govuk-service-navigation__item ${
                                isActivePage(['products/services']) ? 'govuk-service-navigation__item--active' : ''
                            }`}
                        >
                            <a
                                className="govuk-service-navigation__link"
                                href="/products/services"
                                data-topnav="Services"
                            >
                                Services
                            </a>
                        </li>

                        <li
                            className={`govuk-service-navigation__item ${
                                isActivePage(['products/otherProducts']) ? 'govuk-service-navigation__item--active' : ''
                            }`}
                        >
                            <a
                                className="govuk-service-navigation__link"
                                href="/products/otherProducts"
                                data-topnav="Other Products"
                            >
                                Other products
                            </a>
                        </li>

                        <li
                            className={`govuk-service-navigation__item ${
                                isActivePage(['/products/multiOperatorProducts'])
                                    ? 'govuk-service-navigation__item--active'
                                    : ''
                            }`}
                        >
                            <a
                                className="govuk-service-navigation__link"
                                href="/products/multiOperatorProducts"
                                data-topnav="Multi-operator products (internal)"
                            >
                                Multi-operator products (internal)
                            </a>
                        </li>

                        <li
                            className={`govuk-service-navigation__item ${
                                isActivePage(['products/exports']) ? 'govuk-service-navigation__item--active' : ''
                            }`}
                        >
                            <a
                                className="govuk-service-navigation__link"
                                href="/products/exports"
                                data-topnav="Exports"
                            >
                                Export your data
                            </a>
                        </li>

                        <li
                            className={`govuk-service-navigation__item ${
                                isActivePage([
                                    'globalSettings',
                                    'viewCaps',
                                    'viewPassengerTypes',
                                    'viewPurchaseMethods',
                                    'viewTimeRestrictions',
                                    'manageFareDayEnd',
                                    'manageOperatorDetails',
                                    'viewOperatorGroups',
                                    'viewProductGroups',
                                ])
                                    ? 'govuk-service-navigation__item--active'
                                    : ''
                            }`}
                        >
                            <a
                                className="govuk-service-navigation__link"
                                href="/globalSettings"
                                data-topnav="Operator settings"
                            >
                                Operator settings
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
);

const isActivePage = (pages: string[]): boolean => {
    const router = useRouter();
    const currentPath = router.pathname;

    const result = pages.filter((p) => {
        return currentPath.includes(p);
    });

    return result.length > 0;
};

export default Navigation;
