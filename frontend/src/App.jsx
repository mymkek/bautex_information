import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/login/Login.jsx';
import Information from './pages/information/Information.jsx';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/information" element={<Information />} />
        </Routes>
    );
}
