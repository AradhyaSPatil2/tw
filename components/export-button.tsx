"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportButtonProps {
  data: any[]
  filename: string
  headers: string[]
  className?: string
}

export default function ExportButton({ data, filename, headers, className }: ExportButtonProps) {
  const exportToCSV = () => {
    if (data.length === 0) {
      alert("No data to export")
      return
    }

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = getNestedValue(row, header)
            // Escape commas and quotes in values
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value || ""
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  return (
    <Button
      onClick={exportToCSV}
      variant="outline"
      className={`border-[#008dd2] text-[#008dd2] hover:bg-[#008dd2] hover:text-white ${className}`}
    >
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
