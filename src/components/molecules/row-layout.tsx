import {
  IFormField,
  IFormLayoutItem,
} from "@/common/interfaces/form.interfaces";
import { styles } from "@/services/render.service";

import { LayoutRenderer } from "./layout-renderer";

interface RowLayoutProps {
  layout: IFormLayoutItem;
  fields: Record<string, IFormField>;
  columnCount: number;
}

export function RowLayout({ layout, fields, columnCount }: RowLayoutProps) {
  if (!layout.columns || layout.columns.length === 0) {
    return null;
  }

  return (
    <div
      className="grid gap-4"
      style={styles({
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        margin: layout.margin,
      })}
    >
      {layout.columns.map((columnItem, index) => (
        <div
          key={index}
          style={{
            gridColumn: `span ${columnItem.colspan || 1}`,
          }}
        >
          <LayoutRenderer layout={columnItem} fields={fields} />
        </div>
      ))}
    </div>
  );
}
