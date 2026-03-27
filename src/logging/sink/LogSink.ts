import type { Sink } from "@logtape/logtape"

/**
 * The interface that LogSinks must implement.
 * For simplicity, this is just LogTape's Sink type. That's a leaky abstraction, we'll see how it evolves.
 */
export type LogSink = Sink
