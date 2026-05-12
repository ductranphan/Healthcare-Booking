import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-20 pb-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-xl">
        Book an appointment
      </h1>
      <p className="mt-4 text-stone-600 max-w-lg leading-relaxed">
        Choose a physician, pick a time that works, and we'll confirm your
        visit.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/physicians" className="btn btn-primary">
          Find a doctor
        </Link>
        <Link to="/admin" className="btn btn-secondary">
          I'm staff
        </Link>
      </div>
    </section>
  );
}
