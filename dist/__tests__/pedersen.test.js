"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pedersen_1 = __importDefault(require("../pedersen"));
describe('isPrimeMillerRabin', () => {
    // Test case to ensure the primality test correctly identifies a small prime
    test('returns true for safe prime 11', () => {
        const p = 11n;
        expect(pedersen_1.default.isPrimeMillerRabin(p)).toBeTruthy();
    });
    // Test case for another small known prime number
    test('returns true for safe prime 23', () => {
        const p = 23n;
        expect(pedersen_1.default.isPrimeMillerRabin(p)).toBeTruthy();
    });
    // Test to confirm functionality with an additional small prime
    test('returns true for safe prime 47', () => {
        const p = 47n;
        expect(pedersen_1.default.isPrimeMillerRabin(p)).toBeTruthy();
    });
    // Test with a larger prime to verify the test's scalability
    test('returns true for safe prime 999983', () => {
        const p = 999983n;
        expect(pedersen_1.default.isPrimeMillerRabin(p)).toBeTruthy();
    });
    // Verifies non-prime detection with a composite number
    test('returns false for non-safe prime 15', () => {
        const p = 15n; // 15 is not a prime number
        expect(pedersen_1.default.isPrimeMillerRabin(p)).toBeFalsy();
    });
    // Another test to ensure proper identification of non-prime numbers
    test('returns false for non-prime 20', () => {
        const p = 20n;
        expect(pedersen_1.default.isPrimeMillerRabin(p)).toBeFalsy();
    });
    // Test to detect wrong categorization of a composite number
    test('returns false for non-safe prime 24', () => {
        const p = 24n; // 24 is not a prime number
        expect(pedersen_1.default.isPrimeMillerRabin(p)).toBeFalsy();
    });
});
describe('pedersen', () => {
    // Test to check commitment calculation with small parameter values
    test('generate pedersen commitment small values', () => {
        const smallParams = {
            p: 101n,
            g: 2n,
            h: 5n,
        };
        const m1 = 10n;
        const r1 = 7n;
        const C = pedersen_1.default.commitment(m1, r1, smallParams);
        expect(C).toEqual(21n);
    });
    // Test to confirm Pedersen parameter generation and validity checks
    test('should generate valid Pedersen parameters', async () => {
        const { g, h, p } = await pedersen_1.default.generator(32);
        // Ensure parameters are of the correct type
        expect(typeof g).toBe('bigint');
        expect(typeof h).toBe('bigint');
        expect(typeof p).toBe('bigint');
        // Ensure generated parameters have the correct properties
        expect(g).not.toBe(h);
        // Validation of g as a generator
        const orderCondition = pedersen_1.default.modExp(g, (p - 1n) / 2n, p);
        expect(orderCondition).not.toBe(1n);
        // Confirm the primality of the generated value p
        expect(pedersen_1.default.isPrimeMillerRabin(p)).toBeTruthy();
    });
    // Test to verify 'h' is distinct from 'g' and '1' in generated parameters.
    test('should properly select h distinct from g and 1', async () => {
        for (let i = 0; i < 5; i++) { // Repeated tests for reliability
            const { g, h } = await pedersen_1.default.generator(32);
            // Check distinction of h from g and 1
            expect(h).not.toEqual(g);
            expect(h).not.toEqual(1n);
        }
    });
    // Test to validate homomorphic properties in commitment summation 
    test('homomorphic sum property', () => {
        const params = pedersen_1.default.DEFAULT_GENERATOR;
        const m1 = 10n;
        const r1 = pedersen_1.default.randomBlinding();
        const C1 = pedersen_1.default.commitment(m1, r1, params);
        const m2 = 4n;
        const r2 = pedersen_1.default.randomBlinding();
        const C2 = pedersen_1.default.commitment(m2, r2, params);
        const Csum = pedersen_1.default.sum(C1, C2, params);
        // Calculate resulting message and randomness
        const m3 = 4n + 10n;
        const r3 = (r1 + r2) % params.p;
        const C3 = pedersen_1.default.commitment(m3, r3, params);
        // Ensure commitments and their sums behave as expected
        expect(C1).not.toEqual(C2);
        expect(C1).not.toEqual(C3);
        expect(C2).not.toEqual(C3);
        expect(Csum).toEqual(C3);
    });
    // Test to validate homomorphic properties in commitment subtraction
    test('homomorphic subtraction property', () => {
        const params = pedersen_1.default.DEFAULT_GENERATOR;
        const m1 = 50n;
        const r1 = pedersen_1.default.randomBlinding();
        const C1 = pedersen_1.default.commitment(m1, r1, params);
        const m2 = 10n;
        const r2 = r1 / 3n; // Prevent r from being less than zero
        const C2 = pedersen_1.default.commitment(m2, r2, params);
        const Csub = pedersen_1.default.sub(C1, C2, params);
        // Calculate resulting message and randomness after subtraction
        const m3 = 50n - 10n;
        const r3 = r1 - r2;
        const C3 = pedersen_1.default.commitment(m3, r3, params);
        // Validate the correctness of subtraction
        expect(C1).not.toEqual(C2);
        expect(C1).not.toEqual(C3);
        expect(C2).not.toEqual(C3);
        expect(Csub).toEqual(C3);
    });
    // Test to validate homomorphic properties in commitment multiplication 
    test('homomorphic multiply property', () => {
        const params = pedersen_1.default.DEFAULT_GENERATOR;
        const m1 = 33n;
        const r1 = pedersen_1.default.randomBlinding();
        const C1 = pedersen_1.default.commitment(m1, r1, params);
        const scalar = 7n;
        const Cmul = pedersen_1.default.multiply(C1, scalar, params);
        // Calculate resulting message and randomness after multiplication
        const m2 = 33n * scalar;
        const r2 = (r1 * scalar) % params.p;
        const C2 = pedersen_1.default.commitment(m2, r2, params);
        // Validate the correctness of multiplication
        expect(C1).not.toEqual(C2);
        expect(Cmul).toEqual(C2);
    });
    test('should compute correct modular inverse for various cases', () => {
        // 3 * 4 = 12 ≡ 1 mod 11
        expect(pedersen_1.default.modInverse(3n, 11n)).toBe(4n);
        expect((3n * 4n) % 11n).toBe(1n);
        const p = 1000003n;
        const a = 123456n;
        const inv = pedersen_1.default.modInverse(a, p);
        expect((a * inv) % p).toBe(1n);
        // (p-1)^2 ≡ 1 mod p
        expect(pedersen_1.default.modInverse(p - 1n, p)).toBe(p - 1n);
        expect(((p - 1n) * (p - 1n)) % p).toBe(1n);
        expect(pedersen_1.default.modInverse(1n, 7n)).toBe(1n);
        expect((1n * 1n) % 7n).toBe(1n);
        const a2 = 42n;
        const p2 = 101n;
        const inv1 = pedersen_1.default.modInverse(a2, p2);
        const inv2 = pedersen_1.default.modInverse(inv1, p2);
        expect(inv2).toBe(a2 % p2);
        expect(() => pedersen_1.default.modInverse(2n, 4n)).toThrow();
        expect(() => pedersen_1.default.modInverse(0n, 7n)).toThrow();
    });
});
