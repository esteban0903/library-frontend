import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './SearchableSelect.module.css';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
}

interface SearchableSelectProps<T = string | number> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
}

export default function SearchableSelect<T extends string | number>({
  options, value, onChange, label, placeholder = 'Escriba para buscar...', error, loading, disabled,
}: SearchableSelectProps<T>) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = query === ''
    ? options
    : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIdx(0);
    if (value !== null) onChange(null);
  }, [value, onChange]);

  const select = useCallback((option: SelectOption<T>) => {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }, [onChange]);

  const clear = useCallback(() => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  }, [onChange]);

  useEffect(() => {
    if (selected && query !== selected.label) {
      setQuery(selected.label);
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && filtered[activeIdx]) select(filtered[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          placeholder={selected ? selected.label : placeholder}
          value={query}
          onChange={handleInput}
          onFocus={() => { setOpen(true); if (value !== null) { setQuery(''); onChange(null); } }}
          onKeyDown={handleKey}
          disabled={disabled}
          autoComplete="off"
        />
        {value !== null && (
          <button type="button" className={styles.clearBtn} onClick={clear} tabIndex={-1}>&times;</button>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {open && (
        <div className={styles.dropdown}>
          {loading ? (
            <div className={styles.loading}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.noResults}>Sin resultados</div>
          ) : (
            filtered.map((opt, i) => (
              <div
                key={String(opt.value)}
                className={`${styles.option} ${i === activeIdx ? styles.optionActive : ''} ${opt.value === value ? styles.optionSelected : ''}`}
                onClick={() => select(opt)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
