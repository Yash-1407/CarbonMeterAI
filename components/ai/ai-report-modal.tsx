"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Loader2, Download, CheckCircle2 } from "lucide-react"

export function AIReportModal() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generateReport = async () => {
    setLoading(true)
    setError("")
    setReport(null)
    
    try {
      const res = await fetch("/api/ai/report")
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch report")
      setReport(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!report) return
    
    const categoriesText = report.categoryAnalysis?.map((c: any) => "* " + c.category + ": " + c.analysis).join("\n") || "";
    const recsText = report.topRecommendations?.map((r: string) => "- " + r).join("\n") || "";
    const actionText = report.actionPlan30Days?.map((a: string) => "- " + a).join("\n") || "";

    const content = "CarbonMeter AI Report\n" +
      "=====================\n\n" +
      "Executive Summary\n" +
      "-----------------\n" +
      report.executiveSummary + "\n\n" +
      "Category Analysis\n" +
      "-----------------\n" +
      categoriesText + "\n\n" +
      "Comparison\n" +
      "----------\n" +
      report.comparison + "\n\n" +
      "Top Recommendations\n" +
      "-------------------\n" +
      recsText + "\n\n" +
      "30-Day Action Plan\n" +
      "------------------\n" +
      actionText;

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "CarbonMeter_AI_Report.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
          <FileText className="mr-2 h-4 w-4" />
          Generate My Report
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="p-6 bg-white border-b">
          <DialogTitle className="text-2xl font-bold flex justify-between items-center text-slate-800">
            Intelligent Carbon Report
            {report && (
              <Button variant="outline" size="sm" onClick={downloadReport} className="ml-auto flex items-center gap-2">
                <Download className="h-4 w-4" /> Download .txt
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {!report && !loading && !error && (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700">Ready to analyze your footprint?</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                Our AI will review all your past entries to generate a comprehensive, personalized sustainability report.
              </p>
              <Button size="lg" onClick={generateReport} className="bg-blue-600 hover:bg-blue-700 text-white">
                Generate Report Now
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-slate-600 font-medium animate-pulse">Analyzing footprint history...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20 border border-red-200 bg-red-50 rounded-lg text-red-600">
              <p>Error generating report: {error}</p>
              <Button variant="outline" className="mt-4" onClick={() => setError("")}>Try Again</Button>
            </div>
          )}

          {report && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 border-b pb-2">Executive Summary</h3>
                <p className="text-slate-700 leading-relaxed">{report.executiveSummary}</p>
              </section>

              <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 border-b pb-2">Category Breakdown</h3>
                <div className="space-y-4 mt-4">
                  {report.categoryAnalysis?.map((c: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg font-semibold min-w-32 text-center uppercase text-xs tracking-wider">
                        {c.category}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{c.analysis}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-semibold mb-3 text-blue-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Top Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {report.topRecommendations?.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-blue-800 flex gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-semibold mb-3 text-emerald-900">30-Day Action Plan</h3>
                  <div className="space-y-3">
                    {report.actionPlan30Days?.map((plan: string, i: number) => (
                      <div key={i} className="flex gap-3 text-sm items-center border-l-2 border-emerald-400 pl-3 py-1">
                        <span className="font-medium text-slate-700">Week {i+1}:</span>
                        <span className="text-slate-600">{plan}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              
              <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Global Comparison</h3>
                <p className="text-slate-700 font-medium italic">"{report.comparison}"</p>
              </section>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
