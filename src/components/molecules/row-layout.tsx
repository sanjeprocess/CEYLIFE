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

  // Mobile: flex flex-col (single column stack)
  // Desktop (md+): grid with dynamic columns
  // Note: gridTemplateColumns and gridColumn inline styles only apply when grid is active (md+)
  // On mobile, flex takes precedence so these styles are ignored
  return (
    <div
      className="flex flex-col gap-4 md:grid"
      style={styles({
        margin: layout.margin,
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
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
