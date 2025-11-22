interface HeaderProps {
  formName?: string;
}

export const Header = ({ formName }: HeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{formName || "Form"}</h1>
    </div>
  );
};
