import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { Usuario } from '../types/Usuario';

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string;
}

interface Errors {
  nombre?: string;
  apellido?: string;
  email?: string;
  fechaNacimiento?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  initial: Usuario | null;
}

export default function UsuariosForm({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<FormData>({ nombre: '', apellido: '', email: '', fechaNacimiento: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          nombre: initial.nombre,
          apellido: initial.apellido,
          email: initial.email,
          fechaNacimiento: initial.fechaNacimiento,
        });
      } else {
        setForm({ nombre: '', apellido: '', email: '', fechaNacimiento: '' });
      }
      setErrors({});
      setServerError('');
    }
  }, [open, initial]);

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!form.apellido.trim()) errs.apellido = 'El apellido es obligatorio';
    if (!form.email.trim()) {
      errs.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Email inválido';
    }
    if (!form.fechaNacimiento) errs.fechaNacimiento = 'La fecha es obligatoria';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError('');
    try {
      await onSave(form);
    } catch (err: unknown) {
      if (err instanceof Error) setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={initial ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {serverError && <div style={{ background: '#f8d7da', color: '#842029', padding: '0.5rem 0.75rem', borderRadius: 6, marginBottom: '0.75rem', fontSize: '0.85rem' }}>{serverError}</div>}
        <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={errors.nombre} />
        <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} error={errors.apellido} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <Input label="Fecha de Nacimiento" type="date" max={new Date().toISOString().split('T')[0]} value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} error={errors.fechaNacimiento} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" loading={saving}>{initial ? 'Actualizar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}
