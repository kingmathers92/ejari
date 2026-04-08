import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand-light flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-bold text-terracotta mb-4">404</p>
        <h1 className="text-xl font-bold text-ink mb-2">Page introuvable</h1>
        <p className="text-ink-muted text-sm mb-8">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
