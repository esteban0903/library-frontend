import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { Libro } from '../types/Libro';

interface FormData {
  titulo: string;
  isbn: string;
  autor: string;
  edicion: string | null;
  fechaPublicacion: string;
}

interface Errors {
  titulo?: string;
  isbn?: string;
  autor?: string;
  fechaPublicacion?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  initial: Libro | null;
}

export default function LibrosForm({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<FormData>({ titulo: '', isbn: '', autor: '', edicion: '', fechaPublicacion: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          titulo: initial.titulo,
          isbn: initial.isbn,
          autor: initial.autor,
          edicion: initial.edicion || '',
          fechaPublicacion: initial.fechaPublicacion,
        });
      } else {
        setForm({ titulo: '', isbn: '', autor: '', edicion: '', fechaPublicacion: '' });
      }
      setErrors({});
      setServerError('');
    }
  }, [open, initial]);

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!form.titulo.trim()) errs.titulo = 'El título es obligatorio';
    if (!form.isbn.trim()) errs.isbn = 'El ISBN es obligatorio';
    if (!form.autor.trim()) errs.autor = 'El autor es obligatorio';
    if (!form.fechaPublicacion) {
      errs.fechaPublicacion = 'La fecha es obligatoria';
    } else if (form.fechaPublicacion > new Date().toISOString().split('T')[0]) {
      errs.fechaPublicacion = 'La fecha no puede ser futura';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError('');
    try {
      await onSave({ ...form, edicion: form.edicion || null });
    } catch (err: unknown) {
      if (err instanceof Error) setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={initial ? 'Editar Libro' : 'Nuevo Libro'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {serverError && <div style={{ background: '#f8d7da', color: '#842029', padding: '0.5rem 0.75rem', borderRadius: 6, marginBottom: '0.75rem', fontSize: '0.85rem' }}>{serverError}</div>}
        <Input label="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} error={errors.titulo} />
        <Input label="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} error={errors.isbn} />
        <Input label="Autor" value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} error={errors.autor} />
        <Input label="Edición" value={form.edicion || ''} onChange={(e) => setForm({ ...form, edicion: e.target.value })} />
        <Input label="Fecha de Publicación" type="date" max={new Date().toISOString().split('T')[0]} value={form.fechaPublicacion} onChange={(e) => setForm({ ...form, fechaPublicacion: e.target.value })} error={errors.fechaPublicacion} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" loading={saving}>{initial ? 'Actualizar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}
