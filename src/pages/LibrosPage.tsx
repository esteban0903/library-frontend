import { useState, useEffect, useCallback } from 'react';
import { libroService } from '../services/libroService';
import { Libro } from '../types/Libro';
import Table, { Column } from '../components/Table';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import LibrosForm from './LibrosForm';
import EjemplaresModal from '../components/EjemplaresModal';
import styles from './LibrosPage.module.css';

export default function LibrosPage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Libro | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Libro | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [ejemplaresTarget, setEjemplaresTarget] = useState<Libro | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await libroService.listar();
      setLibros(data);
    } catch {
      setError('Error al cargar libros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleSave = async (data: { titulo: string; isbn: string; autor: string; edicion: string | null; fechaPublicacion: string }) => {
    try {
      if (editing) {
        await libroService.actualizar(editing.id, data);
        setSuccess('Libro actualizado correctamente');
      } else {
        await libroService.crear(data);
        setSuccess('Libro creado correctamente');
      }
      setFormOpen(false);
      setEditing(null);
      await cargar();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al guardar libro';
      throw new Error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await libroService.eliminar(deleteTarget.id);
      setSuccess('Libro eliminado correctamente');
      setDeleteTarget(null);
      await cargar();
    } catch {
      setError('Error al eliminar libro');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (l: Libro) => { setEditing(l); setFormOpen(true); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };

  const columns: Column<Libro>[] = [
    { key: 'id', header: 'ID' },
    { key: 'titulo', header: 'Título' },
    { key: 'isbn', header: 'ISBN' },
    { key: 'autor', header: 'Autor' },
    { key: 'edicion', header: 'Edición' },
    { key: 'fechaPublicacion', header: 'Fecha Pub.' },
    { key: 'ejemplaresDisponibles', header: 'Disponibles' },
    {
      key: 'acciones', header: 'Acciones', render: (l) => (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setEjemplaresTarget(l)}>Ejemplares</Button>
          <Button variant="secondary" onClick={() => openEdit(l)}>Editar</Button>
          <Button variant="danger" onClick={() => setDeleteTarget(l)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1>Libros</h1>
        <Button onClick={openCreate}>Nuevo Libro</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {loading ? <Loading /> : <Table columns={columns} data={libros} />}

      <LibrosForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Libro"
        message={`¿Eliminar "${deleteTarget?.titulo}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <EjemplaresModal
        libro={ejemplaresTarget}
        onClose={() => setEjemplaresTarget(null)}
        onChanged={cargar}
      />
    </div>
  );
}
