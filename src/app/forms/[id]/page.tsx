import { FormView } from "@/components/organism/formView";
import { FormLayout } from "@/components/layouts/formLayout";
import { fetchFormByFormId } from "@/service/formData.service";
import { notFound } from "next/navigation";

interface FormPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormPage({ params }: FormPageProps) {
  let formData;
  try {
    const { id } = await params;
    formData = fetchFormByFormId(id);
  } catch (error) {
    console.log(`[FormPage]:`, error);
    notFound();
  }

  if (!formData) {
    notFound();
  }
  if (formData.customComponent) {
    return (
      <FormLayout
        formName={formData.formName}
        showHeader={formData.ui["ui:header"]}
      >
        <div>TODO: Implement custom component handling</div>
      </FormLayout>
    );
  } else {
    return (
      <FormLayout
        formName={formData.formName}
        showHeader={formData.ui["ui:header"]}
      >
        <FormView formData={formData} />
      </FormLayout>
    );
  }
}
