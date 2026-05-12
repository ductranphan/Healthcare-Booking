import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import PhysicianCard from "@/components/PhysicianCard";

export default function Physicians() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["physicians"],
    queryFn: api.listPhysicians,
  });

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Find a physician
        </h1>
        <p className="mt-1 text-stone-600">
          Choose a doctor to see their next available appointments.
        </p>
      </div>

      {isLoading && <CardsSkeleton />}

      {isError && (
        <div className="card p-6 text-sm text-red-700 bg-red-50 border-red-200">
          We couldn't load physicians. Make sure the API is running at{" "}
          <code className="font-mono">http://localhost:8000</code>.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="card p-10 text-center text-stone-600">
          No physicians yet. Run the seed script to populate data.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((p) => (
            <PhysicianCard key={p.id} physician={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-stone-200" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-32 bg-stone-200 rounded" />
              <div className="h-3 w-20 bg-stone-200 rounded" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-stone-200 rounded w-full" />
            <div className="h-3 bg-stone-200 rounded w-5/6" />
            <div className="h-3 bg-stone-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
