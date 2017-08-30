import Registry from './Registry'

export default class MultivalueRegistry extends Registry {

  register(kind, element):void {
    if (typeof kind === 'function') {
      this.recognizers = this.recognizers.push([kind, element]);
    } else {
      const adaptedKey = this._adaptKey(kind);
      const alreadyRegistered = this.getAlreadyRegistered(adaptedKey)
      this.registry = this.registry.set(adaptedKey, alreadyRegistered ? [alreadyRegistered, element] : element);
    }
  }

  getAlreadyRegistered(adaptedKey) {
    const registered = this.registry.get(adaptedKey)

    if (!registered) {
      return null
    }

    return registered
  }

}
