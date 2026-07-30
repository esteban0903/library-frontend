import { useState, useEffect } from 'react';
import { prestamoService } from '../services/prestamoService';
import { usuarioService } from '../services/usuarioService';
import { libroService } from '../services/libroService';
import { Prestamo, PrestamoRequest } from '../types/Prestamo';
import { Usuario } from '../types/Usuario';
import { Libro } from '../types/Libro';
import { Ejemplar } from '../types/Ejemplar';
import Table, { Column } from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import SearchableSelect from '../components/SearchableSelect';
import styles from './PrestamosPage.module.css';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const today = formatDate(new Date());
const todayPlus15 = formatDate(new Date(Date.now() + 15 * 86400000));

export default function PrestamosPage() {
  const [tab, setTab] = useState<'registrar' | 'listar'>('registrar');

  return (
    <div>
      <h1 className={styles.title}>Préstamos</h1>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'registrar' ? styles.tabActive : ''}`} onClick={() => setTab('registrar')}>Registrar</button>
        <button className={`${styles.tab} ${tab === 'listar' ? styles.tabActive : ''}`} onClick={() => setTab('listar')}>Listar</button>
      </div>
      {tab === 'registrar' ? <RegistrarPrestamo /> : <ListarPrestamos />}
    </div>
  );
}

function RegistrarPrestamo() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [ejemplares, setEjemplares] = useState<Ejemplar[]>([]);
  const [ejemplaresLoading, setEjemplaresLoading] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [libroId, setLibroId] = useState<number | null>(null);
  const [ejemplarId, setEjemplarId] = useState<number | null>(null);
  const [fechaPrestamo, setFechaPrestamo] = useState(today);
  const [fechaDevolucion, setFechaDevolucion] = useState(todayPlus15);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    usuarioService.listar().then(setUsuarios).catch(() => setError('Error al cargar usuarios'));
    libroService.listar().then(setLibros).catch(() => setError('Error al cargar libros'));
  }, []);

  useEffect(() => {
    if (!libroId) {
      setEjemplares([]);
      setEjemplarId(null);
      return;
    }
    setEjemplaresLoading(true);
    setEjemplarId(null);
    libroService.listarEjemplaresPorLibro(libroId)
      .then(ejs => setEjemplares(ejs.filter(e => e.estado === 'DISPONIBLE')))
      .catch(() => setError('Error al cargar ejemplares'))
      .finally(() => setEjemplaresLoading(false));
  }, [libroId]);

  const usuarioOptions = usuarios.map(u => ({
    value: u.id,
    label: `${u.nombre} ${u.apellido} (${u.email})`,
  }));

  const libroOptions = libros.map(l => ({
    value: l.id,
    label: `${l.titulo} (${l.isbn}) — ${l.ejemplaresDisponibles} disp.`,
  }));

  const ejemplarOptions = ejemplares.map(e => ({
    value: e.id,
    label: `#${e.id} - ${e.codigo}`,
  }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!usuarioId) errs.usuarioId = 'Seleccione un usuario';
    if (!libroId) errs.libroId = 'Seleccione un libro';
    if (!ejemplarId) errs.ejemplarId = 'Seleccione un ejemplar';
    if (!fechaPrestamo) {
      errs.fechaPrestamo = 'Seleccione la fecha de préstamo';
    } else if (fechaPrestamo > today) {
      errs.fechaPrestamo = 'La fecha no puede ser futura';
    }
    if (!fechaDevolucion) {
      errs.fechaDevolucion = 'Seleccione la fecha de devolución';
    } else if (fechaPrestamo && fechaDevolucion < fechaPrestamo) {
      errs.fechaDevolucion = 'Debe ser posterior a la fecha de préstamo';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const request: PrestamoRequest = {
        usuarioId: usuarioId!,
        ejemplarId: ejemplarId!,
        fechaPrestamo,
        fechaDevolucion,
      };
      await prestamoService.registrar(request);
      setSuccess('Préstamo registrado correctamente');
      setUsuarioId(null);
      setLibroId(null);
      setEjemplarId(null);
      setFechaPrestamo(today);
      setFechaDevolucion(todayPlus15);
      setFormErrors({});
      setLibros([]);
      libroService.listar().then(setLibros);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al registrar préstamo';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Registrar Préstamo</h2>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <SearchableSelect
          label="Usuario"
          options={usuarioOptions}
          value={usuarioId}
          onChange={setUsuarioId}
          placeholder="Escriba para buscar usuario..."
          error={formErrors.usuarioId}
        />
        <SearchableSelect
          label="Libro"
          options={libroOptions}
          value={libroId}
          onChange={setLibroId}
          placeholder="Escriba para buscar libro..."
          error={formErrors.libroId}
        />
        <SearchableSelect
          label="Ejemplar"
          options={ejemplarOptions}
          value={ejemplarId}
          onChange={setEjemplarId}
          placeholder={libroId ? 'Seleccione un ejemplar...' : 'Primero seleccione un libro'}
          loading={ejemplaresLoading}
          disabled={!libroId}
          error={formErrors.ejemplarId}
        />
        <Input label="Fecha de Préstamo" type="date" max={today} value={fechaPrestamo} onChange={(e) => setFechaPrestamo(e.target.value)} error={formErrors.fechaPrestamo} />
        <Input label="Fecha de Devolución" type="date" min={fechaPrestamo || undefined} value={fechaDevolucion} onChange={(e) => setFechaDevolucion(e.target.value)} error={formErrors.fechaDevolucion} />
        <div style={{ marginTop: '0.75rem' }}>
          <Button type="submit" loading={saving}>Registrar Préstamo</Button>
        </div>
      </form>
    </div>
  );
}

