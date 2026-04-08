import { Navbar } from "@/components/layout/Navbar";

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-2xl bg-sand mb-3" />
      <div className="h-4 bg-sand rounded w-3/4 mb-2" />
      <div className="h-3 bg-sand rounded w-1/2 mb-2" />
      <div className="h-4 bg-sand rounded w-1/3" />
    </div>
  );
}

export default function SearchLoading() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-16 bg-white rounded-2xl border border-[#E0DDD6] animate-pulse mb-8" />

        <div className="h-5 bg-sand rounded w-48 mb-6 animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </>
  );
}
