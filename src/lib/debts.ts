export type Debt = {
  id: string;
  description: string;
  amount: number;
  fromUserId: string; // credor: quem criou o débito / a quem devem
  toUserId: string;   // devedor
  status: string;
};

export type Balance = {
  userId: string;     // a outra pessoa
  cents: number;      // > 0: ela me deve · < 0: eu devo a ela · 0: quites
  debtIds: string[];  // todos os débitos pendentes entre nós dois
};

/** Saldo líquido do usuário `me` com cada pessoa da casa (soma em centavos para evitar erro de Float). */
export function computeBalances(debts: Debt[], me: string): Balance[] {
  const byUser = new Map<string, Balance>();

  for (const d of debts) {
    let other: string;
    let sign: 1 | -1;
    if (d.fromUserId === me) { other = d.toUserId; sign = 1; }
    else if (d.toUserId === me) { other = d.fromUserId; sign = -1; }
    else continue;
    if (other === me) continue;

    const balance = byUser.get(other) ?? { userId: other, cents: 0, debtIds: [] };
    balance.cents += sign * Math.round(d.amount * 100);
    balance.debtIds.push(d.id);
    byUser.set(other, balance);
  }

  return Array.from(byUser.values()).sort((a, b) => Math.abs(b.cents) - Math.abs(a.cents));
}
