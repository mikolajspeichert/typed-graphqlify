export declare enum GraphQLType {
    SCALAR = 0,
    INLINE_FRAGMENT = 1,
    FRAGMENT = 2
}
export declare const typeSymbol: unique symbol;
export declare const paramsSymbol: unique symbol;
export interface Params {
    [key: string]: string | boolean | number | Params;
}
export interface GraphQLInlineFragment {
    [typeSymbol]: GraphQLType.INLINE_FRAGMENT;
    typeName: string;
    internal: Record<string, unknown>;
}
export interface GraphQLFragment {
    [typeSymbol]: GraphQLType.FRAGMENT;
    name: string;
    typeName: string;
    internal: Record<string, unknown>;
}
export interface GraphQLScalar {
    [typeSymbol]: GraphQLType.SCALAR;
    [paramsSymbol]?: Params;
}
export declare function render(value: Record<string, unknown>): string;
