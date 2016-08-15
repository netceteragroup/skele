'use strict';

import React from 'react';

function MetaError({ url, status, message }) {
  return (
    <div>
      <p>Read Error</p>
      <p>{url}</p>
      <p>{status}</p>
      <p>{message}</p>
    </div>
  );
}

MetaError.propTypes = {
  url: React.PropTypes.string.isRequired,
  status: React.PropTypes.number.isRequired,
  message: React.PropTypes.string.isRequired
};

export default MetaError;
