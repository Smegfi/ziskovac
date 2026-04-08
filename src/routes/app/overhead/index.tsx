import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, Trash2, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/app/overhead/")({
  component: OverheadPage,
})

interface OverheadCategory {
  id: string
  name: string
  color?: string
}

interface OverheadCost {
  id: string
  categoryId: string
  month: string
  amount: number
  isFixed: boolean
  description?: string
}

function OverheadPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<OverheadCategory[]>([])
  const [costs, setCosts] = useState<OverheadCost[]>([])
  const [monthlySummary, setMonthlySummary] = useState<Record<string, { fixed: number; variable: number; total: number }>>({})

  // Form state
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [showNewCostForm, setShowNewCostForm] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const [newCategory, setNewCategory] = useState({ name: "", color: "#3B82F6" })
  const [newCost, setNewCost] = useState({
    categoryId: "",
    amount: 0,
    isFixed: true,
    description: "",
  })

  // Load overhead categories and costs
  useEffect(() => {
    const load = async () => {
      try {
        const [categoriesRes, costsRes] = await Promise.all([
          fetch("/api/overhead/categories"),
          fetch("/api/overhead/costs"),
        ])

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
          if (data.length > 0 && !newCost.categoryId) {
            setNewCost((prev) => ({ ...prev, categoryId: data[0].id }))
          }
        }

        if (costsRes.ok) {
          const data = await costsRes.json()
          setCosts(data)
          computeMonthlySummary(data)
        }

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load overhead data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Compute monthly summary from costs
  const computeMonthlySummary = (costsList: OverheadCost[]) => {
    const summary: Record<string, { fixed: number; variable: number; total: number }> = {}

    costsList.forEach((cost) => {
      if (!summary[cost.month]) {
        summary[cost.month] = { fixed: 0, variable: 0, total: 0 }
      }

      const amount = typeof cost.amount === "string" ? parseFloat(cost.amount) : cost.amount
      if (cost.isFixed) {
        summary[cost.month].fixed += amount
      } else {
        summary[cost.month].variable += amount
      }
      summary[cost.month].total += amount
    })

    setMonthlySummary(summary)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/overhead/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      if (!res.ok) throw new Error("Failed to create category")

      const category = await res.json()
      setCategories([...categories, category])
      setNewCategory({ name: "", color: "#3B82F6" })
      setShowNewCategoryForm(false)

      // Auto-select the new category
      setNewCost((prev) => ({ ...prev, categoryId: category.id }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category")
    }
  }

  const handleCreateCost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/overhead/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCost,
          month: currentMonth,
          amount: parseFloat(String(newCost.amount)),
        }),
      })

      if (!res.ok) throw new Error("Failed to create cost")

      const cost = await res.json()
      const updatedCosts = [...costs, cost]
      setCosts(updatedCosts)
      computeMonthlySummary(updatedCosts)
      setNewCost({
        categoryId: newCost.categoryId || (categories[0]?.id || ""),
        amount: 0,
        isFixed: true,
        description: "",
      })
      setShowNewCostForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create cost")
    }
  }

  const handleDeleteCost = async (costId: string) => {
    try {
      const res = await fetch(`/api/overhead/costs/${costId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete cost")

      const updatedCosts = costs.filter((c) => c.id !== costId)
      setCosts(updatedCosts)
      computeMonthlySummary(updatedCosts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete cost")
    }
  }

  const monthCosts = costs.filter((c) => c.month === currentMonth)
  const monthSummary = monthlySummary[currentMonth] || { fixed: 0, variable: 0, total: 0 }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overhead Costs</h1>
          <p className="text-gray-500 mt-1">Manage fixed and variable overhead expenses by category</p>
        </div>
        <Button onClick={() => setShowNewCategoryForm(!showNewCategoryForm)} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      {error && (
        <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Add Category Form */}
      {showNewCategoryForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">New Overhead Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., Rent, Software, Salary"
                    required
                  />
                </div>
                <div className="w-20">
                  <Label htmlFor="category-color">Color</Label>
                  <input
                    id="category-color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-full h-10 border rounded cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Category</Button>
                <Button type="button" variant="outline" onClick={() => setShowNewCategoryForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Month</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="w-full md:w-48"
          />
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Fixed Costs</p>
            <p className="text-3xl font-bold text-blue-600">{monthSummary.fixed.toFixed(0)} CZK</p>
            <p className="text-xs text-gray-500 mt-1">Recurring monthly</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Variable Costs</p>
            <p className="text-3xl font-bold text-amber-600">{monthSummary.variable.toFixed(0)} CZK</p>
            <p className="text-xs text-gray-500 mt-1">As needed</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Overhead</p>
            <p className="text-3xl font-bold text-green-600">{monthSummary.total.toFixed(0)} CZK</p>
            <p className="text-xs text-gray-500 mt-1">{monthCosts.length} items</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Cost Form */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Costs for {currentMonth}</h2>
        <Button onClick={() => setShowNewCostForm(!showNewCostForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Cost
        </Button>
      </div>

      {showNewCostForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Add Overhead Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCost} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newCost.categoryId}
                    onChange={(e) => setNewCost({ ...newCost, categoryId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (CZK)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newCost.amount}
                    onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={newCost.isFixed ? "fixed" : "variable"}
                    onChange={(e) => setNewCost({ ...newCost, isFixed: e.target.value === "fixed" })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="fixed">Fixed (Recurring)</option>
                    <option value="variable">Variable (As needed)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={newCost.description}
                    onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                    placeholder="Details"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Cost</Button>
                <Button type="button" variant="outline" onClick={() => setShowNewCostForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Costs List */}
      {monthCosts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {monthCosts.map((cost) => {
              const category = categories.find((c) => c.id === cost.categoryId)
              return (
                <div key={cost.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {category?.color && <div className="w-3 h-3 rounded" style={{ backgroundColor: category.color }} />}
                      <div>
                        <p className="font-medium">{category?.name}</p>
                        {cost.description && <p className="text-sm text-gray-600">{cost.description}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">{Number(cost.amount).toFixed(0)} CZK</p>
                      <p className="text-xs text-gray-600">{cost.isFixed ? "Fixed" : "Variable"}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCost(cost.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No costs for this month</h3>
            <p className="text-gray-600 mb-4">Add your first overhead cost to get started</p>
            <Button onClick={() => setShowNewCostForm(true)}>Add Cost</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
