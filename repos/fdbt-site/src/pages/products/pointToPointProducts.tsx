import { ReactElement, useState } from 'react';
import { MyFaresPointToPointProduct, MyFaresService, NextPageContextWithSession } from '../../interfaces/index';
import { BaseLayout } from '../../layout/Layout';
import {
    getServiceByNocAndId,
    getPassengerTypeNameByIdAndNoc,
    getPointToPointProductsByLineId,
    getTimeRestrictionByIdAndNoc,
} from '../../data/auroradb';
import { getProductsMatchingJson } from '../../data/s3';
import { convertDateFormat, getAndValidateNoc, getCsrfToken } from '../../utils';
import dayjs from '../../utils/dayjs';
import isArray from 'lodash/isArray';
import { getProductStatusTag } from './services';
import BackButton from '../../components/BackButton';
import DeleteConfirmationPopup from '../../components/DeleteConfirmationPopup';
import { buildDeleteUrl } from './otherProducts';
import { MyFaresProduct } from '../../interfaces/dbTypes';
import { getSessionAttribute } from '../../utils/sessions';
import { MULTI_MODAL_ATTRIBUTE } from '../../constants/attributes';

const title = 'Point To Point Products - Create Fares Data Service';
const description = 'View and access your point to point products in one place.';

interface PointToPointProductsProps {
    service: MyFaresService;
    products: MyFaresPointToPointProduct[];
    productNeedsAttention: boolean;
    csrfToken: string;
}

const buildCopyUrl = (productId: string, service: MyFaresService, csrfToken: string) => {
    return `/api/copyProduct?id=${productId}&serviceId=${service.id}&_csrf=${csrfToken}`;
};

