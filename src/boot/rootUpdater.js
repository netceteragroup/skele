import { Updater } from 'redux-elm';
import { fromJS } from 'immutable';
import { put } from 'redux-saga/effects';

const initialModel = fromJS({
  test: 'value'
});

function* saga() {
  yield* testAction();
}

function* testAction() {
  yield put({ type: 'TEST_ACTION'});
}

export default new Updater(initialModel, saga)
  .case('TEST_ACTION', (model, action, ...rest) => model.setIn(['test'], 'new-value'))
  .toReducer();
