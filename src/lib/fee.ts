export function calculateFinalFee(totalFee: number, discount: number): number {
  if (totalFee < 0) return 0;
  const safeDiscount = Number.isFinite(discount) ? discount : 0;
  const finalFee = totalFee - (totalFee * safeDiscount) / 100;
  return finalFee < 0 ? 0 : finalFee;
}

export function calculateRemainingFee(
  finalFee: number,
  paidAmount: number,
): number {
  if (finalFee <= 0) return 0;
  const remaining = finalFee - (paidAmount || 0);
  return remaining < 0 ? 0 : remaining;
}

