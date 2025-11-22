import { ReactNode } from "react";
import { Card, CardContent } from "@/components/atoms/card";
import { cn } from "@/utils/shadcn.utils";

interface FormLayoutProps {
  children: ReactNode;
  formName?: string;
  showHeader?: boolean;
  className?: string;
}

export const FormLayout = ({
  children,
  formName,
  showHeader = true,
  className,
}: FormLayoutProps) => {
  return (
    <div className={cn("min-h-screen bg-background py-8 px-4", className)}>
      <div className="mx-auto max-w-4xl">
        {showHeader && formName && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {formName}
            </h1>
            <div className="mt-2 h-1 w-16 bg-primary rounded-full" />
          </div>
        )}
        <Card className="shadow-lg">
          <CardContent className="p-8">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};
