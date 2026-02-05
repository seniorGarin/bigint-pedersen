export type PedersenParameters = {
    g: bigint;
    h: bigint;
    p: bigint;
};
declare function modExp(base: bigint, exponent: bigint, mod: bigint): bigint;
declare function isPrimeMillerRabin(n: bigint, k?: number): boolean;
declare function randomBlinding(bytes?: number): bigint;
declare function generator(bits?: number): Promise<PedersenParameters>;
declare function modInverse(a: bigint, p: bigint): bigint;
declare function commitment(m: bigint, r: bigint, params: PedersenParameters): bigint;
declare function sum(C1: bigint, C2: bigint, params: PedersenParameters): bigint;
declare function sub(C1: bigint, C2: bigint, params: PedersenParameters): bigint;
declare function multiply(C: bigint, scalar: bigint, params: PedersenParameters): bigint;
declare const pedersen: {
    DEFAULT_GENERATOR: {
        p: bigint;
        g: bigint;
        h: bigint;
    };
    modExp: typeof modExp;
    modInverse: typeof modInverse;
    randomBlinding: typeof randomBlinding;
    isPrimeMillerRabin: typeof isPrimeMillerRabin;
    generator: typeof generator;
    commitment: typeof commitment;
    sum: typeof sum;
    sub: typeof sub;
    multiply: typeof multiply;
};
export default pedersen;
