import { server } from "./server";
const PORT = process.env.PORT || 8080;
async function main(): Promise<void> {
  try {
    await server.listen(PORT, "0.0.0.0");
    server.log.info(`Server listening on http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
    server.log.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  server.log.error(error);
  process.exit(1);
});
