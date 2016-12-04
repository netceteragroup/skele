'use strict';

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { expect } from './support/utils';

import PlainContainer from '../src/read/elements/pure/plainContainer';
import MetaError from '../src/read/elements/pure/metaError';

describe('Reads', () => {

  describe('Pure Components', () => {

    it('properly renders the plain container', () => {
      const child = (
        <div>child element</div>
      );

      const renderer = TestUtils.createRenderer();
      renderer.render(<PlainContainer elements={child} />);
      const output = renderer.getRenderOutput();

      expect(output.type).to.equal('div');
      expect(output).to.have.deep.property('props.children.type', 'div');
      expect(output).to.have.deep.property('props.children.props.children', 'child element');
    });

    it('properly renders the meta error component', () => {
      const renderer = TestUtils.createRenderer();
      renderer.render(
        <MetaError
          url="https://localhost:8080/"
          status={400}
          message="Bad Request"
        />);
      const output = renderer.getRenderOutput();

      expect(output.type).to.equal('div');
      expect(output).to.have.deep.property('props.children[0].type', 'p');
      expect(output).to.have.deep.property('props.children[0].props.children', 'Read Error');
      expect(output).to.have.deep.property('props.children[1].props.children', 'https://localhost:8080/');
      expect(output).to.have.deep.property('props.children[2].props.children', 400);
      expect(output).to.have.deep.property('props.children[3].props.children', 'Bad Request');
    });

  });

});
