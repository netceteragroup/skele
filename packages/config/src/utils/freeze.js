export default function deepFreeze(obj) {
  Object.entries(obj).forEach(subObj => {
    const prop = subObj[1]
    if (typeof prop == 'object' && prop !== null) deepFreeze(prop)
  })
  return Object.freeze(obj)
}
