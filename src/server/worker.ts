import { startIngestionWorker } from "@/server/queue";

const worker = startIngestionWorker();
worker.on("failed", (job, error) => {
  console.error("Ingestion job failed", job?.id, error);
});
console.log("Ingestion worker listening.");
