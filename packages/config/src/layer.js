export default class Layer {
  configuration: object
  next: object
  frozen: bool

  constructor(configuration, next, frozen) {
    this.configuration = configuration
    this.next = next
    this.frozen = frozen
  }
}