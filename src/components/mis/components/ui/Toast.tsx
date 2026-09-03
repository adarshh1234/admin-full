import { useMISToast } from '../../context/ToastContext';

export default function MISToast() {
  const { toasts, removeToast } = useMISToast();

  if (!toasts.length) return null;

  return (
    <div className="mis-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`mis-toast-item mis-toast-${t.type}`}>
          <span>{t.message}</span>
          <button className="mis-toast-close" onClick={() => removeToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
