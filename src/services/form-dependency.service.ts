import { IForm, IFormField } from "@/common/interfaces/form.interfaces";
import { extractVariableNames } from "@/utils/variable.utils";

export type FieldVariableDeps = Record<string, Set<string>>;

export function buildFieldDependencyMap(form: IForm): FieldVariableDeps {
  const dependencyMap: FieldVariableDeps = {};

  function processField(fieldName: string, field: IFormField) {
    const variablesUsed = new Set<string>();

    if (field.defaultValue) {
      extractVariableNames(field.defaultValue).forEach((v) =>
        variablesUsed.add(v)
      );
    }

    if (field.label) {
      extractVariableNames(field.label).forEach((v) => variablesUsed.add(v));
    }

    if (field.placeholder) {
      extractVariableNames(field.placeholder).forEach((v) =>
        variablesUsed.add(v)
      );
    }

    if (field.description) {
      extractVariableNames(field.description).forEach((v) =>
        variablesUsed.add(v)
      );
    }

    if (variablesUsed.size > 0) {
      dependencyMap[fieldName] = variablesUsed;
    }

    if (field.dependencies) {
      Object.entries(field.dependencies).forEach(([depName, depField]) => {
        processField(depName, depField);
      });
    }
  }

  Object.entries(form.fields).forEach(([fieldName, field]) => {
    processField(fieldName, field);
  });

  return dependencyMap;
}

export function getFieldsUsingVariable(
  dependencyMap: FieldVariableDeps,
  variableName: string
): string[] {
  return Object.entries(dependencyMap)
    .filter(([, variables]) => variables.has(variableName))
    .map(([fieldName]) => fieldName);
}

export function getVariablesUsedByField(
  dependencyMap: FieldVariableDeps,
  fieldName: string
): string[] {
  const variables = dependencyMap[fieldName];
  return variables ? Array.from(variables) : [];
}
