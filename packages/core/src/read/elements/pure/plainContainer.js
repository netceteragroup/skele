'use strict';

import React from 'react';

function PlainContainer({ elements }) {
  return (
    <div>
      {elements}
    </div>
  );
}

PlainContainer.propTypes = {
  elements: React.PropTypes.object
};

export default PlainContainer;
