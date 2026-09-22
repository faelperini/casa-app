/** Chaves dos cards da página da casa, na ordem padrão. Acrescentar um card novo aqui basta:
 *  ele aparece no fim para quem já salvou uma ordem (ver resolveCardOrder). */
export const CARD_KEYS = ["shopping", "debts", "recipes"] as const;

export type CardKey = (typeof CARD_KEYS)[number];

function isCardKey(value: string): value is CardKey {
  return (CARD_KEYS as readonly string[]).includes(value);
}

/** Ordem salva (GroupMember.cardOrder) → ordem válida e completa: descarta chave desconhecida
 *  (card que deixou de existir) e repetida, e acrescenta no fim as que faltam. */
export function resolveCardOrder(saved: string[] | null | undefined): CardKey[] {
  const order: CardKey[] = [];
  for (const key of saved ?? []) {
    if (isCardKey(key) && !order.includes(key)) order.push(key);
  }
  for (const key of CARD_KEYS) {
    if (!order.includes(key)) order.push(key);
  }
  return order;
}
