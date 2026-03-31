import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { EditIcon, PlusIcon, TagsIcon, TrashIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

type Category = {
  id: string
  name: string
  description: string | null
  color: string | null
  expenseCount: number
}

type Expense = {
  id: string
  title: string
  amount: number
  currency: string
  date: string
  note: string | null
  categoryId: string | null
  categoryName: string | null
  categoryColor: string | null
}

type ExpenseFormState = {
  title: string
  amount: string
  currency: string
  date: string
  note: string
  categoryId: string
}

const emptyExpenseForm: ExpenseFormState = {
  title: "",
  amount: "",
  currency: "CZK",
  date: new Date().toISOString().slice(0, 10),
  note: "",
  categoryId: "none",
}

export const Route = createFileRoute("/app/expenses/")({
  component: ExpensesPage,
})

function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategoryId, setSelectedCategoryId] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [form, setForm] = useState<ExpenseFormState>(emptyExpenseForm)
  const [isSaving, setIsSaving] = useState(false)

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/expenses/categories")
    if (!response.ok) {
      throw new Error("Failed to load categories")
    }

    const data = (await response.json()) as { items: Category[] }
    setCategories(data.items)
  }, [])

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const params = new URLSearchParams()

    if (selectedCategoryId !== "all") {
      params.set("categoryId", selectedCategoryId)
    }
    if (fromDate) {
      params.set("from", fromDate)
    }
    if (toDate) {
      params.set("to", toDate)
    }

    try {
      const response = await fetch(`/api/expenses?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to load expenses")
      }

      const data = (await response.json()) as { items: Expense[] }
      setItems(data.items)
    } catch {
      setError("Could not load expenses. Please refresh and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, selectedCategoryId, toDate])

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    void fetchExpenses()
  }, [fetchExpenses])

  const monthlyTotal = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    return items
      .filter((item) => {
        const expenseDate = new Date(item.date)
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
      })
      .reduce((sum, item) => sum + item.amount, 0)
  }, [items])

  const openCreateSheet = () => {
    setEditingExpenseId(null)
    setForm(emptyExpenseForm)
    setIsSheetOpen(true)
  }

  const openEditSheet = (item: Expense) => {
    setEditingExpenseId(item.id)
    setForm({
      title: item.title,
      amount: String(item.amount),
      currency: item.currency,
      date: item.date.slice(0, 10),
      note: item.note ?? "",
      categoryId: item.categoryId ?? "none",
    })
    setIsSheetOpen(true)
  }

  const closeSheet = () => {
    if (isSaving) {
      return
    }
    setIsSheetOpen(false)
  }

  const submitExpense = async () => {
    if (!form.title || !form.amount || !form.date) {
      setError("Title, amount and date are required.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        currency: form.currency,
        date: form.date,
        note: form.note || undefined,
        categoryId: form.categoryId === "none" ? null : form.categoryId,
      }

      const response = await fetch(
        editingExpenseId ? `/api/expenses/${editingExpenseId}` : "/api/expenses",
        {
          method: editingExpenseId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? "Failed to save expense")
      }

      await fetchExpenses()
      setIsSheetOpen(false)
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save expense"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteExpense = async (id: string) => {
    setError(null)

    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
    if (!response.ok) {
      setError("Failed to delete expense")
      return
    }

    await fetchExpenses()
    await fetchCategories()
  }

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString("cs-CZ"),
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => {
        if (!row.original.categoryName) {
          return <span className="text-muted-foreground">Uncategorized</span>
        }

        return (
          <Badge
            variant="outline"
            style={
              row.original.categoryColor
                ? {
                    borderColor: row.original.categoryColor,
                    color: row.original.categoryColor,
                  }
                : undefined
            }
          >
            {row.original.categoryName}
          </Badge>
        )
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        new Intl.NumberFormat("cs-CZ", {
          style: "currency",
          currency: row.original.currency,
        }).format(row.original.amount / 100),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditSheet(row.original)}>
            <EditIcon className="size-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void deleteExpense(row.original.id)}>
            <TrashIcon className="size-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track operational expenses and keep your profitability model accurate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/app/expenses/categories">
              <TagsIcon className="size-4" />
              Categories
            </Link>
          </Button>
          <Button onClick={openCreateSheet}>
            <PlusIcon className="size-4" />
            New Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">This month total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">
            {new Intl.NumberFormat("cs-CZ", {
              style: "currency",
              currency: "CZK",
            }).format(monthlyTotal / 100)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void fetchExpenses()}>
              Apply filters
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCategoryId("all")
                setFromDate("")
                setToDate("")
              }}
            >
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-sm text-destructive mb-3">{error}</p> : null}
          {isLoading ? <p className="text-sm text-muted-foreground">Loading expenses...</p> : null}

          {!isLoading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet. Create your first one.</p>
          ) : null}

          {items.length > 0 ? (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={(open) => (open ? setIsSheetOpen(true) : closeSheet())}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingExpenseId ? "Edit expense" : "New expense"}</SheetTitle>
            <SheetDescription>
              Store values in haléře/cents to preserve exact totals.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 px-4 pb-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="expense-title">
                Title
              </label>
              <Input
                id="expense-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="expense-amount">
                  Amount (in cents)
                </label>
                <Input
                  id="expense-amount"
                  type="number"
                  min={1}
                  value={form.amount}
                  onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="expense-currency">
                  Currency
                </label>
                <Input
                  id="expense-currency"
                  maxLength={3}
                  value={form.currency}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="expense-date">
                Date
              </label>
              <Input
                id="expense-date"
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={form.categoryId}
                onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="expense-note">
                Note
              </label>
              <Input
                id="expense-note"
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={closeSheet} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => void submitExpense()} disabled={isSaving}>
              {isSaving ? "Saving..." : editingExpenseId ? "Save changes" : "Create expense"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
