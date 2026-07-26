export interface Expense {
  id: string
  group_id: string
  description: string
  amount: number
  currency: string
  paid_by: string
  split_method: string
  created_at: string
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  profile_id: string
  amount: number
}

export interface Settlement {
  id: string
  group_id: string
  from_profile: string
  to_profile: string
  amount: number
  currency: string
  payment_method: string
  chain?: string
  tx_hash?: string
  status: string
  created_at: string
}

export interface Debt {
  from: string
  to: string
  amount: number
}

/**
 * Simplifies debts within a group by calculating net balances
 * and using a greedy matching algorithm to minimize transactions.
 */
export function simplifyDebts(
  expenses: Expense[],
  splits: ExpenseSplit[],
  settlements: Settlement[]
): Debt[] {
  // Step 1: Calculate net balance for each member
  const balances = new Map<string, number>()

  for (const expense of expenses) {
    // Payer is owed money
    balances.set(expense.paid_by, (balances.get(expense.paid_by) || 0) + expense.amount)
  }

  for (const split of splits) {
    // Each person's share is what they owe
    balances.set(split.profile_id, (balances.get(split.profile_id) || 0) - split.amount)
  }

  // Subtract already-made settlements
  for (const s of settlements.filter((s) => s.status === 'confirmed')) {
    balances.set(s.from_profile, (balances.get(s.from_profile) || 0) + s.amount)
    balances.set(s.to_profile, (balances.get(s.to_profile) || 0) - s.amount)
  }

  // Step 2: Separate into creditors (positive) and debtors (negative)
  const creditors: { id: string; amount: number }[] = []
  const debtors: { id: string; amount: number }[] = []

  for (const [id, balance] of balances) {
    if (balance > 0.01) creditors.push({ id, amount: balance })
    else if (balance < -0.01) debtors.push({ id, amount: -balance })
  }

  // Sort descending for greedy matching
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  // Step 3: Greedy matching — each debtor pays largest creditor first
  const result: Debt[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const payment = Math.min(creditors[ci].amount, debtors[di].amount)
    if (payment > 0.01) {
      result.push({
        from: debtors[di].id,
        to: creditors[ci].id,
        amount: Math.round(payment * 100) / 100,
      })
    }
    creditors[ci].amount -= payment
    debtors[di].amount -= payment
    if (creditors[ci].amount < 0.01) ci++
    if (debtors[di].amount < 0.01) di++
  }

  return result
}
