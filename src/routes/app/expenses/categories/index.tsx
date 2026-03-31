import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { ArrowLeftIcon, EditIcon, PlusIcon, TrashIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type Category = {
  id: string
  name: string
  description: string | null
  color: string | null
  expenseCount: number
}

type CategoryFormState = {
  name: string
  description: string
  color: string
}

const emptyCategoryForm: CategoryFormState = {
  name: "",
  description: "",
  color: "#64748b",
}

export const Route = createFileRoute("/app/expenses/categories/")({
  component: ExpenseCategoriesPage,
})

function ExpenseCategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [isSaving, setIsSaving] = useState(false)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/expenses/categories")
      if (!response.ok) {
        throw new Error("Failed to load categories")
      }

      const data = (await response.json()) as { items: Category[] }
      setItems(data.items)
    } catch {
      setError("Could not load categories. Please refresh and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  const openCreateSheet = () => {
    setEditingCategoryId(null)
    setForm(emptyCategoryForm)
    setIsSheetOpen(true)
  }

  const openEditSheet = (item: Category) => {
    setEditingCategoryId(item.id)
    setForm({
      name: item.name,
      description: item.description ?? "",
      color: item.color ?? "#64748b",
    })
    setIsSheetOpen(true)
  }

  const closeSheet = () => {
    if (isSaving) {
      return
    }
    setIsSheetOpen(false)
  }

  const submitCategory = async () => {
    if (!form.name.trim()) {
      setError("Category name is required.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        color: form.color || undefined,
      }

      const response = await fetch(
        editingCategoryId
          ? `/api/expenses/categories/${editingCategoryId}`
          : "/api/expenses/categories",
        {
          method: editingCategoryId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? "Failed to save category")
      }

      await fetchCategories()
      setIsSheetOpen(false)
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save category"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteCategory = async (id: string) => {
    setError(null)

    const response = await fetch(`/api/expenses/categories/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      setError("Failed to delete category")
      return
    }

    await fetchCategories()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expense categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize expenses and improve reporting quality.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/app/expenses">
              <ArrowLeftIcon className="size-4" />
              Back to expenses
            </Link>
          </Button>
          <Button onClick={openCreateSheet}>
            <PlusIcon className="size-4" />
            New category
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category list</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-sm text-destructive mb-3">{error}</p> : null}
          {isLoading ? <p className="text-sm text-muted-foreground">Loading categories...</p> : null}

          {!isLoading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : null}

          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Expense count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{category.name}</span>
                        {category.description ? (
                          <span className="text-sm text-muted-foreground">{category.description}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.color ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: category.color,
                            color: category.color,
                          }}
                        >
                          {category.color}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>{category.expenseCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditSheet(category)}>
                          <EditIcon className="size-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void deleteCategory(category.id)}
                        >
                          <TrashIcon className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
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
            <SheetTitle>{editingCategoryId ? "Edit category" : "New category"}</SheetTitle>
            <SheetDescription>
              Use strong color separation to improve visual scanning in the expense table.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 px-4 pb-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="category-name">
                Name
              </label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="category-description">
                Description
              </label>
              <Input
                id="category-description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="category-color">
                Color
              </label>
              <Input
                id="category-color"
                type="color"
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={closeSheet} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => void submitCategory()} disabled={isSaving}>
              {isSaving ? "Saving..." : editingCategoryId ? "Save changes" : "Create category"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
