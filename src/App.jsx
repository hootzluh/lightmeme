import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import CreateToken from "./pages/CreateToken"
import LaunchPresale from "./pages/LaunchPresale"
import Community from "./pages/Community"
import HomePage from "./pages/HomePage"
import Profile from "./pages/Profile"
import BuySell from "./pages/BuySell"
import SendReceive from "./pages/SendReceive"
import Stake from "./pages/Stake"
import AccountSettings from "./pages/AccountSettings"
import Notifications from "./pages/Notifications"
import Security from "./pages/Security"
import Preferences from "./pages/Preferences"
import TokenManagement from "./pages/TokenManagement"
import LiveChat from "./pages/LiveChat"
import DirectChat from "./pages/DirectChat"
import LiveStream from "./pages/LiveStream"
import Marketplace from "./pages/Marketplace"
import LiquidityPools from "./pages/LiquidityPools"
import './styles/global.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-token" element={<CreateToken />} />
        <Route path="/launch-presale" element={<LaunchPresale />} />
        <Route path="/analytics" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/buy-sell" element={<BuySell />} />
        <Route path="/send-receive" element={<SendReceive />} />
        <Route path="/stake" element={<Stake />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/security" element={<Security />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/token-management" element={<TokenManagement />} />
        <Route path="/live-chat" element={<LiveChat />} />
        <Route path="/direct-chat" element={<DirectChat />} />
        <Route path="/live-stream" element={<LiveStream />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/liquidity-pools" element={<LiquidityPools />} />
      </Routes>
    </Router>
  )
}

export default App
