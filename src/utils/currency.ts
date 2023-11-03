const FORMATTER_NUMBER: Intl.NumberFormat = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumSignificantDigits: 3
});

const FORMATTER_USD: Intl.NumberFormat = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 3
})

export function formatUSD(amountUSD: number): string {
    return FORMATTER_USD.format(amountUSD);
}

export function formatToken(amount: number): string {
    return FORMATTER_NUMBER.format(amount);
}
