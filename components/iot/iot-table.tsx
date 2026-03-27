"use client"

import React, { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Search, ArrowUpDown } from "lucide-react"
import { EditIoTModal } from "./edit-iot-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteIoTData } from "@/lib/supabase/iot-service"
import { toast } from "sonner"
import { format } from "date-fns"

interface IoTData {
  id: string
  module: string
  transport_type: string | null
  frequency: string | null
  energy_type: string | null
  value: number
  unit: string | null
  created_at: string
}

interface IoTTableProps {
  data: IoTData[]
  onDataChange?: () => void
}

export function IoTTable({ data, onDataChange }: IoTTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<IoTData | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchStr = searchQuery.toLowerCase()
      const typeStr = (item.transport_type || item.energy_type || '').toLowerCase()
      const moduleStr = item.module.toLowerCase()
      const valueStr = item.value.toString()
      
      return moduleStr.includes(searchStr) || typeStr.includes(searchStr) || valueStr.includes(searchStr)
    })
  }, [data, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredData.slice(start, start + rowsPerPage)
  }, [filteredData, currentPage])

  // Handlers
  const handleEdit = (record: IoTData) => {
    setSelectedRecord(record)
    setEditModalOpen(true)
  }

  const handleDeletePrompt = (id: string) => {
    setRecordToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!recordToDelete) return
    setIsDeleting(true)
    try {
      await deleteIoTData(recordToDelete)
      if (onDataChange) onDataChange()
      toast.success("🗑️ Data deleted", { icon: <Trash2 className="w-4 h-4 text-red-500" /> })
      setDeleteDialogOpen(false)
      setRecordToDelete(null)
    } catch (error) {
      toast.error("Failed to delete record")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to page 1 on search
            }}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} records
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No IoT data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{format(new Date(row.created_at), 'PPP')}</TableCell>
                  <TableCell className="capitalize">{row.module}</TableCell>
                  <TableCell>{row.transport_type || row.energy_type || '-'}</TableCell>
                  <TableCell className="font-medium">
                    {row.value} <span className="text-muted-foreground text-xs">{row.unit}</span>
                  </TableCell>
                  <TableCell>{row.frequency || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
                      <Edit2 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePrompt(row.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <EditIoTModal 
        isOpen={editModalOpen} 
        onClose={() => {
          setEditModalOpen(false)
          setSelectedRecord(null)
        }} 
        data={selectedRecord} 
        onDataChange={onDataChange}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your IoT data record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
