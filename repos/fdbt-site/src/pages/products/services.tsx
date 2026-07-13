import { ReactElement } from 'react';
import {
    MyFaresService,
    MyFaresServiceWithProductCount,
    NextPageContextWithSession,
    ProductStatus,
} from '../../interfaces/index';
import { BaseLayout } from '../../layout/Layout';
import { getPointToPointProducts, getBodsOrTndsServicesByNoc } from '../../data/auroradb';
import { getAndValidateNoc, removeDuplicateServices } from '../../utils';
import { MyFaresProduct } from '../../interfaces/dbTypes';
import { getSessionAttribute } from '../../utils/sessions';
import { MULTI_MODAL_ATTRIBUTE } from '../../constants/attributes';
import dayjs from '../../utils/dayjs';

const title = 'Services - Create Fares Data Service';
const description = 'View and access your services in one place.';

interface ServicesProps {
    servicesAndProducts: MyFaresServiceWithProductCount[];
}

const Services = ({ servicesAndProducts }: ServicesProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description} showNavigation>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <div className="dft-flex dft-flex-justify-space-between">
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">Services</h1>

                        <a href="/fareType" className="govuk-button" data-module="govuk-button">
                            Create new product
                        </a>
                    </div>
                    {ServicesTable(servicesAndProducts)}
                </div>
            </div>
        </BaseLayout>
    );
};

const ServicesTable = (services: MyFaresServiceWithProductCount[]): ReactElement => {
    return (
        <table className="govuk-table">
            <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">
                        Service description
                    </th>
                    <th scope="col" className="govuk-table__header dft-text-align-centre">
                        Active products
                    </th>
                    <th scope="col" className="govuk-table__header dft-text-align-centre">
                        Start
                        <br /> date
                    </th>
                    <th scope="col" className="govuk-table__header dft-text-align-centre">
                        End <br />
                        date
                    </th>
                    <th scope="col" className="govuk-table__header dft-text-align-centre">
                        Service status
                    </th>
                </tr>
            </thead>

            <tbody className="govuk-table__body">
                {services.map((service) => (
                    <tr key={service.id} className="govuk-table__row">
                        <td className="govuk-table__cell">
                            <a
                                href={`/products/pointToPointProducts?serviceId=${service.id}`}
                                id={`service-link-${service.id}`}
                            >
                                {service.lineName} - {service.origin} to {service.destination}
                            </a>
                        </td>
                        <td id={`active-products-${service.id}`} className="govuk-table__cell dft-text-align-centre">
                            {service.products}
                        </td>
                        <td className="govuk-table__cell dft-text-align-centre">{service.startDate}</td>
                        <td className="govuk-table__cell dft-text-align-centre">{service.endDate || '-'}</td>
                        <td className="govuk-table__cell dft-text-align-centre">
                            {getProductStatusTag(false, service.startDate, service.endDate, true)}
                            {service.requiresAttention === true ? (
                                <strong className="govuk-tag govuk-tag--yellow dft-table-tag">Needs attention</strong>
                            ) : null}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export const getProductStatus = (
    incomplete: boolean,
    startDate: string,
    endDate: string | undefined,
): ProductStatus => {
    if (incomplete) {
        return 'incomplete';
    }

    const today = dayjs.utc().startOf('day').valueOf();
    const startDateAsUnixTime = dayjs.utc(startDate, 'D/M/YYYY').valueOf();
    const endDateAsUnixTime = endDate ? dayjs.utc(endDate, 'D/M/YYYY').valueOf() : undefined;

    if (startDateAsUnixTime <= today && (!endDateAsUnixTime || endDateAsUnixTime >= today)) {
        return 'active';
    } else if (startDateAsUnixTime > today) {
        return 'pending';
    }

    return 'expired';
};

export const getProductStatusTag = (
    incomplete: boolean,
    startDate: string,
    endDate: string | undefined,
    isWithinATable: boolean,
): ReactElement => {
    const status = getProductStatus(incomplete, startDate, endDate);
    const isWithinATableClass = isWithinATable ? ' dft-table-tag' : '';

    return status === 'active' ? (
        <strong className={`govuk-tag govuk-tag--turquoise${isWithinATableClass}`}>Active</strong>
    ) : status === 'pending' ? (
        <strong className={`govuk-tag govuk-tag--blue${isWithinATableClass}`}>Pending</strong>
    ) : status === 'expired' ? (
        <strong className={`govuk-tag govuk-tag--red${isWithinATableClass}`}>Expired</strong>
    ) : status === 'incomplete' ? (
        <strong className={`govuk-tag govuk-tag--yellow${isWithinATableClass}`}>Incomplete</strong>
    ) : (
        <strong className={`govuk-tag govuk-tag--grey${isWithinATableClass}`}>Unknown</strong>
    );
};

export const showProductAgainstService = (
    // 2021-09-15T23:00:00.000Z format
    productStartDate: string,
    // 2021-09-15T23:00:00.000Z format
    productEndDate: string | undefined,
    // 05/04/2020 format
    serviceStartDate: string,
    // 05/04/2020 format
    serviceEndDate: string | undefined,
): boolean => {
    const momentProductStartDate = dayjs(productStartDate).valueOf();
    const momentProductEndDate = productEndDate && dayjs(productEndDate).valueOf();
    const momentServiceStartDate = dayjs(serviceStartDate, 'D/M/YYYY').valueOf();
    const momentServiceEndDate = serviceEndDate ? dayjs(serviceEndDate, 'D/M/YYYY').valueOf() : undefined;

    // returns TRUE if:
    // there is no product end date OR there is a product end date and it is after the service start date
    //          AND
    // there is no service end date OR there is a service end date and it is after the product start date
    return (
        (!momentProductEndDate || momentProductEndDate >= momentServiceStartDate) &&
        (!momentServiceEndDate || momentServiceEndDate >= momentProductStartDate)
    );
};

export const matchProductsToServices = (
    services: MyFaresService[],
    products: MyFaresProduct[],
): MyFaresServiceWithProductCount[] => {
    const productsByLine = products.reduce((map, product) => {
        const serviceByLine = map.get(product.lineId) ?? [];
        serviceByLine.push(product);
        map.set(product.lineId, serviceByLine);
        return map;
    }, new Map<string, MyFaresProduct[]>());

    return services.map((service) => {
        const filteredProducts = productsByLine
            .get(service.lineId)
            ?.filter((product) =>
                showProductAgainstService(product.startDate, product.endDate, service.startDate, service.endDate),
            );

        return {
            ...service,
            endDate: service.endDate || '',
            products: filteredProducts === undefined ? 0 : filteredProducts.length,
            requiresAttention:
                filteredProducts === undefined
                    ? false
                    : filteredProducts.some((product) =>
                          product.servicesRequiringAttention?.some((serviceId) => serviceId === service.id.toString()),
                      ),
        };
    });
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: ServicesProps }> => {
    const noc = getAndValidateNoc(ctx);
    const dataSource = getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE) ? 'tnds' : 'bods';
    const services: MyFaresService[] = await getBodsOrTndsServicesByNoc(noc, dataSource);
    const servicesWithNoDuplicates = removeDuplicateServices<MyFaresService>(services);

    const products = await getPointToPointProducts(noc);
    const servicesAndProducts = matchProductsToServices(servicesWithNoDuplicates, products);

    return { props: { servicesAndProducts } };
};

export default Services;
