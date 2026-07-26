import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys } from '@/lib/supabase'
import { useWalletStore } from '@/stores/wallet'

export interface Invoice {
  id: string
  created_by: string
  client_name: string
  client_email: string | null
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date: string | null
  notes: string | null
  subtotal: number
  currency: string
  payment_code: string
  payment_method: string | null
  chain: string | null
  tx_hash: string | null
  paid_at: string | null
  created_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order: number
}

export function useInvoices() {
  const { profileId } = useWalletStore()

  return useQuery({
    queryKey: queryKeys.invoices(profileId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('created_by', profileId!)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Invoice[]
    },
    enabled: !!profileId,
  })
}

export function useInvoiceDetail(invoiceId: string) {
  return useQuery({
    queryKey: queryKeys.invoiceDetail(invoiceId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('id', invoiceId)
        .single()

      if (error) throw error
      return data as Invoice & { invoice_items: InvoiceItem[] }
    },
    enabled: !!invoiceId,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const { profileId } = useWalletStore()

  return useMutation({
    mutationFn: async (input: {
      client_name: string
      client_email?: string
      due_date?: string
      notes?: string
      currency: string
      items: { description: string; quantity: number; unit_price: number }[]
    }) => {
      const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          created_by: profileId,
          client_name: input.client_name,
          client_email: input.client_email || null,
          due_date: input.due_date || null,
          notes: input.notes || null,
          currency: input.currency,
          subtotal,
          status: 'draft',
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Insert line items
      const items = input.items.map((item, i) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price,
        sort_order: i,
      }))

      const { error: itemsError } = await supabase.from('invoice_items').insert(items)
      if (itemsError) throw itemsError

      return invoice as Invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices(profileId || '') })
    },
  })
}

export function useSendInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoiceId)

      if (error) throw error
    },
    onSuccess: (_data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoiceDetail(invoiceId) })
    },
  })
}
