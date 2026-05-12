import { Link } from "react-router-dom";
import type { Physician } from "@/types";

export default function PhysicianCard({ physician }: { physician: Physician }) {
  return (
    <Link
      to={`/physicians/${physician.id}`}
      className="group card p-5 hover:border-stone-400 transition-colors block"
    >
      <div className="flex items-center gap-4">
        <img
          src={physician.image_url}
          alt=""
          className="size-14 rounded-full object-cover bg-stone-100"
          loading="lazy"
        />
        <div className="min-w-0">
          <div className="font-semibold truncate">{physician.name}</div>
          <div className="text-sm text-stone-500">{physician.specialty}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-stone-600 leading-relaxed line-clamp-3">
        {physician.bio}
      </p>
      <div className="mt-4 text-sm font-medium text-stone-900 group-hover:underline underline-offset-4">
        See availability →
      </div>
    </Link>
  );
}
