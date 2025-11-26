import { Separator } from "@/components/atoms/separator";

export function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="my-6">
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
      <Separator className="mt-6" />
    </div>
  );
}
