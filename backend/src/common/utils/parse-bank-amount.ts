export function parseBankAmount(text: string): number | null {
  if (!text) return null;

  // normaliza espacios
  const normalized = text.replace(/\s+/g, " ");

  const patterns = [
    // $350.000
    /\$\s?([\d\.]+)/,

    // CLP 350.000
    /CLP\s?([\d\.]+)/i,

    // monto 350.000
    /monto[:\s]+([\d\.]+)/i,

    // por 350.000
    /por\s+([\d\.]+)/i,

    // transferencia de 350.000
    /transferencia\s+(?:de\s+)?([\d\.]+)/i
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (match) {
      const raw = match[1].replace(/\./g, "");
      const amount = parseInt(raw, 10);

      if (!isNaN(amount)) {
        return amount;
      }
    }
  }

  return null;
}