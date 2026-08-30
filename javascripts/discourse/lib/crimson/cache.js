export function setBoundedMap(map, key, value, maxEntries = 128) {
  if (map.has(key)) {
    map.delete(key);
  }

  map.set(key, value);

  while (map.size > maxEntries) {
    const oldestKey = map.keys().next().value;

    if (oldestKey === undefined) {
      break;
    }

    map.delete(oldestKey);
  }
}
