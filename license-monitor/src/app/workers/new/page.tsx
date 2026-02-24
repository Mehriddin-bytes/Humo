import { PageHeader } from "@/components/layout/page-header";
import { WorkerForm } from "@/components/workers/worker-form";

export default function NewWorkerPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title="Add Worker" />
      <WorkerForm mode="create" />
    </div>
  );
}
