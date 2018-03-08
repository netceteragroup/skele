# Transitioning from Girders Elements (pre 1.0.0-alpha.27)

The Skele framework used to be called **Girders Elements** up until version `1.0.0-alpha.26`.

Projects using this framework should follow the following steps to ensure a smooth tranistion
to the new framework name.

## 1. Change import statements

Rename imports looking like

```javascript
import ... from '@girders-elements/core'
```

to

```javascript
import ... from '@skele/classic'
```

This is the only mandatory step, except if you were using action names directly.

## 2. Use the new property names

The following property names have been renamed:

* `@girders-elements/children` -> `@@skele/children`
* `@girders-elements/metadata` -> `@@skele/metadata`
* `@@girders-elements/defaultRead`-> `@@skele/defaultRead`
* `@@skele/_actionMeta` -> `@@skele/actionMeta`

If you have been using them directly, please rename them in your code. Better yet,
start using the `propNames` [object](api/prop-names.md) which lists them correctly.

The old names will still work but will trigger deprecation warning.

### 3. Use the new action types

The following action types have been renamed:

* `@@girders-elements/actions.read` -> `@@skele/actions.read`
* `@@girders-elements/actions.read.refresh` -> `@@skele/actions.read.refresh`
* `@@girders-elements/actions.read.setRefreshing` -> `@@skele/actions.read.setRefreshing`
* `@@girders-elements/actions.read.setLoading` -> `@@skele/actions.read.setLoading`
* `@@girders-elements/actions.read.apply` -> `@@skele/actions.read.apply`
* `@@girders-elements/actions.read.fail` -> `@@skele/actions.read.fail`
* `@@girders-elements/actions.effect.fail` -> `@@skele/actions.effect.fail`

All these action types are available via the `actions` export from `@skele/classic` and
should be used through that object.

If you were using these action types directly please, rename them accordingly. The old names
won't work.
