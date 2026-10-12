import { createApp } from "./app";
import { env } from "./config/env";
import { connectMongo, disconnectMongo } from "./db/mongo";
import { disconnectCache } from "./lib/cache";

async function main(): Promise<void> {
  await connectMongo(env.MONGODB_URI);

  const server = createApp().listen(env.PORT, () => {
    console.log(`API listening on :${env.PORT}`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`${signal} received, shutting down`);
    server.close(() => {
      Promise.all([disconnectMongo(), disconnectCache()])
        .then(() => process.exit(0))
        .catch((error: unknown) => {
          console.error(error);
          process.exit(1);
        });
    });
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

main().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
