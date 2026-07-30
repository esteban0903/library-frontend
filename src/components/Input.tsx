import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  error?: string;
  as?: 'input' | 'select';
  children?: React.ReactNode;
}

export default function Input({ label, error, as = 'input', children, ...props }: InputProps) {
  return (
    <div className={styles.group}>
      <label className={styles.label}>{label}</label>
      {as === 'select' ? (
        <select className={`${styles.field} ${error ? styles.errorField : ''}`} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          {children}
        </select>
      ) : (
        <input className={`${styles.field} ${error ? styles.errorField : ''}`} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
