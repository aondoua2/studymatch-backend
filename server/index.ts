import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;

  let capturedJsonResponse: any = undefined;

  const originalJson = res.json;
  res.json = function (body: any) {
    capturedJsonResponse = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (path.startsWith("/api")) {
      let msg = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        msg += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (msg.length > 120) msg = msg.substring(0, 120) + "…";
      log(msg);
    }
  });

  next();
});

(async () => {
  // Register API routes
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    log(`ERROR ${status}: ${message}`);
    res.status(status).json({ message });
  });

  // Vite only in dev
  if (app.get("env") === "development") {
    // @ts-ignore
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Render uses PORT (required)
  const port = parseInt(process.env.PORT || "5000", 10);

  // @ts-ignore
  server.listen(port, () => {
    log(`Backend running on port ${port}`);
  });
})();

// import express, { Request, Response, NextFunction } from "express";
// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";

// const app = express();

// // Body parsing
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // Logging middleware
// app.use((req: Request, res: Response, next: NextFunction) => {
//   const start = Date.now();
//   const path = req.path;

//   let capturedJsonResponse: any = undefined;

//   const originalJson = res.json;
//   res.json = function (body: any) {
//     capturedJsonResponse = body;
//     return originalJson.call(this, body);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;

//     if (path.startsWith("/api")) {
//       let msg = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         msg += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }
//       if (msg.length > 120) msg = msg.substring(0, 120) + "…";
//       log(msg);
//     }
//   });

//   next();
// });

// (async () => {
//   // Register API routes
//   const server = await registerRoutes(app);

//   // Global error handler
//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || 500;
//     const message = err.message || "Internal Server Error";
//     log(`ERROR ${status}: ${message}`);
//     res.status(status).json({ message });
//   });

//   // Vite only in dev
//   if (app.get("env") === "development") {
//     await setupVite(app, server);
//   } else {
//     serveStatic(app);
//   }

//   // Render uses PORT (required)
//   const port = parseInt(process.env.PORT || "5000", 10);

//   // Start server
//   server.listen(port, () => {
//     log(`Backend running on port ${port}`);
//   });
// })();