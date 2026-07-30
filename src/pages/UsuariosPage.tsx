import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services/usuarioService';
import { Usuario } from '../types/Usuario';
import Table, { Column } from '../components/Table';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import UsuariosForm from './UsuariosForm';
import styles from './UsuariosPage.module.css';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleSave = async (data: { nombre: string; apellido: string; email: string; fechaNacimiento: string }) => {
    try {
      if (editing) {
        await usuarioService.actualizar(editing.id, data);
        setSuccess('Usuario actualizado correctamente');
      } else {
        await usuarioService.crear(data);
        setSuccess('Usuario creado correctamente');
      }
      setFormOpen(false);
      setEditing(null);
      await cargar();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al guardar usuario';
      throw new Error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usuarioService.eliminar(deleteTarget.id);
      setSuccess('Usuario eliminado correctamente');
      setDeleteTarget(null);
      await cargar();
    } catch {
      setError('Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (u: Usuario) => { setEditing(u); setFormOpen(true); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };

  const columns: Column<Usuario>[] = [
    { key: 'id', header: 'ID' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'apellido', header: 'Apellido' },
    { key: 'email', header: 'Email' },
    { key: 'fechaNacimiento', header: 'Fecha Nac.', render: (u) => u.fechaNacimiento },
    {
      key: 'acciones', header: 'Acciones', render: (u) => (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => openEdit(u)}>Editar</Button>
          <Button variant="danger" onClick={() => setDeleteTarget(u)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1>Usuarios</h1>
        <Button onClick={openCreate}>Nuevo Usuario</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {loading ? <Loading /> : <Table columns={columns} data={usuarios} />}

      <UsuariosForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Usuario"
        message={`¿Eliminar a ${deleteTarget?.nombre} ${deleteTarget?.apellido}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
