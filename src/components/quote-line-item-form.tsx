import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export interface LineItemFormData {
  type: "service" | "material" | "hourly"
  description: string
  quantity: number
  unit: string
  unitPrice: number
  hourlyRate?: number
}

interface QuoteLineItemFormProps {
  onSubmit: (data: LineItemFormData) => Promise<void>
  loading?: boolean
}

export function QuoteLineItemForm({ onSubmit, loading = false }: QuoteLineItemFormProps) {
  const [formData, setFormData] = useState<LineItemFormData>({
    type: "service",
    description: "",
    quantity: 1,
    unit: "",
    unitPrice: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    // Reset form
    setFormData({
      type: "service",
      description: "",
      quantity: 1,
      unit: "",
      unitPrice: 0,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Line Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as "service" | "material" | "hourly" })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="hourly">Hourly Work</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                type="text"
                placeholder="e.g., hours, pcs, kg"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="What is this line item for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>Subtotal</Label>
              <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm">
                {(formData.quantity * formData.unitPrice).toFixed(2)} CZK
              </div>
            </div>
          </div>

          {formData.type === "hourly" && (
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="Hourly rate for this work"
                value={formData.hourlyRate || 0}
                onChange={(e) =>
                  setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || undefined })
                }
              />
            </div>
          )}

          <Button type="submit" disabled={loading || !formData.description} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Line Item
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
