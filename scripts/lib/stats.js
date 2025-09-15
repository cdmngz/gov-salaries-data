// scripts/lib/stats.js

function getAllOfficialsFromData(data) {
  const arrays = [
    Array.isArray(data?.royalty) ? data.royalty : [],
    Array.isArray(data?.executive) ? data.executive : [],
    Array.isArray(data?.ministers) ? data.ministers : [],
    Array.isArray(data?.deputies) ? data.deputies : [],
    Array.isArray(data?.senate) ? data.senate : [],
    Array.isArray(data?.officials) ? data.officials : [],
  ];
  return arrays.flat();
}

/** Helper: get officials from a subset of arrays by keys */
function getOfficialsByKeys(data, keys) {
  if (!data || typeof data !== "object") return [];
  return keys.map((k) => (Array.isArray(data[k]) ? data[k] : [])).flat();
}

/** Internal: tally logic reused by all public counters */
function tallyPartyRanges(people, parties) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalCountedOfficials = 0;
  let unaffiliatedCount = 0; // no person.party
  let unmappedPartyCount = 0; // has party, but party missing/invalid range

  for (const person of people) {
    if (!person || typeof person !== "object") continue;

    const partyCode = person.party; // optional
    if (!partyCode) {
      unaffiliatedCount += 1;
      continue;
    }

    const party = parties?.[partyCode];
    const rangeNum = Number(party?.range);
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
    mostPopularRanges, // handles ties, e.g., [2] or [2,3]
    mostPopularCount: maxCount,
    totalCountedOfficials,
    unaffiliatedCount,
    unmappedPartyCount,
  };
}

/**
 * Original behavior (kept for compatibility):
 * Count popularity of party ranges (1..5) among *all* officials.
 */
function countPartyRanges(data) {
  const parties = (data && data.parties) || {};
  const everyone = getAllOfficialsFromData(data);
  return tallyPartyRanges(everyone, parties);
}

/**
 * Split stats
 * 1) Executive-only
 * 2) "Rest" combined (ministers, senate, deputies, officials)
 */
function countPartyRangesSplit(data) {
  const parties = (data && data.parties) || {};

  const executiveOnly = getOfficialsByKeys(data, ["executive"]);
  const restTogether = getOfficialsByKeys(data, [
    "ministers",
    "senate",
    "deputies",
    "officials",
  ]);

  return {
    executive: tallyPartyRanges(executiveOnly, parties),
    rest: tallyPartyRanges(restTogether, parties),
  };
}

module.exports = {
  getAllOfficialsFromData,
  getOfficialsByKeys,
  countPartyRanges, // legacy: all combined
  countPartyRangesSplit, // new: executive vs rest
};
