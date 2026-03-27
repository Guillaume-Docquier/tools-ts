// Jest doesn't allow you to an array of arrays as a theory parameter, it tries to inspect it instead
const toArrayEntry = (array: unknown[]): { array: unknown[] } => ({ array })

class AClassIsTechnicallyRecordLike {
  public readonly foo = "bar"
}

export const Theory = {
  NotAString: [-1, 0, 1, -1.5, 1.5, {}, [], null, undefined, true, false],
  String: ["-1", "0", "1", "-1.5", "1.5", "{}", "[]", "null", "undefined", "true", "false", "", "string", "blah blah blah"],
  Record: [{}, { x: {} }, { a: null }, { null: null }, { undefined }, { yo: "hi" }],
  NotARecord: [-1, 0, 1, -1.5, 1.5, "record", "", "string", "{}", "[]", [], null, undefined, true, false],
  Array: [[], [""], [0], [null], [undefined], [[]], [{}], [false], [1, "string", true]].map(toArrayEntry),
  NotAnArray: [-1, 0, 1, -1.5, 1.5, "record", "", "string", "{}", "[]", {}, null, undefined, true, false],
  NotANumber: ["-1", "0", "1", "-1.5", "1.5", "record", "", "string", "{}", "[]", {}, [], null, undefined, true, false],
  Number: [Number.MIN_VALUE, -2.3456789, -1.5, -1, 0, 1, 1.5, 2.3456789, Number.MAX_VALUE],
  NotAnInteger: ["-1", "0", "1", -1.5, 1.5, "record", "", "string", "{}", "[]", {}, [], null, undefined, true, false],
  Integer: [-999, -1, 0, 1, 999],
  NotABoolean: [-1, 0, 1, -1.5, 1.5, "record", "", "string", "{}", "[]", {}, [], null, undefined, "true", "false"],
  Boolean: [true, false],
  Class: [new AClassIsTechnicallyRecordLike()],
} as const
