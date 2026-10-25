import { useEffect } from 'react';
import './styles.css';
import './styles/daisy.css';
import './styles/heritage.css';
import VerandaBasant from './designs/VerandaBasant';

export default function App() {
  useEffect(() => {
    if (window.location.pathname !== '/') window.history.replaceState(null, '', '/');
  }, []);

  return <VerandaBasant />;
}
