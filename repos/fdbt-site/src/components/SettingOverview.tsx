import { ReactElement } from 'react';
import { SettingsOverview } from '../interfaces';

const SettingOverview = ({ href, name, description, count }: SettingsOverview): ReactElement => {
    return (
        <>
            <a href={href} className="setting-record">
                <p className="govuk-body-s govuk-!-font-weight-bold">
                    {name}
                    {typeof count === 'number' && <b className="numberCircle">{count}</b>}
                    {!count ? null : <strong className="govuk-tag customised-tag">Customised</strong>}
                </p>
                <p className="govuk-body-s">{description}</p>
            </a>
            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
        </>
    );
};

export default SettingOverview;