const PointToPointProducts = ({
    products,
    service,
    productNeedsAttention,
    csrfToken,
}: PointToPointProductsProps): ReactElement => {
    const [popUpState, setPopUpState] = useState<{
        name: string;
        productId: number;
    }>();

    const deleteActionHandler = (productId: number, name: string): void => {
        setPopUpState({
            name,
            productId,
        });
    };

    return (
        <>
            <BaseLayout title={title} description={description}>
                <BackButton href="/products/services" />
                {productNeedsAttention ? (
                    <div className="govuk-warning-text">
                        <span className="govuk-warning-text__icon govuk-!-margin-top-1" aria-hidden="true">
                            !
                        </span>
                        <strong className="govuk-warning-text__text">
                            <span className="govuk-visually-hidden">Warning</span>
                            Your service has been updated in BODS. Stops have been added and/or removed since the
                            creation of your product(s). These products will need updating to reflect these changes.
                        </strong>
                    </div>
                ) : null}
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-l govuk-!-margin-bottom-4" id="service-name">
                            {service.lineName} - {service.origin} to {service.destination}
                        </h1>
                        <h1 className="govuk-heading-s govuk-!-margin-bottom-8" id="service-status">
                            Service status: {getProductStatusTag(false, service.startDate, service.endDate, false)}
                        </h1>
                        <h1 className="govuk-heading-l govuk-!-margin-bottom-4">Products</h1>
                        {PointToPointProductsTable(products, service, deleteActionHandler, csrfToken)}

                        {popUpState && (
                            <DeleteConfirmationPopup
                                entityName={popUpState.name}
                                deleteUrl={buildDeleteUrl(popUpState.productId, csrfToken)}
                                cancelActionHandler={(): void => {
                                    setPopUpState(undefined);
                                }}
                                hintText="When you delete this product it will be removed from the system and will no longer be included in future exports."
                                isOpen={!!popUpState.productId}
                            />
                        )}
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

const PointToPointProductsTable = (
    products: MyFaresPointToPointProduct[],
    service: MyFaresService,
    deleteActionHandler: (productId: number, name: string) => void,
    csrfToken: string,
): ReactElement => {
    return (
        <>
            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Product description
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Time restriction
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Start date
                        </th>
                        <th scope="col" className="govuk-table__header">
                            End date
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Product status
                        </th>
                        <th scope="col" className="govuk-table__header" />
                        <th scope="col" className="govuk-table__header" />
                    </tr>
                </thead>

                <tbody className="govuk-table__body">
                    {products.length > 0
                        ? products.map((product) => (
                              <tr key={product.id} className="govuk-table__row">
                                  <td className="govuk-table__cell dft-table-wrap-anywhere dft-table-fixed-width-cell">
                                      <a
                                          href={`/products/productDetails?productId=${product.id}&serviceId=${service.id}`}
                                          id={`product-${product.id}`}
                                      >
                                          {product.productDescription}
                                      </a>
                                  </td>
                                  <td className="govuk-table__cell dft-table-wrap-anywhere dft-table-fixed-width-cell">
                                      {product.validity}
                                  </td>
                                  <td className="govuk-table__cell">{product.startDate}</td>
                                  <td className="govuk-table__cell">{product.endDate ?? '-'}</td>
                                  <td className="govuk-table__cell">
                                      {getProductStatusTag(false, product.startDate, product.endDate, true)}
                                      {product.requiresAttention ? (
                                          <strong className="govuk-tag govuk-tag--yellow dft-table-tag">
                                              Needs attention
                                          </strong>
                                      ) : null}
                                  </td>
                                  <td className="govuk-table__cell">
                                      <form>
                                          <button
                                              className="govuk-link govuk-body button-link"
                                              formAction={buildCopyUrl(product.id.toString(), service, csrfToken)}
                                              formMethod="post"
                                              type="submit"
                                              id="copy-product-button"
                                          >
                                              Copy
                                          </button>
                                      </form>
                                  </td>
                                  <td className="govuk-table__cell">
                                      <button
                                          className="govuk-link govuk-body button-link"
                                          onClick={() => deleteActionHandler(product.id, product.productDescription)}
                                      >
                                          Delete
                                      </button>
                                  </td>
                              </tr>
                          ))
                        : null}
                </tbody>
            </table>
            {products.length === 0 ? (
                <span className="govuk-body">
                    <i>You currently have no products against this service</i>
                </span>
            ) : null}
        </>
    );
};

export const filterProductsNotToDisplay = (service: MyFaresService, products: MyFaresProduct[]): MyFaresProduct[] => {
    const serviceStartDate = dayjs.utc(service.startDate, 'D/M/YYYY').valueOf();
    const serviceEndDate = service.endDate ? dayjs.utc(service.endDate, 'D/M/YYYY').valueOf() : undefined;
    return products.filter((product) => {
        const productStartDate = dayjs.utc(product.startDate, 'D/M/YYYY').valueOf();
        const productEndDate = product.endDate && dayjs.utc(product.endDate, 'D/M/YYYY').valueOf();
        return (
            (!productEndDate || productEndDate >= serviceStartDate) &&
            (!serviceEndDate || productStartDate <= serviceEndDate)
        );
    });
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: PointToPointProductsProps }> => {
    const noc = getAndValidateNoc(ctx);
    const serviceId = ctx.query?.serviceId;

    if (!serviceId || isArray(serviceId)) {
        throw new Error('Unable to find line name to show products for.');
    }

    const dataSource = getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE) ? 'tnds' : 'bods';
    const service = await getServiceByNocAndId(noc, serviceId, dataSource);
    const products = await getPointToPointProductsByLineId(noc, service.lineId);
    const productsToDisplay = filterProductsNotToDisplay(service, products);

    const formattedProducts: MyFaresPointToPointProduct[] = await Promise.all(
        productsToDisplay.map(async (product) => {
            const matchingJson = await getProductsMatchingJson(product.matchingJsonLink);

            const passengerTypeName = await getPassengerTypeNameByIdAndNoc(matchingJson.passengerType.id, noc);

            const productDescription =
                'products' in matchingJson && 'productName' in matchingJson.products[0]
                    ? matchingJson.products[0].productName
                    : `${passengerTypeName} - ${matchingJson.type} ${
                          'termTime' in matchingJson && matchingJson.termTime ? '(school)' : ''
                      }`;

            let timeRestriction = 'No restrictions';

            if (matchingJson.timeRestriction) {
                const timeRestrictionFromDb = await getTimeRestrictionByIdAndNoc(matchingJson.timeRestriction.id, noc);

                timeRestriction = timeRestrictionFromDb.name;
            }

            const startDate = convertDateFormat(matchingJson.ticketPeriod.startDate);
            const endDate = matchingJson.ticketPeriod.endDate && convertDateFormat(matchingJson.ticketPeriod.endDate);

            return {
                productDescription,
                startDate,
                validity: timeRestriction,
                id: product.id,
                ...(endDate && { endDate }),
                requiresAttention: product.servicesRequiringAttention?.includes(serviceId) ?? false,
            };
        }),
    );

    const productNeedsAttention = formattedProducts.some((product) => product.requiresAttention);

    return {
        props: {
            products: formattedProducts,
            service: { ...service, endDate: service.endDate || '' },
            productNeedsAttention,
            csrfToken: getCsrfToken(ctx),
        },
    };
};

export default PointToPointProducts;
