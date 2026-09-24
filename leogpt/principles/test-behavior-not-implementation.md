# Principle: test behavior, not implementation

**When**: writing, changing, or keeping a test.

**Rule**: call the code the way its users do, and assert what they observe against a literal expected value.

## Do
- Go through the public entry point (route, exported function, component), not private helpers.
- Assert literal values (`expect(total).toBe(1250)`), not values recomputed with the code under test.
- Name the test after the behavior: "rejects an invoice without a customer".
- Mock only the real boundaries (network, clock, external services).

## Don't
- Assert that an internal function was called with some arguments, when the output can be checked.
- Mock the module under test, or everything around it.
- Keep a test that would still pass if every imported function returned `undefined`.

## Check
- Would this test fail if the behavior broke? Would it survive a refactor that keeps the behavior?
