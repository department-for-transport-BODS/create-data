// Test-only helper: reproduces the "id/ref space→underscore" plus whitespace/empty-element
// normalisation that libxslt used to apply, so generated NeTEx can be compared to fixtures
// without depending on native XSLT.
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
    parseAttributeValue: false,
    parseTagValue: false,
});

const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '    ',
});

type FxpNode = Record<string, unknown>;

const underscoreIdAndRefAttrs = (xml: string): string =>
    xml.replace(/(\s(?:id|ref))="([^"]*)"/g, (_match, attr, value) => `${attr}="${value.replace(/ /g, '_')}"`);

const pruneEmptyElements = (nodes: FxpNode[]): FxpNode[] => {
    const out: FxpNode[] = [];
    for (const node of nodes) {
        const tagKeys = Object.keys(node).filter(k => k !== ':@');
        if (tagKeys.length !== 1) {
            out.push(node);
            continue;
        }
        const tag = tagKeys[0];
        if (tag === '#text') {
            const text = node['#text'];
            if (typeof text === 'string' && text.trim() === '') continue;
            out.push(node);
            continue;
        }
        const attrs = node[':@'] as Record<string, unknown> | undefined;
        const children = node[tag];
        const prunedChildren = Array.isArray(children) ? pruneEmptyElements(children as FxpNode[]) : children;
        const hasAttrs = !!attrs && Object.keys(attrs).length > 0;
        const hasChildren = Array.isArray(prunedChildren) && prunedChildren.length > 0;
        if (!hasAttrs && !hasChildren) continue;
        if (attrs) {
            const sorted: Record<string, unknown> = {};
            for (const key of Object.keys(attrs).sort()) sorted[key] = attrs[key];
            node[':@'] = sorted;
        }
        (node as Record<string, unknown>)[tag] = prunedChildren;
        out.push(node);
    }
    return out;
};

export const normaliseNetex = (xml: string): string => {
    const underscored = underscoreIdAndRefAttrs(xml);
    const tree = parser.parse(underscored) as FxpNode[];
    const pruned = pruneEmptyElements(tree);
    return builder.build(pruned);
};
