# Logging

This module is meant to be a logging implementation. It includes the Logger API, supported log destinations (sinks) and eventually middlewares for supported backend tech (Express).

## Current scope and architecture

The `Logger` is a wrapper over [LogTape](https://logtape.org/). It works in both the browser and node.  
The logger encourages structured logging and streamlines the log formatting.  
It is customizable, you can create your own sinks and log formatters, but ideally we would offer all necessary sinks to avoid each project having to implement their own sinks and have uniform logs.

### Context Providers

`Logger` has 1 custom feature: context providers.

Context providers allow you to update the log context after the logger is created.  
This is not something logger libraries support, probably because most loggers are designed for backend applications.  
This feature will be mostly useful for frontend applications, as the logger won't be linked to a single request, DI is not typically used and the application state will likely change during the lifecycle of the logger.

A simple example for this is logging some user info. At the boot of the app, you might have to fetch the user data, but you also want to create child loggers before the user is fetched.

```ts
const contextProvider = new LogContextProvider()
const rootLogger = await Logger.configure({
  sinks: {
    console: createConsoleLogSink(),
  },
  contextProviders: [contextProvider],
})

const initLogger = rootLogger.child({ scope: "init" })

initLogger.info("start init")
// [14:46:28.187] INFO (init): start init { user: null }

await someInitCode(initLogger)
// [14:46:28.189] INFO (init): some init { user: null }

// Fetching the user & setting the context
const user = await loadUser()
contextProvider.user = user

rootLogger.info("this will have user")
// [14:46:28.190] INFO: this will have user { user: { id: 1, isAdmin: true } }

await someInitCode(initLogger)
// [14:46:28.191] INFO (init): some init { user: { id: 1, isAdmin: true } }

initLogger.info("end init")
// [14:46:28.192] INFO (init): end init { user: { id: 1, isAdmin: true } }

const feature1Logger = rootLogger.child({ scope: "feature1" })

feature1Logger.info("some feature work with admin true")
// [14:46:28.192] INFO (feature1): some feature work with admin true { user: { id: 1, isAdmin: true } }

user.isAdmin = false

feature1Logger.info("some feature work with admin false")
// [14:46:28.193] INFO (feature1): some feature work with admin false { user: { id: 1, isAdmin: false } }
```

### Logging within libraries

Libraries that use the logger can get the logger with `Logger.get()`. This logger is designed to be valid and immediately usable.

Applications will eventually configure `Logger`, which will correctly propagate the logger context and sinks to all loggers that were created before the configuration.

## Available Sinks

### ConsoleLogSink

The `ConsoleLogSink` outputs logs to the browser console or terminal. It works in both browser and Node.js environments.

```ts
import { VentionLogger, createConsoleLogSink, jsonLinesConsoleFormatter, prettyConsoleFormatter } from "@ventionco/tech-toolbox"

// You can use a single set of options for dev and prod
const isProd = process.env.NODE_ENV === "production" // or however you know
const logger = await VentionLogger.configure({
  sinks: {
    console: createConsoleLogSink({
      formatter: isProd ? jsonLinesConsoleFormatter : prettyConsoleFormatter,
      redaction: { enabled: isProd },
    }),
  },
})

logger.info("Hello world", { foo: "bar", password: "leaking" })
// Development:  [14:46:28.187] INFO: Hello world { foo: "bar", password: "leaking" }
// Production:   {"timestamp":"2024-01-01T14:46:28.187Z","level":"INFO","message":"Hello world","foo":"bar","password":"[REDACTED]"}
```

## Future work

### Log buffering before configuration

The root logger is immediately available and will propagate its configuration and context once it is configured.

However, you will lose logs that happen before the configuration. That should not happen a lot, since the configuration will be the first thing you do in most cases, but it can happen.

To solve this, we can implement logs buffering so we can replay early logs when the logger is configured.

### Railway log sink

Railway collects logs in the backend from stdout/stderr. However, it's not clear how we'd collect the frontend logs.

We'll want a frontend log sink to send to Railway.

### Backend Middlewares

We'll want to make the Express integration seamless, so we'll want to provide middlewares and documentation to integrate with the framework.

### Dedicated packages

For now, the logger is in the same package as everything else. However, as the logger grows, it might come with dependencies for each sink / middleware that we don't always need.

When we get there and we want to reduce the bundle size, we should consider breaking down the logger core package and the sinks / middlewares.
