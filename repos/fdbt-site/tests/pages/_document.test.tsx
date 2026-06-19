/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DocumentProps } from 'next/dist/pages/_document';
import MyDocument from '../../src/pages/_document';

describe('_document', () => {
    const props: DocumentProps = {
        assetQueryString: '',
        cssAssetQueryString: '',
        deploymentId: undefined,
        dynamicCssManifest: new Set<string>(),
        mutableAssetQueryString: '',
        html: '',
        __NEXT_DATA__: {
            props: {},
            page: '',
            query: {
                '': '',
            },
            buildId: '',
        },
        dangerousAsPath: '',
        isDevelopment: false,
        dynamicImports: [],
        headTags: [{}],
        buildManifest: {
            rootMainFilesTree: {},
            devFiles: [''],
            lowPriorityFiles: [''],
            rootMainFiles: [''],
            pages: {
                '/_app': [''],
            },
            polyfillFiles: [''],
        },
        docComponentsRendered: {},
        scriptLoader: {},
    };

    it('should render correctly', () => {
        const document = React.createElement(MyDocument, {
            ...props,
            nonce: '',
            isAuthed: true,
            csrfToken: '',
            url: '',
            showCookieBanner: true,
            allowTracking: true,
            multiOperator: false,
            noc: 'HELLO',
        });
        const tree = shallow(document);

        expect(tree).toMatchSnapshot();
    });

    it('should not show the cookie banner when the showCookieBanner attribute is false', () => {
        const document = React.createElement(MyDocument, {
            ...props,
            nonce: '',
            isAuthed: true,
            csrfToken: '',
            url: '',
            showCookieBanner: false,
            allowTracking: true,
            multiOperator: true,
            noc: undefined,
        });
        const tree = shallow(document);

        expect(tree).toMatchSnapshot();
    });
});
