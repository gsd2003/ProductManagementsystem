import 'bootstrap/dist/css/bootstrap.min.css';
import{Routes,Route} from 'react-router-dom';
import Dashboard from '../components/Dashboard.jsx';
import Login from '../components/Login.jsx';
import SearchProductCatlog from '../components/SearchProductCatlog.jsx';
import SearchbyNameDesc from '../components/SearchbyNameDesc.jsx';

export default function App() {
  return(
    <>

    <Routes>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/' element={<Login/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/search' element={<SearchProductCatlog/>}/>
      <Route path='/searchbyname' element={<SearchbyNameDesc/>}/>
    </Routes>
    </>
 
  );
}