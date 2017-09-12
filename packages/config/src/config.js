import Layer from './layer'

function define(configuration) {
  return new Layer(configuration, null, false)
}

export { define }

export default {
  define,
}
