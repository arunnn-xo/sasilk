import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Boxes, ChevronLeft, ChevronRight, Edit3, Loader2, Plus, Trash2 } from 'lucide-react'
import { deleteResource, listResource } from '../services/api'
import { DeleteConfirmDialog, itemLabel, TableCell } from './ResourceShared'

const ITEMS_PER_PAGE = 100

export default function CategoriesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const [successMsg, setSuccessMsg] = useState<string>(
    (location.state as { successMsg?: string } | null)?.successMsg || '',
  )

  useEffect(() => {
    if (successMsg) {
      window.history.replaceState({}, '')
      const timer = setTimeout(() => setSuccessMsg(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['resource', 'categories', currentPage],
    queryFn: () => listResource('categories', currentPage, ITEMS_PER_PAGE),
  })

  const allItems = data?.items || []
  const items = allItems.filter((item: any) => !item.parentId)
  const totalItems = allItems.length
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  const [deleteError, setDeleteError] = useState('')
  const [dialogError, setDialogError] = useState('')

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteResource('categories', id),
    onSuccess: () => {
      setDeleteTarget(null)
      setDeleteError('')
      setDialogError('')
      setSelectedIds(new Set())
      setSuccessMsg('Category deleted successfully.')
      queryClient.invalidateQueries({ queryKey: ['resource', 'categories'] })
      refetch()
    },
    onError: (err: Error) => {
      // Keep dialog open — show error inside it
      setDialogError(err.message || 'Failed to delete this category.')
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => {
      return Promise.allSettled(ids.map(id => deleteResource('categories', id)))
    },
    onSuccess: () => {
      setBulkDeleteConfirm(false)
      setSelectedIds(new Set())
      setSuccessMsg('Selected categories deleted.')
      queryClient.invalidateQueries({ queryKey: ['resource', 'categories'] })
      refetch()
    },
    onError: (err: Error) => {
      setBulkDeleteConfirm(false)
      setDeleteError(err.message)
      setTimeout(() => setDeleteError(''), 6000)
    },
  })

  const columns = ['id', 'name', 'navVisible']
  const allSelected = items.length > 0 && items.every((item: any) => selectedIds.has(item.id))
  const selectedCount = selectedIds.size

  const toggleSelect = (id: string | number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(items.map((item: any) => item.id)))
  }

  return (
    <div className="space-y-6">
      <section className="admin-card rounded-lg p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--burgundy)]">
              Product Categories
            </p>
            <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold text-[var(--gold)] md:text-4xl">
              <Boxes className="h-7 w-7 md:h-8 md:w-8" />
              Categories
            </h1>
          </div>
          <div className="flex gap-2">
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={bulkDeleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Selected ({selectedCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/categories/new')}
              className="admin-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        {deleteError && (
          <div className="mt-4 flex items-center gap-2 rounded border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {deleteError}
          </div>
        )}
      </section>

      <section className="admin-card overflow-hidden rounded-lg">
        {!isLoading && items.length > 0 && (
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
            <p className="text-[14.5px] font-semibold text-[var(--muted)]">
              Showing{' '}
              <span className="text-[var(--text)]">
                {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}
              </span>
              {' '}to{' '}
              <span className="text-[var(--text)]">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </span>
              {' '}of{' '}
              <span className="text-[var(--text)]">{totalItems}</span> records
            </p>
            {selectedCount > 0 && (
              <p className="text-sm font-semibold text-[var(--burgundy)]">{selectedCount} selected</p>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--gold)]" />
            <p className="text-sm font-semibold text-[var(--muted)]">Loading categories...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--burgundy-soft)]">
              <Boxes className="h-7 w-7 text-[var(--burgundy)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--muted)]">No categories found</p>
            <button
              type="button"
              onClick={() => navigate('/categories/new')}
              className="admin-btn-primary !text-xs !py-2 !px-4"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Category
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
                <thead className="bg-[var(--panel-strong)] text-[13.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="w-12 border border-[var(--line)] px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 accent-[#520001] cursor-pointer"
                      />
                    </th>
                    <th className="w-10 border border-[var(--line)] px-2 py-3.5 text-center text-xs font-bold text-[var(--muted)]">S.No</th>
                    {columns.map(col => (
                      <th key={col} className="border border-[var(--line)] px-5 py-3.5 font-bold">{col}</th>
                    ))}
                    <th className="border border-[var(--line)] px-5 py-3.5 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        selectedIds.has(item.id) ? 'bg-[var(--burgundy-soft)]/40' : ''
                      }`}
                    >
                      <td className="w-12 border border-[var(--line)] px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="h-4 w-4 accent-[#520001] cursor-pointer"
                        />
                      </td>
                      <td className="w-10 border border-[var(--line)] px-2 py-4 text-center text-xs font-bold text-[var(--muted)]">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      {columns.map(col => (
                        <TableCell key={col} column={col} item={item} items={data?.items} />
                      ))}
                      <td className="border border-[var(--line)] px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/categories/edit/${item.id}`, { state: { item } })}
                            className="rounded border border-[var(--line)] p-2 text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            disabled={deleteMutation.isPending}
                            className="rounded border border-red-200 p-2 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleteMutation.isPending && deleteTarget?.id === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3.5">
                <p className="text-[13.5px] font-semibold text-[var(--muted)]">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded border border-[var(--line)] px-3 py-1.5 text-[13px] font-bold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)] disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded border border-[var(--line)] px-3 py-1.5 text-[13px] font-bold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)] disabled:opacity-50"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {deleteTarget && (
        <DeleteConfirmDialog
          resourceLabel="Category"
          itemLabel={itemLabel(deleteTarget)}
          pending={deleteMutation.isPending}
          errorMessage={dialogError}
          onConfirm={() => {
            setDialogError('')
            deleteMutation.mutate(deleteTarget.id as string | number)
          }}
          onCancel={() => {
            setDeleteTarget(null)
            setDialogError('')
          }}
        />
      )}

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--burgundy)]">Delete Categories</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Are you sure you want to delete{' '}
                  <strong className="text-[var(--text)]">{selectedCount} categories</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(false)}
                disabled={bulkDeleteMutation.isPending}
                className="rounded border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--burgundy)] transition-colors hover:bg-[var(--gold-soft)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedCount} items`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
