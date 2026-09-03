interface LoaderProps {
  label?: string;
}

export default function MISLoader({ label = 'Loading...' }: LoaderProps) {
  return (
    <div className="mis-loader-container">
      <div className="mis-spinner"></div>
      {label && <span className="mis-loader-label">{label}</span>}
    </div>
  );
}
