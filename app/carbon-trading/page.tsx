"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Activity, Send, Download, Box, Link as LinkIcon, CheckCircle2, Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import { Navigation } from "@/components/navigation"

type Transaction = {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  type: "EARNED" | "SENT" | "RECEIVED";
  userId: string;
  amount: number;
  activity?: string;
  recipient?: string;
  sender?: string;
  status: "CONFIRMED";
}

const EARN_INFO = {
  description: "Whenever you manually log an activity in the Carbon Calculator, you automatically mine and earn 1 CCCT.",
  exchangeRate: "1000 CCCT = ₹1 INR (1 re)",
  future: "CCCT can be traded, converted into Carbon Coin crypto, or exchanged instead of money!"
};

export default function CarbonTrading() {
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState(0)
  const [walletAddress, setWalletAddress] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  const [loading, setLoading] = useState(true)
  const [mining, setMining] = useState(false)
  const [miningMessage, setMiningMessage] = useState("")
  const [toast, setToast] = useState<{message: string, isError: boolean} | null>(null)

  const [tradeForm, setTradeForm] = useState({ recipient: "", amount: "" })

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        fetchLedger(user.id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [])

  const fetchLedger = async (userId: string) => {
    try {
      const res = await fetch(`/api/carbon-trading/ledger?userId=${userId}`, { cache: "no-store" })
      const data = await res.json()
      if (data.success) {
        setBalance(data.balance)
        setWalletAddress(data.walletAddress)
        setTransactions(data.transactions)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError })
    setTimeout(() => setToast(null), 5000)
  }

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const amountNum = parseInt(tradeForm.amount)
    if (!tradeForm.recipient || isNaN(amountNum) || amountNum <= 0) {
      showToast("Invalid inputs", true)
      return
    }

    setMining(true)
    setMiningMessage("Executing Smart Contract transfer...")
    
    // Simulate mining delay
    await new Promise(r => setTimeout(r, 1000))

    try {
      const res = await fetch('/api/carbon-trading/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderId: user.id, 
          recipientId: tradeForm.recipient, 
          amount: amountNum 
        })
      })
      const data = await res.json()
      
      if (data.success) {
        showToast(`Trade Successful! TX: ${data.txHash}`)
        setTradeForm({ recipient: "", amount: "" })
        fetchLedger(user.id)
      } else {
        showToast(data.message, true)
      }
    } catch (e) {
      showToast("Network error", true)
    } finally {
      setMining(false)
    }
  }

  const totalEarned = transactions.filter(t => t.type === "EARNED" || t.type === "RECEIVED").reduce((acc, t) => acc + t.amount, 0)
  const totalSpent = transactions.filter(t => t.type === "SENT").reduce((acc, t) => acc + t.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#22c55e]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-md text-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <AlertCircle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-slate-400">Please sign in to access your Web3 Carbon Wallet.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-12 flex flex-col">
      <Navigation />
      {/* Top Stats Bar */}
      <div className="bg-[#0f172a] border-b border-slate-800 py-2 px-4 shadow-[0_4px_15px_rgba(0,0,0,0.5)] z-10 sticky top-16 md:top-0 text-xs font-mono flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400">
        <div className="flex items-center gap-1"><Box className="w-3 h-3 text-[#22c55e]" /> Total Blocks Mined: {transactions.length > 0 ? transactions[0].blockNumber : 1000000}</div>
        <div className="flex items-center gap-1"><LinkIcon className="w-3 h-3 text-blue-400" /> Network: CarbonChain Testnet</div>
        <div className="flex items-center gap-1">⛽ Gas Fee: 0 GWEI (Green Network)</div>
        <div className="flex items-center gap-1">🤝 Consensus: Proof of Green Activity</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Header & Balance */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-[#22c55e] to-emerald-300 bg-clip-text text-transparent">
              Carbon Trading ⛓️
            </h1>
            <p className="text-slate-400 mt-2">Earn, trade, and offset using the secure CarbonChain.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 min-w-[280px] shadow-[0_0_20px_rgba(34,197,94,0.15)] rounded-2xl border-l-[4px] border-l-[#22c55e]">
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Current Balance</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{balance}</span>
              <span className="text-xl text-[#22c55e] font-bold">CCCT</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Wallet & Trade */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-[0_0_25px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-300">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Box className="text-[#22c55e]" /> My Blockchain Wallet
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Your User ID</p>
                  <p className="font-mono text-sm bg-black/40 p-2 rounded text-blue-400 break-all border border-blue-400/30">
                    {user.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Wallet Address</p>
                  <p className="font-mono text-sm bg-black/40 p-2 rounded text-[#22c55e] break-all border border-[#22c55e]/30">
                    {walletAddress || "0x0000000000000000000000000000000000000000"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-3 rounded border border-slate-700/50">
                    <p className="text-xs text-slate-400">Total Earned</p>
                    <p className="font-bold text-lg text-emerald-400 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> {totalEarned}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded border border-slate-700/50">
                    <p className="text-xs text-slate-400">Total Spent/Traded</p>
                    <p className="font-bold text-lg text-[#ef4444] flex items-center gap-1"><TrendingDown className="w-4 h-4"/> {totalSpent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Credits Form */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Send className="text-blue-400" /> Trade Credits
              </h2>
              
              <form onSubmit={handleTrade} className="space-y-4 z-10 relative">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Recipient ID / Address</label>
                  <input 
                    type="text" 
                    required
                    value={tradeForm.recipient}
                    onChange={e => setTradeForm({...tradeForm, recipient: e.target.value})}
                    placeholder="Enter User ID..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-200 transition-all placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Amount (CCCT)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max="500"
                    value={tradeForm.amount}
                    onChange={e => setTradeForm({...tradeForm, amount: e.target.value})}
                    placeholder="0" 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 font-mono text-xl font-bold text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
                  />
                </div>
                
                {/* Real-time Validation UI */}
                <div className="bg-black/40 rounded-lg p-3 text-xs space-y-1">
                  <div className={`flex items-center gap-2 ${balance >= parseInt(tradeForm.amount || "0") ? 'text-[#22c55e]' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Sufficient balance
                  </div>
                  <div className={`flex items-center gap-2 ${parseInt(tradeForm.amount || "0") > 0 ? 'text-[#22c55e]' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Amount {'>'} 0
                  </div>
                  <div className={`flex items-center gap-2 ${tradeForm.recipient.length > 3 ? 'text-[#22c55e]' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Recipient added
                  </div>
                </div>

                <button 
                  disabled={mining}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mining ? <><Loader2 className="w-5 h-5 animate-spin"/> Mining...</> : "Execute Trade 🚀"}
                </button>
              </form>

              {/* Smart Contract Snippet */}
              <div className="mt-8">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Smart Contract Logic</p>
                <div className="bg-[#050505] p-3 rounded-xl border border-slate-800/80 font-mono text-[10px] text-slate-400 overflow-x-auto custom-scrollbar">
<pre>{`contract CCCT {
  mapping(address => uint) public bals;
  function transfer(address to, uint256 amt) public {
    require(bals[msg.sender] >= amt, "Funds");
    require(amt > 0, "Zero");
    bals[msg.sender] -= amt;
    bals[to] += amt;
    emit Tx(msg.sender, to, amt);
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Earn & Recent Transactions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Earn Information Block */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/80 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-amber-400" /> How to Earn CCCT
              </h2>
              <div className="space-y-4 relative z-10">
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-slate-200">{EARN_INFO.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                     <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Exchange Rate</p>
                     <p className="text-[#22c55e] font-mono text-lg font-bold">{EARN_INFO.exchangeRate}</p>
                  </div>
                  <div className="bg-black/40 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-center text-center">
                     <p className="text-slate-400 text-xs mb-1 font-medium">{EARN_INFO.future}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/80 p-6 backdrop-blur-sm">
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <LinkIcon className="text-slate-400" /> Recent Blocks
              </h2>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 font-mono text-sm">No transactions yet. Start mining!</div>
                ) : (
                  transactions.slice(0,10).map((tx, i) => (
                    <div key={i} className="flex items-stretch gap-3">
                      {/* Visual Blockchain connection */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded bg-slate-800 border border-slate-600 flex items-center justify-center font-mono text-[10px] text-slate-400" title={`Block #${tx.blockNumber}`}>
                          {tx.blockNumber.toString().slice(-3)}
                        </div>
                        {i !== Math.min(transactions.length, 10) - 1 && (
                          <div className="w-0.5 h-full bg-slate-700 my-1"></div>
                        )}
                      </div>
                      
                      {/* TX Details Card */}
                      <div className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {tx.type === "EARNED" || tx.type === "RECEIVED" ? (
                              <span className="bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{tx.type}</span>
                            ) : (
                              <span className="bg-[#ef4444]/20 text-[#ef4444] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{tx.type}</span>
                            )}
                            <span className="bg-black/50 text-slate-400 font-mono text-xs px-2 py-0.5 rounded border border-slate-800">{tx.txHash}</span>
                            <span className="flex items-center gap-1 text-[#22c55e] text-xs font-medium ml-2"><CheckCircle2 className="w-3 h-3"/> CONFIRMED</span>
                          </div>
                          <p className="text-sm text-slate-300">
                            {tx.activity || (tx.type === "SENT" ? `To: ${tx.recipient}` : `From: ${tx.sender}`)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 font-mono">{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                        <div className={`font-mono font-bold text-xl ${tx.type === "EARNED" || tx.type === "RECEIVED" ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                          {tx.type === "EARNED" || tx.type === "RECEIVED" ? '+' : '-'}{tx.amount} CCCT
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Global Mining Overlay & Toasts */}
      {mining && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-[#22c55e]/50 p-8 rounded-2xl flex flex-col items-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <Box className="w-16 h-16 text-[#22c55e] animate-pulse mb-4" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#22c55e] to-emerald-300 bg-clip-text text-transparent mb-2">Mining in Progress...</h3>
            <p className="text-slate-400 font-mono text-sm">{miningMessage}</p>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl text-white font-mono shadow-2xl z-50 flex items-center gap-3 border ${toast.isError ? 'bg-red-900 border-red-500' : 'bg-green-900 border-green-500'}`}>
          {toast.isError ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
          {toast.message}
        </div>
      )}

    </div>
  )
}
