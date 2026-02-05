import pedersen from '../pedersen'

describe('isPrimeMillerRabin', () => {

    // Test case to ensure the primality test correctly identifies a small prime
    test('returns true for safe prime 11', () => {
        const p = 11n;
        expect(pedersen.isPrimeMillerRabin(p)).toBeTruthy();
    });

    // Test case for another small known prime number
    test('returns true for safe prime 23', () => {
        const p = 23n;
        expect(pedersen.isPrimeMillerRabin(p)).toBeTruthy();
    });

    // Test to confirm functionality with an additional small prime
    test('returns true for safe prime 47', () => {
        const p = 47n;
        expect(pedersen.isPrimeMillerRabin(p)).toBeTruthy();
    });

    // Test with a larger prime to verify the test's scalability
    test('returns true for safe prime 999983', () => {
        const p = 999983n;
        expect(pedersen.isPrimeMillerRabin(p)).toBeTruthy();
    });

    // Verifies non-prime detection with a composite number
    test('returns false for non-safe prime 15', () => {
        const p = 15n; // 15 is not a prime number
        expect(pedersen.isPrimeMillerRabin(p)).toBeFalsy();
    });

    // Another test to ensure proper identification of non-prime numbers
    test('returns false for non-prime 20', () => {
        const p = 20n;
        expect(pedersen.isPrimeMillerRabin(p)).toBeFalsy();
    });

    // Test to detect wrong categorization of a composite number
    test('returns false for non-safe prime 24', () => {
        const p = 24n; // 24 is not a prime number
        expect(pedersen.isPrimeMillerRabin(p)).toBeFalsy();
    });
});

describe('pedersen', () => {

    // Test to check commitment calculation with small parameter values
    test('generate pedersen commitment small values', () => {
        const smallParams = {
            p: 101n,
            g: 2n,
            h: 5n,
        }

        const m1 = 10n;
        const r1 = 7n;

        const C = pedersen.commitment(m1, r1, smallParams);
        expect(C).toEqual(21n);
    });

    // Test to confirm Pedersen parameter generation and validity checks
    test('should generate valid Pedersen parameters', async () => {
        const { g, h, p } = await pedersen.generator(32);

        // Ensure parameters are of the correct type
        expect(typeof g).toBe('bigint');
        expect(typeof h).toBe('bigint');
        expect(typeof p).toBe('bigint');

        // Ensure generated parameters have the correct properties
        expect(g).not.toBe(h);

        // Validation of g as a generator
        const orderCondition = pedersen.modExp(g, (p - 1n) / 2n, p);
        expect(orderCondition).not.toBe(1n);

        // Confirm the primality of the generated value p
        expect(pedersen.isPrimeMillerRabin(p)).toBeTruthy();
    });

    // Test to verify 'h' is distinct from 'g' and '1' in generated parameters.
    test('should properly select h distinct from g and 1', async () => {
        for (let i = 0; i < 5; i++) { // Repeated tests for reliability
            const { g, h } = await pedersen.generator(32);

            // Check distinction of h from g and 1
            expect(h).not.toEqual(g);
            expect(h).not.toEqual(1n);
        }
    });

    // Test to validate homomorphic properties in commitment summation 
    test('homomorphic sum property', () => {
        const params = pedersen.DEFAULT_GENERATOR;

        const m1 = 10n;
        const r1 = pedersen.randomBlinding();
        const C1 = pedersen.commitment(m1, r1, params);

        const m2 = 4n;
        const r2 = pedersen.randomBlinding();
        const C2 = pedersen.commitment(m2, r2, params);

        const Csum = pedersen.sum(C1, C2, params);

        // Calculate resulting message and randomness
        const m3 = 4n + 10n;
        const r3 = (r1 + r2) % params.p;
        const C3 = pedersen.commitment(m3, r3, params);

        // Ensure commitments and their sums behave as expected
        expect(C1).not.toEqual(C2);
        expect(C1).not.toEqual(C3);
        expect(C2).not.toEqual(C3);
        expect(Csum).toEqual(C3);
    });

    // Test to validate homomorphic properties in commitment subtraction
    test('homomorphic subtraction property', () => {
        const params = pedersen.DEFAULT_GENERATOR;

        const m1 = 50n;
        const r1 = pedersen.randomBlinding();
        const C1 = pedersen.commitment(m1, r1, params);

        const m2 = 10n;
        const r2 = r1 / 3n; // Prevent r from being less than zero
        const C2 = pedersen.commitment(m2, r2, params);

        const Csub = pedersen.sub(C1, C2, params);

        // Calculate resulting message and randomness after subtraction
        const m3 = 50n - 10n;
        const r3 = r1 - r2;
        const C3 = pedersen.commitment(m3, r3, params);

        // Validate the correctness of subtraction
        expect(C1).not.toEqual(C2);
        expect(C1).not.toEqual(C3);
        expect(C2).not.toEqual(C3);
        expect(Csub).toEqual(C3);
    });

    // Test to validate homomorphic properties in commitment multiplication 
    test('homomorphic multiply property', () => {
        const params = pedersen.DEFAULT_GENERATOR;

        const m1 = 33n;
        const r1 = pedersen.randomBlinding();
        const C1 = pedersen.commitment(m1, r1, params);

        const scalar = 7n;

        const Cmul = pedersen.multiply(C1, scalar, params);

        // Calculate resulting message and randomness after multiplication
        const m2 = 33n * scalar;
        const r2 = (r1 * scalar) % params.p;
        const C2 = pedersen.commitment(m2, r2, params);

        // Validate the correctness of multiplication
        expect(C1).not.toEqual(C2);
        expect(Cmul).toEqual(C2);
    });

    test('modInverse basic property', () => {
        const testCases = [
            [3n, 11n],   // 3^-1 mod 11 = 4
            [7n, 13n],   // 7^-1 mod 13 = 2 (7*2=14≡1)
            [5n, 17n],   // 5^-1 mod 17 = 7 (5*7=35≡1)
            [1n, 19n],   // 1^-1 mod 19 = 1
        ];

        testCases.forEach(([a, p]) => {
            const inv = pedersen.modInverse(a, p);
            // Check: a * inv ≡ 1 mod p
            expect((a * inv) % p).toEqual(1n);
        });
    });
})