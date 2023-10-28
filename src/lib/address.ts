/**
 * Shortens the address string followed by ellipsis if the address is too long.
 *
 * Examples
 *
 *  `shortenAddress("abcdefg", 3, 3)` -> `"abc..."`
 *
 *  `shortenAddress("abcdefg", 0, 3)` -> `"..."`
 *
 *  `shortenAddress("abcdefg", 3, 0)` -> `"abc..."`
 *
 *  `shortenAddress("abcdefg", 3, 8)` -> `"abcdefg"`
 *
 *
 * @param address candidate address to shorten if needed
 * @param shortenLength length of the address (excluding ellipsis) after shortening
 * @param thresholdLength length at which to shorten
 * @returns shortened address if needed, original otherwise
 */
export function shortenAddress(address: string, shortenLength: number = 4, thresholdLength: number = 8): string {
    if (thresholdLength < 0) {
        throw new Error("Threshold length must be non-negative.");
    }
    if (shortenLength < 0) {
        throw new Error("Shorten length must be non-negative.");
    }
    if (address.length > thresholdLength) {
        address = address.substring(0, shortenLength) + "...";
    }
    return address;
}
