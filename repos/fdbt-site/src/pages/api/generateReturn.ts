import { NextApiResponse } from 'next';
import dayjs from '../../utils/dayjs';
import { getProductIdByMatchingJsonLink, getServiceByIdAndDataSource } from '../../data/auroradb';
import { NextApiRequestWithSession } from '../../interfaces';
import { TicketWithIds, WithIds, SingleTicket, ReturnTicket } from '../../interfaces/matchingJsonTypes';
import { isPointToPointTicket } from '../../interfaces/typeGuards';
import { getAndValidateNoc, redirectTo, redirectToError } from '../../utils/apiUtils';
import {
    collectInfoForMatchingTickets,
    insertDataToProductsBucketAndProductsTable,
} from '../../utils/apiUtils/userData';
import { buildUuid } from '../fareType';

export const findTicketsToMakeReturn = (
    passengerTypeId: number,
    directionToFind: 'inbound' | 'outbound',
    tickets: TicketWithIds[],
    originalTicket: TicketWithIds,
): WithIds<SingleTicket>[] => {
    const chosenTickets = [originalTicket as WithIds<SingleTicket>];
    let found = false;
    tickets.forEach((ticket) => {
        if (!found) {
            let expired = false;

            if (ticket.ticketPeriod.endDate) {
                const today = dayjs.utc().startOf('day').valueOf();
                const endDateAsUnixTime = dayjs.utc(ticket.ticketPeriod.endDate, 'DD/MM/YYYY').valueOf();
                if (endDateAsUnixTime < today) {
                    expired = true;
                }
            }

            if (!expired) {
                if (isPointToPointTicket(ticket) && ticket.type === 'single') {
                    if ('journeyDirection' in ticket && ticket.passengerType.id === passengerTypeId) {
                        if (ticket.journeyDirection === directionToFind) {
                            chosenTickets.push(ticket);
                            found = true;
                        }
                    }
                }
            }
        }
    });

    if (chosenTickets.length === 2) {
        return chosenTickets;
    }

    return [];
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { lineId, productId, serviceId, passengerTypeId } = req.query;

        if (
            typeof lineId !== 'string' ||
            typeof productId !== 'string' ||
            typeof serviceId !== 'string' ||
            typeof passengerTypeId !== 'string'
        ) {
            throw new Error('Generate return API called with incorrect parameters.');
        }
        const noc = getAndValidateNoc(req, res);

        const service = await getServiceByIdAndDataSource(noc, Number(serviceId), 'bods');
        const directions = Array.from(
            service.journeyPatterns.reduce((set, pattern) => {
                set.add(pattern.direction);
                return set;
            }, new Set<string>()),
        );

        const outboundDirection = directions.find((it) => ['outbound', 'clockwise'].includes(it));
        const inboundDirection = directions.find((it) => ['inbound', 'antiClockwise'].includes(it));

        if (!outboundDirection || !inboundDirection) {
            redirectTo(
                res,
                `/products/productDetails?productId=${productId}&serviceId=${serviceId}&generateReturn=false`,
            );
            return;
        }

        const { directionToFind, tickets, originalTicket } = await collectInfoForMatchingTickets(
            noc,
            lineId,
            outboundDirection,
            productId,
        );
        const result = findTicketsToMakeReturn(Number(passengerTypeId), directionToFind, tickets, originalTicket);

        if (result.length !== 2) {
            redirectTo(
                res,
                `/products/productDetails?productId=${productId}&serviceId=${serviceId}&generateReturn=false`,
            );
            return;
        } else {
            // create return
            const outboundTicket = result.find(
                (ticket) => ticket.journeyDirection === outboundDirection,
            ) as WithIds<SingleTicket>;
            const inboundTicket = result.find(
                (ticket) => ticket.journeyDirection === inboundDirection,
            ) as WithIds<SingleTicket>;

            const uuid = buildUuid(noc);
            const returnTicket: WithIds<ReturnTicket> = {
                type: 'return',
                passengerType: outboundTicket.passengerType,
                lineName: outboundTicket.lineName,
                lineId: outboundTicket.lineId,
                nocCode: outboundTicket.nocCode,
                operatorName: outboundTicket.operatorName,
                serviceDescription: outboundTicket.serviceDescription,
                email: outboundTicket.email,
                uuid,
                timeRestriction: outboundTicket.timeRestriction,
                ticketPeriod: outboundTicket.ticketPeriod,
                products: outboundTicket.products,
                inboundFareZones: inboundTicket.fareZones,
                outboundFareZones: outboundTicket.fareZones,
                returnPeriodValidity: {
                    amount: '1',
                    typeOfDuration: 'day',
                },
                unassignedStops: {
                    inboundUnassignedStops: [],
                    outboundUnassignedStops: [],
                },
            };

            const newJsonLink = await insertDataToProductsBucketAndProductsTable(returnTicket, noc, uuid, {
                req,
                res,
            });

            const newProductId = await getProductIdByMatchingJsonLink(noc, newJsonLink);

            redirectTo(res, `/products/productDetails?productId=${newProductId}&serviceId=${serviceId}`);
            return;
        }
    } catch (error) {
        const message = 'There was a problem generating a return.';
        redirectToError(res, message, 'api.generateReturn', error);
    }
};
