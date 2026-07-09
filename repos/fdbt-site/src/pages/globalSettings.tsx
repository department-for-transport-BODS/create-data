import { ReactElement } from 'react';
import SettingOverview from '../components/SettingOverview';
import {
    getGroupPassengerTypesFromGlobalSettings,
    getPassengerTypesByNocCode,
    getSalesOfferPackagesByNocCode,
    getTimeRestrictionByNocCode,
    getFareDayEnd,
    getOperatorDetails,
    getOperatorGroupsByNoc,
    getCaps,
} from '../data/auroradb';
import { GlobalSettingsCounts, NextPageContextWithSession } from '../interfaces';
import { BaseLayout } from '../layout/Layout';
import SubNavigation from '../layout/SubNavigation';
import { getAndValidateNoc } from '../utils';
import { extractGlobalSettingsReferer } from '../utils/globalSettings';

const title = 'Operator Settings - Create Fares Data Service';
const description = 'View and access your settings in one place.';

interface GlobalSettingsProps {
    globalSettingsCounts: GlobalSettingsCounts;
    referer: string | null;
}

const GlobalSettings = ({ globalSettingsCounts, referer }: GlobalSettingsProps): ReactElement => {
    return (
        <>
            <BaseLayout title={title} description={description} showNavigation referer={referer}>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-quarter">
                        <SubNavigation />
                    </div>

                    <div className="govuk-grid-column-three-quarters">
                        <h1 className="govuk-heading-xl">Settings overview</h1>
                        <p className="govuk-body-m">
                            Operators may customise the following definitions relevant to their fares or choose to use
                            default settings.
                        </p>
                        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                        <SettingOverview
                            href="/viewPassengerTypes"
                            name="Passenger types"
                            description="Define age range and required proof documents of your passengers as well as passenger groups."
                            count={globalSettingsCounts.passengerTypesCount}
                        />
                        <SettingOverview
                            href="/viewPurchaseMethods"
                            name="Purchase methods"
                            description="Define the way your tickets are sold, including where they are bought, the payment method and format."
                            count={globalSettingsCounts.purchaseMethodsCount}
                        />
                        <SettingOverview
                            href="/viewTimeRestrictions"
                            name="Time restrictions"
                            description="Define certain days and time periods that your tickets can be used within."
                            count={globalSettingsCounts.timeRestrictionsCount}
                        />
                        <SettingOverview
                            href="/manageFareDayEnd"
                            name="Fare day end"
                            description="If your fare day extends past midnight, define its end time."
                            count={globalSettingsCounts.fareDayEndSet}
                        />

                        <SettingOverview
                            href="/viewOperatorGroups"
                            name="Operator groups"
                            description="Define your operator groups - these will be used in multi operator tickets."
                            count={globalSettingsCounts.operatorGroupsCount}
                        />

                        <SettingOverview
                            href="/manageOperatorDetails"
                            name="Operator details"
                            description="Define your operator contact details - these will be included in your fares data and therefore may be presented to passengers."
                            count={globalSettingsCounts.operatorDetailsSet}
                        />
                        <SettingOverview
                            href="/viewCaps"
                            name="Caps"
                            description="Define your different types of caps and when they expire."
                            count={globalSettingsCounts.capCount}
                        />
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: GlobalSettingsProps }> => {
    const noc = getAndValidateNoc(ctx);

    if (!noc) {
        throw new Error('No NOC found for user.');
    }

    const referer = extractGlobalSettingsReferer(ctx);

    const savedCaps = await getCaps(noc);
    const savedPassengerTypes = await getPassengerTypesByNocCode(noc, 'single');
    const savedGroupPassengerTypes = await getGroupPassengerTypesFromGlobalSettings(noc);
    const savedTimeRestrictions = await getTimeRestrictionByNocCode(noc);
    const purchaseMethodsCount = await getSalesOfferPackagesByNocCode(noc);
    const fareDayEnd = await getFareDayEnd(noc);
    const operatorDetails = await getOperatorDetails(noc);
    const operatorGroups = await getOperatorGroupsByNoc(noc);

    const globalSettingsCounts: GlobalSettingsCounts = {
        capCount: savedCaps.length,
        passengerTypesCount: savedPassengerTypes.length + savedGroupPassengerTypes.length,
        timeRestrictionsCount: savedTimeRestrictions.length,
        purchaseMethodsCount: purchaseMethodsCount.length,
        fareDayEndSet: !!fareDayEnd,
        operatorDetailsSet: !!operatorDetails,
        operatorGroupsCount: operatorGroups.length,
    };

    return { props: { globalSettingsCounts, referer } };
};

export default GlobalSettings;
