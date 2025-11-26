import { cn } from "@/utils/shadcn.utils";

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold">{children}</h1>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function H4({ children }: { children: React.ReactNode }) {
  return <h4 className="text-base font-semibold">{children}</h4>;
}

export function H5({ children }: { children: React.ReactNode }) {
  return <h5 className="text-sm font-semibold">{children}</h5>;
}

export function H6({ children }: { children: React.ReactNode }) {
  return <h6 className="text-xs font-semibold">{children}</h6>;
}

export function P({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-base", className)}>{children}</p>;
}
