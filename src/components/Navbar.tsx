import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <span className={styles.logo}>Library</span>
      <div className={styles.links}>
        <NavLink to="/usuarios" className={({ isActive }) => isActive ? styles.active : ''}>
          Usuarios
        </NavLink>
        <NavLink to="/libros" className={({ isActive }) => isActive ? styles.active : ''}>
          Libros
        </NavLink>
        <NavLink to="/prestamos" className={({ isActive }) => isActive ? styles.active : ''}>
          Préstamos
        </NavLink>
      </div>
    </nav>
  );
}
