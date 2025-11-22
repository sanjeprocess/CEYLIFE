import { IListOrderedLayoutItem, IListUnorderedLayoutItem } from "@/common/interfaces/formData";
import { cn } from "@/utils/shadcn.utils";

/**
 * Map bullet type to CSS list-style-type
 */
function getListStyleType(bullet?: string): string {
  switch (bullet) {
    case "roman":
      return "list-[lower-roman]";
    case "decimal":
      return "list-decimal";
    case "alpha":
      return "list-[lower-alpha]";
    case "disc":
      return "list-disc";
    case "circle":
      return "list-[circle]";
    case "square":
      return "list-[square]";
    default:
      return "list-disc";
  }
}

export const ListOrdered = (props: IListOrderedLayoutItem) => {
  const listStyleClass = getListStyleType(props.bullet || "decimal");

  return (
    <ol className={cn("ml-6 mb-4", listStyleClass)}>
      {props.items.map((item, index) => {
        if (item.type === "list:item-break") {
          return (
            <li key={index} className="list-none text-center my-2 font-semibold">
              {item.text}
            </li>
          );
        }
        return (
          <li key={index} className="mb-1">
            {item.text}
          </li>
        );
      })}
    </ol>
  );
};

export const ListUnordered = (props: IListUnorderedLayoutItem) => {
  const listStyleClass = getListStyleType(props.bullet || "disc");

  return (
    <ul className={cn("ml-6 mb-4", listStyleClass)}>
      {props.items.map((item, index) => {
        if (item.type === "list:item-break") {
          return (
            <li key={index} className="list-none text-center my-2 font-semibold">
              {item.text}
            </li>
          );
        }
        return (
          <li key={index} className="mb-1">
            {item.text}
          </li>
        );
      })}
    </ul>
  );
};

