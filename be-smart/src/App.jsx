import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import DeleteME                                 from "./pages/DeleteME"
import HomePage                                 from "./pages/HomePage"
import LoginPage                                from "./pages/LoginPage"
import CreateAccount                            from "./pages/CreateAccount"
import MakeReport                               from "./pages/MakeReport";
import ProfilePage                              from "./pages/ProfilePage";
import JobMapPage                               from "./pages/JobMapPage";
import AddGigs                                  from "./pages/AddGigs";
import ProtectedRoute                           from "./components/global-context/Protected_Routes"
import { UserProvider }                         from "./components/global-context/context_provider"

function App() {
  

  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* filler page for now (delete asap) */}
          <Route path="/" element={<HomePage />}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/make-a-report" element={<MakeReport />} />
          <Route path="/your-profile" element={<ProfilePage />} />
          <Route path="/job-map" element={<JobMapPage />} />
          <Route path="/add-gig" element={<AddGigs />} />

          {/* example of using our protected routes */}
          <Route path="/test" element={<ProtectedRoute><DeleteME/></ProtectedRoute>}/>




        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App
