import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Edit3, Loader2, Plus, Trash2, AlertTriangle } from 'lucide-react'
import type { ResourceConfig } from '../app/resources'
import { bulkDeleteResource, deleteResource, listResource } from '../services/api'
import { DeleteConfirmDialog, itemLabel, TableCell } from './ResourceShared'


export default function ResourceListPage({ config }: { config: ResourceConfig }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const ITEMS_PER_PAGE = config.api === 'categories' ? 100 : 20
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
    queryKey: ['resource', config.api, currentPage],
    queryFn: () => listResource(config.api, currentPage, ITEMS_PER_PAGE),
  })

  const items = data?.items || []

  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [config.api])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [currentPage])

  const totalItems = data?.total ?? items.length
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  const [deleteError, setDeleteError] = useState('')

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteResource(config.api, id),
    onSuccess: () => {
      setDeleteTarget(null)
      setDeleteError('')
      setSelectedIds(new Set())
      setSuccessMsg(`${config.title} deleted successfully.`)
      queryClient.invalidateQueries({ queryKey: ['resource', config.api] })
    },
    onError: (err: Error) => {
      setDeleteTarget(null)
      setDeleteError(err.message || 'Failed to delete. Please try again.')
      setTimeout(() => setDeleteError(''), 6000)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => bulkDeleteResource(config.api, ids),
    onSuccess: (result) => {
      setBulkDeleteConfirm(false)
      setSelectedIds(new Set())
      setDeleteError('')
      const deletedCount = result.succeeded.length
      if (result.failed > 0) {
        setSuccessMsg(`Deleted ${deletedCount} ${config.title}. ${result.failed} failed.`)
        if (result.failed === result.succeeded.length + result.failed) {
          setDeleteError('Selected items could not be found in the database. Try refreshing the list.')
        } else {
          setDeleteError(`${result.failed} item(s) failed to delete.`)
        }
        setTimeout(() => setDeleteError(''), 8000)
      } else {
        setSuccessMsg(`${deletedCount} ${config.title} deleted successfully.`)
      }
      queryClient.invalidateQueries({ queryKey: ['resource', config.api] })
    },
    onError: (err: Error) => {
      setBulkDeleteConfirm(false)
      setDeleteError(err.message || 'Failed to delete selected items.')
      setTimeout(() => setDeleteError(''), 6000)
    },
  })

  const visibleColumns = useMemo(() => config.columns, [config.columns])

  const basePath = config.path.replace('/', '')

  const allSelected = items.length > 0 && items.every((item: any) => selectedIds.has(item.id))

  const toggleSelect = (id: string | number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((item: any) => item.id)))
    }
  }

  const selectedCount = selectedIds.size

  return (
    <div className="space-y-6">
      {/* ─── Page Header ──────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {config.eyebrow}
            </p>
            <h1 className="mt-1 flex items-center gap-3 font-black text-2xl text-[#1F080D] tracking-tight md:text-3xl font-serif">
              <config.Icon className="h-6 w-6 text-[#6B1A2A] md:h-7 md:w-7" />
              {config.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!config.hideActions && selectedCount > 0 && (
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={bulkDeleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 disabled:opacity-50"
              >
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Selected ({selectedCount})
              </button>
            )}
            {!config.hideAddNew && (
              <button
                type="button"
                onClick={() => navigate(`/${basePath}/new`)}
                className="admin-btn-primary"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Add New {config.title}
              </button>
            )}
          </div>
        </div>

        {/* Success toast */}
        {successMsg ? (
          <div className="admin-toast mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        ) : null}

        {deleteError ? (
          <div className="admin-toast mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {deleteError}
          </div>
        ) : null}
      </section>

      {/* ─── Data Table ───────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#EFE8DA] space-y-4">
        {/* Record count bar */}
        {!isLoading && items.length > 0 ? (
          <div className="pb-2 flex justify-between items-center border-b border-[#EFE8DA]">
            <p className="text-xs font-semibold text-[#7A6065]">
              Showing{' '}
              <span className="font-bold text-[#1F080D]">
                {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}
              </span>
              {' '}to{' '}
              <span className="font-bold text-[#1F080D]">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </span>
              {' '}of{' '}
              <span className="font-bold text-[#1F080D]">{totalItems}</span>{' '}
              {totalItems === 1 ? 'record' : 'records'}
            </p>
            {!config.hideActions && selectedCount > 0 && (
              <p className="text-xs font-bold text-[#6B1A2A] bg-[#FBF7F8] border border-[#6B1A2A]/20 px-3 py-1 rounded-full">
                {selectedCount} selected
              </p>
            )}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                {!config.hideActions && (
                  <th className="w-12 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-[#EFE8DA] text-[#6B1A2A] focus:ring-[#6B1A2A]/20 cursor-pointer"
                      aria-label="Select all"
                    />
                  </th>
                )}
                {!config.hideSerialNumber && (
                  <th className="px-5 py-3.5 font-bold">S.No</th>
                )}
                {visibleColumns.map(column => (
                  <th key={column} className="px-5 py-3.5 font-bold">
                    {column}
                  </th>
                ))}
                {!config.hideActions && (
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DA]">
              {items.map((item: any, idx: number) => (
                <tr
                  key={item.id ?? item.code ?? Math.random()}
                  className={`hover:bg-[#FAF6EE]/70 transition-colors ${
                    selectedIds.has(item.id) ? 'bg-[#FAF4E8]' : ''
                  }`}
                >
                  {!config.hideActions && (
                    <td className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="h-4 w-4 rounded border-[#EFE8DA] text-[#6B1A2A] focus:ring-[#6B1A2A]/20 cursor-pointer"
                        aria-label={`Select ${itemLabel(item)}`}
                      />
                    </td>
                  )}
                  {!config.hideSerialNumber && (
                    <td className="px-5 py-4 font-bold text-[#7A6065] text-xs">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  )}
                  {visibleColumns.map(column => (
                    <TableCell key={column} column={column} item={item} items={data?.items} />
                  ))}
                  {!config.hideActions && (
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/${basePath}/edit/${item.id}`, { state: { item } })
                          }
                          className="p-2 text-[#7A6065] hover:text-[#6B1A2A] rounded-lg hover:bg-[#FBF7F8] transition-colors"
                          aria-label={`Edit ${itemLabel(item)}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-[#7A6065] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                          aria-label={`Delete ${itemLabel(item)}`}
                        >
                          {deleteMutation.isPending && deleteTarget?.id === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {/* Empty state */}
              {!items.length && !isLoading ? (
                <tr>
                  <td
                    colSpan={(config.hideActions ? 0 : 1) + (config.hideSerialNumber ? 0 : 1) + visibleColumns.length + (config.hideActions ? 0 : 1)}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBF7F8] text-[#6B1A2A] border border-[#D9B86E]/40">
                        <config.Icon className="h-7 w-7" />
                      </div>
                      <p className="text-sm font-bold text-[#1F080D]">
                        No {config.title.toLowerCase()} found
                      </p>
                      {!config.hideAddNew && (
                        <button
                          type="button"
                          onClick={() => navigate(`/${basePath}/new`)}
                          className="admin-btn-primary !text-xs !py-2 !px-4"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[3]" />
                          Create First Entry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 ? (
          <div className="flex items-center justify-between pt-4 border-t border-[#EFE8DA]">
            <p className="text-xs font-semibold text-[#7A6065]">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-[#EFE8DA] text-[#1F080D] disabled:opacity-40 hover:bg-[#FAF6EE] transition-colors"
              >
                <ChevronLeft className="h-4 w-4 inline mr-1" />
                Prev
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-[#EFE8DA] text-[#1F080D] disabled:opacity-40 hover:bg-[#FAF6EE] transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 inline ml-1" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[#6B1A2A]" />
            <p className="text-sm font-semibold text-[#7A6065]">
              Loading {config.title.toLowerCase()}…
            </p>
          </div>
        ) : null}
      </section>

      {/* ─── Single Delete Confirmation ───────────────────── */}
      {deleteTarget ? (
        <DeleteConfirmDialog
          resourceLabel={config.title}
          itemLabel={itemLabel(deleteTarget)}
          pending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id as string | number)}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}

      {/* ─── Bulk Delete Confirmation ─────────────────────── */}
      {bulkDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--burgundy)]">
                  Delete {config.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Are you sure you want to delete{' '}
                  <strong className="text-[var(--text)]">{selectedCount} {config.title.toLowerCase()}</strong>?
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
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {bulkDeleteMutation.isPending ? 'Deleting…' : `Delete ${selectedCount} items`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
