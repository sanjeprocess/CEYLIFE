import { ISubheaderLayoutItem } from "@/common/interfaces/formData";
import { cn } from "@/utils/shadcn.utils";

export const Subheader = (props: ISubheaderLayoutItem) => {
  const alignClass = cn({
    "text-left": props.align === "left" || !props.align,
    "text-center": props.align === "center",
    "text-right": props.align === "right",
  });

  return (
    <h2 className={cn("text-2xl font-semibold mt-6 mb-3", alignClass)}>
      {props.text}
    </h2>
  );
};
