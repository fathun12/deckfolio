type BlockFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

export function BlockField({ label, htmlFor, children }: BlockFieldProps) {
  return (
    <div>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}