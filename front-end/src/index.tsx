import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import "index.css"
import * as serviceWorker from "shared/helpers/service-worker"
import StaffApp from "staff-app/app"
import { GlobalStyle } from "shared/styles/global-style"
import { StudentContextProvider } from "contexts/student-context"

const Home: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <p>Engineering Test</p>
        <Link to="staff/daily-care">Staff</Link>
      </header>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <StudentContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home>Engineering Test</Home>} />
          <Route path="staff/*" element={<StaffApp />} />
        </Routes>
      </BrowserRouter>
    </StudentContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
)

serviceWorker.register()
