import { useState, useEffect } from 'react';
import { libroService } from '../services/libroService';
import { Libro } from '../types/Libro';
import { Ejemplar } from '../types/Ejemplar';
import Loading from './Loading';
import styles from './EjemplaresModal.module.css';

interface Props {
  libro: Libro | null;
  onClose: () => void;
  onChanged: () => void;
}

export default function EjemplaresModal({ libro, onClose, onChanged }: Props) {
  const [ejemplares, setEjemplares] = useState<Ejemplar[]>([]);
  const [loading, setLoading] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!libro) return;
    setLoading(true);
    setError('');
    libroService.listarEjemplaresPorLibro(libro.id)
      .then(setEjemplares)
      .catch(() => setError('Error al cargar ejemplares'))
      .finally(() => setLoading(false));
  }, [libro]);

  if (!libro) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await libroService.crearEjemplar(libro.id, codigo.trim());
      setSuccess('Ejemplar agregado');
      setCodigo('');
      const updated = await libroService.listarEjemplaresPorLibro(libro.id);
      setEjemplares(updated);
      onChanged();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al agregar ejemplar';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: Ejemplar) => {
    if (!confirm(`¿Eliminar ejemplar "${e.codigo}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await libroService.eliminarEjemplar(e.id);
      setSuccess('Ejemplar eliminado');
      setEjemplares(prev => prev.filter(x => x.id !== e.id));
      onChanged();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al eliminar ejemplar';
      setError(msg);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Ejemplares: {libro.titulo}</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form className={styles.addRow} onSubmit={handleAdd}>
          <input
            className={styles.addInput}
            placeholder="Código del ejemplar (ej: LIB-001)"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            disabled={saving}
            autoFocus
          />
          <button type="submit" className={styles.delBtn} style={{ borderColor: '#198754', color: '#198754', whiteSpace: 'nowrap' }} disabled={saving || !codigo.trim()}>
            {saving ? '...' : '+ Agregar'}
          </button>
        </form>

        {loading ? <Loading /> : ejemplares.length === 0 ? (
          <div className={styles.empty}>Sin ejemplares registrados</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ejemplares.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.codigo}</td>
                  <td>
                    <span className={`${styles.badge} ${e.estado === 'DISPONIBLE' ? styles.badgeAvailable : styles.badgeLoaned}`}>
                      {e.estado}
                    </span>
                  </td>
                  <td>
                    <button className={styles.delBtn} onClick={() => handleDelete(e)} disabled={e.estado !== 'DISPONIBLE'} title={e.estado !== 'DISPONIBLE' ? 'No se puede eliminar un ejemplar prestado' : ''}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
