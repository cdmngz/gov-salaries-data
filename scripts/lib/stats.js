// scripts/lib/stats.js

function getAllOfficialsFromData(data) {
  const arrays = [
    Array.isArray(data.royalty) ? data.royalty : [],
    Array.isArray(data.executive) ? data.executive : [],
    Array.isArray(data.ministers) ? data.ministers : [],
    Array.isArray(data.deputies) ? data.deputies : [],
    Array.isArray(data.senate) ? data.senate : [],
    Array.isArray(data.officials) ? data.officials : [],
  ];
  return arrays.flat();
}

/**
 * Count popularity of party ranges (1..5) among officials.
 * - If an official has no `party`, they're excluded from the 1..5 tally and counted in `unaffiliatedCount`.
 * - If an official has a `party` but that party is missing or lacks a valid range (1..5),
 *   they're excluded from the 1..5 tally and counted in `unmappedPartyCount`.
 */
function countPartyRanges(data) {
  const parties = (data && data.parties) || {};
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalCountedOfficials = 0;
  let unaffiliatedCount = 0;
  let unmappedPartyCount = 0;

  for (const person of getAllOfficialsFromData(data)) {
    if (!person || typeof person !== "object") continue;

    const partyCode = person.party; // optional
    if (!partyCode) {
      unaffiliatedCount += 1;
      continue;
    }

    const party = parties[partyCode];
    const rangeNum = Number(party && party.range);

    const isValid = Number.isFinite(rangeNum) && rangeNum >= 1 && rangeNum <= 5;

    if (isValid) {
      counts[rangeNum] += 1;
      totalCountedOfficials += 1;
    } else {
      unmappedPartyCount += 1;
    }
  }

  const maxCount = Math.max(...Object.values(counts));
  const mostPopularRanges =
    maxCount > 0
      ? Object.entries(counts)
          .filter(([, v]) => v === maxCount)
          .map(([k]) => Number(k))
      : [];

  return {
    counts, // {1:n,2:n,3:n,4:n,5:n}
    mostPopularRanges, // handles ties, e.g. [2] or [2,3]
    mostPopularCount: maxCount,
    totalCountedOfficials,
    unaffiliatedCount,
    unmappedPartyCount,
  };
}

module.exports = {
  getAllOfficialsFromData,
  countPartyRanges,
};
