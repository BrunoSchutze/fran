import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/Login'
import AdminDashboard from './Pages/AdminDashboard'
import CustomerExperience from './Pages/CustomerExperience'


export default function App(){
return (
<Routes>
<Route path="/" element={<Login/>} />
<Route path="/dashboard" element={<AdminDashboard/>} />
<Route path="/sucursal/:code/experience" element={<CustomerExperience/>} />
<Route path="*" element={<Navigate to="/" replace/>} />
</Routes>
)
}