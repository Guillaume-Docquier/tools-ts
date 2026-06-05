// Jest doesn't allow you to an array of arrays as a theory parameter, it tries to inspect it instead
const toArrayEntry = (array: unknown[]): { array: unknown[] } => ({ array })

class AClassIsTechnicallyRecordLike {
  public readonly foo = "bar"
}

class ClassWithThenMethod {
  public async then(): Promise<string> {
    return "value"
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
  PromiseLike: [[Promise.resolve("value"), { then: () => Promise.resolve("value") }, new ClassWithThenMethod()]],
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
    [() => Promise.resolve("value")],
    () => Promise.resolve("value"),
  ],
  Function: [function functionDeclaration() {}, () => {}, async () => {}, class SomeClass {}],
  NotAFunction: [undefined, null, true, false, 0, 1, "", "function", {}, { call: () => {} }, [], [() => {}]],
} as const
