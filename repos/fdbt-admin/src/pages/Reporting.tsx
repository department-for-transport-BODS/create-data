import { ReactElement, useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { H1, H3 } from '@govuk-react/heading';
import BarChart from 'react-easy-bar-chart';
import Table from '@govuk-react/table';
import Details from '@govuk-react/details';
import LoadingBox from '@govuk-react/loading-box';
import { BrowserRouter, Redirect } from 'react-router-dom';
import { ObjectList } from 'aws-sdk/clients/s3';
import { UsersListType } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { getCognitoClientAndUserPool } from '../utils/cognito';
import { listUsersInPool } from '../data/cognito';
import getS3Client from '../utils/s3';
import { getBucketName, listBucketObjects } from '../data/s3';
import { NETEX_DATA_BUCKET_PREFIX, PRODUCTS_DATA_BUCKET_PREFIX } from '../constants';
import {
    createGraphData,
    formatGraphDataForCsv,
    getProductCount,
    GraphData,
    mapIntoArrayOfArrays,
    netexFilesGenerated,
    productsCreated,
    typesOfProductsCreated,
} from '../utils/helpers';

interface ReportingProps {
    isFullAdmin: boolean;
}

const Reporting = ({ isFullAdmin }: ReportingProps): ReactElement => {
    const [loaded, setLoaded] = useState<boolean>(false);
    const [users, setUsers] = useState<UsersListType>([]);
    const [registeredNocs, setRegisteredNocs] = useState<string[]>([]);
    const [nocsWhoCreatedProducts, setNocsWhoCreatedProducts] = useState<string[]>([]);
    const [thirtyDayNetex, setThirtyDayNetex] = useState<string[]>([]);
    const [yearNetex, setYearNetex] = useState<string[]>([]);
    const [graphData, setGraphData] = useState<GraphData[]>([]);

    const getUsers = async (): Promise<UsersListType> => {
        const { client, userPoolId } = await getCognitoClientAndUserPool();

        return listUsersInPool(client, userPoolId);
    };

    const getExportsFromMatchingDataBucket = async (): Promise<ObjectList> => {
        const { client } = await getS3Client();
        const bucketName = getBucketName(NETEX_DATA_BUCKET_PREFIX);
        return listBucketObjects(client, bucketName);
    };

    const getProductsFromProductsDataBucket = async (): Promise<ObjectList> => {
        const { client } = await getS3Client();
        const bucketName = getBucketName(PRODUCTS_DATA_BUCKET_PREFIX);
        return listBucketObjects(client, bucketName);
    };

    useEffect(() => {
        getUsers()
            .then((data) => {

                const supportEmailDomains = (import.meta.env.VITE_SUPPORT_USER_EMAIL_DOMAINS || '')
                    .split(',')
                    .map((domain) => domain.trim().toLowerCase())
                    .filter(Boolean);

                const filteredData = data.filter((user) => {
                    const email = user.Attributes?.find((attribute) => attribute.Name === 'email')?.Value as string;
                    const hasTestNoc =
                        (user.Attributes?.find((attribute) => attribute.Name === 'custom:noc')?.Value as string) ===
                        'IWBusCo';
                    const emailToLower = email.toLowerCase();
                    const accountConfirmed = user?.UserStatus === 'CONFIRMED';
                    
                    const isSupportUser = supportEmailDomains.some((domain) => emailToLower.includes(domain));

                    if (
                        !isSupportUser &&
                        !emailToLower.includes('dft.gov.uk') &&
                        !hasTestNoc &&
                        accountConfirmed
                    ) {
                        return user;
                    }

                    return false;
                });

                setUsers(filteredData);

                const nocs: string[] = [];

                filteredData.forEach((user) => {
                    const nocString = user.Attributes?.find((attribute) => attribute.Name === 'custom:noc')
                        ?.Value as string;
                    const usersNocs = [];
                    if (nocString.includes('|')) {
                        const splitNocs = nocString.split('|');
                        splitNocs.forEach((noc) => {
                            usersNocs.push(noc);
                        });
                    } else {
                        usersNocs.push(nocString);
                    }

                    usersNocs.forEach((noc) => {
                        if (!nocs.includes(noc)) {
                            nocs.push(noc);
                        }
                    });
                });

                const sortedNocs = nocs.sort();

                setRegisteredNocs(sortedNocs);

                getExportsFromMatchingDataBucket()
                    .then((netexData) => {
                        setThirtyDayNetex(netexFilesGenerated(sortedNocs, netexData, 30));
                        setYearNetex(netexFilesGenerated(sortedNocs, netexData, 365));
                    })
                    .catch((err) => {
                        console.error(err);
                    });

                getProductsFromProductsDataBucket()
                    .then((products) => {
                        setNocsWhoCreatedProducts(productsCreated(sortedNocs, products));
                        const types = typesOfProductsCreated(products);
                        setGraphData(createGraphData(types));
                        setLoaded(true);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            })
            .catch((err) => {
                console.error(err);
                setUsers([]);
            });
    }, []);

    return isFullAdmin ? (
        <>
            <LoadingBox loading={!loaded}>
                <H1>Reporting</H1>
                <Table>
                    <Table.Row key="users">
                        <Table.Cell>Registered users, discounting any privileged accounts</Table.Cell>
                        <Table.Cell>{users.length}</Table.Cell>
                    </Table.Row>
                    <Table.Row key="nocs">
                        <Table.Cell>
                            <Details summary="Registered NOCs">
                                {registeredNocs.length > 0 && (
                                    <>
                                        <CSVLink
                                            filename="registeredNocs.csv"
                                            data={mapIntoArrayOfArrays(registeredNocs)}
                                        >
                                            Download as csv
                                        </CSVLink>
                                        <br />
                                    </>
                                )}
                                {registeredNocs.join(', ')}
                            </Details>
                        </Table.Cell>
                        <Table.Cell>{registeredNocs.length}</Table.Cell>
                    </Table.Row>
                    <Table.Row key="nocs-who-made-products">
                        <Table.Cell>
                            <Details summary="NOCs who have created products">
                                {registeredNocs.length > 0 && (
                                    <>
                                        <CSVLink
                                            filename="nocsWhoMadeProducts.csv"
                                            data={mapIntoArrayOfArrays(nocsWhoCreatedProducts)}
                                        >
                                            Download as csv
                                        </CSVLink>
                                        <br />
                                    </>
                                )}
                                {nocsWhoCreatedProducts.join(', ')}
                            </Details>
                        </Table.Cell>
                        <Table.Cell>{nocsWhoCreatedProducts.length}</Table.Cell>
                    </Table.Row>
                    <Table.Row key="30-day-netex">
                        <Table.Cell>
                            <Details summary="NOCs who have generated NeTEx in the last 30 days">
                                {thirtyDayNetex.length > 0 && (
                                    <>
                                        <CSVLink
                                            filename="thirtyDayNetexNocs.csv"
                                            data={mapIntoArrayOfArrays(thirtyDayNetex)}
                                        >
                                            Download as csv
                                        </CSVLink>
                                        <br />
                                    </>
                                )}
                                {thirtyDayNetex.join(', ')}
                            </Details>
                        </Table.Cell>
                        <Table.Cell>{thirtyDayNetex.length}</Table.Cell>
                    </Table.Row>
                    <Table.Row key="year-netex">
                        <Table.Cell>
                            <Details summary="NOCs who have generated NeTEx in the last year">
                                {yearNetex.length > 0 && (
                                    <>
                                        <CSVLink filename="yearNetexNocs.csv" data={mapIntoArrayOfArrays(yearNetex)}>
                                            Download as csv
                                        </CSVLink>
                                        <br />
                                    </>
                                )}

                                {yearNetex.join(', ')}
                            </Details>
                        </Table.Cell>
                        <Table.Cell>{yearNetex.length}</Table.Cell>
                    </Table.Row>
                </Table>
                {loaded && graphData.length > 0 && (
                    <>
                        <H3>Created products (not necessarily exported) </H3>
                        <BarChart
                            xAxis="Hover over bars to see fare type and count"
                            yAxis={`${getProductCount(graphData)} total products`}
                            height={400}
                            width={800}
                            data={graphData}
                        />
                        <br />
                        <CSVLink filename="createdProducts.csv" data={formatGraphDataForCsv(graphData)}>
                            Download as csv
                        </CSVLink>
                    </>
                )}
            </LoadingBox>
        </>
    ) : (
        <BrowserRouter>
            <Redirect to="/listUsers" />
        </BrowserRouter>
    );
};

export default Reporting;
