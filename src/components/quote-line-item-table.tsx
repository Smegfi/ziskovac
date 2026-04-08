import { Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface LineItem {
  id: string
  type: string
  description: string
  quantity: string | number
  unit?: string
  unitPrice: string | number
  subtotal: string | number
  hourlyRate?: string | number
}

interface QuoteLineItemTableProps {
  lineItems: LineItem[]
  onEdit?: (item: LineItem) => void
  onDelete?: (id: string) => Promise<void>
  loading?: boolean
}

export function QuoteLineItemTable({
  lineItems,
  onEdit,
  onDelete,
  loading = false,
}: QuoteLineItemTableProps) {
  const total = lineItems.reduce((sum, item) => sum + Number(item.subtotal), 0)

  if (lineItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No line items yet. Add your first item above.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="capitalize text-sm">{item.type}</TableCell>
                  <TableCell className="max-w-xs">{item.description}</TableCell>
                  <TableCell className="text-right text-sm">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-right text-sm">{Number(item.unitPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">{Number(item.subtotal).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="text-lg font-semibold">
            Total: {total.toFixed(2)} CZK
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
