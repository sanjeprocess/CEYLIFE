import React from "react";
import {
  ILayoutItem,
  IJSONSchemaProperty,
  IFieldLayoutItem,
} from "@/common/interfaces/formData";
import { FieldInput } from "@/components/molecules/field";
import { Subheader } from "@/components/molecules/subheader";
import { Markdown } from "@/components/molecules/markdown";
import { ListOrdered, ListUnordered } from "@/components/molecules/list";

interface FormElementProps {
  element: ILayoutItem;
  schema?: IJSONSchemaProperty;
  required?: boolean;
}

export const FormElement = ({
  element,
  schema,
  required,
}: FormElementProps): React.ReactNode => {
  switch (element.type) {
    case "field":
      return (
        <FieldInput
          {...(element as IFieldLayoutItem)}
          schema={schema}
          required={required}
        />
      );
    case "subheader":
      return <Subheader {...element} />;
    case "md":
      return <Markdown {...element} />;
    case "list:ordered":
      return <ListOrdered {...element} />;
    case "list:unordered":
      return <ListUnordered {...element} />;
    default:
      return null;
  }
};
