import { FatalError } from "./FatalError.js"

export type NotImplementedContext = { trackedBy: string }

/**
 * You can use this if you're implementing a feature, but you're not yet ready to implement all the parts.
 * You should provide a url to where the implementation is tracked (usually, a jira ticket), so you don't forget.
 */
export class NotImplementedError extends FatalError<NotImplementedContext> {
  constructor(context: NotImplementedContext) {
    super(`This feature is not yet implemented!`, context)

    // We can't use "this.constructor.name" because when code gets bundled, the class names get mangled and you get a useless name
    this.name = "NotImplementedError"
  }
}
