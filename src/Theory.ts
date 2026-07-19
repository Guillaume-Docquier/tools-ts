// oxlint-disable unicorn/no-thenable -- This is intentional to cover 3rd party code that does this
// oxlint-disable typescript/no-extraneous-class -- This is test code

// Jest doesn't allow you to an array of arrays as a theory parameter, it tries to inspect it instead
const toArrayEntry = (array: unknown[]): { array: unknown[] } => ({ array })

class AClassIsTechnicallyRecordLike {
  public readonly foo = "bar"
}

class ClassWithThenMethod implements PromiseLike<"value"> {
  public async then<TResult1 = "value", TResult2 = never>(
    onfulfilled?: ((value: "value") => TResult1 | PromiseLike<TResult1>) | null,
  ): Promise<TResult1 | TResult2> {
    if (onfulfilled !== null && onfulfilled !== undefined) {
      return await onfulfilled("value")
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This is fine
    return "value" as TResult1
  }
}

export const Theory = {
  String: ["-1", "0", "1", "-1.5", "1.5", "{}", "[]", "null", "undefined", "true", "false", "", "string", "blah blah blah"],
  NotAString: [-1, 0, 1, -1.5, 1.5, {}, [], null, undefined, true, false],
  Record: [{}, { x: {} }, { a: null }, { null: null }, { undefined }, { yo: "hi" }],
  NotARecord: [-1, 0, 1, -1.5, 1.5, "record", "", "string", "{}", "[]", [], null, undefined, true, false],
  Array: [[], [""], [0], [null], [undefined], [[]], [{}], [false], [1, "string", true]].map(toArrayEntry),
  NotAnArray: [-1, 0, 1, -1.5, 1.5, "record", "", "string", "{}", "[]", {}, null, undefined, true, false],
  Number: [Number.MIN_VALUE, -2.3456789, -1.5, -1, 0, 1, 1.5, 2.3456789, Number.MAX_VALUE],
  NotANumber: ["-1", "0", "1", "-1.5", "1.5", "record", "", "string", "{}", "[]", {}, [], null, undefined, true, false],
  Boolean: [true, false],
  NotABoolean: [-1, 0, 1, -1.5, 1.5, "record", "", "string", "{}", "[]", {}, [], null, undefined, "true", "false"],
  Class: [new AClassIsTechnicallyRecordLike()],
  PromiseLike: [
    (async () => "value" as const)(),
    Promise.resolve("value"),
    {
      then: async <TResult1 = "value">(
        onfulfilled?: ((value: "value") => TResult1 | PromiseLike<TResult1>) | null,
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This is fine
      ): Promise<TResult1> => (onfulfilled !== undefined && onfulfilled !== null ? await onfulfilled("value") : ("value" as TResult1)),
    },
    new ClassWithThenMethod(),
  ] as const satisfies Array<PromiseLike<"value">>,
  NotPromiseLike: [
    undefined,
    null,
    true,
    false,
    0,
    1,
    "",
    "then",
    {},
    { then: undefined },
    { then: null },
    { then: "not a function" },
    [],
    // oxlint-disable-next-line typescript/promise-function-async -- This is intentional to cover 3rd party code that does this
    [(): Promise<string> => Promise.resolve("value")],
    // oxlint-disable-next-line typescript/promise-function-async -- This is intentional to cover 3rd party code that does this
    (): Promise<string> => Promise.resolve("value"),
  ],
  Function: [function functionDeclaration(): void {}, (): void => {}, async (): Promise<void> => {}, class SomeClass {}],
  NotAFunction: [undefined, null, true, false, 0, 1, "", "function", {}, { call: (): void => {} }, [], [(): void => {}]],
} as const