function ListarPrestamos() {
  const [mode, setMode] = useState<'usuario' | 'libro'>('usuario');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [libroId, setLibroId] = useState<number | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchDone, setSearchDone] = useState(false);

  useEffect(() => {
    usuarioService.listar().then(setUsuarios).catch(() => setError('Error al cargar usuarios'));
    libroService.listar().then(setLibros).catch(() => setError('Error al cargar libros'));
  }, []);

  const usuarioOptions = usuarios.map(u => ({
    value: u.id,
    label: `${u.nombre} ${u.apellido} (${u.email})`,
  }));

  const libroOptions = libros.map(l => ({
    value: l.id,
    label: `${l.titulo} (${l.isbn})`,
  }));

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearchDone(true);
    try {
      let result: Prestamo[];
      if (mode === 'usuario') {
        if (!usuarioId) { setError('Seleccione un usuario'); setLoading(false); return; }
        result = await prestamoService.listarPorUsuario(usuarioId);
      } else {
        if (!libroId) { setError('Seleccione un libro'); setLoading(false); return; }
        const libro = libros.find(l => l.id === libroId);
        if (!libro) { setError('Libro no encontrado'); setLoading(false); return; }
        result = await prestamoService.listarPorIsbn(libro.isbn);
      }
      setPrestamos(result);
    } catch {
      setError('Error al buscar préstamos');
    } finally {
      setLoading(false);
    }
  };

  const handleDevolver = async (id: number) => {
    try {
      await prestamoService.devolver(id);
      setSuccess('Préstamo devuelto correctamente');
      setPrestamos((prev) => prev.map((p) => p.id === id ? { ...p, estadoPrestamo: 'DEVUELTO' as const } : p));
    } catch {
      setError('Error al devolver préstamo');
    }
  };

  const columns: Column<Prestamo>[] = [
    { key: 'id', header: 'ID' },
    { key: 'nombreUsuario', header: 'Usuario' },
    { key: 'codigoEjemplar', header: 'Ejemplar' },
    { key: 'tituloLibro', header: 'Libro' },
    { key: 'fechaPrestamo', header: 'Fecha Préstamo' },
    { key: 'fechaDevolucion', header: 'Fecha Devolución' },
    {
      key: 'estadoPrestamo', header: 'Estado', render: (p) => {
        const color = p.estadoPrestamo === 'ACTIVO' ? '#0d6efd' : p.estadoPrestamo === 'DEVUELTO' ? '#198754' : '#dc3545';
        return <span style={{ color, fontWeight: 600 }}>{p.estadoPrestamo}</span>;
      },
    },
    {
      key: 'acciones', header: 'Acciones', render: (p) => (
        p.estadoPrestamo === 'ACTIVO' ? <Button onClick={() => handleDevolver(p.id)}>Devolver</Button> : <span style={{ color: '#999' }}>—</span>
      ),
    },
  ];

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Listar Préstamos</h2>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <div className={styles.searchRow}>
        <div className={styles.searchMode}>
          <label>
            <input type="radio" checked={mode === 'usuario'} onChange={() => { setMode('usuario'); setSearchDone(false); }} /> Por Usuario
          </label>
          <label>
            <input type="radio" checked={mode === 'libro'} onChange={() => { setMode('libro'); setSearchDone(false); }} /> Por Libro
          </label>
        </div>
        <div className={styles.searchFields}>
          {mode === 'usuario' ? (
            <div style={{ flex: 1, maxWidth: 320 }}>
              <SearchableSelect
                options={usuarioOptions}
                value={usuarioId}
                onChange={setUsuarioId}
                placeholder="Buscar usuario..."
              />
            </div>
          ) : (
            <div style={{ flex: 1, maxWidth: 320 }}>
              <SearchableSelect
                options={libroOptions}
                value={libroId}
                onChange={setLibroId}
                placeholder="Buscar libro por título o ISBN..."
              />
            </div>
          )}
          <Button onClick={handleSearch}>Buscar</Button>
        </div>
      </div>

      {loading ? <Loading /> : searchDone && <Table columns={columns} data={prestamos} emptyMessage="No se encontraron préstamos" />}
    </div>
  );
}
