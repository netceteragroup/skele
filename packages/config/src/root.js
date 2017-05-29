import Layer from './layer'
export default class RootLayer {

  root: Layer
  current: Layer

  constructor(config) {
    this.root = new Layer(config, null, false)
    this.current = this.root
  }

  define(config) {
    const newLayer = new Layer(config, null, false)
    this.current.next = newLayer
    this.current = newLayer
    return this
  }

}